import React, { useState } from 'react';
import {
  Building2,
  Phone,
  QrCode,
  FileText,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  Upload,
  ShieldCheck,
  Zap,
  HelpCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight,
  Lock,
  User,
  Store,
  FileSpreadsheet,
  Check,
  Share2
} from 'lucide-react';
import { BusinessAccount, SimpleBankAccount, DocumentItem, Conversation } from '../../types';
import { WhatsAppQrManager } from '../whatsapp/WhatsAppQrManager';
import { TelegramBotManager } from '../telegram/TelegramBotManager';
import { CatalogCsvImporter } from '../documents/CatalogCsvImporter';
import { BusinessTemplatesSection } from '../documents/BusinessTemplatesSection';
import { QuotationPdfModal } from '../documents/QuotationPdfModal';

interface BusinessPortalViewProps {
  business: BusinessAccount;
  onUpdateBusiness: (updated: Partial<BusinessAccount>) => void;
  onRegisterNewBusiness: (newBiz: Partial<BusinessAccount>) => void;
  onOpenPaymentModal: (planOrItem?: any, amount?: number, currency?: 'GTQ' | 'USD') => void;
  onNavigateToView?: (view: any) => void;
  documents: DocumentItem[];
  onAddDocument: (doc: Partial<DocumentItem>) => void;
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
}

