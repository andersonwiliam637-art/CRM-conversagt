import {
  Conversation,
  Client,
  Campaign,
  DocumentItem,
  PaymentGatewayConfig,
  TransactionRecord,
  LegalDocument,
  AnalyticsKPI
} from '../types';

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-101',
    customerId: 'cli-01',
    customerName: 'Arq. Alejandro Morales',
    customerAvatar: '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg',
    customerPhone: '+502 5521 8900',
    customerEmail: 'alejandro@moralesstudio.com',
    channel: 'whatsapp',
    lastMessage: 'Excelente, ¿me puedes enviar el enlace de pago con tarjeta o el número de cuenta monetaria para hacer la transferencia?',
    lastMessageTime: '10:42 AM',
    unreadCount: 1,
    status: 'open',
    priority: 'vip',
    assignedAgent: 'Valeria Méndez (Lead VIP)',
    tags: ['Arquitectura', 'Plan Platinum', 'Lead Caliente', 'Factura Solicitada'],
    intentScore: 96,
    geminiSummary: 'Cliente de alto perfil solicita link de pago para plan Platinum anual y confirmación de cuentas bancarias.',
    messages: [
      {
        id: 'm-1',
        conversationId: 'conv-101',
        sender: 'user',
        text: 'Hola equipo ConversaGT. Estuvimos evaluando la demo de la suite con IA Gemini y queremos implementarla para nuestras 14 sedes.',
        timestamp: '10:30 AM',
        status: 'read',
      },
      {
        id: 'm-2',
        conversationId: 'conv-101',
        sender: 'bot_gemini',
        text: '¡Un gusto saludarte Arquitecto Morales! Qué gran noticia. La suite Enterprise cuenta con multi-sede ilimitado, agentes IA dedicados con Gemini y sincronización directa a WhatsApp Business API y CRM.',
        timestamp: '10:31 AM',
        status: 'read',
        aiSuggested: true,
      },
      {
        id: 'm-3',
        conversationId: 'conv-101',
        sender: 'agent',
        text: 'Hola Alejandro, un placer atenderle. Le hemos preparado la cotización con el 15% de descuento por suscripción anual y configuración llave en mano.',
        timestamp: '10:35 AM',
        status: 'read',
      },
      {
        id: 'm-4',
        conversationId: 'conv-101',
        sender: 'user',
        text: 'Excelente, ¿me puedes enviar el enlace de pago con tarjeta o el número de cuenta monetaria para hacer la transferencia?',
        timestamp: '10:42 AM',
        status: 'delivered',
        sentiment: 'positivo',
      }
    ]
  },
  {
    id: 'conv-102',
    customerId: 'cli-02',
    customerName: 'Licda. Sofía Castillo',
    customerAvatar: '/src/assets/images/avatar_executive_agent_1790539065657.jpg',
    customerPhone: '+502 4410 7733',
    customerEmail: 'sofia@castilloretail.gt',
    channel: 'instagram',
    lastMessage: '¿El bot con Gemini puede consultar el stock de nuestro catálogo en tiempo real desde los documentos?',
    lastMessageTime: '09:15 AM',
    unreadCount: 0,
    status: 'open',
    priority: 'high',
    assignedAgent: 'Carlos Ramos',
    tags: ['E-commerce', 'Catálogo RAG', 'Retail'],
    intentScore: 88,
    geminiSummary: 'Consulta técnica sobre capacidades RAG de Gemini conectadas al inventario de Retail.',
    messages: [
      {
        id: 'm-10',
        conversationId: 'conv-102',
        sender: 'user',
        text: 'Hola, vi sus campañas de WhatsApp automation y me interesa para nuestra cadena de tiendas.',
        timestamp: '09:10 AM',
        status: 'read',
      },
      {
        id: 'm-11',
        conversationId: 'conv-102',
        sender: 'user',
        text: '¿El bot con Gemini puede consultar el stock de nuestro catálogo en tiempo real desde los documentos?',
        timestamp: '09:15 AM',
        status: 'read',
      }
    ]
  },
  {
    id: 'conv-103',
    customerId: 'cli-03',
    customerName: 'Ing. Rodrigo Mendoza',
    customerAvatar: '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg',
    customerPhone: '+502 3301 9922',
    customerEmail: 'rmendoza@logisticsgroup.com',
    channel: 'webchat',
    lastMessage: 'Ya realizamos el pago vía PayPal. Les adjunto la referencia de autorización PAYID-884920.',
    lastMessageTime: 'Ayer',
    unreadCount: 0,
    status: 'resolved',
    priority: 'normal',
    assignedAgent: 'Valeria Méndez',
    tags: ['Pagado', 'PayPal', 'Logística'],
    intentScore: 100,
    geminiSummary: 'Pago procesado exitosamente por PayPal. Activación de credenciales completada.',
    messages: [
      {
        id: 'm-20',
        conversationId: 'conv-103',
        sender: 'user',
        text: 'Ya realizamos el pago vía PayPal. Les adjunto la referencia de autorización PAYID-884920.',
        timestamp: 'Ayer 04:20 PM',
        status: 'read',
        sentiment: 'positivo',
      },
      {
        id: 'm-21',
        conversationId: 'conv-103',
        sender: 'agent',
        text: '¡Confirmado Ing. Mendoza! Su factura electrónica y accesos a la consola Enterprise han sido despachados a su correo.',
        timestamp: 'Ayer 04:25 PM',
        status: 'read',
      }
    ]
  },
  {
    id: 'conv-104',
    customerId: 'cli-04',
    customerName: 'Dra. Carmen Villagrán',
    customerAvatar: '/src/assets/images/avatar_executive_agent_1790539065657.jpg',
    customerPhone: '+502 5900 1144',
    customerEmail: 'carmen@clinicavillagran.com',
    channel: 'messenger',
    lastMessage: 'Necesito saber si cumplen con normativas de privacidad médica y protección de datos antes de contratar.',
    lastMessageTime: 'Ayer',
    unreadCount: 0,
    status: 'pending',
    priority: 'high',
    assignedAgent: 'Legal Compliance Bot',
    tags: ['Salud', 'Legal', 'Privacidad'],
    intentScore: 75,
    geminiSummary: 'Pregunta sobre políticas de privacidad RGPD / HIPAA y procesamiento de datos confidenciales con Gemini.',
    messages: [
      {
        id: 'm-30',
        conversationId: 'conv-104',
        sender: 'user',
        text: 'Necesito saber si cumplen con normativas de privacidad médica y protección de datos antes de contratar.',
        timestamp: 'Ayer 02:15 PM',
        status: 'read',
      }
    ]
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-01',
    name: 'Arq. Alejandro Morales',
    company: 'Morales & Asociados Studio',
    email: 'alejandro@moralesstudio.com',
    phone: '+502 5521 8900',
    avatar: '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg',
    stage: 'vip',
    ltv: 4800,
    dealsCount: 3,
    channelOrigin: 'whatsapp',
    tags: ['VIP', 'Plan Platinum', 'Inmobiliaria', 'Corporativo'],
    lastContactDate: 'Hoy, 10:42 AM',
    notes: 'Cliente de alto valor. Prefiere atención ejecutiva y transferencias bancarias a Banco Industrial.',
    assignedTo: 'Anderson William',
    paymentMethodPreferred: 'bank_transfer',
    activationStatus: 'activo',
    paymentConfirmed: true,
    registeredDate: '15 Ago 2026',
    botEnabled: true,
  },
  {
    id: 'cli-02',
    name: 'Licda. Sofía Castillo',
    company: 'Castillo Retail Group',
    email: 'sofia@castilloretail.gt',
    phone: '+502 4410 7733',
    avatar: '/src/assets/images/avatar_executive_agent_1790539065657.jpg',
    stage: 'negociacion',
    ltv: 2400,
    dealsCount: 1,
    channelOrigin: 'whatsapp',
    tags: ['Retail', 'Catálogo RAG', 'Multi-agente'],
    lastContactDate: 'Hoy, 09:15 AM',
    notes: 'Interesada en automatizar 5,000 conversaciones mensuales de WhatsApp con Gemini.',
    assignedTo: 'Anderson William',
    paymentMethodPreferred: 'card',
    activationStatus: 'pendiente_verificacion',
    paymentConfirmed: false,
    registeredDate: '28 Ago 2026',
    botEnabled: true,
  },
  {
    id: 'cli-03',
    name: 'Ing. Rodrigo Mendoza',
    company: 'TransLogistics Global',
    email: 'rmendoza@logisticsgroup.com',
    phone: '+502 3301 9922',
    avatar: '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg',
    stage: 'ganado',
    ltv: 3600,
    dealsCount: 2,
    channelOrigin: 'whatsapp',
    tags: ['Enterprise', 'PayPal Activo', 'Logística'],
    lastContactDate: 'Ayer, 04:25 PM',
    notes: 'Suscripción Enterprise anual pagada mediante PayPal. Renovación automática en Octubre.',
    assignedTo: 'Anderson William',
    paymentMethodPreferred: 'paypal',
    activationStatus: 'activo',
    paymentConfirmed: true,
    registeredDate: '10 Ago 2026',
    botEnabled: true,
  },
  {
    id: 'cli-04',
    name: 'Dra. Carmen Villagrán',
    company: 'Red Médica Especializada',
    email: 'carmen@clinicavillagran.com',
    phone: '+502 5900 1144',
    avatar: '/src/assets/images/avatar_executive_agent_1790539065657.jpg',
    stage: 'contactado',
    ltv: 1200,
    dealsCount: 1,
    channelOrigin: 'whatsapp',
    tags: ['Salud', 'Legal', 'Citas Médicas'],
    lastContactDate: 'Ayer, 02:15 PM',
    notes: 'Revisando acuerdos DPA y políticas de privacidad antes de firma.',
    assignedTo: 'Anderson William',
    paymentMethodPreferred: 'card',
    activationStatus: 'pendiente_verificacion',
    paymentConfirmed: false,
    registeredDate: '01 Sep 2026',
    botEnabled: true,
  },
  {
    id: 'cli-05',
    name: 'Lic. Fernando Gutiérrez',
    company: 'Innova Finanzas & Seguros',
    email: 'fgutierrez@innovafin.com',
    phone: '+502 4899 3311',
    avatar: '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg',
    stage: 'nuevo',
    ltv: 0,
    dealsCount: 0,
    channelOrigin: 'whatsapp',
    tags: ['Fintech', 'Seguros', 'Prospección'],
    lastContactDate: '21 Ago 2026',
    notes: 'Lead entrante desde campaña de WhatsApp. Requiere demo de pasarelas de pago y chatbots.',
    assignedTo: 'Anderson William',
    paymentMethodPreferred: 'bank_transfer',
    activationStatus: 'inactivo',
    paymentConfirmed: false,
    registeredDate: '02 Sep 2026',
    botEnabled: false,
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-01',
    title: 'Manual de Políticas y Procedimientos de Pagos ConversaGT',
    category: 'legal',
    fileType: 'pdf',
    size: '1.4 MB',
    uploadedAt: '15 Ago 2026',
    chunksCount: 24,
    status: 'indexed',
    description: 'Documento normativo con lineamientos de cobro con tarjeta 3DS, cuentas bancarias autorizadas y reembolsos.',
    content: `CONVERSAGT - POLÍTICAS OFICIALES DE PAGOS Y TRANSACCIONES
1. MÉTODOS DE PAGO ACEPTADOS:
- Tarjetas de Crédito y Débito (Visa, Mastercard, American Express) procesadas mediante pasarelas con certificación PCI-DSS Nivel 1 y tokenización 3D Secure 2.0.
- PayPal Commerce Platform: Procesamiento seguro con protección al comprador y facturación proforma.
- Transferencias Bancarias Directas: Cuentas monetarias en Banco Industrial (Guatemala), BAC Credomatic (Regional USD/GTQ) y Chase Bank (USA - Operaciones Internacionales).

2. PROCEDIMIENTO DE VERIFICACIÓN BANCARIA:
- Las transferencias bancarias requieren el envío de boleta o comprobante digital al número oficial o carga en la plataforma.
- El tiempo de acreditación estándar es inmediato para transferencias locales del mismo banco o de 2 a 4 horas hábiles para ACH / transferencias interbancarias.

3. FACTURACIÓN Y TRIBUTACIÓN:
- Toda transacción genera Factura Electrónica (DTE / SAT) emitida automáticamente al correo electrónico registrado del pagador con desglose de IVA y retenciones aplicables.`
  },
  {
    id: 'doc-02',
    title: 'Especificaciones Técnicas del Motor de IA Gemini 3.7 & RAG',
    category: 'sop',
    fileType: 'markdown',
    size: '890 KB',
    uploadedAt: '18 Ago 2026',
    chunksCount: 18,
    status: 'indexed',
    description: 'Arquitectura del sistema de Retrieval-Augmented Generation para búsqueda semántica e inferencia en milisegundos.',
    content: `ARQUITECTURA DE IA GEMINI 3.7 FLASH EN CONVERSAGT
- Modelo Core: Google Gemini 3.7 Flash optimizado para tareas conversacionales de alta velocidad y baja latencia (<350ms).
- Procesamiento RAG: Los documentos cargados son fragmentados en chunks vectoriales semánticos. Cuando el cliente realiza una pregunta en WhatsApp o WebChat, el motor localiza los fragmentos más relevantes y los inyecta en el contexto de Gemini.
- Privacidad de Datos: Ningún dato del cliente ni conversación es utilizado para re-entrenar modelos públicos de IA. Cumplimiento estricto con las políticas de Enterprise Data Governance de Google Cloud.`
  },
  {
    id: 'doc-03',
    title: 'Catálogo de Planes y Tarifas Enterprise 2026-2027',
    category: 'pricing',
    fileType: 'pdf',
    size: '2.1 MB',
    uploadedAt: '20 Ago 2026',
    chunksCount: 14,
    status: 'indexed',
    description: 'Estructura de precios, límites de mensajes en WhatsApp Business API, agentes simultáneos y soporte prioritario.',
    content: `PLANES Y SUSCRIPCIONES CONVERSAGT 2026:
1. Plan Pro Growth ($99 USD / mes):
- Hasta 3,000 conversaciones activas mensuales.
- 5 Agentes humanos simultáneos + 1 Bot Gemini Flash.
- Conexión a WhatsApp, WebChat e Instagram.
- Pasarela de pago estándar (Tarjetas + PayPal).

2. Plan Enterprise Platinum ($299 USD / mes) [MÁS POPULAR]:
- Hasta 15,000 conversaciones activas mensuales.
- Agentes ilimitados + Base de Conocimiento RAG ilimitada.
- Canales completos: WhatsApp Oficial, Instagram DM, Facebook Messenger, Telegram y WebChat.
- Pasarelas completas: Tarjetas 3DS, PayPal, Transferencias Bancarias con conciliación automática.
- SLA 99.9% garantizado por contrato.

3. Plan Unlimited Custom ($599 USD / mes):
- Volumen dedicado sin límites de mensajes.
- Servidor e instancia privada de base de datos.
- Asesor legal y técnico dedicado 24/7.`
  },
  {
    id: 'doc-04',
    title: 'Guía de Políticas y Cumplimiento Meta WhatsApp Business API',
    category: 'whatsapp_policy',
    fileType: 'markdown',
    size: '650 KB',
    uploadedAt: '22 Ago 2026',
    chunksCount: 12,
    status: 'indexed',
    description: 'Protocolos de Opt-In, plantillas aprobadas por Meta, manejo de opt-out (STOP) y ventanas de 24 horas.',
    content: `GUÍA DE CUMPLIMIENTO OFICIAL WHATSAPP BUSINESS & META
1. REQUISITO DE OPT-IN:
- Todo contacto debe haber otorgado su consentimiento explícito para recibir comunicaciones de marketing o notificaciones comerciales.
- Mecanismos válidos: Casillas de verificación en checkout web, mensajes iniciados por el usuario, o formularios QR en sucursales físicas.

2. PLANTILLAS DE MENSAJE (UTILITY, MARKETING, AUTHENTICATION):
- Los mensajes fuera de la ventana de 24 horas deben utilizar plantillas pre-aprobadas por Meta.
- Prohibido el contenido engañoso, spam o venta de productos regulados según la política comercial de WhatsApp.`
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-01',
    name: 'Lanzamiento VIP: Automatización con IA Gemini',
    channel: 'whatsapp',
    status: 'running',
    targetSegment: 'Clientes VIP & Inmobiliarias',
    audienceSize: 1240,
    sentCount: 1180,
    openRate: 98.2,
    clickRate: 42.6,
    conversionRate: 18.4,
    templateBody: 'Estimado/a {{nombre}}, en ConversaGT hemos habilitado el nuevo motor de Inteligencia Artificial Gemini 3.7 para su empresa. Active hoy su prueba de 14 días con soporte VIP y pasarelas de pago listas.',
    buttons: [
      { text: '💎 Activar Demo VIP', action: 'url_demo' },
      { text: '📞 Hablar con Asesor', action: 'agent_call' }
    ],
    createdAt: '22 Ago 2026',
    geminiOptimized: true,
  },
  {
    id: 'cmp-02',
    name: 'Recordatorio de Facturación & Renovación Anual',
    channel: 'whatsapp',
    status: 'scheduled',
    targetSegment: 'Suscripciones por vencer en 15 días',
    audienceSize: 320,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    templateBody: 'Hola {{nombre}}, le recordamos que su membresía Enterprise cuenta con precio congelado al renovar este mes. Puede pagar directamente con tarjeta, PayPal o transferencia bancaria.',
    buttons: [
      { text: '💳 Ver Opciones de Pago', action: 'billing_link' }
    ],
    createdAt: '23 Ago 2026',
    geminiOptimized: true,
  },
  {
    id: 'cmp-03',
    name: 'Re-enganche de Leads Inactivos con Descuento',
    channel: 'sms',
    status: 'completed',
    targetSegment: 'Leads no contactados (+30 días)',
    audienceSize: 2800,
    sentCount: 2800,
    openRate: 94.1,
    clickRate: 28.5,
    conversionRate: 11.2,
    templateBody: 'ConversaGT: {{nombre}}, automatiza tu WhatsApp y aumenta tus ventas un 40%. Código promocional EXCLUSIVO20 válido por 48 horas.',
    buttons: [],
    createdAt: '10 Ago 2026',
    geminiOptimized: false,
  }
];

