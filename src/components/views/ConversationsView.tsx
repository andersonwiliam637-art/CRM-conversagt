import React, { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  ChatMessage,
  ChannelType,
  ConversationStatus,
  PriorityType
} from '../../types';
import {
  Search,
  Send,
  Sparkles,
  Paperclip,
  CheckCheck,
  CreditCard,
  Building2,
  Phone,
  Mail,
  User,
  Tag,
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
  Zap,
  ShieldCheck,
  Globe,
  Loader2,
  Plus,
  Bot,
  MessageSquare,
  RefreshCw,
  Copy,
  Eye,
  ExternalLink,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';
import { askGeminiCopilot } from '../../services/geminiService';

interface ConversationsViewProps {
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string, sender?: 'agent' | 'bot_gemini' | 'user') => void;
  onOpenPaymentModal: (customer?: any) => void;
  onSelectClient?: (clientId: string) => void;
  documents: any[];
  onAddNewConversation?: (newConv: Partial<Conversation>) => void;
}

export const ConversationsView: React.FC<ConversationsViewProps> = ({
  conversations,
  onSendMessage,
  onOpenPaymentModal,
  documents,
  onAddNewConversation,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'ai' | 'vip' | 'resolved' | 'demo'>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const [copilotTone, setCopilotTone] = useState<'profesional_calido' | 'persuasivo' | 'tecnico_conciso'>('profesional_calido');
  const [showRightDrawer, setShowRightDrawer] = useState(true);
  
  // Internal notes state per conversation (persistent in localStorage)
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('conversa_internal_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read notes', e);
    }
    return {
      'conv-101': 'Cliente solicita factura contable con NIT 449201-8. Se acordó pago mediante transferencia a Banco Industrial.',
      'conv-102': 'Interesada en catálogo de mayoreo ferretero. Enviar cotización formal.',
      'conv-103': 'Comprobante de depósito BAM enviado para validación manual.'
    };
  });

  // Save notes on edit
  const handleUpdateNote = (convId: string, text: string) => {
    const updated = { ...internalNotes, [convId]: text };
    setInternalNotes(updated);
    try {
      localStorage.setItem('conversa_internal_notes', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save note', e);
    }
  };

  // Mobile responsive view
  const [mobileScreen, setMobileScreen] = useState<'list' | 'chat'>('list');

  // Modal to start new conversation
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('+502 ');
  const [newChatChannel, setNewChatChannel] = useState<ChannelType>('whatsapp');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0] || {
    id: 'empty',
    customerId: '0',
    customerName: 'Sin conversación seleccionada',
    customerAvatar: '/default_avatar_director.png',
    customerPhone: '',
    customerEmail: '',
    channel: 'whatsapp' as ChannelType,
    lastMessage: '',
    lastMessageTime: '',
    unreadCount: 0,
    status: 'open' as ConversationStatus,
    priority: 'normal' as PriorityType,
    assignedAgent: 'Valeria Méndez',
    tags: [],
    intentScore: 50,
    messages: []
  };

  // Compile business context for Copilot
  const compiledRagContext = React.useMemo(() => {
    const defaultInfo = `INFORMACIÓN Y PRECIOS BASE CONVERSAGT:
• Plan Emprendedor: Q350.00 / mes ($45.00 USD) - 1 Agente + Bot IA 24/7 en WhatsApp.
• Plan Business Pro: Q750.00 / mes ($95.00 USD) - 3 Agentes + RAG Documentos + Difusión masiva WhatsApp.
• Plan Platinum Enterprise: Q2,299.00 / año ($295.00 USD) - Agentes ilimitados + SAT DTE FEL.
• Cuentas Bancarias Guatemala:
  - Banco Industrial (Ahorro): No. 1402158 (GTQ) a nombre de Anderson William.
  - Banco Agromercantil BAM (Ahorro): No. 4030437443 (GTQ) a nombre de Anderson William.
• PayPal Oficial & Pago con Tarjeta: andersonwiliam637@gmail.com
• Facturación SAT: Emitimos Factura Electrónica oficial DTE / FEL con NIT de la empresa o C/F al instante.`;

    if (!documents || documents.length === 0) {
      return defaultInfo;
    }

    const docsText = documents
      .map((d: any) => `[DOCUMENTO: ${d.title} (${d.category})]\n${d.content || d.description || ''}`)
      .join('\n\n');

    return `${defaultInfo}\n\n=== CATÁLOGO Y POLÍTICAS DEL NEGOCIO ===\n${docsText}`;
  }, [documents]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv.messages]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Channel filter
    if (channelFilter !== 'all' && c.channel !== channelFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.customerName.toLowerCase().includes(q);
      const matchPhone = c.customerPhone.toLowerCase().includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMsg) return false;
    }

    // Status Tab filter
    if (filterTab === 'pending') {
      return c.status === 'pending' || c.priority === 'vip' || c.priority === 'high';
    }
    if (filterTab === 'ai') {
      return c.assignedAgent.toLowerCase().includes('asistente') || c.assignedAgent.toLowerCase().includes('bot');
    }
    if (filterTab === 'vip') {
      return c.priority === 'vip';
    }
    if (filterTab === 'resolved') {
      return c.status === 'resolved';
    }
    if (filterTab === 'demo') {
      return c.isDemo === true;
    }

    return true;
  });

  // Handle agent message send
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(activeConv.id, inputText.trim(), 'agent');
    setInputText('');
    setSuggestedReply(null);
  };

  // Quick message actions
  const handleSendBankDetails = () => {
    const text = `Estimado(a) ${activeConv.customerName}, le comparto nuestras cuentas bancarias autorizadas en Guatemala:
🏦 Banco Industrial (Ahorro GTQ): No. 1402158
🏦 BAM Agromercantil (Ahorro GTQ): No. 4030437443
Titular: Anderson William

Al realizar su depósito o transferencia, por favor envíenos su comprobante por este medio para proceder con la facturación y activación inmediata.`;
    onSendMessage(activeConv.id, text, 'agent');
  };

  const handleSendPaymentLink = () => {
    const text = `Estimado(a) ${activeConv.customerName}, puede realizar su pago en línea con tarjeta de crédito/débito o PayPal a través del siguiente enlace oficial:
💳 https://conversagt.com/checkout/pago-seguro
Correo de cobro verificado: andersonwiliam637@gmail.com

Su transacción cuenta con protección PCI-DSS y emisión automática de Factura SAT FEL.`;
    onSendMessage(activeConv.id, text, 'agent');
  };

  // Trigger Gemini Copilot suggestion
  const handleTriggerCopilot = async () => {
    setIsCopilotLoading(true);
    setSuggestedReply(null);
    try {
      const lastClientMessage = [...activeConv.messages].reverse().find((m) => m.sender === 'user')?.text || activeConv.lastMessage;
      const res = await askGeminiCopilot(
        lastClientMessage,
        activeConv.messages,
        compiledRagContext,
        activeConv.customerName,
        copilotTone
      );
      if (res && res.reply) {
        setSuggestedReply(res.reply);
      }
    } catch (err) {
      console.warn('Copilot error:', err);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // Create new conversation
  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      customerId: `cust-${Date.now()}`,
      customerName: newChatName.trim(),
      customerAvatar: '/default_avatar_director.png',
      customerPhone: newChatPhone.trim() || '+502 5555-0000',
      customerEmail: `${newChatName.toLowerCase().replace(/\s+/g, '.')}@cliente.gt`,
      channel: newChatChannel,
      lastMessage: 'Conversación iniciada por el agente.',
      lastMessageTime: 'Ahora',
      unreadCount: 0,
      status: 'open',
      priority: 'normal',
      assignedAgent: 'Valeria Méndez',
      tags: ['nuevo'],
      intentScore: 70,
      isDemo: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          conversationId: newId,
          sender: 'agent',
          text: `Hola ${newChatName.trim()}, le saluda el equipo de ConversaGT. ¿En qué podemos apoyarle hoy?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent'
        }
      ]
    };

    if (onAddNewConversation) {
      onAddNewConversation(newConv);
    }
    setSelectedConvId(newId);
    setShowNewChatModal(false);
    setNewChatName('');
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#0A0A0A] font-sans select-none border border-[#313131] rounded-lg">
      {/* ========================================================================= */}
      {/* 1. LEFT PANEL: CONVERSATION LIST (320px - 360px)                          */}
      {/* ========================================================================= */}
      <div
        className={`w-full md:w-80 lg:w-88 border-r border-[#313131] bg-[#141414] flex flex-col shrink-0 ${
          mobileScreen === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & Search */}
        <div className="p-3.5 border-b border-[#313131] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                Bandeja Omnicanal
              </span>
              <span className="text-[11px] font-mono text-[#A7A7A7] font-tabular">
                ({filteredConversations.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs transition-all"
              title="Iniciar nueva conversación manual"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Chat</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A7A7A7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, NIT o mensaje..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#313131] text-xs text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF] transition-all"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5 border-b border-[#1E1E1E]">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTab === 'all'
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('pending')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTab === 'pending'
                  ? 'bg-[#1E1E1E] text-[#D97706] border border-[#D97706]/40'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              Por Atender
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('ai')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTab === 'ai'
                  ? 'bg-[#1E1E1E] text-[#6798FF] border border-[#6798FF]/40'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              En IA
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('vip')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTab === 'vip'
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              VIP
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('resolved')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTab === 'resolved'
                  ? 'bg-[#1E1E1E] text-[#16A34A] border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              Resueltos
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('demo')}
              className={`px-2 py-1 rounded font-mono text-[10px] transition-colors ${
                filterTab === 'demo'
                  ? 'bg-[#6798FF]/20 text-[#6798FF] border border-[#6798FF]/40'
                  : 'text-[#A7A7A7] hover:text-[#6798FF]'
              }`}
            >
              DEMO
            </button>
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1E1E1E]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#A7A7A7]">
              No hay conversaciones en esta categoría.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConv.id;
              const isUrgent = c.priority === 'vip' || c.priority === 'high' || c.status === 'pending';
              const isDemoConv = c.isDemo === true;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedConvId(c.id);
                    setMobileScreen('chat');
                  }}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1E1E1E] border-l-2 border-[#6798FF]'
                      : 'hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-[#1E1E1E] border border-[#313131] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {c.customerName.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {c.customerName}
                          </span>
                          {isDemoConv ? (
                            <span className="text-[8px] font-mono uppercase text-[#6798FF] bg-[#6798FF]/10 px-1.5 py-0.5 rounded border border-[#6798FF]/30 whitespace-nowrap">
                              DEMO — DATOS DE PRUEBA
                            </span>
                          ) : c.priority === 'vip' ? (
                            <span className="text-[9px] font-mono uppercase text-[#6798FF] bg-[#6798FF]/10 px-1 rounded">
                              VIP
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-[#A7A7A7] font-mono truncate">
                          {c.channel} · {c.customerPhone}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-[#7C7C7C] font-tabular">
                        {c.lastMessageTime}
                      </span>
                      {c.unreadCount > 0 && (
                        <div className="mt-0.5 inline-block px-1.5 py-0.2 rounded bg-[#6798FF] text-[9px] font-bold text-black font-tabular">
                          {c.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#A7A7A7] truncate mt-1.5 line-clamp-1">
                    {c.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1E1E1E] text-[10px] text-[#7C7C7C] font-mono">
                    <span>Resp: {c.assignedAgent}</span>
                    <span className="capitalize">{c.status === 'open' ? 'En atención' : c.status === 'pending' ? 'Por atender' : 'Resuelto'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MIDDLE PANEL: CENTRAL CONVERSATION THREAD                              */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden ${
          mobileScreen === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Top Control Bar */}
        <div className="p-3 border-b border-[#313131] bg-[#141414] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile back button */}
            <button
              type="button"
              onClick={() => setMobileScreen('list')}
              className="md:hidden p-1.5 rounded bg-[#1E1E1E] border border-[#313131] text-[#A7A7A7]"
            >
              ←
            </button>

            <div className="w-8 h-8 rounded bg-[#1E1E1E] border border-[#313131] flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {activeConv.customerName.charAt(0)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white truncate">
                  {activeConv.customerName}
                </h2>
                {activeConv.isDemo && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30">
                    DEMO — DATOS DE PRUEBA
                  </span>
                )}
                <span className="text-[11px] font-mono text-[#A7A7A7] hidden sm:inline">
                  · {activeConv.customerPhone}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1E1E1E] border border-[#313131] text-[#A7A7A7]">
                  {activeConv.channel}
                </span>
              </div>
              <div className="text-[11px] text-[#A7A7A7] mt-0.5 flex items-center gap-2">
                <span>Agente responsable: <strong className="text-white">{activeConv.assignedAgent}</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons on topbar: Status, Agent, Transfer and Dossier */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Status Selector */}
            <select
              value={activeConv.status}
              onChange={(e) => {
                const nextStatus = e.target.value as ConversationStatus;
                activeConv.status = nextStatus;
                onSendMessage(activeConv.id, `[Sistema] Estado actualizado a: ${nextStatus === 'open' ? 'En atención' : nextStatus === 'pending' ? 'Por atender' : 'Resuelto'}`, 'agent');
              }}
              className="bg-[#0A0A0A] border border-[#313131] rounded px-2 py-1 text-[11px] text-white focus:outline-none hidden sm:inline"
              title="Cambiar estado de la conversación"
            >
              <option value="open">En atención</option>
              <option value="pending">Por atender</option>
              <option value="resolved">Resuelto</option>
            </select>

            {/* Transfer to human or resume AI button */}
            <button
              type="button"
              onClick={() => {
                const isCurrentlyAi = activeConv.assignedAgent.toLowerCase().includes('asistente') || activeConv.assignedAgent.toLowerCase().includes('bot');
                const nextAgent = isCurrentlyAi ? 'Valeria Méndez (Agente)' : 'Asistente IA (Automático)';
                activeConv.assignedAgent = nextAgent;
                onSendMessage(activeConv.id, `[Sistema] Conversación reasignada a: ${nextAgent}`, 'agent');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-xs font-medium text-white transition-all"
              title="Cambiar entre atención automatizada por IA y asesor humano"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#6798FF]" />
              <span className="hidden sm:inline">
                {activeConv.assignedAgent.toLowerCase().includes('asistente') || activeConv.assignedAgent.toLowerCase().includes('bot')
                  ? 'Transferir a Humano'
                  : 'Reanudar Asistente IA'}
              </span>
            </button>

            {/* Toggle Client Dossier Drawer */}
            <button
              type="button"
              onClick={() => setShowRightDrawer(!showRightDrawer)}
              className={`p-1.5 rounded border text-xs transition-colors ${
                showRightDrawer
                  ? 'bg-[#1E1E1E] text-white border-[#6798FF]'
                  : 'bg-[#141414] text-[#A7A7A7] border-[#313131] hover:text-white'
              }`}
              title="Mostrar u ocultar expediente comercial del cliente"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A0A0A]">
          {activeConv.isDemo && (
            <div className="p-2.5 rounded bg-[#141414] border border-[#6798FF]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-semibold text-[#6798FF]">DEMO — DATOS DE PRUEBA:</span>
                <span className="text-[#A7A7A7] text-[11px]">Conversación de demostración para verificar el flujo omnicanal.</span>
              </div>
            </div>
          )}

          {activeConv.messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#A7A7A7]">
              No hay mensajes registrados en este canal.
            </div>
          ) : (
            activeConv.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isAi = msg.sender === 'bot_gemini';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-md sm:max-w-lg rounded-lg p-3 text-xs sm:text-sm leading-relaxed ${
                      msg.status === 'SEND_FAILED'
                        ? 'bg-[#DC2626]/10 text-white border border-[#DC2626]/50'
                        : isUser
                        ? 'bg-[#141414] text-white border border-[#313131]'
                        : isAi
                        ? 'bg-[#141414] text-white border border-[#6798FF]/30'
                        : 'bg-[#1E1E1E] text-white border border-[#313131]'
                    }`}
                  >
                    {msg.status === 'SEND_FAILED' && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#DC2626] uppercase tracking-wider mb-1.5 pb-1 border-b border-[#DC2626]/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Fallo en Entrega de Mensaje (SEND_FAILED)</span>
                      </div>
                    )}

                    {isAi && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6798FF] uppercase tracking-wider mb-1.5 pb-1 border-b border-[#313131]">
                        <Bot className="w-3 h-3" />
                        <span>Respuesta Asistente IA</span>
                      </div>
                    )}

                    {isUser && (
                      <div className="text-[10px] font-mono text-[#A7A7A7] mb-1">
                        {activeConv.customerName}:
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.errorMessage && (
                      <div className="mt-1 text-[11px] text-[#DC2626] font-mono">
                        Causa: {msg.errorMessage}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-[#7C7C7C] font-mono font-tabular">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        msg.status === 'SEND_FAILED' ? (
                          <span className="text-[#DC2626] font-semibold">Error</span>
                        ) : (
                          <CheckCheck className="w-3 h-3 text-[#6798FF]" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Copilot Suggestion Box (Clean & Dismissible) */}
        {suggestedReply && (
          <div className="m-3 p-3 rounded-lg bg-[#141414] border border-[#6798FF]/40 text-xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#313131]">
              <div className="flex items-center gap-1.5 text-[#6798FF] font-medium font-mono text-[11px] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sugerencia del Asistente IA ({copilotTone})</span>
              </div>
              <button
                type="button"
                onClick={() => setSuggestedReply(null)}
                className="text-[#A7A7A7] hover:text-white text-[11px]"
              >
                ✕ Descartar
              </button>
            </div>
            <p className="text-white text-xs leading-relaxed whitespace-pre-wrap">
              {suggestedReply}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onSendMessage(activeConv.id, suggestedReply, 'agent');
                  setSuggestedReply(null);
                }}
                className="px-3 py-1 rounded bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs transition-all"
              >
                Insertar y Enviar al Cliente
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText(suggestedReply);
                  setSuggestedReply(null);
                }}
                className="px-3 py-1 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-white text-xs transition-all"
              >
                Editar antes de enviar
              </button>
            </div>
          </div>
        )}

        {/* Bottom Fast Action Shortcuts */}
        <div className="px-3 py-2 bg-[#141414] border-t border-[#313131] flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSendBankDetails}
              className="px-2.5 py-1 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <Building2 className="w-3 h-3 text-[#6798FF]" />
              <span>Enviar Cuentas BI/BAM</span>
            </button>

            <button
              type="button"
              onClick={handleSendPaymentLink}
              className="px-2.5 py-1 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <CreditCard className="w-3 h-3 text-[#6798FF]" />
              <span>Enlace Tarjeta / PayPal</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPaymentModal({ name: activeConv.customerName, email: activeConv.customerEmail })}
              className="px-2.5 py-1 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <DollarSign className="w-3 h-3 text-[#16A34A]" />
              <span>Generar Boleta Oficial</span>
            </button>
          </div>

          {/* AI Draft Trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={copilotTone}
              onChange={(e: any) => setCopilotTone(e.target.value)}
              className="bg-[#0A0A0A] border border-[#313131] rounded px-2 py-1 text-[11px] text-white focus:outline-none"
            >
              <option value="profesional_calido">Tono Cálido</option>
              <option value="persuasivo">Tono Comercial</option>
              <option value="tecnico_conciso">Tono Técnico</option>
            </select>

            <button
              type="button"
              onClick={handleTriggerCopilot}
              disabled={isCopilotLoading}
              className="px-2.5 py-1 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#6798FF] hover:text-white transition-all flex items-center gap-1 text-[11px] font-medium"
            >
              {isCopilotLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>Sugerir Respuesta IA</span>
            </button>
          </div>
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#141414] border-t border-[#313131] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Responder a ${activeConv.customerName} como ${activeConv.assignedAgent}...`}
            className="flex-1 px-3.5 py-2 rounded-lg bg-[#0A0A0A] border border-[#313131] text-sm text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF] transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] disabled:opacity-40 disabled:hover:bg-[#6798FF] text-black font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIGHT PANEL: CLIENT DOSSIER & CRM SIDEBAR (280px - 320px)              */}
      {/* ========================================================================= */}
      {showRightDrawer && (
        <div className="w-72 lg:w-80 border-l border-[#313131] bg-[#141414] flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Ficha del Cliente
            </span>
            <button
              type="button"
              onClick={() => setShowRightDrawer(false)}
              className="text-[#A7A7A7] hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Profile Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-[#1E1E1E] border border-[#313131] flex items-center justify-center text-white font-semibold text-lg">
                {activeConv.customerName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {activeConv.customerName}
                  </h3>
                  {activeConv.isDemo && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#6798FF]/20 text-[#6798FF] border border-[#6798FF]/40">
                      DEMO — DATOS DE PRUEBA
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#A7A7A7] block truncate">
                  {activeConv.customerEmail || 'Sin correo registrado'}
                </span>
                <span className="text-[11px] font-mono text-[#6798FF]">
                  {activeConv.customerPhone}
                </span>
              </div>
            </div>

            {/* Commercial Stage */}
            <div className="p-3 rounded bg-[#1E1E1E] border border-[#313131] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A7A7A7]">Etapa Comercial:</span>
                <span className="font-mono text-white font-medium capitalize">
                  {activeConv.priority === 'vip' ? 'Cliente VIP' : 'Negociación Activa'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A7A7A7]">Canal de Origen:</span>
                <span className="font-mono text-white capitalize">{activeConv.channel}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A7A7A7]">Puntaje de Interés:</span>
                <span className="font-mono text-[#16A34A] font-tabular">{activeConv.intentScore || 85}%</span>
              </div>
            </div>
          </div>

          {/* Internal Notes Section (Editable & Auto-saved) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white uppercase font-mono text-[11px]">
                Notas Internas
              </span>
              <span className="text-[10px] text-[#A7A7A7]">Solo equipo</span>
            </div>
            <textarea
              rows={4}
              value={internalNotes[activeConv.id] || ''}
              onChange={(e) => handleUpdateNote(activeConv.id, e.target.value)}
              placeholder="Escribe notas internas sobre acuerdos, NIT o detalles de entrega..."
              className="w-full p-2.5 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF] transition-all resize-none"
            />
          </div>

          {/* Summary from Gemini */}
          {activeConv.geminiSummary && (
            <div className="p-3 rounded bg-[#1E1E1E] border border-[#313131] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6798FF] uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Resumen Contextual IA</span>
              </div>
              <p className="text-[#A7A7A7] text-[11px] leading-relaxed">
                {activeConv.geminiSummary}
              </p>
            </div>
          )}

          {/* Activity Timeline / History */}
          <div className="space-y-1.5 pt-2 border-t border-[#313131]">
            <span className="text-xs font-semibold text-white uppercase font-mono text-[11px]">
              Historial de Actividad
            </span>
            <div className="space-y-2 text-[11px] text-[#A7A7A7]">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                <div>
                  <span className="text-white font-medium">Conversación iniciada</span>
                  <div className="text-[10px] text-[#7C7C7C]">{activeConv.lastMessageTime}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6798FF] mt-1.5 shrink-0" />
                <div>
                  <span className="text-white font-medium">Asignado a: {activeConv.assignedAgent}</span>
                  <div className="text-[10px] text-[#7C7C7C]">En curso</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-[#313131] space-y-2">
            <span className="text-[11px] font-mono uppercase text-[#A7A7A7] block mb-1">
              Acciones Comerciales
            </span>
            <button
              type="button"
              onClick={() => onOpenPaymentModal({ name: activeConv.customerName, email: activeConv.customerEmail })}
              className="w-full py-2 px-3 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-xs text-white text-left flex items-center justify-between transition-colors"
            >
              <span>Generar Factura SAT / FEL</span>
              <FileText className="w-3.5 h-3.5 text-[#A7A7A7]" />
            </button>
            <button
              type="button"
              onClick={handleSendBankDetails}
              className="w-full py-2 px-3 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-xs text-white text-left flex items-center justify-between transition-colors"
            >
              <span>Reenviar Cuentas Bancarias</span>
              <Building2 className="w-3.5 h-3.5 text-[#A7A7A7]" />
            </button>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#313131] rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
              <h3 className="text-sm font-semibold text-white">
                Iniciar Nueva Conversación
              </h3>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="text-[#A7A7A7] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-3">
              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Nombre del Cliente / Empresa</label>
                <input
                  type="text"
                  required
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Ej: Licda. Sofía Morales"
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Número de WhatsApp / Teléfono</label>
                <input
                  type="text"
                  required
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="+502 5555-4433"
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Canal</label>
                <select
                  value={newChatChannel}
                  onChange={(e: any) => setNewChatChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                >
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="telegram">Telegram</option>
                  <option value="webchat">WebChat</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#313131] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-3 py-1.5 rounded bg-[#1E1E1E] text-xs text-[#A7A7A7] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#6798FF] hover:bg-[#5584eb] text-xs font-semibold text-black"
                >
                  Crear Conversación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
