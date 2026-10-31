// server/connectors/types.ts - Omnichannel Connector Types & Contracts

export type ChannelType = 'whatsapp' | 'telegram' | 'instagram' | 'webchat';

export type ProviderType = 
  | 'meta_cloud_api' 
  | 'whatsapp_web_linked' 
  | 'telegram_bot_api' 
  | 'webchat_native';

export type ConnectionStatus =
  | 'NO_CONFIGURADO'
  | 'CONFIGURACION_PENDIENTE'
  | 'VERIFICANDO'
  | 'CONECTADO'
  | 'ERROR_CONEXION'
  | 'DEMO_DATOS_PRUEBA';

export type DeliveryStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'SEND_FAILED';

export type MessageContentType =
  | 'text'
  | 'image'
  | 'audio'
  | 'document'
  | 'location'
  | 'template'
  | 'system';

export interface MessageAttachment {
  url: string;
  mimeType: string;
  fileName?: string;
  sizeBytes?: number;
}

export interface ContactIdentity {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

/**
 * Normalized Inbound Message Model (Universal across all channels)
 */
export interface NormalizedInboundMessage {
  tenantId: string;
  connectionId: string;
  channel: ChannelType;
  provider: ProviderType;
  externalConversationId: string;
  externalMessageId: string;
  externalContactId: string;
  sender: ContactIdentity;
  recipient: ContactIdentity;
  messageType: MessageContentType;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
  isDemo?: boolean;
}

/**
 * Normalized Outbound Message Model (Universal across all channels)
 */
export interface NormalizedOutboundMessage {
  tenantId: string;
  connectionId: string;
  conversationId: string;
  channel: ChannelType;
  provider?: ProviderType;
  recipient: ContactIdentity;
  messageType: MessageContentType;
  content: string;
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
}

export interface SendResult {
  success: boolean;
  externalMessageId?: string;
  deliveryStatus: DeliveryStatus;
  error?: string;
  timestamp: string;
}

export interface HealthCheckResult {
  status: ConnectionStatus;
  lastVerifiedAt: string;
  latencyMs?: number;
  error?: string;
  maskedIdentifier?: string;
  details?: Record<string, any>;
}

/**
 * Channel Connection Entity (Safe for Frontend - ZERO CREDENTIALS EXPOSED)
 */
export interface ChannelConnectionDTO {
  id: string;
  tenantId: string;
  channel: ChannelType;
  provider: ProviderType;
  name: string;
  status: ConnectionStatus;
  maskedIdentifier: string;
  lastVerifiedAt: string | null;
  warningMessage?: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard Channel Connector Interface
 * Every external channel provider must implement this adapter contract.
 */
export interface ChannelConnector {
  readonly channel: ChannelType;
  readonly provider: ProviderType;

  /**
   * Performs an honest health check verification.
   * NEVER returns CONECTADO unless verified against the live provider.
   */
  healthCheck(tenantId: string, connectionId: string): Promise<HealthCheckResult>;

  /**
   * Dispatches a normalized outbound message to the external provider.
   * If delivery fails, must return success=false and deliveryStatus='failed' or 'SEND_FAILED'.
   */
  sendMessage(message: NormalizedOutboundMessage): Promise<SendResult>;

  /**
   * Normalizes provider-specific webhook payload into the common Inbound model.
   */
  normalizeInbound(payload: any, headers?: Record<string, any>): Promise<NormalizedInboundMessage | null>;
}

/**
 * Real WhatsApp Web Session Contract (From future dedicated worker microservice)
 */
export type WhatsAppWebStatus =
  | 'NO_CONFIGURADO'
  | 'CONFIGURACION_PENDIENTE'
  | 'ESPERANDO_QR'
  | 'QR_DISPONIBLE'
  | 'VERIFICANDO'
  | 'CONECTADO'
  | 'DESCONECTADO'
  | 'ERROR'
  | 'DEMO';

export interface WhatsAppWebSession {
  connectionId: string;
  tenantId: string;
  status: WhatsAppWebStatus;
  qr?: string | null;
  qrExpiresAt?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  lastConnectedAt?: string | null;
  lastHeartbeatAt?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  isDemo?: boolean;
}

/**
 * Future Microservice Contract Specification for WhatsApp Web (Linked Session)
 */
export interface WhatsAppWebMicroserviceContract {
  serviceName: string;
  version: string;
  architecture: 'decoupled_microservice';
  protocols: ['HTTP/REST', 'WebSocket'];
  endpoints: {
    health: 'GET /api/v1/health';
    createSession: 'POST /api/v1/sessions';
    getSessionStatus: 'GET /api/v1/sessions/:sessionId';
    getQrCode: 'GET /api/v1/sessions/:sessionId/qr';
    requestPairingCode: 'POST /api/v1/sessions/:sessionId/pair';
    sendMessage: 'POST /api/v1/sessions/:sessionId/messages';
    terminateSession: 'DELETE /api/v1/sessions/:sessionId';
  };
  events: [
    'session.qr_generated',
    'session.authenticated',
    'session.disconnected',
    'message.inbound',
    'message.status_update'
  ];
  disclaimer: string;
}
