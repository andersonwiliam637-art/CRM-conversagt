// server/connectors/adapters/WhatsAppWebConnector.ts
import type {
  ChannelConnector,
  ChannelType,
  ProviderType,
  HealthCheckResult,
  NormalizedInboundMessage,
  NormalizedOutboundMessage,
  SendResult,
  WhatsAppWebMicroserviceContract,
} from "../types.js";

/**
 * WhatsApp Web — Sesión Vinculada Connector
 *
 * Architecture Specification & Dedicated Microservice Contract:
 * - Conector alternativo mediante sesión vinculada (QR / Pairing Code).
 * - NOT Meta Cloud API.
 * - Decoupled adapter contract designed to interface with a future external dedicated microservice.
 * - In accordance with specifications: NO unofficial libraries installed inside this core repository.
 * - Explicit Security & Risk Warning included in every verification payload.
 */
export class WhatsAppWebConnector implements ChannelConnector {
  public readonly channel: ChannelType = "whatsapp";
  public readonly provider: ProviderType = "whatsapp_web_linked";

  public static readonly DISCLAIMER =
    "Conector alternativo mediante sesión vinculada. No corresponde a Meta Cloud API. " +
    "Aviso importante: No es una integración oficial de Meta. Puede tener riesgos de compatibilidad, " +
    "desconexión automática por suspensión de energía del dispositivo o suspensión de cuenta si se utiliza para envíos masivos no autorizados.";

  /**
   * Complete architectural specification of the future external worker microservice.
   */
  public static getMicroserviceContract(): WhatsAppWebMicroserviceContract {
    return {
      serviceName: "conversagt-wa-web-worker",
      version: "1.0.0-architecture-draft",
      architecture: "decoupled_microservice",
      protocols: ["HTTP/REST", "WebSocket"],
      endpoints: {
        health: "GET /api/v1/health",
        createSession: "POST /api/v1/sessions",
        getSessionStatus: "GET /api/v1/sessions/:sessionId",
        getQrCode: "GET /api/v1/sessions/:sessionId/qr",
        requestPairingCode: "POST /api/v1/sessions/:sessionId/pair",
        sendMessage: "POST /api/v1/sessions/:sessionId/messages",
        terminateSession: "DELETE /api/v1/sessions/:sessionId",
      },
      events: [
        "session.qr_generated",
        "session.authenticated",
        "session.disconnected",
        "message.inbound",
        "message.status_update",
      ],
      disclaimer: WhatsAppWebConnector.DISCLAIMER,
    };
  }

