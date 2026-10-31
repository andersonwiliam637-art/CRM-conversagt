export type ChannelType = 'whatsapp' | 'instagram' | 'messenger' | 'webchat' | 'telegram';

export type ViewType =
  | 'inicio'
  | 'conversations'
  | 'clients'
  | 'automation'
  | 'marketing'
  | 'analytics'
  | 'settings'
  | 'business_portal'
  | 'campaigns'
  | 'documents'
  | 'payments'
  | 'legal'
  | 'admin_activation'
  | 'public_portal';

export type PriorityType = 'vip' | 'high' | 'normal' | 'low';

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'archived';

export type IntegrationStatus =
  | 'NO_CONFIGURADO'
  | 'CONFIGURACION_PENDIENTE'
  | 'VERIFICANDO'
  | 'CONECTADO'
  | 'ERROR_CONEXION'
  | 'DEMO_DATOS_PRUEBA';

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

export type ProviderType = 
  | 'meta_cloud_api' 
  | 'whatsapp_web_linked' 
  | 'telegram_bot_api' 
  | 'webchat_native';

export type MessageDeliveryStatus = 
  | 'pending'
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed'
  | 'SEND_FAILED';

export interface ChannelConnection {
  id: string;
  tenantId: string;
  channel: ChannelType;
  provider: ProviderType;
  name: string;
  status: IntegrationStatus;
  maskedIdentifier: string;
  lastVerifiedAt: string | null;
  warningMessage?: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedInboundMessage {
  tenantId: string;
  connectionId: string;
  channel: ChannelType;
  provider: ProviderType;
  externalConversationId: string;
  externalMessageId: string;
  externalContactId: string;
  sender: { id: string; name?: string; phone?: string; email?: string; avatar?: string };
  recipient: { id: string; name?: string; phone?: string };
  messageType: 'text' | 'image' | 'audio' | 'document' | 'location' | 'template' | 'system';
  content: string;
  timestamp: string;
  attachments?: Array<{ url: string; mimeType: string; fileName?: string; sizeBytes?: number }>;
  metadata?: Record<string, any>;
  isDemo?: boolean;
}

export interface NormalizedOutboundMessage {
  tenantId: string;
  connectionId: string;
  conversationId: string;
  channel: ChannelType;
  provider?: ProviderType;
  recipient: { id: string; phone?: string; externalContactId?: string };
  messageType: 'text' | 'image' | 'audio' | 'document' | 'template';
  content: string;
  attachments?: Array<{ url: string; mimeType: string; fileName?: string }>;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'agent' | 'bot_gemini';
  text: string;
  timestamp: string;
  status: MessageDeliveryStatus;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'pdf';
  aiSuggested?: boolean;
  sentiment?: 'positivo' | 'neutral' | 'urgente';
  errorMessage?: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  customerPhone: string;
  customerEmail: string;
  channel: ChannelType;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: ConversationStatus;
  priority: PriorityType;
  assignedAgent: string;
  tags: string[];
  intentScore: number; // 0 - 100
  geminiSummary?: string;
  messages: ChatMessage[];
  isDemo?: boolean;
}

export type ClientStage = 'nuevo' | 'contactado' | 'negociacion' | 'ganado' | 'vip';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  stage: ClientStage;
  ltv: number;
  dealsCount: number;
  channelOrigin: ChannelType;
  tags: string[];
  lastContactDate: string;
  notes: string;
  assignedTo: string;
  paymentMethodPreferred: 'card' | 'paypal' | 'bank_transfer';
  activationStatus?: 'activo' | 'pendiente_verificacion' | 'inactivo';
  paymentConfirmed?: boolean;
  registeredDate?: string;
  botEnabled?: boolean;
  leadSource?: 'tiktok' | 'instagram' | 'facebook' | 'whatsapp' | 'web';
  selectedPlan?: string;
  isDemo?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'whatsapp' | 'sms' | 'email';
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  targetSegment: string;
  audienceSize: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  templateBody: string;
  buttons: { text: string; action: string }[];
  createdAt: string;
  geminiOptimized: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'legal' | 'sop' | 'product_catalog' | 'pricing' | 'whatsapp_policy' | 'faq' | 'web_url';
  fileType: 'pdf' | 'docx' | 'markdown' | 'faq' | 'url' | 'txt' | 'json';
  size: string;
  uploadedAt: string;
  chunksCount: number;
  status: 'indexed' | 'processing' | 'error';
  content: string;
  description: string;
  sourceUrl?: string;
  faqPairsCount?: number;
}