export const INITIAL_PAYMENT_CONFIG: PaymentGatewayConfig = {
  card: {
    enabled: true,
    provider: 'Stripe',
    liveMode: true,
    acceptedCards: ['Visa', 'Mastercard', 'American Express', 'Diners Club'],
    autoCapture: true,
  },
  paypal: {
    enabled: true,
    businessEmail: 'andersonwiliam637@gmail.com',
    clientId: 'PAYPAL_CLIENT_LIVE_ANDERSON_WILLIAMS_GT',
    sandbox: false,
    instantPayout: true,
  },
  bankTransfer: {
    enabled: true,
    verificationRequired: true,
    autoInstructionsEmail: true,
    banks: [
      {
        id: 'bank-01',
        bankName: 'Banco Industrial, S.A.',
        country: 'Guatemala',
        currency: 'GTQ',
        accountType: 'Ahorro',
        accountNumber: '1402158',
        accountHolder: 'ConversaGT Soluciones Tecnológicas, S.A.',
        taxId: '10293848-1',
        swiftBic: 'BINDGTGC',
        instructions: 'Indicar en la boleta el número de cotización o factura. Notificar al WhatsApp oficial (+502 5521 8900) con comprobante digital.',
        activeForCheckout: true,
      },
      {
        id: 'bank-02',
        bankName: 'Banco Agromercantil (BAM)',
        country: 'Guatemala',
        currency: 'GTQ',
        accountType: 'Ahorro',
        accountNumber: '4030437443',
        accountHolder: 'ConversaGT Soluciones Tecnológicas, S.A.',
        taxId: '10293848-1',
        swiftBic: 'BAMGGTQ',
        instructions: 'Indicar en la boleta el número de cotización o factura. Notificar al WhatsApp oficial (+502 5521 8900) con comprobante digital.',
        activeForCheckout: true,
      }
    ]
  }
};

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-001',
    invoiceNumber: 'INV-2026-8941',
    customerId: 'cli-01',
    customerName: 'Arq. Alejandro Morales',
    customerEmail: 'alejandro@moralesstudio.com',
    planOrItem: 'Suscripción Enterprise Platinum (Anual)',
    amount: 3229.20,
    currency: 'USD',
    method: 'bank_transfer',
    status: 'completed',
    date: '23 Ago 2026, 10:45 AM',
    bankReference: 'BI-TRF-9948201',
    receiptMessage: 'Transferencia confirmada y acreditada en Banco Industrial.',
  },
  {
    id: 'tx-002',
    invoiceNumber: 'INV-2026-8940',
    customerId: 'cli-03',
    customerName: 'Ing. Rodrigo Mendoza',
    customerEmail: 'rmendoza@logisticsgroup.com',
    planOrItem: 'Plan Pro Growth + Paquete 10k WhatsApp',
    amount: 199.00,
    currency: 'USD',
    method: 'paypal',
    status: 'completed',
    date: '22 Ago 2026, 04:20 PM',
    paypalOrderId: 'PAYID-884920',
    receiptMessage: 'Pago verificado por PayPal Commerce Protection.',
  },
  {
    id: 'tx-003',
    invoiceNumber: 'INV-2026-8939',
    customerId: 'cli-02',
    customerName: 'Licda. Sofía Castillo',
    customerEmail: 'sofia@castilloretail.gt',
    planOrItem: 'Módulo de Base de Conocimiento RAG',
    amount: 149.00,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    date: '21 Ago 2026, 11:10 AM',
    authorizationCode: 'AUTH-VISA-9932',
    receiptMessage: 'Aprobado con 3D Secure Visa Signature.',
  },
  {
    id: 'tx-004',
    invoiceNumber: 'INV-2026-8938',
    customerId: 'cli-05',
    customerName: 'Lic. Fernando Gutiérrez',
    customerEmail: 'fgutierrez@innovafin.com',
    planOrItem: 'Setup Inicial Llave en Mano',
    amount: 450.00,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    date: '19 Ago 2026, 02:30 PM',
    authorizationCode: 'AUTH-MC-4410',
    receiptMessage: 'Cobro exitoso con Mastercard Black.',
  }
];

