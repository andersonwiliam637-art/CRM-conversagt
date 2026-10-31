// server/connectors/MessageService.ts - Omnichannel Message Pipeline
import crypto from "node:crypto";
import { db } from "../db.js";
import { ConnectorRegistry } from "./registry.js";
import type {
  NormalizedInboundMessage,
  NormalizedOutboundMessage,
  SendResult,
  ProviderType,
  ChannelType,
} from "./types.js";
import { logAudit, sanitizeText } from "../security.js";

export interface AIResponseDecision {
  shouldRespond: boolean;
  reason?: string;
  generatedText?: string;
}

/**
 * Omnichannel Message Pipeline & Isolation Engine
 *
 * Enforces the flow:
 * CHANNEL CONNECTOR -> EVENT -> NORMALIZACIÓN -> CONVERSACIÓN -> CLIENTE -> AGENTE / IA -> RESPUESTA -> DELIVERY STATUS
 */
export class MessageService {
  private registry: ConnectorRegistry;

  constructor() {
    this.registry = ConnectorRegistry.getInstance();
  }

  /**
   * Processes a normalized inbound message:
   * 1. Multi-Tenant Isolation: verifies tenant exists.
   * 2. Upserts Client record for this tenant.
   * 3. Upserts Conversation record for this tenant.
   * 4. Stores Inbound Message in messages table.
   * 5. Returns context for AI or Human Agent assignment.
   */
  public async handleInboundMessage(inbound: NormalizedInboundMessage): Promise<{
    conversationId: string;
    clientId: string;
    messageId: string;
    botEnabled: boolean;
  }> {
    if (!inbound.tenantId) {
      throw new Error("Violación de aislamiento multi-tenant: tenantId requerido en mensaje entrante.");
    }

    const now = new Date().toISOString();

    // 1. Verify tenant exists
    const tenant = db.prepare("SELECT id, name FROM tenants WHERE id = ?").get(inbound.tenantId) as { id: string } | undefined;
    if (!tenant) {
      throw new Error(`Tenant '${inbound.tenantId}' no encontrado o no autorizado.`);
    }

    // 2. Identify or Create Customer (strictly scoped by tenant_id)
    const customerPhone = inbound.sender.phone || inbound.sender.id;
    let client = db
      .prepare("SELECT * FROM clients WHERE tenant_id = ? AND (phone = ? OR email = ?)")
      .get(inbound.tenantId, customerPhone, inbound.sender.email || "") as any;

    let clientId: string;
    let botEnabled = true;

    if (!client) {
      clientId = "client-" + crypto.randomUUID();
      const defaultName = sanitizeText(inbound.sender.name || `Contacto (${customerPhone.slice(-4)})`, 100);
      
      db.prepare(`
        INSERT INTO clients (
          id, tenant_id, name, company, email, phone, avatar,
          stage, ltv, deals_count, channel_origin, tags,
          notes, activation_status, payment_confirmed, bot_enabled,
          created_at, updated_at
        ) VALUES (?, ?, ?, '', ?, ?, ?, 'nuevo', 0, 0, ?, ?, '', 'activo', 0, 1, ?, ?)
      `).run(
        clientId,
        inbound.tenantId,
        defaultName,
        sanitizeText(inbound.sender.email || ""),
        sanitizeText(customerPhone),
        inbound.sender.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        inbound.channel,
        JSON.stringify([inbound.channel.toUpperCase(), "Nuevo Lead"]),
        now,
        now
      );
    } else {
      clientId = client.id;
      botEnabled = Boolean(client.bot_enabled);
    }

    // 3. Upsert Conversation (scoped by tenant_id)
    let conv = db
      .prepare("SELECT * FROM conversations WHERE tenant_id = ? AND customer_phone = ? AND channel = ?")
      .get(inbound.tenantId, customerPhone, inbound.channel) as any;

    let conversationId: string;
    if (!conv) {
      conversationId = "conv-" + crypto.randomUUID();
      db.prepare(`
        INSERT INTO conversations (
          id, tenant_id, customer_id, customer_name, customer_avatar,
          customer_phone, customer_email, channel, last_message,
          last_message_time, unread_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(
        conversationId,
        inbound.tenantId,
        clientId,
        client?.name || inbound.sender.name || customerPhone,
        client?.avatar || "",
        customerPhone,
        client?.email || inbound.sender.email || "",
        inbound.channel,
        sanitizeText(inbound.content, 200),
        now,
        now,
        now
      );
    } else {
      conversationId = conv.id;
      db.prepare(`
        UPDATE conversations
        SET last_message = ?, last_message_time = ?, unread_count = unread_count + 1, updated_at = ?
        WHERE id = ? AND tenant_id = ?
      `).run(sanitizeText(inbound.content, 200), now, now, conversationId, inbound.tenantId);
    }

    // 4. Store Inbound Message (scoped by tenant_id and conversation_id)
    const messageId = "msg-" + crypto.randomUUID();
    db.prepare(`
      INSERT INTO messages (
        id, tenant_id, conversation_id, sender, text, status, created_at
      ) VALUES (?, ?, ?, 'user', ?, 'delivered', ?)
    `).run(
      messageId,
      inbound.tenantId,
      conversationId,
      sanitizeText(inbound.content, 5000),
      now
    );

    return { conversationId, clientId, messageId, botEnabled };
  }

  /**
   * Dispatches an outbound message to a customer via the appropriate connector adapter.
   * If delivery fails:
   * - Message status is set strictly to 'SEND_FAILED'.
   * - Error is logged in audit logs.
   * - Error is returned to caller so the agent UI can display it accurately.
   */
  public async sendOutboundMessage(outbound: NormalizedOutboundMessage): Promise<SendResult> {
    if (!outbound.tenantId) {
      throw new Error("Violación de aislamiento multi-tenant: tenantId requerido en mensaje saliente.");
    }

    const now = new Date().toISOString();
    const messageId = "msg-" + crypto.randomUUID();

    // 1. Verify tenant access to conversation
    const conv = db
      .prepare("SELECT * FROM conversations WHERE id = ? AND tenant_id = ?")
      .get(outbound.conversationId, outbound.tenantId) as any;

    if (!conv) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: "Conversación no encontrada o no pertenece a esta empresa.",
        timestamp: now,
      };
    }

    // 2. Identify provider adapter
    let provider = outbound.provider;
    if (!provider) {
      if (outbound.channel === "whatsapp") {
        // Check active connection for this tenant
        const conn = db
          .prepare("SELECT provider, status FROM channel_connections WHERE tenant_id = ? AND channel = 'whatsapp' AND status = 'CONECTADO'")
          .get(outbound.tenantId) as { provider: ProviderType; status: string } | undefined;
        
        provider = conn?.provider || "meta_cloud_api";
      } else if (outbound.channel === "telegram") {
        provider = "telegram_bot_api";
      } else {
        provider = "webchat_native";
      }
    }

    const connector = this.registry.get(provider);
    if (!connector) {
      const errorMsg = `No se encontró conector registrado para el proveedor: ${provider}`;
      this.recordFailedMessage(outbound, messageId, errorMsg);
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: errorMsg,
        timestamp: now,
      };
    }

    // 3. Dispatch to Connector Adapter
    const sendResult = await connector.sendMessage(outbound);

    if (!sendResult.success || sendResult.deliveryStatus === "SEND_FAILED" || sendResult.deliveryStatus === "failed") {
      // Record as SEND_FAILED in database
      this.recordFailedMessage(outbound, messageId, sendResult.error || "Fallo en conector externo.");

      logAudit({
        tenantId: outbound.tenantId,
        eventType: "message_send_failed",
        actor: "MessageService",
        ipAddress: "internal",
        details: `Fallo al enviar mensaje en canal ${outbound.channel} (${provider}): ${sendResult.error}`,
        severity: "warning",
      });

      return {
        ...sendResult,
        deliveryStatus: "SEND_FAILED",
      };
    }

    // 4. Record as Successfully Sent in Database
    db.prepare(`
      INSERT INTO messages (
        id, tenant_id, conversation_id, sender, text, status, created_at
      ) VALUES (?, ?, ?, 'agent', ?, 'sent', ?)
    `).run(
      messageId,
      outbound.tenantId,
      outbound.conversationId,
      sanitizeText(outbound.content, 5000),
      now
    );

    // Update conversation last message & timestamp
    db.prepare(`
      UPDATE conversations
      SET last_message = ?, last_message_time = ?, updated_at = ?
      WHERE id = ? AND tenant_id = ?
    `).run(sanitizeText(outbound.content, 200), now, now, outbound.conversationId, outbound.tenantId);

    return {
      success: true,
      externalMessageId: sendResult.externalMessageId || messageId,
      deliveryStatus: "sent",
      timestamp: now,
    };
  }

  private recordFailedMessage(outbound: NormalizedOutboundMessage, messageId: string, errorReason: string): void {
    const now = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO messages (
          id, tenant_id, conversation_id, sender, text, status, created_at
        ) VALUES (?, ?, ?, 'agent', ?, 'SEND_FAILED', ?)
      `).run(
        messageId,
        outbound.tenantId,
        outbound.conversationId,
        `[FALLO DE ENVÍO: ${sanitizeText(errorReason, 200)}] ${sanitizeText(outbound.content, 5000)}`,
        now
      );
    } catch (err) {
      console.error("[MessageService] Error registrando mensaje fallido:", err);
    }
  }
}
