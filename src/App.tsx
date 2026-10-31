import React, { useState, useEffect } from 'react';
import { Pyramid } from 'lucide-react';
import { ViewType, Conversation, Client, Campaign, DocumentItem, PaymentGatewayConfig, TransactionRecord, BusinessAccount } from './types';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_CLIENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_DOCUMENTS,
  INITIAL_PAYMENT_CONFIG,
  INITIAL_TRANSACTIONS,
  INITIAL_LEGAL_DOCS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { InicioView } from './components/views/InicioView';
import { ConversationsView } from './components/views/ConversationsView';
import { ClientsView } from './components/views/ClientsView';
import { AutomationView } from './components/views/AutomationView';
import { MarketingView } from './components/views/MarketingView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { BusinessPortalView } from './components/views/BusinessPortalView';
import { CampaignsView } from './components/views/CampaignsView';
import { DocumentsView } from './components/views/DocumentsView';
import { PaymentsView } from './components/views/PaymentsView';
import { LegalView } from './components/views/LegalView';
import { AdminActivationView } from './components/views/AdminActivationView';
import { PublicPortalView } from './components/views/PublicPortalView';
import { FloatingWhatsAppSupport } from './components/floating/FloatingWhatsAppSupport';
import { PaymentCheckoutModal } from './components/modals/PaymentCheckoutModal';
import { NavNotification } from './components/Navbar';
import { api } from './services/apiService';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('inicio');
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [notificationsList, setNotificationsList] = useState<NavNotification[]>([
    { id: 1, title: 'Transferencia confirmada', desc: 'Banco Industrial: Arq. Alejandro Morales ($3,229.20)', time: 'Hace 5 min', unread: true },
    { id: 2, title: 'IA Gemini Copilot', desc: 'Respuesta sugerida aprobada con 98% de confianza', time: 'Hace 18 min', unread: true },
    { id: 3, title: 'Opt-in WhatsApp Meta', desc: '48 nuevos clientes registrados con consentimiento', time: 'Hace 1h', unread: false },
  ]);

  // Persistent Business Account for Business Owner
  const [activeBusiness, setActiveBusiness] = useState<BusinessAccount>(() => {
    try {
      const saved = localStorage.getItem('conversa_active_business_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load active business profile', e);
    }
    return {
      id: 'biz-default',
      businessName: 'Ferretería & Materiales El Progreso',
      ownerName: 'Carlos Mendoza',
      phone: '+502 5415-4016',
      email: 'carlos@ferreteriaelprogreso.gt',
      industry: 'ferreteria',
      currency: 'GTQ',
      planName: 'Plan Negocio Pro',
      planPrice: 225,
      status: 'active',
      subscriptionExpiresAt: '2026-10-15',
      daysRemaining: 28,
      whatsappConnected: false,
      bankAccounts: [
        { bankName: 'Banco Industrial', accountNumber: '1402158', accountHolder: 'Anderson William', accountType: 'Ahorro' },
        { bankName: 'BAM Agromercantil', accountNumber: '4030437443', accountHolder: 'Anderson William', accountType: 'Ahorro' }
      ],
      paymentInstructions: 'Transferencia a Banco Industrial (1402158) o BAM (4030437443). Enviar boleta por WhatsApp.',
      documentsCount: 4,
      messagesCount: 12
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('conversa_active_business_profile', JSON.stringify(activeBusiness));
    } catch (e) {
      console.warn('Could not save business profile', e);
    }
  }, [activeBusiness]);
  
  // Persistent Clients State (Local Storage + Initial Fallback)
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('conversa_clients_db');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read clients from storage', e);
    }
    return INITIAL_CLIENTS;
  });

  // Persistent RAG Documents State (Local Storage + Initial Fallback)
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('conversa_rag_documents_db');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read documents from storage', e);
    }
    return INITIAL_DOCUMENTS;
  });

  // Sync clients to storage on change
  useEffect(() => {
    try {
      localStorage.setItem('conversa_clients_db', JSON.stringify(clients));
    } catch (e) {
      console.warn('Could not persist clients', e);
    }
  }, [clients]);

  // Sync documents to storage on change
  useEffect(() => {
    try {
      localStorage.setItem('conversa_rag_documents_db', JSON.stringify(documents));
    } catch (e) {
      console.warn('Could not persist documents', e);
    }
  }, [documents]);

  // Load authoritative data from centralized relational database
  useEffect(() => {
    async function loadAuthoritativeData() {
      try {
        await api.initSession();
        const [dbClients, dbDocs, dbTxs] = await Promise.allSettled([
          api.getClients(),
          api.getDocuments(),
          api.getTransactions()
        ]);

        if (dbClients.status === 'fulfilled' && dbClients.value.length > 0) {
          setClients(dbClients.value);
        }
        if (dbDocs.status === 'fulfilled' && dbDocs.value.length > 0) {
          setDocuments(
            dbDocs.value.map((d: any) => ({
              id: d.id,
              title: d.title,
              category: d.category || 'product_catalog',
              description: d.description || '',
              content: d.content,
              fileType: 'txt',
              size: `${(d.file_size / 1024).toFixed(1)} KB`,
              uploadedAt: 'Indexado',
              chunksCount: Math.ceil((d.token_count || 50) / 10),
              status: 'indexed',
            }))
          );
        }
        if (dbTxs.status === 'fulfilled' && dbTxs.value.length > 0) {
          setTransactions(dbTxs.value);
        }
      } catch (err) {
        console.warn('Could not sync with central database:', err);
      }
    }
    loadAuthoritativeData();
  }, []);

  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>(INITIAL_PAYMENT_CONFIG);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [legalDocs] = useState(INITIAL_LEGAL_DOCS);

  // Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState('Plan Platinum Enterprise 2026');
  const [checkoutAmount, setCheckoutAmount] = useState(2299.00);
  const [checkoutCurrency, setCheckoutCurrency] = useState<'GTQ' | 'USD'>('GTQ');
  const [checkoutCustomer, setCheckoutCustomer] = useState<{ name?: string; email?: string }>({});

  const unreadTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingActivationTotal = clients.filter((c) => (c.activationStatus || 'pendiente_verificacion') === 'pendiente_verificacion').length;
  const vipTotal = clients.filter((c) => c.stage === 'vip').length;

  const handleAddConversation = (newConv: Partial<Conversation>) => {
    setConversations((prev) => [newConv as Conversation, ...prev]);
  };

  // Handlers
  const handleSendMessage = async (
    conversationId: string,
    text: string,
    sender: 'agent' | 'bot_gemini' | 'user' = 'agent',
    overrideStatus?: 'sent' | 'delivered' | 'read' | 'SEND_FAILED',
    errorMessage?: string
  ) => {
    const msgId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const initialStatus = overrideStatus || (sender === 'user' ? 'delivered' : 'sent');

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const newMsg = {
            id: msgId,
            conversationId,
            sender,
            text,
            timestamp,
            status: initialStatus,
            errorMessage,
          };
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Ahora',
            unreadCount: sender === 'user' ? c.unreadCount + 1 : 0,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // If outbound from agent and not a demo conversation, verify via connector pipeline
    if (sender === 'agent' && !overrideStatus) {
      try {
        const targetConv = conversations.find((c) => c.id === conversationId);
        if (targetConv && !targetConv.isDemo) {
          const res = await fetch('/api/connectors/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              channel: targetConv.channel,
              recipient: { phone: targetConv.customerPhone, id: targetConv.customerId },
              content: text,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === conversationId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === msgId
                        ? {
                            ...m,
                            status: 'SEND_FAILED',
                            errorMessage: errData.error || 'Conector externo no configurado o error de entrega.',
                          }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          }
        }
      } catch (err) {
        console.warn('Connector send pipeline notice:', err);
      }
    }
  };

  const handleOpenPaymentModal = (customerOrPlan?: any, amount?: number, currency: 'GTQ' | 'USD' = 'GTQ') => {
    if (typeof customerOrPlan === 'string') {
      setCheckoutItem(customerOrPlan);
      setCheckoutAmount(amount || 2299.00);
      setCheckoutCurrency(currency);
      setCheckoutCustomer({
        name: 'Cliente Corporativo',
        email: 'contacto@corporativo.com',
      });
    } else if (customerOrPlan && typeof customerOrPlan === 'object') {
      setCheckoutItem(`Suscripción Plan Platinum - ${customerOrPlan.name || customerOrPlan.customerName}`);
      setCheckoutAmount(amount || 2299.00);
      setCheckoutCurrency(currency);
      setCheckoutCustomer({
        name: customerOrPlan.name || customerOrPlan.customerName,
        email: customerOrPlan.email || customerOrPlan.customerEmail,
      });
    } else {
      setCheckoutItem('Plan Platinum Enterprise Anual (Guatemala / LATAM)');
      setCheckoutAmount(2299.00);
      setCheckoutCurrency('GTQ');
      setCheckoutCustomer({});
    }
    setIsCheckoutOpen(true);
  };

  const handleAddClient = (newClient: Partial<Client>) => {
    const created: Client = {
      id: `client-${Date.now()}`,
      name: newClient.name || 'Nuevo Cliente',
      company: newClient.company || 'Empresa',
      email: newClient.email || '',
      phone: newClient.phone || '',
      avatar: newClient.avatar || '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg',
      stage: newClient.stage || 'nuevo',
      ltv: newClient.ltv || 0,
      dealsCount: newClient.dealsCount || 0,
      channelOrigin: newClient.channelOrigin || 'whatsapp',
      tags: newClient.tags || ['Nuevo'],
      lastContactDate: 'Hoy',
      notes: newClient.notes || '',
      assignedTo: newClient.assignedTo || 'Anderson William',
      paymentMethodPreferred: newClient.paymentMethodPreferred || 'bank_transfer',
      activationStatus: 'pendiente_verificacion',
      paymentConfirmed: false,
      botEnabled: true,
      registeredDate: 'Hoy',
    };
    setClients((prev) => [created, ...prev]);
  };

  const handlePublicClientRegistration = (clientData: Partial<Client>, initialMessage?: string) => {
    const newClientId = `client-${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name: clientData.name || 'Nuevo Prospecto',
      company: clientData.company || 'Negocio Independiente',
      email: clientData.email || '',
      phone: clientData.phone || '',
      avatar: '/src/assets/images/avatar_executive_agent_1790539065657.jpg',
      stage: 'nuevo',
      ltv: clientData.ltv || 350,
      dealsCount: 1,
      channelOrigin: 'whatsapp',
      tags: ['Prospecto Web', clientData.leadSource?.toUpperCase() || 'TIKTOK', clientData.selectedPlan || 'Plan Business Pro'],
      lastContactDate: 'Ahora',
      notes: clientData.notes || `Registrado por ${clientData.leadSource}. Plan: ${clientData.selectedPlan}`,
      assignedTo: 'Anderson William',
      paymentMethodPreferred: clientData.paymentMethodPreferred || 'bank_transfer',
      activationStatus: 'pendiente_verificacion',
      paymentConfirmed: false,
      botEnabled: true,
      registeredDate: 'Hoy',
      leadSource: clientData.leadSource,
      selectedPlan: clientData.selectedPlan,
    };

    setClients((prev) => [newClient, ...prev]);

    // Create a new WhatsApp conversation in CRM
    const newConvId = `conv-${Date.now()}`;
    const userMsgText = initialMessage || `¡Hola! Me registré en ConversaGT para contratar el ${clientData.selectedPlan}.`;
    const botReplyText = `¡Hola ${newClient.name}! 👋 Gracias por registrarte en ConversaGT desde ${newClient.leadSource?.toUpperCase() || 'publicidad'}. Soy el Asistente IA del Ingeniero Anderson William (+502 54154016). Hemos apartado tu ${newClient.selectedPlan || 'Plan'}.\n\nPuedes transferir a Banco Industrial (Ahorro 1402158), BAM (Ahorro 4030437443) o PayPal (andersonwiliam637@gmail.com). Al enviar tu boleta por WhatsApp te activamos de inmediato.`;

    const newConversation: Conversation = {
      id: newConvId,
      customerId: newClientId,
      customerName: newClient.name,
      customerAvatar: newClient.avatar,
      customerPhone: newClient.phone,
      customerEmail: newClient.email,
      channel: 'whatsapp',
      lastMessage: userMsgText,
      lastMessageTime: 'Ahora',
      unreadCount: 1,
      status: 'pending',
      priority: 'high',
      assignedAgent: 'Anderson William',
      tags: ['Nuevo Lead', clientData.leadSource?.toUpperCase() || 'TIKTOK', 'Por Activar'],
      intentScore: 95,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          conversationId: newConvId,
          sender: 'user',
          text: userMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          sentiment: 'positivo',
        },
        {
          id: `msg-${Date.now()}-2`,
          conversationId: newConvId,
          sender: 'bot_gemini',
          text: botReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          sentiment: 'positivo',
        },
      ],
    };

    setConversations((prev) => [newConversation, ...prev]);

    // Push notification to bell
    const newNotification: NavNotification = {
      id: Date.now(),
      title: `🚨 ¡Nuevo cliente de ${clientData.leadSource?.toUpperCase() || 'REDES'}!`,
      desc: `${newClient.name} (${newClient.phone}) solicitó ${clientData.selectedPlan || 'Plan'}`,
      time: 'Ahora',
      unread: true,
    };
    setNotificationsList((prev) => [newNotification, ...prev]);
  };

  const handleToggleClientActivation = (clientId: string, newStatus: 'activo' | 'pendiente_verificacion' | 'inactivo') => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, activationStatus: newStatus } : c))
    );
    api.updateClient(clientId, { activationStatus: newStatus }).catch((e) => console.warn('Sync error:', e));
  };

  const handleTogglePaymentConfirmed = (clientId: string, confirmed: boolean) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, paymentConfirmed: confirmed } : c))
    );
    api.updateClient(clientId, { paymentConfirmed: confirmed }).catch((e) => console.warn('Sync error:', e));
  };

  const handleToggleBotEnabled = (clientId: string, enabled: boolean) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, botEnabled: enabled } : c))
    );
    api.updateClient(clientId, { botEnabled: enabled }).catch((e) => console.warn('Sync error:', e));
  };

  const handleAddDocument = async (newDoc: Partial<DocumentItem>) => {
    try {
      const docId = await api.createDocument({
        title: newDoc.title || 'Documento',
        category: newDoc.category || 'legal',
        description: newDoc.description || '',
        content: newDoc.content || '',
      });

      const created: DocumentItem = {
        id: docId,
        title: newDoc.title || 'Documento',
        category: newDoc.category || 'legal',
        fileType: newDoc.fileType || 'txt',
        size: newDoc.size || '15 KB',
        uploadedAt: 'Hoy',
        chunksCount: newDoc.chunksCount || 10,
        status: 'indexed',
        description: newDoc.description || '',
        content: newDoc.content || '',
        sourceUrl: newDoc.sourceUrl,
        faqPairsCount: newDoc.faqPairsCount,
      };
      setDocuments((prev) => [created, ...prev]);
    } catch (err: any) {
      console.warn('Fallback adding document to local state:', err);
      const created: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: newDoc.title || 'Documento',
        category: newDoc.category || 'legal',
        fileType: newDoc.fileType || 'txt',
        size: newDoc.size || '15 KB',
        uploadedAt: 'Hoy',
        chunksCount: newDoc.chunksCount || 10,
        status: 'indexed',
        description: newDoc.description || '',
        content: newDoc.content || '',
        sourceUrl: newDoc.sourceUrl,
        faqPairsCount: newDoc.faqPairsCount,
      };
      setDocuments((prev) => [created, ...prev]);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    api.deleteDocument(docId).catch((e) => console.warn('Sync delete doc error:', e));
  };

  const handleLaunchCampaign = (camp: Partial<Campaign>) => {
    const created: Campaign = {
      id: `camp-${Date.now()}`,
      name: camp.name || 'Campaña',
      channel: camp.channel || 'whatsapp',
      status: camp.status || 'running',
      targetSegment: camp.targetSegment || 'VIP',
      audienceSize: camp.audienceSize || 1000,
      sentCount: 0,
      openRate: 98.4,
      clickRate: 34.2,
      conversionRate: 18.5,
      templateBody: camp.templateBody || '',
      buttons: camp.buttons || [],
      createdAt: 'Hoy',
      geminiOptimized: true,
    };
    setCampaigns((prev) => [created, ...prev]);
  };

  const handleActivateBusiness = () => {
    setActiveBusiness((prev) => ({
      ...prev,
      status: 'active',
      subscriptionExpiresAt: '2026-10-15',
      daysRemaining: 30,
    }));
    setNotificationsList((prev) => [
      {
        id: Date.now(),
        title: `✅ Empresa Activada por Anderson William`,
        desc: `${activeBusiness.businessName} ahora tiene servicio ACTIVO y bots operando 24/7.`,
        time: 'Ahora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const handleDeactivateBusiness = () => {
    setActiveBusiness((prev) => ({
      ...prev,
      status: 'pending_activation',
      daysRemaining: 0,
    }));
  };

  const handleSimulateTestRegistration = () => {
    const testId = `test-biz-${Date.now()}`;
    const testClient: Client = {
      id: testId,
      name: 'Ing. Fernando Morales (Prueba)',
      company: 'Distribuidora Los Volcanes, S.A.',
      email: 'fmorales@losvolcanes.gt',
      phone: '+502 5555-1234',
      avatar: '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg',
      stage: 'nuevo',
      ltv: 225,
      dealsCount: 1,
      channelOrigin: 'whatsapp',
      tags: ['Prueba Sandbox', 'Boleta BI', 'Plan Negocio Pro'],
      lastContactDate: 'Ahora',
      notes: 'Boleta de prueba No. 1402-998 depositada en Banco Industrial (1402158) por Q225.00',
      assignedTo: 'Anderson William',
      paymentMethodPreferred: 'bank_transfer',
      activationStatus: 'pendiente_verificacion',
      paymentConfirmed: false,
      botEnabled: false,
      registeredDate: 'Hoy',
      leadSource: 'whatsapp',
      selectedPlan: 'Plan Negocio Pro',
    };

    setClients((prev) => [testClient, ...prev]);

    setTransactions((prev) => [
      {
        id: `tx-test-${Date.now()}`,
        invoiceNumber: `DTE-TEST-${Date.now().toString().slice(-6)}`,
        authorizationCode: `BI-1402-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: testClient.name,
        customerEmail: testClient.email,
        amount: 225,
        currency: 'GTQ',
        planOrItem: 'Plan Negocio Pro Mensual',
        method: 'bank_transfer',
        bankName: 'Banco Industrial',
        status: 'pending_verification',
        createdAt: new Date().toISOString(),
        requiresManualActivation: true,
      },
      ...prev,
    ]);

    setNotificationsList((prev) => [
      {
        id: Date.now(),
        title: `🧪 Prueba Generada: Distribuidora Los Volcanes`,
        desc: `Boleta BI por Q225 lista para que Anderson William presione "Validar en Banca & Activar".`,
        time: 'Ahora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const handlePaymentSuccess = (tx: any) => {
    const verifiedTx = {
      ...tx,
      status: 'pending_verification',
      requiresManualActivation: true,
    };
    setTransactions((prev) => [verifiedTx, ...prev]);

    setNotificationsList((prev) => [
      {
        id: Date.now(),
        title: `🏦 Boleta/Pago Registrado (Pendiente de Validación)`,
        desc: `${tx.customerName || 'Cliente'} envió comprobante por ${tx.currency === 'GTQ' ? 'Q' : '$'}${tx.amount}. Requiere activación manual por Anderson.`,
        time: 'Ahora',
        unread: true,
      },
      ...prev,
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0A] text-white font-sans select-none">
      {/* 1. Global Executive Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(v) => {
          setActiveView(v);
          setIsMobileMenuOpen(false);
        }}
        onOpenPaymentModal={() => handleOpenPaymentModal()}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        notificationsList={notificationsList}
      />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden flex"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-72 bg-[#141414] border-r border-[#313131] h-full p-4 overflow-y-auto animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#313131]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Menú ConversaGT</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#A7A7A7] hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <Sidebar
              activeView={activeView}
              onNavigate={(v) => {
                setActiveView(v);
                setIsMobileMenuOpen(false);
              }}
              unreadCount={unreadTotal}
              vipClientsCount={vipTotal}
              pendingActivationCount={pendingActivationTotal}
            />
          </div>
        </div>
      )}

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden when exploring public portal) */}
        {activeView !== 'public_portal' && (
          <div className="hidden md:block w-64 shrink-0">
            <Sidebar
              activeView={activeView}
              onNavigate={(v) => setActiveView(v)}
              unreadCount={unreadTotal}
              vipClientsCount={vipTotal}
              pendingActivationCount={pendingActivationTotal}
            />
          </div>
        )}

        {/* View Switcher Container */}
        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0A0A0A] ${
          ['conversations'].includes(activeView) ? 'p-2' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'
        }`}>
          {(activeView === 'inicio' || activeView === 'business_portal') && (
            <InicioView
              conversations={conversations}
              clients={clients}
              transactions={transactions}
              onNavigate={(v) => setActiveView(v)}
              onOpenConversation={(convId) => {
                setActiveView('conversations');
              }}
              onOpenPaymentModal={() => handleOpenPaymentModal()}
            />
          )}

          {activeView === 'conversations' && (
            <ConversationsView
              conversations={conversations}
              onSendMessage={handleSendMessage}
              onOpenPaymentModal={handleOpenPaymentModal}
              documents={documents}
              onAddNewConversation={handleAddConversation}
            />
          )}

          {activeView === 'clients' && (
            <ClientsView
              clients={clients}
              onOpenChatWithClient={() => {
                setActiveView('conversations');
              }}
              onOpenPaymentModal={(client) => handleOpenPaymentModal(client)}
              onAddClient={handleAddClient}
            />
          )}

          {(activeView === 'automation' || activeView === 'documents') && (
            <AutomationView
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {(activeView === 'marketing' || activeView === 'campaigns') && (
            <MarketingView
              campaigns={campaigns}
              onLaunchCampaign={handleLaunchCampaign}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView />
          )}

          {(activeView === 'settings' || activeView === 'payments' || activeView === 'legal' || activeView === 'admin_activation') && (
            <SettingsView
              activeBusiness={activeBusiness}
              onUpdateBusiness={(updated) => setActiveBusiness((prev) => ({ ...prev, ...updated }))}
              clients={clients}
              transactions={transactions}
            />
          )}

          {activeView === 'public_portal' && (
            <PublicPortalView
              onRegisterClient={handlePublicClientRegistration}
              onGoToDashboard={() => setActiveView('conversations')}
              documents={documents}
            />
          )}
        </main>
      </div>

      {/* 3. Global Interactive Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planOrItem={checkoutItem}
        amount={checkoutAmount}
        currency={checkoutCurrency}
        customerName={checkoutCustomer.name}
        customerEmail={checkoutCustomer.email}
        banks={paymentConfig.bankTransfer.banks}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 4. Floating WhatsApp Support for Anderson William (+502 54154016) */}
      <FloatingWhatsAppSupport />
    </div>
  );
}