export const INITIAL_LEGAL_DOCS: LegalDocument[] = [
  {
    id: 'legal-01',
    key: 'terms',
    title: 'Términos y Condiciones de Servicio (Terms of Service)',
    badge: 'Contrato Principal',
    category: 'Marco Contractual',
    lastUpdated: '10 de Agosto de 2026',
    version: 'v3.4 Oficial',
    summary: 'Establece los derechos, responsabilidades, propiedad intelectual, condiciones de uso y términos de pago para clientes de ConversaGT.',
    enforceableJurisdictions: ['Guatemala', 'Estados Unidos (Delaware)', 'México', 'Unión Europea'],
    keyClauses: [
      { title: '1. Objeto del Servicio', desc: 'Suministro de software SaaS para gestión omnicanal, automatización de mensajería e integración con modelos de IA.' },
      { title: '2. Disponibilidad y SLA', desc: 'Compromiso de tiempo de actividad del 99.9% mensual con créditos de compensación por interrupciones.' },
      { title: '3. Propiedad de la Información', desc: 'El cliente es el propietario absoluto de sus bases de datos, historiales de clientes y documentos subidos.' },
      { title: '4. Pagos y Suscripciones', desc: 'Tarifas fijas pagaderas mediante Tarjetas, PayPal o Transferencias Bancarias en los términos acordados.' }
    ],
    fullText: `TÉRMINOS Y CONDICIONES GENERALES DE USO Y CONTRATACIÓN DE CONVERSAGT

1. DISPOSICIONES GENERALES Y ACEPTACIÓN
El presente contrato regula el acceso y utilización de la plataforma omnicanal "ConversaGT" (en adelante, la "Plataforma"), provista por CONVERSAGT SOLUCIONES TECNOLÓGICAS, S.A. Al acceder, registrarse o utilizar cualquiera de nuestros servicios, usted (en adelante, el "Cliente") acepta de manera plena, expresa e irrevocable los presentes Términos y Condiciones.

2. DESCRIPCIÓN DE LOS SERVICIOS
ConversaGT proporciona una suite integral de comunicación empresarial que incluye:
a) Bandeja de entrada omnicanal unificada (WhatsApp Business API, Instagram Direct, Facebook Messenger, Telegram, WebChat).
b) Motor de Inteligencia Artificial Copilot y RAG impulsado por modelos avanzados de Google Gemini.
c) Módulos de CRM, difusión de campañas masivas y base de conocimientos documentales.
d) Pasarelas de cobro integradas y facturación digital con soporte para pagos con tarjeta de crédito/débito, PayPal y transferencias bancarias directas.

3. OBLIGACIONES Y POLÍTICAS DE USO ACEPTABLE
El Cliente se compromete a:
- No utilizar la plataforma para el envío de spam, comunicaciones no solicitadas o fraude electrónico.
- Contar con el consentimiento previo y expreso (Opt-in) de los destinatarios finales conforme a las políticas comerciales de Meta Platforms y leyes de protección de datos.
- Proteger y no divulgar las credenciales de acceso de sus operadores o llaves de API.

4. MODELO DE PAGOS, TARIFAS Y SUSCRIPCIONES
- Los precios vigentes se encuentran expresados en Dólares de los Estados Unidos de América (USD) o moneda local equivalente según factura.
- Métodos de pago autorizados: Tarjetas de crédito/débito bajo protocolo seguro 3D Secure, cuentas verificadas de PayPal y transferencias bancarias a las cuentas monetarias oficiales detalladas en la plataforma.
- En caso de transferencias bancarias, la activación o renovación del servicio se formaliza contra presentación del comprobante bancario verificable.

5. LIMITACIÓN DE RESPONSABILIDAD
ConversaGT no será responsable por suspensiones de líneas de WhatsApp derivadas del incumplimiento de las Políticas de Comercio de Meta por parte del Cliente. Nuestra responsabilidad total frente a cualquier reclamación no excederá el importe pagado por el Cliente en los doce (12) meses anteriores al hecho causante.`
  },
  {
    id: 'legal-02',
    key: 'privacy',
    title: 'Política de Privacidad y Tratamiento de Datos (GDPR / CCPA / LATAM)',
    badge: 'Protección de Datos',
    category: 'Cumplimiento Legal',
    lastUpdated: '12 de Agosto de 2026',
    version: 'v4.1 Global',
    summary: 'Describe detalladamente cómo se recolectan, encriptan, almacenan y protegen los datos personales de clientes y usuarios finales.',
    enforceableJurisdictions: ['Unión Europea (RGPD)', 'California (CCPA)', 'Guatemala', 'Hispanoamérica'],
    keyClauses: [
      { title: '1. Encriptación en Reposo y Tránsito', desc: 'Todos los datos están encriptados mediante AES-256 en reposo y TLS 1.3 en tránsito.' },
      { title: '2. Derechos ARCO', desc: 'Garantía total de Acceso, Rectificación, Cancelación y Oposición para cualquier titular de datos.' },
      { title: '3. No Venta de Datos', desc: 'ConversaGT jamás comercializa, alquila ni comparte bases de datos con terceras partes para fines publicitarios.' }
    ],
    fullText: `POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES DE CONVERSAGT

1. RESPONSABLE DEL TRATAMIENTO
ConversaGT actúa como Encargado del Tratamiento (Data Processor) respecto a los datos de los clientes finales que el Cliente procesa a través de la plataforma, y como Responsable del Tratamiento (Data Controller) únicamente de los datos de cuenta y facturación del Cliente.

2. CATEGORÍAS DE DATOS PROCESADOS
Recopilamos y procesamos únicamente:
- Datos de identificación y contacto (Nombre, dirección de correo, teléfono, empresa).
- Mensajes y registros de interacción omnicanal procesados voluntariamente por el Cliente.
- Metadatos de conexión, registros de auditoría y transacciones financieras (sin almacenar números completos de tarjetas de crédito).

3. SEGURIDAD DE LA INFORMACIÓN
Implementamos controles técnicos y organizativos rigurosos:
- Encriptación de extremo a extremo en transferencias de red mediante TLS 1.3.
- Encriptación de bases de datos mediante el estándar militar AES-256.
- Aislamiento lógico multi-inquilino (Multi-Tenant) con políticas estrictas de control de acceso basado en roles (RBAC).

4. EJERCICIO DE DERECHOS
Cualquier titular puede solicitar el acceso, portabilidad, rectificación o supresión de sus datos personales enviando una solicitud formal a legal@conversagt.com.`
  },
  {
    id: 'legal-03',
    key: 'ai_policy',
    title: 'Política de Uso Ético y Privacidad de Inteligencia Artificial (Gemini AI)',
    badge: 'IA Transparente',
    category: 'Gobernanza de IA',
    lastUpdated: '18 de Agosto de 2026',
    version: 'v2.0 Enterprise',
    summary: 'Garantiza que ningún dato confidencial de clientes sea utilizado para entrenar modelos públicos de IA y define el marco ético de Gemini.',
    enforceableJurisdictions: ['Google Cloud Enterprise', 'EU AI Act', 'Global Standards'],
    keyClauses: [
      { title: '1. No Reentrenamiento', desc: 'Los prompts, mensajes y documentos subidos NO se usan para entrenar los modelos base de Google.' },
      { title: '2. Supervisión Humana (Human-in-the-loop)', desc: 'Los agentes humanos pueden auditar, editar o anular cualquier sugerencia generada por el bot.' },
      { title: '3. Transparencia Algorítmica', desc: 'Los usuarios son informados cuando interactúan con un asistente automatizado impulsado por IA.' }
    ],
    fullText: `POLÍTICA DE GOBERNANZA, PRIVACIDAD Y ÉTICA EN INTELIGENCIA ARTIFICIAL

1. INTEGRACIÓN OFICIAL CON GOOGLE GEMINI ENTERPRISE
ConversaGT utiliza las interfaces de programación oficiales de Google Cloud Gemini API bajo condiciones de nivel empresarial (Enterprise Tier).

2. PROTECCIÓN CONTRA EL ENTRENAMIENTO DE MODELOS
Bajo los acuerdos vigentes con los proveedores de modelos de lenguaje:
- Ningún texto de cliente, audio dictado, consulta o documento indexado en el motor RAG es retenido ni utilizado para re-entrenar, mejorar o alimentar modelos públicos de IA.
- Las consultas son procesadas en memoria de forma efímera durante la llamada de inferencia.

3. CONTROL Y RESPONSABILIDAD DEL OPERADOR
El sistema de IA está diseñado como un Copiloto Asistencial. Las respuestas automáticas pueden ser previsualizadas, ajustadas o canceladas por agentes humanos en cualquier momento antes de su despacho.`
  },
  {
    id: 'legal-04',
    key: 'dpa',
    title: 'Acuerdo de Procesamiento de Datos (Data Processing Addendum - DPA)',
    badge: 'Anexo Contractual',
    category: 'Seguridad Corporativa',
    lastUpdated: '05 de Agosto de 2026',
    version: 'v3.0',
    summary: 'Anexo formal que regula la relación contractual entre el Cliente y ConversaGT respecto a la custodia y tratamiento de datos personales.',
    enforceableJurisdictions: ['Internacional', 'RGPD Artículo 28', 'LATAM'],
    keyClauses: [
      { title: '1. Instrucciones Documentadas', desc: 'ConversaGT solo procesará datos siguiendo las instrucciones legítimas del Cliente.' },
      { title: '2. Confidencialidad del Personal', desc: 'Todo el personal con acceso a infraestructura está sujeto a acuerdos de confidencialidad perpetuos.' },
      { title: '3. Notificación de Incidentes', desc: 'Notificación obligatoria dentro de las 48 horas en caso de cualquier brecha de seguridad detectada.' }
    ],
    fullText: `DATA PROCESSING ADDENDUM (DPA) - ACUERDO DE ENCARGADO DE TRATAMIENTO

Este Anexo de Procesamiento de Datos complementa los Términos y Condiciones Generales.

1. ALCANCE Y OBJETO
El Encargado (ConversaGT) tratará los Datos Personales exclusivamente por cuenta y según las instrucciones documentadas del Responsable (el Cliente), con el único fin de prestar los Servicios contratados.

2. SUBENCARGADOS AUTORIZADOS
El Cliente autoriza expresamente el uso de proveedores de infraestructura de primer nivel mundial:
- Google Cloud Platform (Alojamiento, cómputo y modelos Gemini).
- Meta Platforms Ireland Ltd. (Infraestructura de WhatsApp Cloud API).
- Proveedores de pagos certificados PCI-DSS (Stripe, PayPal, Bancos Nacionales).`
  },
  {
    id: 'legal-05',
    key: 'sla',
    title: 'Acuerdo de Nivel de Servicio (Service Level Agreement - SLA 99.9%)',
    badge: 'Garantía Operativa',
    category: 'Garantía Técnica',
    lastUpdated: '15 de Agosto de 2026',
    version: 'v2.2',
    summary: 'Define los compromisos de disponibilidad de red, tiempos de respuesta de soporte técnico y compensaciones económicas.',
    enforceableJurisdictions: ['Global'],
    keyClauses: [
      { title: '1. Uptime Garantizado', desc: '99.9% de disponibilidad mensual en el enrutador de mensajes y servidores API.' },
      { title: '2. Tiempos de Respuesta', desc: 'Prioridad Crítica: < 15 minutos. Prioridad Alta: < 1 hora. Soporte Estándar: < 4 horas.' },
      { title: '3. Créditos de Servicio', desc: 'Reembolso del 10% al 30% de la cuota mensual si el uptime es menor al 99.9%.' }
    ],
    fullText: `ACUERDO DE NIVEL DE SERVICIO (SLA) - GARANTÍA DE DISPONIBILIDAD 99.9%

1. COMPROMISO DE DISPONIBILIDAD
ConversaGT garantiza que la plataforma mantendrá un porcentaje de tiempo de actividad mensual ("Uptime") igual o superior al noventa y nueve punto nueve por ciento (99.9%), excluyendo mantenimientos programados informados con 48 horas de antelación.

2. CRÉDITOS DE SERVICIO POR DISPONIBILIDAD INFERIOR
- Disponibilidad entre 99.0% y 99.89%: Crédito del 10% sobre la factura mensual.
- Disponibilidad entre 95.0% y 98.99%: Crédito del 20% sobre la factura mensual.
- Disponibilidad inferior a 95.0%: Crédito del 30% sobre la factura mensual.`
  },
  {
    id: 'legal-06',
    key: 'refunds',
    title: 'Política de Pagos, Facturación, Reembolsos y Cancelaciones',
    badge: 'Financiero & Fiscal',
    category: 'Políticas Financieras',
    lastUpdated: '20 de Agosto de 2026',
    version: 'v2.8',
    summary: 'Reglas transparentes sobre ciclos de facturación, pasarelas de pago, verificación de transferencias y derecho de desistimiento.',
    enforceableJurisdictions: ['Guatemala (SAT / DIACO)', 'Internacional'],
    keyClauses: [
      { title: '1. Periodo de Garantía', desc: '14 días de garantía de satisfacción con reembolso total en caso de disconformidad justificada.' },
      { title: '2. Emisión de Facturas', desc: 'Emisión inmediata de factura electrónica tributaria (DTE) con cada pago procesado.' },
      { title: '3. Cancelación sin Penalidad', desc: 'Las suscripciones mensuales pueden cancelarse en cualquier momento con 1 clic sin cláusulas de permanencia.' }
    ],
    fullText: `POLÍTICA DE PAGOS, FACTURACIÓN Y POLÍTICA DE REEMBOLSOS

1. PROCESAMIENTO DE PAGOS
- Pagos con Tarjeta: Los cobros se realizan de forma inmediata a través de conexiones encriptadas. No almacenamos los datos sensibles de su plástico en nuestros servidores.
- Pagos vía PayPal: Redirección segura a la pasarela oficial de PayPal o cobro automático para planes recurrentes.
- Pagos por Transferencia Bancaria: El Cliente transferirá el monto exacto a una de las cuentas bancarias autorizadas (Banco Industrial, BAC Credomatic o Chase Bank). Las facturas se emiten tan pronto la entidad bancaria liquida la transferencia.

2. POLÍTICA DE REEMBOLSOS
Ofrecemos una garantía de satisfacción de catorce (14) días calendario a partir del primer pago del servicio. Si la plataforma no cumple con las especificaciones técnicas contratadas, el Cliente podrá solicitar el reintegro total del importe a través del mismo canal por el cual efectuó el pago.`
  },
  {
    id: 'legal-07',
    key: 'whatsapp_optin',
    title: 'Consentimiento Informado y Normativa de Opt-In para WhatsApp',
    badge: 'Meta Compliance',
    category: 'Normativa WhatsApp',
    lastUpdated: '21 de Agosto de 2026',
    version: 'v3.1',
    summary: 'Plantillas y cláusulas legales listas para copiar y pegar en su sitio web para capturar leads con opt-in legal 100% válido ante Meta.',
    enforceableJurisdictions: ['Meta Platforms Policy', 'Leyes Antispam Globales'],
    keyClauses: [
      { title: '1. Texto de Consentimiento Web', desc: 'Cláusula obligatoria para formularios web antes de disparar mensajes automáticos.' },
      { title: '2. Comando de Cancelación (STOP)', desc: 'Todo usuario que responda con "BAJA" o "STOP" debe ser excluido automáticamente de difusiones.' }
    ],
    fullText: `GUÍA DE CLÁUSULAS DE CONSENTIMIENTO OPT-IN PARA CLIENTES DE CONVERSAGT

CLÁUSULA SUGERIDA PARA SU SITIO WEB / CHECKOUT:
"Al ingresar su número de teléfono y presionar 'Enviar / Comprar', usted autoriza expresamente a [NOMBRE DE SU EMPRESA] a enviarle confirmaciones de pedido, soporte y comunicaciones comerciales a través de WhatsApp. Puede revocar este consentimiento en cualquier momento respondiendo con la palabra 'ALTO' o 'BAJA'."`
  },
  {
    id: 'legal-08',
    key: 'ingenieroai_license',
    title: 'Certificado de Autenticidad y Licencia Oficial (ingenieroai.pro)',
    badge: 'ingenieroai.pro Oficial',
    category: 'Propiedad Intelectual & Licencia',
    lastUpdated: '12 de Septiembre de 2026',
    version: 'v3.2.0 Golden Lexus',
    summary: 'Acreditación formal de autoría y desarrollo oficial por el Ingeniero AI Senior Anderson William a través de su portal oficial ingenieroai.pro.',
    enforceableJurisdictions: ['Guatemala (RPI)', 'Convenio de Berna', 'OMPI', 'Internacional'],
    keyClauses: [
      { title: '1. Autoría y Desarrollo Oficial', desc: 'Esta plataforma fue diseñada, codificada y blindada por Anderson William, Ingeniero AI Senior (Portal Oficial: ingenieroai.pro).' },
      { title: '2. Licencia Comercial B2B', desc: 'Concede al adquirente derecho no transferible de explotación comercial, gestión de clientes y automatización omnicanal.' },
      { title: '3. Protección Anti-Tampering & Piratería', desc: 'El código base incorpora firmas criptográficas de integridad SHA-256 para prevenir robo, alteración no autorizada o ingeniería inversa.' },
      { title: '4. Soporte Oficial Directo', desc: 'Canal directo de escalamiento con el autor mediante el WhatsApp oficial +502 54154016 y correo andersonwiliam637@gmail.com.' }
    ],
    fullText: `CERTIFICADO OFICIAL DE AUTENTICIDAD, AUTORÍA Y LICENCIA DE SOFTWARE

PORTAL OFICIAL CERTIFICADOR: https://ingenieroai.pro
ARQUITECTO & INGENIERO SENIOR: Anderson William
LICENCIA SERIAL: LIC-INGENIEROAI-PRO-GT-2026-X99
SELLO CRIPTOGRÁFICO: 0x9F82A41C90B824DF63AA9274092E1B4C
ESTADO: VIGENTE, VERIFICADA Y BLINDADA

1. DECLARACIÓN DE AUTORÍA Y PROPIEDAD INTELECTUAL
Por medio del presente documento, se hace constar que el software "ConversaGT Executive Lexus Edition" ha sido concebido, diseñado y construido en su totalidad por Anderson William a través de la firma tecnológica "ingenieroai.pro". 

Todos los derechos morales y de propiedad intelectual sobre el código fuente, lógica algorítmica de enrutamiento RAG, arquitectura anti-tampering y modelos de sincronización con Gemini y WhatsApp Meta Graph API están protegidos bajo las leyes de Propiedad Intelectual de la República de Guatemala, el Tratado de la OMPI sobre Derecho de Autor y el Convenio de Berna.

2. CONDICIONES DE LA LICENCIA DE USO
El titular del servicio adquiere una Licencia de Explotación Comercial B2B que le faculta para:
a) Gestionar sus canales de WhatsApp, Telegram, Instagram y WebChat con sus clientes.
b) Emitir cobros legítimos a través de las pasarelas bancarias autorizadas (Banco Industrial, BAM, PayPal andersonwiliam637@gmail.com y Tarjetas).
c) Implementar automatizaciones con inteligencia artificial sin riesgo de corte o desconexión no autorizada.

3. BLINDAJE CONTRA LA OBSOLESCENCIA & CIBERSEGURIDAD
Este sistema ha sido estructurado con arquitectura anti-frágil:
- Protección activa contra caídas de internet o saturación de API (modo de contingencia local).
- Cifrado en reposo AES-256 y en tránsito TLS 1.3.
- Registro de auditoría inviolable de transacciones y estados de clientes.

4. CANALES OFICIALES DE VERIFICACIÓN
Para verificar la legitimidad de esta copia del software o reportar uso indebido:
- Sitio Web Oficial: https://ingenieroai.pro
- Soporte y Atención al Cliente: WhatsApp +502 54154016
- Correo Electrónico: andersonwiliam637@gmail.com`
  },
  {
    id: 'legal-09',
    key: 'guatemala_law',
    title: 'Marco Normativo Guatemala (Decreto 47-2008, DIACO y Régimen SAT FEL)',
    badge: 'Leyes de Guatemala',
    category: 'Cumplimiento Legal Nacional',
    lastUpdated: '12 de Septiembre de 2026',
    version: 'v2026.3 GT',
    summary: 'Alineación jurídica con las leyes vigentes en Guatemala para garantizar que los contratos por WhatsApp, firmas y facturas gocen de total validez probatoria ante tribunales y la SAT.',
    enforceableJurisdictions: ['República de Guatemala (Tribunales de Justicia, SAT, DIACO)'],
    keyClauses: [
      { title: '1. Validez de Mensajes de Datos (Decreto 47-2008)', desc: 'Los acuerdos, confirmaciones de pedido y cotizaciones enviadas por WhatsApp tienen plena fuerza probatoria legal en Guatemala.' },
      { title: '2. Protección al Consumidor (Decreto 06-2003)', desc: 'Cumplimiento con la DIACO en cuanto a claridad de precios en Quetzales, condiciones de entrega y derecho de retracto.' },
      { title: '3. Facturación Electrónica SAT (DTE / FEL)', desc: 'Todas las transacciones procesadas generan un Documento Tributario Electrónico con código de autorización fiscal.' },
      { title: '4. Conservación de Registros Mercantiles', desc: 'Almacenamiento digital seguro de conversaciones mercantiles por el término mínimo de 5 años exigido por el Código de Comercio.' }
    ],
    fullText: `DICTAMEN DE CUMPLIMIENTO LEGAL PARA COMERCIO ELECTRÓNICO EN GUATEMALA

1. LEY PARA EL RECONOCIMIENTO DE LAS COMUNICACIONES Y FIRMAS ELECTRÓNICAS (DECRETO 47-2008)
El sistema ConversaGT opera en estricta observancia del Decreto Número 47-2008 del Congreso de la República de Guatemala:
- Artículo 5 (Reconocimiento jurídico de los mensajes de datos): La información no perderá validez ni fuerza probatoria por el solo hecho de constar en un mensaje de datos (mensajería instantánea de WhatsApp o correo electrónico).
- Artículo 11 (Formación y validez de los contratos): En la formación de un contrato, las partes pueden utilizar mensajes de datos, teniendo plena validez jurídica cuando el cliente acepta una cotización o confirma un pedido a través del bot.

2. LEY DE PROTECCIÓN AL CONSUMIDOR Y USUARIO (DECRETO 06-2003 - DIACO)
- La plataforma exhibe con transparencia los precios en Quetzales (GTQ) e incluye el desglose del Impuesto al Valor Agregado (12% IVA).
- Todo comprador cuenta con un canal de atención al cliente y soporte para formular quejas o aclaraciones (WhatsApp +502 54154016).

3. RÉGIMEN DE FACTURA ELECTRÓNICA EN LÍNEA (SAT FEL / DTE)
- Conforme a los Acuerdos de Directorio de la Superintendencia de Administración Tributaria (SAT), todo pago con tarjeta o transferencia genera automáticamente un DTE con su Número de Autorización, Serie y Número de DTE.

4. CÓDIGO DE COMERCIO DE GUATEMALA (DECRETO 2-70)
- Los artículos 368 al 381 exigen a los comerciantes conservar la correspondencia y registros de sus operaciones. ConversaGT almacena de forma inalterable y cifrada el historial de pedidos y pagos para salvaguardar al comerciante ante cualquier auditoría.`
  },
  {
    id: 'legal-10',
    key: 'telegram_terms',
    title: 'Términos Operativos y de Privacidad para Bots de Telegram',
    badge: 'Telegram API',
    category: 'Integraciones de Terceros',
    lastUpdated: '12 de Septiembre de 2026',
    version: 'v2.1',
    summary: 'Términos específicos para clientes que operan bots automatizados en Telegram usando la infraestructura de ConversaGT.',
    enforceableJurisdictions: ['Telegram API Terms of Service', 'Internacional'],
    keyClauses: [
      { title: '1. Cumplimiento con Botfather', desc: 'Los bots deben configurarse utilizando tokens legítimos emitidos por @BotFather.' },
      { title: '2. Encriptación de Webhooks', desc: 'Toda comunicación entre los servidores de Telegram y ConversaGT viaja bajo certificados SSL forzados.' },
      { title: '3. Privacidad de los Usuarios', desc: 'No se rastrean nombres de usuario ni identidades ajenas a la conversación comercial.' }
    ],
    fullText: `TÉRMINOS PARA LA OPERACIÓN DE BOTS DE TELEGRAM EN CONVERSAGT

1. ALCANCE DE LA INTEGRACIÓN
ConversaGT permite a los usuarios conectar sus propios bots creados a través de la API oficial de Telegram (@BotFather).

2. SEGURIDAD DE LOS TOKENS
El token de autenticación del bot es resguardado mediante cifrado irreversible y únicamente se emplea para recibir eventos mediante webhooks autenticados y responder a los comandos del usuario (/start, /planes, /pago, /humano).

3. PROHIBICIÓN DE MENSAJES MASIVOS INVASIVOS
Al igual que en WhatsApp, queda terminantemente prohibido el envío de mensajes a usuarios que no hayan interactuado previamente con el bot o solicitado información.`
  }
];

export const INITIAL_ANALYTICS: AnalyticsKPI = {
  totalConversations: 14890,
  resolutionRate: 94.6,
  responseTimeAvgSeconds: 18,
  csatScore: 98.4,
  activeAiAssists: 11240,
  revenueGenerated: 84350,
  channelBreakdown: [
    { channel: 'WhatsApp Oficial', count: 9840, percentage: 66, color: '#10b981' },
    { channel: 'Instagram Direct', count: 2450, percentage: 16, color: '#ec4899' },
    { channel: 'WebChat Ejecutivo', count: 1620, percentage: 11, color: '#3b82f6' },
    { channel: 'Facebook Messenger', count: 720, percentage: 5, color: '#8b5cf6' },
    { channel: 'Telegram Business', count: 260, percentage: 2, color: '#06b6d4' },
  ],
  monthlyTrends: [
    { month: 'Mar', conversations: 8200, sales: 42000 },
    { month: 'Abr', conversations: 9500, sales: 51000 },
    { month: 'May', conversations: 11200, sales: 63000 },
    { month: 'Jun', conversations: 12800, sales: 71500 },
    { month: 'Jul', conversations: 13900, sales: 78200 },
    { month: 'Ago', conversations: 14890, sales: 84350 },
  ]
};
