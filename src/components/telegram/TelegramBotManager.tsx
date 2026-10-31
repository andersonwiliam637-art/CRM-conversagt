import React, { useState } from 'react';
import {
  Send,
  Bot,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Power,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Terminal,
  KeyRound
} from 'lucide-react';
import { BusinessAccount } from '../../types';

interface TelegramBotManagerProps {
  business: BusinessAccount;
  onUpdateBusiness: (updated: Partial<BusinessAccount>) => void;
}

export const TelegramBotManager: React.FC<TelegramBotManagerProps> = ({
  business,
  onUpdateBusiness,
}) => {
  const [botToken, setBotToken] = useState(business.telegramBotToken || '');
  const [botUsername, setBotUsername] = useState(business.telegramBotUsername || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'NO_CONFIGURADO' | 'CONFIGURACION_PENDIENTE' | 'VERIFICANDO' | 'CONECTADO' | 'DEMO_DATOS_PRUEBA'
  >(business.telegramConnected ? 'CONFIGURACION_PENDIENTE' : 'NO_CONFIGURADO');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Test Chat State (Clearly marked as DEMO)
  const [testInput, setTestInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      id: 'tg-1',
      sender: 'bot',
      text: `¡Hola! Bienvenido al canal de atención de ${business.businessName}. Automatizamos respuestas de catálogos, cotizaciones y cuentas bancarias en Quetzales.`,
      time: '10:00'
    }
  ]);

  const handleConnectTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) {
      setFeedback({
        type: 'error',
        text: 'Por favor ingresa tu Token de Bot proporcionado por @BotFather en Telegram.',
      });
      return;
    }

    setIsVerifying(true);
    setConnectionStatus('VERIFICANDO');
    setFeedback(null);

    try {
      const res = await fetch('/api/telegram/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: botToken.trim(),
          username: botUsername.trim(),
          businessId: business.id,
          businessName: business.businessName
        })
      });

      if (res.ok) {
        setConnectionStatus('CONFIGURACION_PENDIENTE');
        onUpdateBusiness({
          telegramBotToken: botToken.trim(),
          telegramBotUsername: botUsername.trim(),
          telegramBotStatus: 'pending'
        });
        setFeedback({
          type: 'success',
          text: 'Token guardado en servidor backend. Verificación de webhook pendiente de registro con la API de Telegram.',
        });
      } else {
        setConnectionStatus('CONFIGURACION_PENDIENTE');
        setFeedback({
          type: 'error',
          text: 'No se pudo verificar el token directamente con los servidores de Telegram. Verifique la clave.',
        });
      }
    } catch {
      setConnectionStatus('CONFIGURACION_PENDIENTE');
      setFeedback({
        type: 'error',
        text: 'Error al contactar el servidor de backend.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = () => {
    setConnectionStatus('NO_CONFIGURADO');
    setBotToken('');
    setBotUsername('');
    onUpdateBusiness({
      telegramConnected: false,
      telegramBotToken: '',
      telegramBotStatus: 'disconnected'
    });
    setFeedback({
      type: 'success',
      text: 'Integración de Telegram desvinculada.',
    });
  };

  const handleSendTest = async (overrideText?: string) => {
    const textToSend = overrideText || testInput.trim();
    if (!textToSend || isBotTyping) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setTestInput('');
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/telegram/simulate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          from: business.ownerName || 'Cliente Telegram',
          businessName: business.businessName
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error();
      }
    } catch {
      let reply = '';
      const lower = textToSend.toLowerCase();
      if (lower.includes('/start') || lower.includes('hola')) {
        reply = `¡Hola! Bienvenido al canal de atención de ${business.businessName}. Automatizo atención, cotizaciones y pedidos 24/7.`;
      } else if (lower.includes('/pago') || lower.includes('cuenta') || lower.includes('banco')) {
        reply = `Cuentas Bancarias de ${business.businessName}:\n• Banco Industrial (Ahorro): 1402158\n• BAM Agromercantil (Ahorro): 4030437443\n• Titular: Anderson William\n\nEnvía tu comprobante para validación contable y emisión de Factura SAT.`;
      } else {
        reply = `He recibido tu mensaje de prueba para el bot de ${business.businessName}. El asistente responderá de inmediato basándose en tus documentos indexados.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#A7A7A7] uppercase tracking-wider">Canal Telegram</span>
            <span className="text-xs text-[#A7A7A7]">·</span>
            {connectionStatus === 'NO_CONFIGURADO' && (
              <span className="font-mono text-[10px] text-[#A7A7A7] bg-[#1E1E1E] px-2 py-0.5 rounded border border-[#313131]">
                NO CONFIGURADO
              </span>
            )}
            {connectionStatus === 'CONFIGURACION_PENDIENTE' && (
              <span className="font-mono text-[10px] text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded border border-[#D97706]/30">
                CONFIGURACIÓN PENDIENTE
              </span>
            )}
            {connectionStatus === 'VERIFICANDO' && (
              <span className="font-mono text-[10px] text-[#6798FF] bg-[#6798FF]/10 px-2 py-0.5 rounded border border-[#6798FF]/30">
                VERIFICANDO
              </span>
            )}
            {connectionStatus === 'CONECTADO' && (
              <span className="font-mono text-[10px] text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded border border-[#16A34A]/30">
                CONECTADO
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight mt-1">
            Conexión con Bot de Telegram
          </h2>
          <p className="text-xs text-[#A7A7A7] mt-0.5">
            Vincula un bot creado con @BotFather para atención automatizada con IA.
          </p>
        </div>

        {connectionStatus !== 'NO_CONFIGURADO' && (
          <button
            type="button"
            onClick={handleDisconnect}
            className="px-3 py-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white text-xs transition-all"
          >
            Desconectar
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
          feedback.type === 'success'
            ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30'
            : 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Grid: Form & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Token Form */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleConnectTelegram} className="p-5 rounded-lg bg-[#141414] border border-[#313131] space-y-4">
            <div className="pb-3 border-b border-[#313131]">
              <h3 className="font-semibold text-white text-sm">
                Credenciales del Bot de Telegram
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Obtén el token desde @BotFather en Telegram y configúralo en el servidor backend.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A7A7A7] block mb-1">Nombre de Usuario del Bot (@usuario):</label>
                <input
                  type="text"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  placeholder="@NombreDeTuBot"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div>
                <label className="text-[#A7A7A7] block mb-1">Bot Token de Telegram:</label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
                />
                <span className="text-[10px] text-[#A7A7A7] mt-1 block">
                  El secreto se almacena en el servidor como <code className="font-mono text-[#6798FF]">TELEGRAM_BOT_TOKEN</code>.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] disabled:opacity-40 text-black font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Guardar Credenciales en Backend</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Chat Simulator (Explicitly DEMO) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-lg bg-[#141414] border border-[#313131] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#6798FF]" />
                <span className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
                  Simulador de Respuestas del Bot
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase text-[#6798FF] bg-[#6798FF]/10 px-1.5 py-0.5 rounded border border-[#6798FF]/30">
                DEMO — DATOS DE PRUEBA
              </span>
            </div>

            {/* Chat Box */}
            <div className="h-56 overflow-y-auto p-3 rounded-lg bg-[#0A0A0A] border border-[#313131] space-y-2.5 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                        : 'bg-[#141414] text-white border border-[#6798FF]/30'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[10px] text-[#7C7C7C] font-mono text-right mt-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex items-center gap-2 text-xs text-[#A7A7A7] p-2 font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#6798FF] animate-pulse" />
                  <span>El asistente está escribiendo...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendTest();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Escribe una pregunta para probar el bot de Telegram..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#313131] text-xs text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
              />
              <button
                type="submit"
                disabled={isBotTyping || !testInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] disabled:opacity-40 text-black font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
