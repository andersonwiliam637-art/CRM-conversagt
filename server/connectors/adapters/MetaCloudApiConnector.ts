// server/connectors/adapters/MetaCloudApiConnector.ts
import type {
  ChannelConnector,
  ChannelType,
  ProviderType,
  HealthCheckResult,
  NormalizedInboundMessage,
  NormalizedOutboundMessage,
  SendResult,
} from "../types.js";
import { db } from "../../db.js";

/**
 * WhatsApp Meta Cloud API Connector (Official Integration)
 *
 * Requirements:
 * - Decoupled adapter adhering to the ChannelConnector interface.
 * - Variables: WHATSAPP_WEBHOOK, WHATSAPP_APP_SECRET, WHATSAPP_PHONE_ID, WHATSAPP_ACCESS_TOKEN.
 * - Initial status: NO_CONFIGURADO.
 * - Health Check: Real API query to Graph API. Never returns CONECTADO solely because env vars exist.
 * - Zero Secrets Leakage: Access tokens are never returned in responses or plain errors.
 */
export class MetaCloudApiConnector implements ChannelConnector {
  public readonly channel: ChannelType = "whatsapp";
  public readonly provider: ProviderType = "meta_cloud_api";

  /**
   * Helper to retrieve credentials from server-side vault or env without leaking them.
   */
  private getCredentials(tenantId: string): {
    phoneId: string | null;
    accessToken: string | null;
    appSecret: string | null;
    webhookUrl: string | null;
  } {
    // 1. Check if tenant has stored credentials in database
    try {
      const row = db
        .prepare("SELECT config_json FROM channel_configs WHERE tenant_id = ? AND channel_type = 'whatsapp_meta'")
        .get(tenantId) as { config_json: string } | undefined;

      if (row && row.config_json) {
        const parsed = JSON.parse(row.config_json);
        if (parsed.phoneId && parsed.accessToken) {
          return {
            phoneId: parsed.phoneId,
            accessToken: parsed.accessToken,
            appSecret: parsed.appSecret || process.env.WHATSAPP_APP_SECRET || null,
            webhookUrl: process.env.WHATSAPP_WEBHOOK || "/api/webhooks/whatsapp",
          };
        }
      }
    } catch {
      // Fallback to env
    }

    // 2. Check process.env (strictly server-side)
    const phoneId = process.env.WHATSAPP_PHONE_ID || null;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || null;
    const appSecret = process.env.WHATSAPP_APP_SECRET || null;
    const webhookUrl = process.env.WHATSAPP_WEBHOOK || "/api/webhooks/whatsapp";

    return { phoneId, accessToken, appSecret, webhookUrl };
  }

  /**
   * Masks a phone number or ID for safe UI display (e.g. "+502 •••• 4016")
   */
  private maskIdentifier(idOrPhone: string): string {
    const clean = idOrPhone.trim();
    if (clean.length <= 4) return "••••";
    const visibleSuffix = clean.slice(-4);
    const visiblePrefix = clean.startsWith("+") ? clean.slice(0, 4) : clean.slice(0, 2);
    return `${visiblePrefix} •••• ${visibleSuffix}`;
  }