export interface BankAccountInfo {
  id: string;
  bankName: string;
  country: string;
  currency: 'USD' | 'GTQ' | 'EUR' | 'MXN';
  accountType: 'Monetaria' | 'Ahorro' | 'Checking';
  accountNumber: string;
  accountHolder: string;
  taxId: string;
  swiftBic: string;
  routingNumber?: string;
  iban?: string;
  instructions: string;
  activeForCheckout: boolean;
}

export interface PaymentGatewayConfig {
  card: {
    enabled: boolean;
    provider: 'Stripe' | 'AuthorizeNet' | '3D_Secure';
    liveMode: boolean;
    acceptedCards: string[];
    autoCapture: boolean;
  };
  paypal: {
    enabled: boolean;
    businessEmail: string;
    clientId: string;
    sandbox: boolean;
    instantPayout: boolean;
  };
  bankTransfer: {
    enabled: boolean;
    banks: BankAccountInfo[];
    verificationRequired: boolean;
    autoInstructionsEmail: boolean;
  };
}

export interface TransactionRecord {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planOrItem: string;
  amount: number;
  currency: string;
  method: 'card' | 'paypal' | 'bank_transfer';
  status: 'completed' | 'pending_verification' | 'failed' | 'refunded';
  date: string;
  authorizationCode?: string;
  bankReference?: string;
  paypalOrderId?: string;
  receiptMessage?: string;
}

export interface LegalDocument {
  id: string;
  key: 'terms' | 'privacy' | 'dpa' | 'ai_policy' | 'sla' | 'refunds' | 'whatsapp_optin' | 'ingenieroai_license' | 'guatemala_law' | 'telegram_terms' | string;
  title: string;
  badge: string;
  category: string;
  lastUpdated: string;
  version: string;
  summary: string;
  fullText: string;
  enforceableJurisdictions: string[];
  keyClauses: { title: string; desc: string }[];
}

export interface AnalyticsKPI {
  totalConversations: number;
  resolutionRate: number;
  responseTimeAvgSeconds: number;
  csatScore: number;
  activeAiAssists: number;
  revenueGenerated: number;
  channelBreakdown: { channel: string; count: number; percentage: number; color: string }[];
  monthlyTrends: { month: string; conversations: number; sales: number }[];
}

export interface SimpleBankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: string;
}

export interface BankSlipSubmission {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bankName: string;
  accountNumber: string;
  slipNumber: string;
  amount: number;
  currency: 'GTQ' | 'USD';
  planName: string;
  submissionDate: string;
  status: 'pendiente_verificacion' | 'aprobado' | 'rechazado';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  imageUrl?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: 'admin_login_success' | 'admin_login_failed' | 'slip_approved' | 'slip_rejected' | 'waf_rate_limit' | 'telegram_connected' | 'whatsapp_paired';
  ipAddress: string;
  actor: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface BusinessAccount {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  industry: 'ferreteria' | 'repuestos' | 'clinica' | 'restaurante' | 'inmobiliaria' | 'moda' | 'servicios' | 'otro';
  currency: 'GTQ' | 'USD';
  planName: string;
  planPrice: number;
  status: 'active' | 'pending_activation' | 'pending_payment' | 'trial' | 'inactive';
  subscriptionExpiresAt: string;
  daysRemaining: number;
  activationDate?: string;
  activatedBy?: string;
  whatsappConnected: boolean;
  whatsappPhone?: string;
  telegramConnected?: boolean;
  telegramBotUsername?: string;
  telegramBotToken?: string;
  telegramBotStatus?: 'connected' | 'disconnected' | 'configuring';
  bankAccounts: SimpleBankAccount[];
  paymentInstructions: string;
  customGreeting?: string;
  documentsCount: number;
  messagesCount: number;
}