export const BusinessPortalView: React.FC<BusinessPortalViewProps> = ({
  business,
  onUpdateBusiness,
  onRegisterNewBusiness,
  onOpenPaymentModal,
  onNavigateToView,
  documents,
  onAddDocument,
  conversations,
  onSendMessage
}) => {
  // Navigation tabs in Business Portal
  const [activeTab, setActiveTab] = useState<'overview' | 'whatsapp' | 'telegram' | 'catalog' | 'payments_setup' | 'subscription' | 'inbox'>('overview');
  
  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  // New Business Form State
  const [regBizName, setRegBizName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPlan, setRegPlan] = useState<'emprendedor' | 'pro' | 'corporativo'>('pro');
  const [regIndustry, setRegIndustry] = useState<any>('ferreteria');

  // Interactive Test Chat State
  const [testUserQuery, setTestUserQuery] = useState('');
  const [testChatMessages, setTestChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `¡Hola! Bienvenido a ${business.businessName}. 👋 Soy tu asistente de ventas automatizado con IA. ¿En qué te puedo asesorar hoy?`,
      time: 'Ahora'
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Bank Accounts Editor State
  const [bankAccounts, setBankAccounts] = useState<SimpleBankAccount[]>(business.bankAccounts || [
    { bankName: 'Banco Industrial', accountNumber: '1402158', accountHolder: 'Anderson William', accountType: 'Ahorro' },
    { bankName: 'BAM Agromercantil', accountNumber: '4030437443', accountHolder: 'Anderson William', accountType: 'Ahorro' }
  ]);
  const [paymentNoticeText, setPaymentNoticeText] = useState(business.paymentInstructions || 'Transferencia bancaria a Banco Industrial o BAM, o enlace seguro de tarjeta / PayPal: andersonwiliam637@gmail.com.');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Quick bot response simulator
  const handleTestChatSend = () => {
    if (!testUserQuery.trim()) return;

    const userText = testUserQuery.trim();
    const newMsg = { sender: 'user' as const, text: userText, time: 'Ahora' };
    setTestChatMessages((prev) => [...prev, newMsg]);
    setTestUserQuery('');
    setIsBotTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('precio') || lower.includes('cuanto') || lower.includes('costo') || lower.includes('cotiz')) {
        reply = `¡Con gusto! En ${business.businessName} tenemos disponibles nuestros productos oficiales con entrega inmediata. Por ejemplo, te puedo generar una cotización formal con IVA y flete incluido. ¿Deseas que te comparta nuestro catálogo completo en PDF?`;
      } else if (lower.includes('cuenta') || lower.includes('banco') || lower.includes('pago') || lower.includes('transferencia') || lower.includes('tarjeta')) {
        reply = `Para realizar tu pago de forma 100% segura aceptamos transferencias directas a:\n\n• Banco Industrial (Ahorro): 1402158\n• BAM (Ahorro): 4030437443\n• Titular: Anderson William\n• PayPal / Tarjetas: andersonwiliam637@gmail.com\n\nAl transferir envíanos tu comprobante por aquí y procesamos tu pedido de inmediato. 🚚`;
      } else if (lower.includes('hola') || lower.includes('buenos') || lower.includes('tardes')) {
        reply = `¡Hola! Qué gusto saludarte en ${business.businessName}. Estamos listos para atenderte las 24 horas. ¿Qué producto o servicio estás buscando hoy?`;
      } else {
        reply = `He consultado la base de conocimiento de ${business.businessName}. Con base en nuestros documentos oficiales, te confirmo que disponemos de atención y despacho rápido. Puedes confirmar tu pedido o solicitar hablar con un asesor humano al +502 5415-4016.`;
      }

      setTestChatMessages((prev) => [...prev, { sender: 'bot', text: reply, time: 'Ahora' }]);
      setIsBotTyping(false);
    }, 1000);
  };

  const handleSaveBankAccounts = () => {
    onUpdateBusiness({
      bankAccounts,
      paymentInstructions: paymentNoticeText
    });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3500);
  };

  const handleCreateNewBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regBizName.trim()) return;

    const planPrices = {
      emprendedor: 199,
      pro: 225,
      corporativo: 499
    };

    const newBiz: Partial<BusinessAccount> = {
      id: `biz-${Date.now()}`,
      businessName: regBizName.trim(),
      ownerName: regOwnerName.trim() || 'Dueño de Negocio',
      phone: regPhone.trim() || '+502 5000-0000',
      email: regEmail.trim() || 'negocio@ejemplo.com',
      industry: regIndustry,
      currency: 'GTQ',
      planName: regPlan === 'emprendedor' ? 'Plan Emprendedor' : regPlan === 'pro' ? 'Plan Negocio Pro' : 'Plan Corporativo Enterprise',
      planPrice: planPrices[regPlan],
      status: 'pending_activation',
      subscriptionExpiresAt: 'Pendiente de Validación Bancaria',
      daysRemaining: 0,
      whatsappConnected: false,
      bankAccounts: [
        { bankName: 'Banco Industrial', accountNumber: '1402158', accountHolder: 'Anderson William', accountType: 'Ahorro' },
        { bankName: 'BAM Agromercantil', accountNumber: '4030437443', accountHolder: 'Anderson William', accountType: 'Ahorro' }
      ],
      paymentInstructions: 'Transferencia bancaria a Banco Industrial o BAM, o enlace seguro de tarjeta / PayPal: andersonwiliam637@gmail.com.',
      documentsCount: 1,
      messagesCount: 0
    };

    onRegisterNewBusiness(newBiz);
    setShowRegisterModal(false);
    setActiveTab('subscription');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Ultra-Clear Executive Header for Business Owners */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Subtle Luxury Banner Backdrop with Scrim */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/src/assets/images/banner_business_portal_1790539083451.jpg"
            alt="Business Portal Luxury Suite"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-15 filter brightness-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/90" />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                {business.businessName}
              </h2>
              {business.status === 'active' ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{business.planName} Activo</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400 font-tabular">
                    {business.daysRemaining} días restantes
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Pendiente de Activación por Anderson William</span>
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span>Titular: <strong className="text-white font-medium">{business.ownerName}</strong></span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>WhatsApp: <strong className="text-white font-medium font-tabular">{business.phone}</strong></span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-medium">IA Gemini 3.7 lista</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenPaymentModal(business.planName, business.planPrice, 'GTQ')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagar / Renovar Mensualidad (Q<span className="font-tabular">{business.planPrice}</span>)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Registrar Otra Empresa</span>
          </button>
        </div>
      </div>

      {/* Activation Status Banner */}
      {business.status === 'pending_activation' ? (
        <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  Servicio en Proceso de Activación Manual (Validación Bancaria)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/40">
                  Plan No Activo Aún
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Por motivos de seguridad y validación en la banca guatemalteca (Banco Industrial No. 1402158 o BAM No. 4030437443),
                tu bot se activará cuando <strong>Anderson William (+502 54154016)</strong> confirme tu boleta y presione <strong className="text-emerald-400">"Activar Servicio al Usuario"</strong> en su panel administrativo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <a
              href={`https://wa.me/50254154016?text=${encodeURIComponent(
                `🚨 *SOLICITUD DE ACTIVACIÓN DE SERVICIO - CONVERSAGT* 🚨\n\n` +
                `🏢 *Empresa:* ${business.businessName}\n` +
                `👤 *Dueño:* ${business.ownerName}\n` +
                `📱 *Teléfono:* ${business.phone}\n` +
                `📦 *Plan:* ${business.planName} (Q${business.planPrice})\n\n` +
                `_Hola Anderson William, adjunto mi boleta para la activación de mi servicio en ConversaGT._`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Enviar Boleta por WhatsApp (+502 54154016)</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Servicio Activo & Autorizado por Anderson William • Bots WhatsApp/Telegram Operando 24/7</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            {business.daysRemaining} días restantes
          </span>
        </div>
      )}

      {/* 2. Four-Step Onboarding Roadmap for Beginners (Super Intuitive) */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">
              Guía de Éxito en 4 Pasos (Tu Bot Listo para Vender y Cobrar)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold">
            Paso a Paso Fácil
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div
            onClick={() => setActiveTab('overview')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Paso 1</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-xs text-white">Mi Negocio</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Nombre, rubro y datos de contacto de tu empresa.</p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setActiveTab('whatsapp')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Paso 2</span>
              {business.whatsappConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <h4 className="font-bold text-xs text-white">Conectar WhatsApp</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Escanea el código QR con tu celular y activa la IA.</p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setActiveTab('catalog')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'catalog'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Paso 3</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-xs text-white">Subir lo que Vendo</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Sube tu PDF, menú o lista de precios con 1 clic.</p>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setActiveTab('payments_setup')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'payments_setup'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Paso 4</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-xs text-white">Mis Cuentas de Cobro</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Tus cuentas bancarias donde tus clientes te depositarán.</p>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Tab Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Resumen de Mi Negocio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>1. Conectar WhatsApp</span>
          {!business.whatsappConnected && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'telegram'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>2. Telegram Bot 24/7</span>
          {business.telegramConnected ? (
            <span className="w-2 h-2 rounded-full bg-sky-300" />
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">Nuevo</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'catalog'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Mis Productos & Documentos ({documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'inbox'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>4. Clientes & Chats ({conversations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments_setup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'payments_setup'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>5. Mis Cuentas de Cobro</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'subscription'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>6. Mi Mensualidad</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (PANEL PRINCIPAL) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Estado de WhatsApp</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${business.whatsappConnected ? 'bg-[#16A34A]' : 'bg-[#7C7C7C]'}`} />
                <h4 className="text-base font-semibold text-white font-mono text-sm">
                  {business.whatsappConnected ? 'CONECTADO' : 'NO CONFIGURADO'}
                </h4>
              </div>
              <p className="text-[11px] text-[#A7A7A7]">
                {business.whatsappConnected ? 'Conexión verificada en backend' : 'Configura WhatsApp Web QR o Meta Cloud en Ajustes'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Productos & Documentos</span>
              <h4 className="text-base font-bold text-white">{documents.length} Archivos en Memoria</h4>
              <p className="text-[11px] text-slate-400">Precios y políticas memorizadas por Gemini</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Clientes Atendidos</span>
              <h4 className="text-base font-bold text-white">{conversations.length} Conversaciones</h4>
              <p className="text-[11px] text-slate-400">Prospectos captados en WhatsApp</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Permanencia de Cuenta</span>
              <h4 className="text-base font-bold text-emerald-400">{business.daysRemaining} Días Restantes</h4>
              <p className="text-[11px] text-slate-400">Plan: {business.planName} (Q{business.planPrice}/mes)</p>
            </div>
          </div>

          {/* Guía Rápida en 4 Pasos Sencillos para el Cliente */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>¿Cómo funciona tu plataforma ConversaGT en 4 pasos?</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Diseñado para que cualquier dueño de negocio en Guatemala venda en automático por WhatsApp y Telegram.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                Fácil & Sin Complicaciones
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div 
                onClick={() => setActiveTab('catalog')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px]">PASO 1</span>
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white text-xs">Sube tus Productos o PDF</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Carga tu lista de precios en Excel o PDF. La IA Gemini memorizará todo para responder dudas.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('whatsapp')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px]">PASO 2</span>
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white text-xs">Vincula WhatsApp o Telegram</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Escanea el código QR igual que WhatsApp Web o pon tu token de Telegram para activar el bot 24/7.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('payments_setup')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px]">PASO 3</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white text-xs">Tus Cuentas Bancarias</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Configura tu cuenta BI, BAM o G&T para que tu bot le cobre y comparta los datos a tus clientes.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('subscription')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px]">PASO 4</span>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white text-xs">Paga & Activa tu Servicio</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Paga tu mensualidad. Anderson William verifica la boleta en banca y activa tu cuenta de inmediato.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>¿Quieres probar cómo responde tu bot a tus clientes?</span>
              </h3>
              <p className="text-xs text-slate-400">
                Abre el simulador en vivo y hazle preguntas sobre tus precios, productos o cuentas bancarias.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>Probar Chat de mi Bot Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowQuotationModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Emitir Cotización PDF</span>
              </button>
            </div>
          </div>

          {/* Business Templates Showcase */}
          <BusinessTemplatesSection
            onAddDocument={onAddDocument}
            isZeroHallucinationActive={true}
            onToggleZeroHallucination={() => {}}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WHATSAPP QR & LIVE BOT SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: QR Scan & Status */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Vincular Mi Teléfono de WhatsApp</h3>
                    <p className="text-[11px] text-slate-400">Sin trámites engorrosos de Meta. Conexión directa estilo WhatsApp Web.</p>
                  </div>
                </div>
              </div>

              {/* Step instructions for business owner */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                <span className="font-bold text-emerald-400 block text-xs">Instrucciones sencillas en tu celular:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Abre <strong>WhatsApp</strong> en tu teléfono.</li>
                  <li>Toca en <strong>Ajustes</strong> (o los 3 puntos arriba a la derecha).</li>
                  <li>Selecciona <strong>Dispositivos vinculados</strong> y luego <strong>Vincular un dispositivo</strong>.</li>
                  <li>Apunta la cámara de tu teléfono a este código QR. ¡Y listo!</li>
                </ol>
              </div>

              <WhatsAppQrManager />
            </div>
          </div>

          {/* Right Column: Live Interactive Chat Simulator (Test your bot) */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Probar mi Bot en Vivo</h3>
                    <p className="text-[10px] text-slate-400">Escribe aquí como si fueras uno de tus clientes</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Simulador 24/7
                </span>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
                {testChatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      <span className="text-[9px] opacity-70 block text-right mt-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="p-2.5 rounded-2xl bg-slate-800 text-slate-400 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>El bot de {business.businessName} está escribiendo...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-2">
                <button
                  type="button"
                  onClick={() => setTestUserQuery('¿Qué precios manejan y qué productos tienen?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] shrink-0 transition-colors"
                >
                  "¿Qué precios manejan?"
                </button>
                <button
                  type="button"
                  onClick={() => setTestUserQuery('¿A qué cuentas de banco puedo transferir?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] shrink-0 transition-colors"
                >
                  "¿A qué cuentas de banco transfiero?"
                </button>
                <button
                  type="button"
                  onClick={() => setTestUserQuery('¿Hacen envíos a departamentos de Guatemala?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] shrink-0 transition-colors"
                >
                  "¿Hacen envíos a departamentos?"
                </button>
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={testUserQuery}
                  onChange={(e) => setTestUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTestChatSend()}
                  placeholder="Escribe tu mensaje de prueba..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleTestChatSend}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TELEGRAM BOT 24/7 (ALTERNATIVA O COMPLEMENTO) */}
      {/* ========================================================================= */}
      {activeTab === 'telegram' && (
        <div className="space-y-5">
          <TelegramBotManager
            business={business}
            onUpdateBusiness={onUpdateBusiness}
            onOpenPaymentModal={onOpenPaymentModal}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRODUCTS & DOCUMENTS (SUBIR ARCHIVOS FACIL) */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-white text-sm">
                Documentos & Catálogos Memorizados por la IA ({documents.length} Archivos)
              </h3>
              <p className="text-xs text-slate-400">
                Todo documento que subas aquí será leído por Gemini para responder las dudas y precios a tus clientes en WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQuotationModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generar Cotización PDF</span>
              </button>
            </div>
          </div>

          {/* CSV & Excel Importer */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar Lista de Precios o Catálogo Excel/CSV Seguro</span>
            </h4>
            <CatalogCsvImporter
              onAddDocument={onAddDocument}
              onSuccess={() => {
                alert('¡Catálogo importado y memorizado con éxito por la IA!');
              }}
            />
          </div>

          {/* Current Documents List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{doc.size || '12 KB'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{doc.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{doc.description || doc.content?.slice(0, 100)}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Memorizado por Gemini</span>
                  </span>
                  <span>{doc.chunksCount} fragmentos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MIS CLIENTES & CONVERSACIONES */}
      {/* ========================================================================= */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-sm">
                Bandeja de Mensajes de WhatsApp ({conversations.length} Contactos)
              </h3>
              <p className="text-xs text-slate-400">
                Personas que han interactuado con tu negocio. Puedes ver las respuestas que dio la IA o contestar tú mismo.
              </p>
            </div>
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView('conversations')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>Abrir CRM Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            {conversations.slice(0, 8).map((conv) => (
              <div
                key={conv.id}
                className="p-4 hover:bg-slate-800/50 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={conv.customerAvatar || '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg'}
                    alt={conv.customerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/src/assets/images/avatar_advisor_carlos_1790539075055.jpg';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white truncate">{conv.customerName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{conv.customerPhone}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToView) onNavigateToView('conversations');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Ver Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MIS CUENTAS DE COBRO */}
      {/* ========================================================================= */}
      {activeTab === 'payments_setup' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-sm">
                Configuración de Cuentas Bancarias (A Dónde Cobras a tus Clientes)
              </h3>
              <p className="text-xs text-slate-400">
                Cuando un cliente le pida al bot el número de cuenta para pagar, la IA le enviará estos datos de forma automática.
              </p>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Cuentas bancarias actualizadas correctamente! El bot ya usará esta información.</span>
              </div>
            )}

            <div className="space-y-3">
              {bankAccounts.map((account, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
                >
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Banco</label>
                    <input
                      type="text"
                      value={account.bankName}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[index].bankName = e.target.value;
                        setBankAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">No. de Cuenta</label>
                    <input
                      type="text"
                      value={account.accountNumber}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[index].accountNumber = e.target.value;
                        setBankAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Titular</label>
                    <input
                      type="text"
                      value={account.accountHolder}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[index].accountHolder = e.target.value;
                        setBankAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Tipo de Cuenta</label>
                    <input
                      type="text"
                      value={account.accountType}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[index].accountType = e.target.value;
                        setBankAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-slate-300 font-bold text-xs mb-1">
                Instrucciones Adicionales de Pago para el Bot:
              </label>
              <textarea
                rows={3}
                value={paymentNoticeText}
                onChange={(e) => setPaymentNoticeText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
                placeholder="Ej. Favor enviar comprobante de pago por WhatsApp para coordinar despacho en 24 horas..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveBankAccounts}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cuentas para el Bot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: MI MENSUALIDAD & FACTURAS */}
      {/* ========================================================================= */}
      {activeTab === 'subscription' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tu Plan Actual</span>
                <h3 className="text-xl font-black text-white">{business.planName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tarifa: <strong>Q{business.planPrice}.00 / mes</strong> ($29 USD)
                </p>
              </div>

              <div className="text-right">
                {business.status === 'active' ? (
                  <>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/40">
                      Cuenta Activa ({business.daysRemaining} días restantes)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">Próxima renovación: 15 de Octubre, 2026</p>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/40 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Pendiente de Activación por Anderson</span>
                    </span>
                    <p className="text-[11px] text-amber-200/70 mt-1">Validando boleta en Banco Industrial / BAM</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Option A: Pay Online */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                    <span>Opción A: Pago Inmediato con Tarjeta o PayPal</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Paga con cualquier tarjeta de crédito o débito Visa / Mastercard o PayPal de forma instantánea y tu servicio continuará activo sin interrupciones.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPaymentModal(business.planName, business.planPrice, 'GTQ')}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar Mensualidad en Línea (Q{business.planPrice})</span>
                </button>
              </div>

              {/* Option B: Local Bank Transfer */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                    <span>Opción B: Transferencia Bancaria Local Guatemala</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <p>• <strong>Banco Industrial (Ahorro):</strong> 1402158</p>
                    <p>• <strong>BAM Agromercantil (Ahorro):</strong> 4030437443</p>
                    <p>• <strong>Titular:</strong> Anderson William</p>
                  </div>
                </div>

                <a
                  href="https://wa.me/50254154016?text=Hola%20Ingeniero%20Anderson%20William,%20adjunto%20comprobante%20de%20pago%20de%20mi%20mensualidad%20de%20ConversaGT"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Enviar Boleta por WhatsApp al 5415-4016</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER A NEW BUSINESS PROFILE */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Registrar Mi Empresa en ConversaGT</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewBusinessSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre de la Empresa o Negocio *</label>
                <input
                  type="text"
                  required
                  value={regBizName}
                  onChange={(e) => setRegBizName(e.target.value)}
                  placeholder="Ej. Taller Los Compadres o Ferretería Central"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre del Dueño / Encargado</label>
                  <input
                    type="text"
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Ej. +502 5415-4016"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rubro de tu Empresa</label>
                  <select
                    value={regIndustry}
                    onChange={(e) => setRegIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="ferreteria">Ferretería & Construcción</option>
                    <option value="repuestos">Repuestos & Taller Automotriz</option>
                    <option value="clinica">Clínica Médica / Odontología</option>
                    <option value="restaurante">Restaurante & Delivery</option>
                    <option value="inmobiliaria">Inmobiliaria & Bienes Raíces</option>
                    <option value="moda">Tienda de Ropa & Calzado</option>
                    <option value="servicios">Servicios Profesionales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Seleccionar Plan</label>
                  <select
                    value={regPlan}
                    onChange={(e) => setRegPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-emerald-400"
                  >
                    <option value="emprendedor">Plan Emprendedor (Q199 / mes)</option>
                    <option value="pro">Plan Negocio Pro (Q225 / mes) ★ Recomendado</option>
                    <option value="corporativo">Plan Corporativo (Q499 / mes)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Al registrar tu empresa obtendrás tu propio panel independiente, conexión de WhatsApp con código QR y memoria RAG para tus catálogos y precios.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <span>Crear Mi Panel de Negocio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation PDF Modal */}
      <QuotationPdfModal
        isOpen={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
        defaultCustomerName="Cliente de WhatsApp"
        defaultCustomerPhone={business.phone}
      />
    </div>
  );
};
