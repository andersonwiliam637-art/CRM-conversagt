import React, { useState, useEffect, useRef } from 'react';
import {
  Pyramid,
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  MessageSquare,
  Phone,
  ShieldCheck,
  CreditCard,
  Building2,
  Zap,
  Check,
  ExternalLink,
  ArrowRight,
  Lock,
  DollarSign,
  Globe,
  RefreshCw,
  Activity,
  Award,
  Users,
  Copy,
  ChevronRight
} from 'lucide-react';
import { Client, Conversation, DocumentItem } from '../../types';
import { askGeminiCopilot } from '../../services/geminiService';

interface PublicPortalViewProps {
  onRegisterClient: (clientData: Partial<Client>, initialMessage?: string) => void;
  onGoToDashboard: () => void;
  documents?: DocumentItem[];
}

interface DemoMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  onRegisterClient,
  onGoToDashboard,
  documents = [],
}) => {
  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<'emprendedor' | 'pro' | 'platinum'>('pro');
  const [currency, setCurrency] = useState<'GTQ' | 'USD'>('GTQ');

  // Channel Selection for Lead Bot Deployment
  const [botPlatformPreference, setBotPlatformPreference] = useState<'whatsapp' | 'telegram' | 'dual'>('whatsapp');

  // Lead Form
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadCountryCode, setLeadCountryCode] = useState('+502');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadTelegramHandle, setLeadTelegramHandle] = useState('');
  const [leadSource, setLeadSource] = useState<'tiktok' | 'instagram' | 'facebook' | 'whatsapp' | 'web'>('tiktok');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bi' | 'bam' | 'paypal' | 'card'>('bi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<any | null>(null);

  // Live Interactive Bot Demo with Dual WhatsApp / Telegram Mode
  const [demoChannelMode, setDemoChannelMode] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola! 👋 Soy el Asistente IA de ConversaGT en WhatsApp. Automatizo la atención de tus clientes 24/7, cierro ventas y recibo pagos por Banco Industrial, BAM, Tarjetas o PayPal. ¿Qué tipo de negocio tienes?',
      time: 'Ahora',
    },
  ]);
  const [demoInput, setDemoInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const demoEndRef = useRef<HTMLDivElement>(null);

  // Copied alert for bank accounts
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    demoEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [demoMessages, isBotTyping]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleSwitchDemoChannel = (mode: 'whatsapp' | 'telegram') => {
    setDemoChannelMode(mode);
    if (mode === 'telegram') {
      setDemoMessages([
        {
          id: 'tg-1',
          sender: 'bot',
          text: '🤖 *ConversaGT Telegram Bot Oficial*\n¡Bienvenido! Atiendo a tus clientes en Telegram al instante. Escribe /start, /planes, /pago o formula tu consulta.',
          time: 'Ahora',
        },
      ]);
    } else {
      setDemoMessages([
        {
          id: 'wa-1',
          sender: 'bot',
          text: '¡Hola! 👋 Soy el Asistente IA de ConversaGT en WhatsApp. Automatizo la atención de tus clientes 24/7, cierro ventas y recibo pagos por Banco Industrial, BAM, Tarjetas o PayPal. ¿Qué tipo de negocio tienes?',
          time: 'Ahora',
        },
      ]);
    }
  };

  const handleSendDemoMessage = async (customText?: string) => {
    const textToSend = customText || demoInput.trim();
    if (!textToSend || isBotTyping) return;

    const userMsg: DemoMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
    };

    setDemoMessages((prev) => [...prev, userMsg]);
    if (!customText) setDemoInput('');
    setIsBotTyping(true);

    if (demoChannelMode === 'telegram') {
      // Call Telegram simulation backend
      try {
        const res = await fetch('/api/telegram/simulate-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSend, from: leadName || 'Prospecto Web' }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          setDemoMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: data.reply,
              time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else {
          throw new Error('Respuesta no JSON');
        }
      } catch (e) {
        setDemoMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '🤖 Telegram Bot: Información de pagos y activación al WhatsApp +502 54154016 con Anderson William.',
            time: 'Ahora',
          },
        ]);
      } finally {
        setIsBotTyping(false);
      }
      return;
    }

    try {
      const history = demoMessages.slice(-4).map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'agent',
        text: m.text,
      }));

      const context = `INFORMACIÓN OFICIAL CONVERSAGT:
Planes disponibles:
- Plan Emprendedor: Q350/mes ($45 USD) para 1 agente y respuestas con IA en WhatsApp y Telegram.
- Plan Business Pro (Más vendido): Q750/mes ($95 USD) con 3 agentes, RAG de catálogos y cobro con tarjeta/bancos.
- Plan Platinum: Q2,299/año ($295 USD) con agentes ilimitados y facturación SAT FEL.
Cuentas oficiales a nombre de Anderson William:
- Banco Industrial (Ahorro): 1402158
- BAM (Ahorro): 4030437443
- PayPal oficial: andersonwiliam637@gmail.com
Soporte técnico y activación por WhatsApp: +502 54154016 (Ingeniero AI Anderson William).`;

      const res = await askGeminiCopilot(
        textToSend,
        history,
        context,
        leadName || 'Interesado/a',
        'profesional_calido'
      );

      const botMsg: DemoMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply || 'Con gusto te atendemos. Puedes consultar nuestros planes desde Q350 o escribir a nuestro WhatsApp oficial +502 54154016.',
        time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      };

      setDemoMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const fallbackMsg: DemoMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '¡Con gusto! Contamos con planes desde Q350 al mes, soporte oficial en Guatemala y pagos mediante Banco Industrial (1402158), BAM (4030437443) y PayPal (andersonwiliam637@gmail.com). Puedes registrarte abajo o escribirnos al WhatsApp +502 54154016.',
        time: 'Ahora',
      };
      setDemoMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;

    setIsSubmitting(true);
    const fullPhone = `${leadCountryCode} ${leadPhone.trim()}`;
    const cleanPhoneNoSpaces = fullPhone.replace(/[^0-9]/g, '');

    const planData = {
      emprendedor: { name: 'Plan Emprendedor', price: currency === 'GTQ' ? 'Q350/mes' : '$45 USD/mes', ltv: 350 },
      pro: { name: 'Plan Business Pro (Recomendado)', price: currency === 'GTQ' ? 'Q750/mes' : '$95 USD/mes', ltv: 750 },
      platinum: { name: 'Plan Platinum Anual', price: currency === 'GTQ' ? 'Q2,299/año' : '$295 USD/año', ltv: 2299 },
    }[selectedPlan];

    const paymentLabels = {
      bi: 'Banco Industrial (Ahorro No. 1402158)',
      bam: 'Banco Agromercantil BAM (Ahorro No. 4030437443)',
      paypal: 'PayPal Oficial (andersonwiliam637@gmail.com)',
      card: 'Tarjeta de Crédito / Débito (Enlace Directo 3DS)',
    };

    const platformLabel = {
      whatsapp: 'WhatsApp Business',
      telegram: 'Telegram Bot',
      dual: 'Omnicanal Dual (WhatsApp + Telegram)',
    }[botPlatformPreference];

    const newClientPayload: Partial<Client> = {
      name: leadName.trim(),
      company: leadCompany.trim() || 'Negocio Independiente',
      phone: fullPhone,
      email: leadEmail.trim() || `${leadName.toLowerCase().replace(/\s+/g, '')}@cliente-conversagt.com`,
      stage: 'nuevo',
      channelOrigin: botPlatformPreference === 'telegram' ? 'telegram' : 'whatsapp',
      leadSource: leadSource,
      selectedPlan: planData.name,
      notes: `Registrado desde portal público por ${leadSource.toUpperCase()}. Plataforma deseada: ${platformLabel}. Método de pago seleccionado: ${paymentLabels[selectedPaymentMethod]}. Plan: ${planData.name} (${planData.price}). Telegram: ${leadTelegramHandle || 'N/A'}.`,
      paymentMethodPreferred: selectedPaymentMethod === 'paypal' ? 'paypal' : selectedPaymentMethod === 'card' ? 'card' : 'bank_transfer',
      activationStatus: 'pendiente_verificacion',
      paymentConfirmed: false,
      botEnabled: true,
      registeredDate: new Date().toISOString(),
    };

    const initialWelcomeMessage = `¡Hola Anderson William! Me registré a ConversaGT desde ${leadSource.toUpperCase()} para mi negocio "${newClientPayload.company}". Deseo automatizar con ${platformLabel}, seleccioné el ${planData.name} (${planData.price}) y pagaré mediante ${paymentLabels[selectedPaymentMethod]}. Mi número de WhatsApp es ${fullPhone}.`;

    // Trigger onboarding into CRM
    onRegisterClient(newClientPayload, initialWelcomeMessage);

    // Save for receipt UI
    setRegistrationSuccess({
      name: leadName,
      company: newClientPayload.company,
      phone: fullPhone,
      cleanPhone: cleanPhoneNoSpaces,
      plan: planData.name,
      price: planData.price,
      platform: platformLabel,
      telegram: leadTelegramHandle,
      source: leadSource,
      paymentMethod: paymentLabels[selectedPaymentMethod],
      paymentMethodKey: selectedPaymentMethod,
    });

    setIsSubmitting(false);
  };

  const getWhatsAppNotifyUrl = (reg: any) => {
    const text = `🚨 *NUEVO CLIENTE REGISTRADO EN CONVERSAGT (LEXUS EDITION)* 🚨%0A%0A👤 *Nombre:* ${encodeURIComponent(reg.name)}%0A🏢 *Empresa:* ${encodeURIComponent(reg.company)}%0A📱 *WhatsApp:* ${encodeURIComponent(reg.phone)}%0A🤖 *Canal Deseado:* ${encodeURIComponent(reg.platform)}%0A🌐 *Origen:* ${encodeURIComponent(reg.source.toUpperCase())}%0A📦 *Plan Elegido:* ${encodeURIComponent(reg.plan)} (${encodeURIComponent(reg.price)})%0A💳 *Método de Pago:* ${encodeURIComponent(reg.paymentMethod)}%0A%0A_Hola Anderson William (Ingeniero AI), adjunto mi boleta para la activación inmediata de mi cuenta y bot._`;
    return `https://wa.me/50254154016?text=${text}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner Navigation */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-amber-300 to-emerald-600 p-0.5 shadow-md shadow-emerald-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Pyramid className="w-4 h-4 text-emerald-400 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Conversa<span className="text-emerald-400">GT</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Portal Oficial
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Software de WhatsApp con IA • Guatemala & LATAM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Direct Support WhatsApp */}
          <a
            href="https://wa.me/50254154016?text=Hola%20Ingeniero%20AI%20Anderson%20William,%20quiero%20información%20para%20contratar%20ConversaGT"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">WhatsApp Soporte:</span>
            <span>+502 54154016</span>
          </a>

          {/* Switch to Admin Dashboard */}
          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Panel CRM / Ingeniero AI</span>
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden rounded-3xl mt-2 mb-8 border border-slate-800/80 bg-slate-900/40">
        {/* Cinematic Backdrop Image with Measured Contrast Scrim */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/src/assets/images/hero_omnichannel_command_1790539052849.jpg"
            alt="ConversaGT Command Center Interface"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20 filter saturate-150"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative text-center space-y-6 max-w-3xl mx-auto">
          {/* Clean Editorial Kicker (Zero-Pill Discipline) */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-200 font-medium">Arquitectura de Alta Disponibilidad</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Ingeniero AI Anderson William</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Guatemala & LATAM</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
            Automatiza tu <span className="text-emerald-400">WhatsApp con Inteligencia Artificial</span> 24/7
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Atiende al instante a todos los prospectos que llegan de TikTok, Instagram y WhatsApp. Cierra ventas automáticamente, envía catálogos y recibe pagos directos por Banco Industrial, BAM, Tarjeta o PayPal con facturación SAT FEL.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#planes-y-registro"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Contratar Plan Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/50254154016?text=Hola%20Ingeniero%20AI%20Anderson%20William,%20solicito%20asesoría%20personalizada%20para%20activar%20ConversaGT%20en%20mi%20empresa"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-emerald-500/40 text-white font-medium text-sm transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Hablar por WhatsApp (+502 5415-4016)</span>
            </a>
          </div>

          {/* Trust Highlights with Single-Elevation Depth */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400 mb-2" />
              <div className="font-semibold text-xs text-white font-tabular">Respuestas &lt; 2s</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Sin perder prospectos</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <Building2 className="w-4 h-4 text-emerald-400 mb-2" />
              <div className="font-semibold text-xs text-white">BI & BAM Directos</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cuentas en Guatemala</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <CreditCard className="w-4 h-4 text-sky-400 mb-2" />
              <div className="font-semibold text-xs text-white">PayPal & Tarjetas</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cobros internacionales</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-400 mb-2" />
              <div className="font-semibold text-xs text-white">Factura SAT FEL</div>
              <div className="text-[11px] text-slate-400 mt-0.5">100% deducible de ISR</div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DEMO: CHAT WITH BOT RIGHT HERE BEFORE BUYING */}
      <section className="py-10 px-4 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${demoChannelMode === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'}`}>
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white">
                    Simulador Interactivo {demoChannelMode === 'whatsapp' ? 'WhatsApp Business' : 'Telegram Bot'}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${demoChannelMode === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                    🟢 En Línea 24/7
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Prueba la respuesta en tiempo real de nuestros bots automatizados para tu negocio.
                </p>
              </div>
            </div>

            {/* Mode Switcher + Fast Questions */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handleSwitchDemoChannel('whatsapp')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${demoChannelMode === 'whatsapp' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  🟢 WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchDemoChannel('telegram')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${demoChannelMode === 'telegram' ? 'bg-blue-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  🔵 Telegram
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSendDemoMessage(demoChannelMode === 'telegram' ? '/planes' : '¿Cuánto cuesta el Plan Business Pro y qué incluye?')}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                {demoChannelMode === 'telegram' ? '/planes' : 'Precios'}
              </button>
              <button
                type="button"
                onClick={() => handleSendDemoMessage(demoChannelMode === 'telegram' ? '/pago' : '¿A qué cuentas de Banco Industrial o BAM puedo transferir?')}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                {demoChannelMode === 'telegram' ? '/pago' : 'Cuentas'}
              </button>
            </div>
          </div>

          {/* Interactive Chat Window */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 h-72 overflow-y-auto space-y-3">
            {demoMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {msg.sender === 'user' ? <Users className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-[9px] mt-1 text-slate-400 text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2 bg-slate-900/60 rounded-xl max-w-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span>Gemini pensando respuesta...</span>
              </div>
            )}
            <div ref={demoEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendDemoMessage()}
              placeholder="Escribe una pregunta para el Bot (ej. ¿Cómo conectan mi WhatsApp?)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleSendDemoMessage()}
              disabled={isBotTyping || !demoInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Preguntar</span>
            </button>
          </div>
        </div>
      </section>

      {/* PLANS & ONBOARDING REGISTRATION */}
      <section id="planes-y-registro" className="py-12 px-4 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            Precios y Suscripción Oficial
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Elige el plan ideal para tu empresa
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sin contratos forzosos. Activación inmediata al reportar tu comprobante con el Ingeniero AI.
          </p>

          {/* Currency Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrency('GTQ')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currency === 'GTQ' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quetzales (GTQ)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currency === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dólares (USD)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Plan Emprendedor */}
          <div
            onClick={() => setSelectedPlan('emprendedor')}
            className={`p-6 rounded-3xl border cursor-pointer transition-all space-y-5 relative ${
              selectedPlan === 'emprendedor'
                ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xl'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <h3 className="text-lg font-bold text-white">Plan Emprendedor</h3>
              <p className="text-xs text-slate-400 mt-0.5">Para negocios que inician en WhatsApp</p>
            </div>

            <div className="text-3xl font-black text-white">
              {currency === 'GTQ' ? 'Q350' : '$45'}
              <span className="text-xs text-slate-400 font-normal"> / mes</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1 Número de WhatsApp conectado</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1 Agente de atención</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bot Inteligente Gemini 24/7</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Soporte por WhatsApp de Anderson</span>
              </li>
            </ul>

            <button
              type="button"
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                selectedPlan === 'emprendedor'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {selectedPlan === 'emprendedor' ? '✓ Plan Seleccionado' : 'Elegir Plan'}
            </button>
          </div>

          {/* Plan Business Pro (Highlighted) */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`p-6 rounded-3xl border cursor-pointer transition-all space-y-5 relative ${
              selectedPlan === 'pro'
                ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-950/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              ⭐ Más Vendido en Guatemala
            </div>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Business Pro</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold">
                  Recomendado
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Empresas en crecimiento y ventas activas</p>
            </div>

            <div className="text-3xl font-black text-emerald-400">
              {currency === 'GTQ' ? 'Q750' : '$95'}
              <span className="text-xs text-slate-400 font-normal"> / mes</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">WhatsApp Business API Oficial</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hasta 3 Agentes en simultáneo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Base de Conocimiento RAG (Catálogos y PDFs)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cobro con Tarjeta, BI, BAM y PayPal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Emisión de Factura SAT FEL</span>
              </li>
            </ul>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
            >
              {selectedPlan === 'pro' ? '✓ Plan Seleccionado' : 'Elegir Plan Business Pro'}
            </button>
          </div>

          {/* Plan Platinum Anual */}
          <div
            onClick={() => setSelectedPlan('platinum')}
            className={`p-6 rounded-3xl border cursor-pointer transition-all space-y-5 relative ${
              selectedPlan === 'platinum'
                ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-2xl'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <h3 className="text-lg font-bold text-white">Platinum Anual</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ahorro máximo y soporte VIP directo</p>
            </div>

            <div className="text-3xl font-black text-amber-400">
              {currency === 'GTQ' ? 'Q2,299' : '$295'}
              <span className="text-xs text-slate-400 font-normal"> / año</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Agentes y contactos Ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>WhatsApp Marketing & Difusiones Masivas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Configuración VIP directa por Ingeniero AI</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Soporte prioritario 24/7 por llamada</span>
              </li>
            </ul>

            <button
              type="button"
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                selectedPlan === 'platinum'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {selectedPlan === 'platinum' ? '✓ Plan Seleccionado' : 'Elegir Plan Platinum'}
            </button>
          </div>
        </div>

        {/* REGISTRATION FORM FOR NEW LEADS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl space-y-6">
          <div className="text-left space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Completa tus datos para iniciar</span>
            </h3>
            <p className="text-xs text-slate-400">
              Tu cuenta y bot se generarán al instante en el sistema y recibirás las instrucciones de activación.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            {/* Lead Origin Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                ¿Por dónde nos contactaste o viste nuestra publicidad?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'tiktok', label: 'TikTok 🎵' },
                  { id: 'instagram', label: 'Instagram 📸' },
                  { id: 'whatsapp', label: 'WhatsApp 💬' },
                  { id: 'facebook', label: 'Facebook 📘' },
                  { id: 'web', label: 'Web / Google 🌐' },
                ].map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setLeadSource(src.id as any)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs border text-center transition-all ${
                      leadSource === src.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tu Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre de tu Empresa o Negocio
                </label>
                <input
                  type="text"
                  value={leadCompany}
                  onChange={(e) => setLeadCompany(e.target.value)}
                  placeholder="Ej. Distribuidora El Éxito"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* WhatsApp Phone and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tu Número de WhatsApp *
                </label>
                <div className="flex gap-2">
                  <select
                    value={leadCountryCode}
                    onChange={(e) => setLeadCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="+502">🇬🇹 +502 (GT)</option>
                    <option value="+52">🇲🇽 +52 (MX)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+503">🇸🇻 +503 (SV)</option>
                    <option value="+504">🇭🇳 +504 (HN)</option>
                    <option value="+57">🇨🇴 +57 (CO)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="54154016"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Correo Electrónico (Para Factura y Accesos)
                </label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="gerencia@miempresa.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Desired Channel for Bot Automation */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="block text-slate-200 font-bold">
                Canal de Automatización Deseado:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'whatsapp', label: '🟢 WhatsApp Business', desc: 'Meta Cloud API oficial' },
                  { id: 'telegram', label: '🔵 Telegram Bot', desc: 'Atención por @Bot' },
                  { id: 'dual', label: '⚡ Omnicanal Dual', desc: 'WhatsApp + Telegram integrados' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBotPlatformPreference(item.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      botPlatformPreference === item.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {(botPlatformPreference === 'telegram' || botPlatformPreference === 'dual') && (
                <div className="pt-2">
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                    Usuario o @Canal de Telegram (Opcional):
                  </label>
                  <input
                    type="text"
                    value={leadTelegramHandle}
                    onChange={(e) => setLeadTelegramHandle(e.target.value)}
                    placeholder="@mi_empresa_bot o @usuario"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-slate-300 font-semibold mb-2">
                Selecciona tu Método de Pago Preferido:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Banco Industrial */}
                <div
                  onClick={() => setSelectedPaymentMethod('bi')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedPaymentMethod === 'bi'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="font-bold text-white block">Banco Industrial (Guatemala)</span>
                    <span className="text-[11px] text-slate-400">Cuenta de Ahorro: No. 1402158</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">Titular: Anderson William</span>
                  </div>
                </div>

                {/* BAM */}
                <div
                  onClick={() => setSelectedPaymentMethod('bam')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedPaymentMethod === 'bam'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="font-bold text-white block">Banco Agromercantil BAM</span>
                    <span className="text-[11px] text-slate-400">Cuenta de Ahorro: No. 4030437443</span>
                    <span className="text-[10px] text-teal-400 font-semibold block">Titular: Anderson William</span>
                  </div>
                </div>

                {/* PayPal */}
                <div
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedPaymentMethod === 'paypal'
                      ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="font-bold text-white block">PayPal Oficial & Tarjeta</span>
                    <span className="text-[11px] text-slate-400">andersonwiliam637@gmail.com</span>
                    <span className="text-[10px] text-blue-300 font-semibold block">Paga con tarjeta sin cuenta PayPal</span>
                  </div>
                </div>

                {/* Tarjeta de Crédito */}
                <div
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedPaymentMethod === 'card'
                      ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="font-bold text-white block">Tarjeta Visa / Mastercard</span>
                    <span className="text-[11px] text-slate-400">Enlace de pago seguro 3DS</span>
                    <span className="text-[10px] text-purple-300 font-semibold block">Aprobación instantánea</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Registrar mi Negocio & Proceder a Pago</span>
            </button>
          </form>
        </div>
      </section>

      {/* CONFIRMATION / RECEIPT MODAL AFTER REGISTRATION */}
      {registrationSuccess && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">
                ¡Registro Recibido con Éxito!
              </h3>
              <p className="text-xs text-slate-300">
                Estimado/a <strong>{registrationSuccess.name}</strong>, tu negocio <strong>"{registrationSuccess.company}"</strong> fue registrado en el sistema.
              </p>
            </div>

            {/* Selected Plan Summary */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Plan Seleccionado:</span>
                <span className="font-bold text-white">{registrationSuccess.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Monto a Cancelar:</span>
                <span className="font-black text-emerald-400 text-sm">{registrationSuccess.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Número de WhatsApp:</span>
                <span className="font-mono text-emerald-300 font-bold">{registrationSuccess.phone}</span>
              </div>
            </div>

            {/* Specific Bank / Payment instructions */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Datos de Pago ({registrationSuccess.paymentMethod})</span>
                </span>
              </div>

              {registrationSuccess.paymentMethodKey === 'bi' && (
                <div className="space-y-1.5 text-slate-200">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Banco Industrial (Ahorro Monetario)</span>
                      <span className="font-mono font-bold text-white text-sm">1402158</span>
                      <span className="text-[10px] text-emerald-400 block">Titular: Anderson William</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('1402158', 'BI')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]"
                    >
                      {copiedAccount === 'BI' ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}

              {registrationSuccess.paymentMethodKey === 'bam' && (
                <div className="space-y-1.5 text-slate-200">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Banco Agromercantil BAM (Ahorro)</span>
                      <span className="font-mono font-bold text-white text-sm">4030437443</span>
                      <span className="text-[10px] text-emerald-400 block">Titular: Anderson William</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('4030437443', 'BAM')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]"
                    >
                      {copiedAccount === 'BAM' ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}

              {registrationSuccess.paymentMethodKey === 'paypal' && (
                <div className="space-y-1.5 text-slate-200">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Cuenta Oficial de PayPal</span>
                      <span className="font-mono font-bold text-white text-sm">andersonwiliam637@gmail.com</span>
                      <span className="text-[10px] text-blue-300 block">Acepta Tarjeta Visa/Mastercard internacional</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('andersonwiliam637@gmail.com', 'PayPal')}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-[11px]"
                    >
                      {copiedAccount === 'PayPal' ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}

              {registrationSuccess.paymentMethodKey === 'card' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                  Para procesar con tarjeta de crédito/débito directamente, envía tu confirmación al Ingeniero AI para emitir tu link de pago seguro 3DS.
                </div>
              )}
            </div>

            {/* GOLDEN CTA: DIRECT WHATSAPP NOTIFICATION TO ANDERSON WILLIAM */}
            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppNotifyUrl(registrationSuccess)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-5 h-5 animate-bounce" />
                <span>Enviar Boleta y Activar con Ingeniero AI (+502 54154016)</span>
              </a>

              <p className="text-[10px] text-slate-400 text-center">
                Al hacer clic se abrirá WhatsApp con todos tus datos listos para que adjuntes tu boleta y Anderson William active tu servicio.
              </p>
            </div>

            {/* Close / Enter Portal */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRegistrationSuccess(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cerrar ventana
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegistrationSuccess(null);
                  onGoToDashboard();
                }}
                className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                <span>Ir al Panel CRM</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEXUS 4D LUXURY CERTIFICATE OF AUTHENTICITY & LEGAL ACCREDITATION */}
      <section className="py-12 px-4 lg:px-8 max-w-5xl mx-auto">
        <div className="lexus-card-4d lexus-obsidian rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-inner">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Certificado de Autenticidad Oficial • Desarrollado por ingenieroai.pro</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ingeniería de Clase Mundial con Resiliencia y Blindaje Anti-Vulnerabilidades
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              ConversaGT ha sido diseñada bajo estrictos estándares de ciberseguridad (OWASP 2026, cifrado SHA-256 en reposo, Rate Limiting y DPA conforme al Decreto 47-2008 de Guatemala) por <strong>Anderson William</strong>, Arquitecto e Ingeniero AI Senior con más de 15 años en Full-Stack y Ciberseguridad.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <a
                href="https://ingenieroai.pro"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <span>Visitar Sitio Oficial ingenieroai.pro</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/50254154016?text=Hola%20Ingeniero%20AI%20Anderson%20William,%20solicito%20verificación%20de%20licencia%20y%20activación%20de%20ConversaGT"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-200 font-bold text-xs transition-all flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Oficial: +502 54154016</span>
              </a>
            </div>

            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400">
              <div>🔒 Cifrado Bancario End-to-End</div>
              <div>⚡ 99.9% Uptime SLA Garantizado</div>
              <div>🇬🇹 Cumplimiento SAT FEL & DPA</div>
              <div>🛡️ Blindaje Anti-DDoS & Inyecciones</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-400">
          ConversaGT • Plataforma de Inteligencia Artificial para WhatsApp & Telegram en Guatemala y LATAM
        </p>
        <p>
          Licenciado y Autenticado Oficialmente por{' '}
          <a href="https://ingenieroai.pro" target="_blank" rel="noreferrer" className="text-amber-400 font-semibold hover:underline">
            ingenieroai.pro
          </a>{' '}
          • Dirección Técnica: <strong>Anderson William (Ingeniero AI Senior)</strong> • WhatsApp:{' '}
          <a href="https://wa.me/50254154016" target="_blank" rel="noreferrer" className="text-emerald-400 font-mono font-bold hover:underline">
            +502 54154016
          </a>
        </p>
        <p className="text-[10px]">
          Cuentas autorizadas: Banco Industrial No. 1402158 | BAM No. 4030437443 | PayPal andersonwiliam637@gmail.com
        </p>
      </footer>
    </div>
  );
};