  /**
   * Real Health Check: Validates connection with Meta Graph API
   */
  public async healthCheck(tenantId: string, _connectionId: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const creds = this.getCredentials(tenantId);

    // If no credentials configured, state is strictly NO_CONFIGURADO
    if (!creds.phoneId || !creds.accessToken) {
      return {
        status: "NO_CONFIGURADO",
        lastVerifiedAt: new Date().toISOString(),
        maskedIdentifier: creds.phoneId ? this.maskIdentifier(creds.phoneId) : "Sin ID asignado",
        details: {
          webhookConfigured: Boolean(creds.webhookUrl),
          phoneIdConfigured: Boolean(creds.phoneId),
          tokenConfigured: Boolean(creds.accessToken),
          note: "Credenciales pendientes de configuración en variables de entorno o bóveda segura.",
        },
      };
    }

    // Attempt real handshake against Meta Graph API
    try {
      const graphUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(creds.phoneId)}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`;
      
      const response = await fetch(graphUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          "User-Agent": "ConversaGT-Connector/1.0",
        },
        signal: AbortSignal.timeout(6000),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        let errSnippet = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            // Sanitize: strip out any potential token echoes
            errSnippet = errData.error.message.replace(/EAA[0-9a-zA-Z]+/g, "[TOKEN_REDACTED]");
          }
        } catch {}

        return {
          status: "ERROR_CONEXION",
          lastVerifiedAt: new Date().toISOString(),
          latencyMs,
          error: `Error de verificación con Meta: ${errSnippet}`,
          maskedIdentifier: this.maskIdentifier(creds.phoneId),
        };
      }

      const metaData = await response.json();
      const verifiedPhone = metaData.display_phone_number || creds.phoneId;

      return {
        status: "CONECTADO",
        lastVerifiedAt: new Date().toISOString(),
        latencyMs,
        maskedIdentifier: this.maskIdentifier(verifiedPhone),
        details: {
          verifiedName: metaData.verified_name || "Cuenta WhatsApp Business",
          qualityRating: metaData.quality_rating || "UNKNOWN",
          codeVerificationStatus: metaData.code_verification_status || "VERIFIED",
        },
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        status: "ERROR_CONEXION",
        lastVerifiedAt: new Date().toISOString(),
        latencyMs,
        error: `Fallo de red al contactar Meta Graph API: ${err.message || "Timeout"}`,
        maskedIdentifier: this.maskIdentifier(creds.phoneId),
      };
    }
  }

  /**
   * Normalizes incoming Meta webhook payload into standard NormalizedInboundMessage
   */
  public async normalizeInbound(payload: any, _headers?: Record<string, any>): Promise<NormalizedInboundMessage | null> {
    try {
      if (!payload || payload.object !== "whatsapp_business_account") {
        return null;
      }

      const entry = payload.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      if (!value || !value.messages || value.messages.length === 0) {
        return null;
      }

      const msg = value.messages[0];
      const contact = value.contacts?.[0] || {};
      const metadata = value.metadata || {};

      const senderPhone = msg.from;
      const senderName = contact.profile?.name || `WhatsApp (${senderPhone.slice(-4)})`;
      const recipientPhone = metadata.display_phone_number || metadata.phone_number_id || "ConversaGT";

      let content = "";
      let messageType: NormalizedInboundMessage["messageType"] = "text";
      const attachments: NormalizedInboundMessage["attachments"] = [];

      if (msg.type === "text") {
        content = msg.text?.body || "";
      } else if (msg.type === "image") {
        messageType = "image";
        content = msg.image?.caption || "[Imagen recibida]";
        if (msg.image?.id) {
          attachments.push({
            url: `https://graph.facebook.com/v21.0/${msg.image.id}`,
            mimeType: msg.image.mime_type || "image/jpeg",
          });
        }
      } else if (msg.type === "audio") {
        messageType = "audio";
        content = "[Nota de voz]";
        if (msg.audio?.id) {
          attachments.push({
            url: `https://graph.facebook.com/v21.0/${msg.audio.id}`,
            mimeType: msg.audio.mime_type || "audio/ogg",
          });
        }
      } else if (msg.type === "document") {
        messageType = "document";
        content = msg.document?.caption || msg.document?.filename || "[Documento adjunto]";
        if (msg.document?.id) {
          attachments.push({
            url: `https://graph.facebook.com/v21.0/${msg.document.id}`,
            mimeType: msg.document.mime_type || "application/octet-stream",
            fileName: msg.document.filename,
          });
        }
      } else {
        content = `[Mensaje interactivo / tipo ${msg.type}]`;
      }

      const normalized: NormalizedInboundMessage = {
        tenantId: "", // Filled by pipeline based on phone_number_id routing
        connectionId: metadata.phone_number_id || "conn-meta-default",
        channel: "whatsapp",
        provider: "meta_cloud_api",
        externalConversationId: senderPhone,
        externalMessageId: msg.id,
        externalContactId: senderPhone,
        sender: {
          id: senderPhone,
          name: senderName,
          phone: senderPhone,
        },
        recipient: {
          id: metadata.phone_number_id || "business",
          name: "ConversaGT Business",
          phone: recipientPhone,
        },
        messageType,
        content,
        timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
        attachments,
        metadata: {
          rawMessageId: msg.id,
          wabaId: entry.id,
        },
      };

      return normalized;
    } catch (err) {
      console.error("[MetaCloudApiConnector] Error al normalizar webhook:", err);
      return null;
    }
  }

  /**
   * Sends an outbound normalized message through Meta Graph API
   */
  public async sendMessage(message: NormalizedOutboundMessage): Promise<SendResult> {
    const creds = this.getCredentials(message.tenantId);

    if (!creds.phoneId || !creds.accessToken) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: "Credenciales de Meta Cloud API no configuradas. Configure WHATSAPP_PHONE_ID y WHATSAPP_ACCESS_TOKEN.",
        timestamp: new Date().toISOString(),
      };
    }

    const recipientPhone = message.recipient.phone || message.recipient.id;
    if (!recipientPhone) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: "Destinatario inválido: no se proporcionó número telefónico.",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
      const graphUrl = `https://graph.facebook.com/v21.0/${creds.phoneId}/messages`;

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { body: message.content },
      };

      const res = await fetch(graphUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        let errorMsg = `Error HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson?.error?.message) {
            errorMsg = errJson.error.message.replace(/EAA[0-9a-zA-Z]+/g, "[REDACTED]");
          }
        } catch {}

        return {
          success: false,
          deliveryStatus: "SEND_FAILED",
          error: `Fallo al entregar mensaje por Meta Cloud API: ${errorMsg}`,
          timestamp: new Date().toISOString(),
        };
      }

      const resData = await res.json();
      const messageId = resData.messages?.[0]?.id || "wamid." + Date.now();

      return {
        success: true,
        externalMessageId: messageId,
        deliveryStatus: "sent",
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: `Fallo de red al enviar mensaje por Meta: ${err.message || "Error desconocido"}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
