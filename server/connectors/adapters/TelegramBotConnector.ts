// server/connectors/adapters/TelegramBotConnector.ts
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
 * Telegram Bot API Connector
 */
export class TelegramBotConnector implements ChannelConnector {
  public readonly channel: ChannelType = "telegram";
  public readonly provider: ProviderType = "telegram_bot_api";

  private getToken(tenantId: string): string | null {
    try {
      const row = db
        .prepare("SELECT config_json FROM channel_configs WHERE tenant_id = ? AND channel_type = 'telegram_bot'")
        .get(tenantId) as { config_json: string } | undefined;

      if (row && row.config_json) {
        const parsed = JSON.parse(row.config_json);
        if (parsed.token) return parsed.token;
      }
    } catch {}

    return process.env.TELEGRAM_BOT_TOKEN || null;
  }

  public async healthCheck(tenantId: string, _connectionId: string): Promise<HealthCheckResult> {
    const token = this.getToken(tenantId);
    if (!token) {
      return {
        status: "NO_CONFIGURADO",
        lastVerifiedAt: new Date().toISOString(),
        maskedIdentifier: "Sin bot vinculado",
        error: "Token de Telegram Bot no configurado para este tenant.",
      };
    }

    const startTime = Date.now();
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
        signal: AbortSignal.timeout(5000),
      });

      const latencyMs = Date.now() - startTime;
      if (!res.ok) {
        return {
          status: "ERROR_CONEXION",
          lastVerifiedAt: new Date().toISOString(),
          latencyMs,
          error: `Error de API de Telegram: HTTP ${res.status}`,
          maskedIdentifier: "Token inválido",
        };
      }

      const data = await res.json();
      if (!data.ok || !data.result) {
        return {
          status: "ERROR_CONEXION",
          lastVerifiedAt: new Date().toISOString(),
          latencyMs,
          error: "Respuesta inválida de Telegram getMe.",
          maskedIdentifier: "Token no válido",
        };
      }

      const username = `@${data.result.username}`;
      return {
        status: "CONECTADO",
        lastVerifiedAt: new Date().toISOString(),
        latencyMs,
        maskedIdentifier: username,
        details: {
          botId: data.result.id,
          firstName: data.result.first_name,
          canJoinGroups: data.result.can_join_groups,
        },
      };
    } catch (err: any) {
      return {
        status: "ERROR_CONEXION",
        lastVerifiedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: `Fallo de conexión con Telegram: ${err.message || "Timeout"}`,
        maskedIdentifier: "Fallo de red",
      };
    }
  }

  public async normalizeInbound(payload: any, _headers?: Record<string, any>): Promise<NormalizedInboundMessage | null> {
    try {
      const msg = payload?.message || payload?.channel_post;
      if (!msg) return null;

      const chatId = String(msg.chat?.id || "");
      const from = msg.from || {};
      const senderName = [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || `Usuario TG (${chatId.slice(-4)})`;

      return {
        tenantId: "",
        connectionId: "conn-telegram-default",
        channel: "telegram",
        provider: "telegram_bot_api",
        externalConversationId: chatId,
        externalMessageId: String(msg.message_id),
        externalContactId: String(from.id || chatId),
        sender: {
          id: String(from.id || chatId),
          name: senderName,
        },
        recipient: {
          id: "bot",
          name: "ConversaGT Telegram Bot",
        },
        messageType: msg.photo ? "image" : msg.voice ? "audio" : msg.document ? "document" : "text",
        content: msg.text || msg.caption || "[Multimedia Telegram]",
        timestamp: new Date(msg.date * 1000).toISOString(),
        metadata: {
          chatType: msg.chat?.type,
        },
      };
    } catch (err) {
      console.error("[TelegramBotConnector] Error normalizando evento:", err);
      return null;
    }
  }

  public async sendMessage(message: NormalizedOutboundMessage): Promise<SendResult> {
    const token = this.getToken(message.tenantId);
    if (!token) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: "SEND_FAILED: Token de Telegram no configurado para este tenant.",
        timestamp: new Date().toISOString(),
      };
    }

    const chatId = message.recipient.id || message.recipient.phone;
    if (!chatId) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: "SEND_FAILED: Chat ID de Telegram no especificado.",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.content,
          parse_mode: "Markdown",
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          deliveryStatus: "SEND_FAILED",
          error: `SEND_FAILED: Telegram rechazó el mensaje (${errJson.description || res.statusText}).`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await res.json();
      return {
        success: true,
        externalMessageId: String(data.result?.message_id || Date.now()),
        deliveryStatus: "sent",
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        deliveryStatus: "SEND_FAILED",
        error: `SEND_FAILED: Error de red con Telegram (${err.message || "Timeout"}).`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