  /**
   * Health Check:
   * Honest check against configured microservice URL (WHATSAPP_WEB_SERVICE_URL).
   * - If no microservice URL configured: returns NO_CONFIGURADO (or DEMO_DATOS_PRUEBA if explicitly running in sandbox demo mode).
   * - If microservice configured: performs real HTTP ping to /api/v1/health.
   * - NEVER claims CONECTADO without a real verified worker responding.
   */
  public async healthCheck(_tenantId: string, _connectionId: string): Promise<HealthCheckResult> {
    const workerUrl = process.env.WHATSAPP_WEB_SERVICE_URL;

    // Check if worker service is explicitly defined
    if (!workerUrl) {
      return {
        status: "NO_CONFIGURADO",
        lastVerifiedAt: new Date().toISOString(),
        maskedIdentifier: "Sin microservicio asignado",
        error: "Microservicio dedicado de WhatsApp Web no configurado (WHATSAPP_WEB_SERVICE_URL ausente).",
        details: {
          warning: WhatsAppWebConnector.DISCLAIMER,
          adapterReady: true,
          contractVersion: "1.0.0",
          statusNote: "El adaptador está preparado para conectar con el microservicio dedicado cuando sea desplegado.",
        },
      };
    }

    // Attempt ping to dedicated worker service
    const startTime = Date.now();
    try {
      const res = await fetch(`${workerUrl.replace(/\/$/, "")}/api/v1/health`, {
        method: "GET",
        headers: { "X-Tenant-Id": _tenantId },
        signal: AbortSignal.timeout(4000),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        return {
          status: "ERROR_CONEXION",
          lastVerifiedAt: new Date().toISOString(),
          latencyMs,
          error: `Microservicio WhatsApp Web respondió con estado HTTP ${res.status}`,
          details: { warning: WhatsAppWebConnector.DISCLAIMER },
        };
      }

      const data = await res.json();
      return {
        status: data.sessionActive ? "CONECTADO" : "CONFIGURACION_PENDIENTE",
        lastVerifiedAt: new Date().toISOString(),
        latencyMs,
        maskedIdentifier: data.phone ? `•••• ${data.phone.slice(-4)}` : "Sesión sin vincular",
        details: {
          warning: WhatsAppWebConnector.DISCLAIMER,
          workerVersion: data.version || "1.0.0",
          batteryStatus: data.battery,
          platform: data.platform,
        },
      };
    } catch (err: any) {
      return {
        status: "ERROR_CONEXION",
        lastVerifiedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: `No se pudo establecer conexión con el microservicio WhatsApp Web (${err.message || "Timeout"}).`,
        details: { warning: WhatsAppWebConnector.DISCLAIMER },
      };
    }
  }

  /**
   * Retrieves current WhatsAppWebSession from microservice or returns honest NO_CONFIGURADO status.
   */
  public async getSession(tenantId: string, connectionId: string): Promise<import("../types.js").WhatsAppWebSession> {
    const workerUrl = process.env.WHATSAPP_WEB_SERVICE_URL;

    if (!workerUrl) {
      return {
        connectionId,
        tenantId,
        status: "NO_CONFIGURADO",
        qr: null,
        qrExpiresAt: null,
        phoneNumber: null,
        displayName: null,
        lastConnectedAt: null,
        lastHeartbeatAt: null,
        errorCode: "MICROSERVICE_NOT_CONFIGURED",
        errorMessage: "El microservicio de WhatsApp Web todavía no está configurado (WHATSAPP_WEB_SERVICE_URL ausente en variables de entorno del servidor).",
      };
    }

    try {
      const res = await fetch(`${workerUrl.replace(/\/$/, "")}/api/v1/sessions/${connectionId}`, {
        method: "GET",
        headers: { "X-Tenant-Id": tenantId },
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        return {
          connectionId,
          tenantId,
          status: "ERROR",
          errorCode: `HTTP_${res.status}`,
          errorMessage: `Microservicio WhatsApp Web respondió con error HTTP ${res.status}`,
          qr: null,
        };
      }

      const data = await res.json();
      return {
        connectionId,
        tenantId,
        status: data.status || (data.qr ? "QR_DISPONIBLE" : data.sessionActive ? "CONECTADO" : "ESPERANDO_QR"),
        qr: data.qr || null,
        qrExpiresAt: data.qrExpiresAt || null,
        phoneNumber: data.phoneNumber || null,
        displayName: data.displayName || null,
        lastConnectedAt: data.lastConnectedAt || null,
        lastHeartbeatAt: data.lastHeartbeatAt || null,
        errorCode: data.errorCode || null,
        errorMessage: data.errorMessage || null,
      };
    } catch (err: any) {
      return {
        connectionId,
        tenantId,
        status: "ERROR",
        errorCode: "CONNECTION_TIMEOUT",
        errorMessage: `No se pudo comunicar con el microservicio WhatsApp Web (${err.message || "Timeout"}).`,
        qr: null,
      };
    }
  }

  /**
   * Requests a fresh QR code from the microservice.
   */
  public async requestNewQr(tenantId: string, connectionId: string): Promise<import("../types.js").WhatsAppWebSession> {
    const workerUrl = process.env.WHATSAPP_WEB_SERVICE_URL;

    if (!workerUrl) {
      return {
        connectionId,
        tenantId,
        status: "NO_CONFIGURADO",
        qr: null,
        qrExpiresAt: null,
        errorCode: "MICROSERVICE_NOT_CONFIGURED",
        errorMessage: "El microservicio de WhatsApp Web todavía no está configurado. No es posible generar códigos QR reales sin el microservicio dedicado.",
      };
    }

    try {
      const res = await fetch(`${workerUrl.replace(/\/$/, "")}/api/v1/sessions/${connectionId}/qr`, {
        method: "POST",
        headers: { "X-Tenant-Id": tenantId },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        return {
          connectionId,
          tenantId,
          status: "ERROR",
          errorCode: `HTTP_${res.status}`,
          errorMessage: `Microservicio rechazó la generación del código QR (HTTP ${res.status})`,
        };
      }

      const data = await res.json();
      return {
        connectionId,
        tenantId,
        status: "QR_DISPONIBLE",
        qr: data.qr,
        qrExpiresAt: data.qrExpiresAt || new Date(Date.now() + 60000).toISOString(),
      };
    } catch (err: any) {
      return {
        connectionId,
        tenantId,
        status: "ERROR",
        errorCode: "FETCH_FAILED",
        errorMessage: `Error al contactar microservicio para solicitud de QR: ${err.message}`,
      };
    }
  }

  /**
   * Disconnects active session via microservice.
   */
  public async disconnectSession(tenantId: string, connectionId: string): Promise<import("../types.js").WhatsAppWebSession> {
    const workerUrl = process.env.WHATSAPP_WEB_SERVICE_URL;

    if (!workerUrl) {
      return {
        connectionId,
        tenantId,
        status: "NO_CONFIGURADO",
      };
    }

    try {
      await fetch(`${workerUrl.replace(/\/$/, "")}/api/v1/sessions/${connectionId}`, {
        method: "DELETE",
        headers: { "X-Tenant-Id": tenantId },
        signal: AbortSignal.timeout(4000),
      });
      return {
        connectionId,
        tenantId,
        status: "DESCONECTADO",
      };
    } catch {
      return {
        connectionId,
        tenantId,
        status: "DESCONECTADO",
      };
    }
  }

  /**
   * Normalizes incoming event from dedicated microservice into standard NormalizedInboundMessage
   */
  public async normalizeInbound(payload: any, _headers?: Record<string, any>): Promise<NormalizedInboundMessage | null> {
    try {
      if (!payload || !payload.senderPhone || !payload.content) {
        return null;
      }

      const senderPhone = String(payload.senderPhone).trim();
      const senderName = payload.senderName || `WhatsApp Web (${senderPhone.slice(-4)})`;

      return {
        tenantId: payload.tenantId || "",
        connectionId: payload.connectionId || "conn-wa-web-default",
        channel: "whatsapp",
        provider: "whatsapp_web_linked",
        externalConversationId: senderPhone,
        externalMessageId: payload.messageId || `waw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        externalContactId: senderPhone,
        sender: {
          id: senderPhone,
          name: senderName,
          phone: senderPhone,
        },
        recipient: {
          id: payload.botPhone || "agent_session",
          name: "Sesión Vinculada",
          phone: payload.botPhone,
        },
        messageType: payload.messageType || "text",
        content: String(payload.content),
        timestamp: payload.timestamp || new Date().toISOString(),
        attachments: payload.attachments || [],
        metadata: {
          source: "whatsapp_web_microservice",
          pushName: payload.pushName,
          isGroup: Boolean(payload.isGroup),
        },
        isDemo: Boolean(payload.isDemo),
      };
    } catch (err) {
      console.error("[WhatsAppWebConnector] Error normalizando evento entrante:", err);
      return null;
    }
  }

  /**
   * Sends outbound message via microservice.
   * If microservice is offline or session not paired, returns SEND_FAILED.
   */
  public async sendMessage(message: NormalizedOutboundMessage): Promise<SendResult> {
    const workerUrl = process.env.WHATSAPP_WEB_SERVICE_URL;

    if (!workerUrl) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: "SEND_FAILED: Microservicio de WhatsApp Web no disponible (WHATSAPP_WEB_SERVICE_URL no configurado).",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const res = await fetch(`${workerUrl.replace(/\/$/, "")}/api/v1/sessions/${message.connectionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": message.tenantId,
        },
        body: JSON.stringify({
          recipient: message.recipient.phone || message.recipient.id,
          content: message.content,
          messageType: message.messageType,
          attachments: message.attachments,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          deliveryStatus: "SEND_FAILED",
          error: `SEND_FAILED: Microservicio WhatsApp Web rechazó el envío (${errorData.error || res.statusText}).`,
          timestamp: new Date().toISOString(),
        };
      }

      const resData = await res.json();
      return {
        success: true,
        externalMessageId: resData.messageId || `waw_out_${Date.now()}`,
        deliveryStatus: "sent",
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: `SEND_FAILED: Fallo de comunicación con el microservicio WhatsApp Web (${err.message || "Timeout"}).`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
