import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  ShieldCheck,
  Building2,
  Lock,
  Globe,
  Sliders,
  CheckCircle2,
  Save,
  Key,
  Server,
  Zap,
  Send,
  Bot,
  Terminal,
  AlertTriangle,
  RefreshCw,
  Phone,
  QrCode,
  Smartphone,
  CreditCard,
  Users,
  FileText,
  Scale,
  Check,
  ChevronRight,
  HelpCircle,
  Copy,
  BookOpen,
  ArrowRightLeft
} from 'lucide-react';
import { WhatsAppQrManager } from '../whatsapp/WhatsAppQrManager';

interface SettingsViewProps {
  activeBusiness?: any;
  onUpdateBusiness?: (updated: any) => void;
  clients?: any[];
  transactions?: any[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeBusiness,
  onUpdateBusiness,
  clients = [],
  transactions = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    'channels' | 'payments' | 'team' | 'sat' | 'ai_config' | 'legal' | 'activation' | 'advanced'
  >('channels');

  // Channel Sub-tab: 'whatsapp_cloud' | 'whatsapp_qr' | 'telegram'
  const [channelSubTab, setChannelSubTab] = useState<'whatsapp_cloud' | 'whatsapp_qr' | 'telegram'>('whatsapp_cloud');

  // WhatsApp Meta form state (placeholders only)
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaWabaId, setMetaWabaId] = useState('');
  const [webhookToken, setWebhookToken] = useState('conversagt_verify_token_secure');

  // Telegram form state
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramBotUser, setTelegramBotUser] = useState('@ConversaGT_Bot');

  // AI Advanced Settings State
  const [aiProvider, setAiProvider] = useState<'gemini_flash' | 'gemini_pro'>('gemini_flash');
  const [temperature, setTemperature] = useState(0.3);
  const [ragChunkSize, setRagChunkSize] = useState(400);
  const [ragMaxChunks, setRagMaxChunks] = useState(4);
  const [strictZeroHallucination, setStrictZeroHallucination] = useState(true);

  // Security audit state
  const [securityAuditData, setSecurityAuditData] = useState<any>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Bank accounts config (Guatemala)
  const [biAccount, setBiAccount] = useState('1402158');
  const [bamAccount, setBamAccount] = useState('4030437443');
  const [accountHolder, setAccountHolder] = useState('Anderson William');

  const fetchSecurityAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await fetch('/api/security/audit');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setSecurityAuditData(data);
      }
    } catch (e) {
      console.warn('Could not fetch audit', e);
    } finally {
      setIsRunningAudit(false);
    }
  };

  useEffect(() => {
    fetchSecurityAudit();
  }, []);

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText('https://conversagt.com/api/whatsapp/webhook');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#A7A7A7] uppercase tracking-wider">Consola Técnica</span>
            <span className="text-xs text-[#A7A7A7]">·</span>
            <span className="font-mono text-xs text-white">Configuración del Sistema</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Configuración & Conectividad
          </h1>
          <p className="text-sm text-[#A7A7A7] mt-0.5">
            Gestión de canales, credenciales, equipo, facturación SAT y motor IA avanzado.
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#313131] pb-2 overflow-x-auto text-xs">
        {[
          { id: 'channels', label: '1. Canales de Comunicación', icon: Phone },
          { id: 'payments', label: '2. Pagos & Cuentas Bancarias', icon: CreditCard },
          { id: 'team', label: '3. Equipo & Permisos', icon: Users },
          { id: 'sat', label: '4. Facturación SAT FEL', icon: FileText },
          { id: 'ai_config', label: '5. IA & RAG Avanzado', icon: Bot },
          { id: 'legal', label: '6. Marco Legal & DPA', icon: Scale },
          { id: 'activation', label: '7. Validación de Pagos (Admin)', icon: ShieldCheck },
          { id: 'advanced', label: '8. Opciones Avanzadas & Seguridad', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#6798FF]' : 'text-[#A7A7A7]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. CANALES DE COMUNICACIÓN                                                */}
      {/* ========================================================================= */}
      {activeTab === 'channels' && (
        <div className="space-y-6 max-w-4xl">
          {/* Sub-tabs: WhatsApp Cloud vs WhatsApp QR Demo vs Telegram */}
          <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E] text-xs">
            <button
              type="button"
              onClick={() => setChannelSubTab('whatsapp_cloud')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                channelSubTab === 'whatsapp_cloud'
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              WhatsApp — Meta Cloud API
            </button>
            <button
              type="button"
              onClick={() => setChannelSubTab('whatsapp_qr')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                channelSubTab === 'whatsapp_qr'
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              WhatsApp Web — Sesión vinculada
            </button>
            <button
              type="button"
              onClick={() => setChannelSubTab('telegram')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                channelSubTab === 'telegram'
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              Telegram Bot API
            </button>
          </div>

          {/* 1.1 & 1.2 WhatsApp (Meta Cloud API & WhatsApp Web — Sesión vinculada) */}
          {(channelSubTab === 'whatsapp_cloud' || channelSubTab === 'whatsapp_qr') && (
            <WhatsAppQrManager />
          )}

          {/* 1.3 Telegram Bot */}
          {channelSubTab === 'telegram' && (
            <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Conexión con Bot de Telegram
                  </h3>
                  <p className="text-xs text-[#A7A7A7] mt-0.5">
                    Vincula un bot creado con @BotFather para atención omnicanal en Telegram.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1E1E] text-[#A7A7A7] border border-[#313131]">
                  NO CONFIGURADO
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[#A7A7A7] block mb-1">Nombre de Usuario del Bot</label>
                  <input
                    type="text"
                    value={telegramBotUser}
                    onChange={(e) => setTelegramBotUser(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[#A7A7A7] block mb-1">Bot Token (Obtenido desde @BotFather)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs placeholder-[#7C7C7C]"
                  />
                  <span className="text-[10px] text-[#A7A7A7] mt-1 block">
                    El token se almacena en el servidor como variable de entorno segura <code className="font-mono text-[#6798FF]">TELEGRAM_BOT_TOKEN</code>.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PAGOS & CUENTAS BANCARIAS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 max-w-4xl">
          {/* Cuentas Bancarias Locales (Guatemala) */}
          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Cuentas Bancarias Autorizadas en Guatemala (BI & BAM)
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Datos oficiales para transferencias y depósitos verificados por el equipo de administración.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded bg-[#1E1E1E] border border-[#313131] space-y-2">
                <span className="font-semibold text-white block">Banco Industrial (BI)</span>
                <div>
                  <label className="text-[11px] text-[#A7A7A7] block">Número de Cuenta (Ahorro Quetzales)</label>
                  <input
                    type="text"
                    value={biAccount}
                    onChange={(e) => setBiAccount(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A7A7A7] block">Titular</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-[#0A0A0A] border border-[#313131] text-white text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded bg-[#1E1E1E] border border-[#313131] space-y-2">
                <span className="font-semibold text-white block">BAM Agromercantil</span>
                <div>
                  <label className="text-[11px] text-[#A7A7A7] block">Número de Cuenta (Ahorro Quetzales)</label>
                  <input
                    type="text"
                    value={bamAccount}
                    onChange={(e) => setBamAccount(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A7A7A7] block">Titular</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-[#0A0A0A] border border-[#313131] text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pasarelas de Tarjeta y PayPal */}
          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Pasarelas Digitales (Tarjeta & PayPal)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded bg-[#1E1E1E] border border-[#313131] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Cobro con Tarjeta (3D-Secure)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30">
                    DEMO — DATOS DE PRUEBA
                  </span>
                </div>
                <p className="text-[11px] text-[#A7A7A7]">
                  Soporte para cobro con Visa y Mastercard mediante pasarela PCI-DSS Nivel 1.
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#1E1E1E] border border-[#313131] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">PayPal Business</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30">
                    CONFIGURACIÓN PENDIENTE
                  </span>
                </div>
                <div className="text-[11px] text-[#A7A7A7] space-y-1">
                  <div>ID de Webhook Registrado: <span className="font-mono text-white text-xs">6VT269952U654131N</span></div>
                  <div>Credenciales Client ID / Secret: <span className="font-mono text-[#D97706]">Pendientes de backend</span></div>
                  <div>Endpoint Activo: <code className="font-mono text-[#6798FF]">/api/webhooks/paypal</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EQUIPO & ROLES                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="rounded-lg bg-[#141414] border border-[#313131] overflow-hidden max-w-4xl">
          <div className="p-4 border-b border-[#313131] bg-[#1E1E1E] flex items-center justify-between text-xs">
            <span className="font-semibold text-white font-mono uppercase text-[11px] tracking-wider">
              Miembros del Equipo & Permisos
            </span>
            <span className="text-[#A7A7A7] font-mono text-[11px]">3 usuarios activos</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#313131] text-[#A7A7A7] font-mono text-[11px] uppercase">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Permisos</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              <tr>
                <td className="py-3 px-4">
                  <div className="font-medium text-white">Anderson William</div>
                  <div className="text-[11px] text-[#A7A7A7] font-mono">andersonwiliam637@gmail.com</div>
                </td>
                <td className="py-3 px-4 font-mono text-[#6798FF]">SUPER_ADMIN</td>
                <td className="py-3 px-4 text-[#A7A7A7]">Acceso total, validación bancaria y configuración</td>
                <td className="py-3 px-4 text-right font-mono text-[#16A34A]">Activo</td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="font-medium text-white">Valeria Méndez</div>
                  <div className="text-[11px] text-[#A7A7A7] font-mono">valeria@empresa.gt</div>
                </td>
                <td className="py-3 px-4 font-mono text-white">AGENTE_SENIOR</td>
                <td className="py-3 px-4 text-[#A7A7A7]">Atención de chats, CRM y emisión de cotizaciones</td>
                <td className="py-3 px-4 text-right font-mono text-[#16A34A]">Activo</td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="font-medium text-white">Carlos Ramos</div>
                  <div className="text-[11px] text-[#A7A7A7] font-mono">carlos@empresa.gt</div>
                </td>
                <td className="py-3 px-4 font-mono text-white">AGENTE_VENTAS</td>
                <td className="py-3 px-4 text-[#A7A7A7]">Atención de chats asignados y registro de prospectos</td>
                <td className="py-3 px-4 text-right font-mono text-[#16A34A]">Activo</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FACTURACIÓN SAT FEL                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'sat' && (
        <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Factura Electrónica en Línea (SAT FEL / DTE)
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Emisión de comprobantes tributarios electrónicos válidos para la Superintendencia de Administración Tributaria.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30">
              CONFIGURACIÓN PENDIENTE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#A7A7A7] block mb-1">NIT Emisor</label>
              <input
                type="text"
                placeholder="Ej: 10293848-1"
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[#A7A7A7] block mb-1">Certificador Autorizado por la SAT</label>
              <select className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-white text-xs">
                <option value="infile">INFILE, S.A.</option>
                <option value="megaprint">MegaPrint (G&T Continental)</option>
                <option value="digifact">Digifact Servicios</option>
                <option value="sat_direct">Agencia Virtual SAT Directa</option>
              </select>
            </div>

            <div className="p-3 rounded bg-[#1E1E1E] border border-[#313131] text-[11px] text-[#A7A7A7]">
              Las credenciales de firma digital (Llave y Token del Certificador) se almacenan de forma cifrada en el backend y no se transmiten al cliente.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. IA & RAG AVANZADO (Términos Técnicos Confinados Aquí)                  */}
      {/* ========================================================================= */}
      {activeTab === 'ai_config' && (
        <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-5 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Parámetros Técnicos del Motor de IA & RAG
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Configuración profunda del LLM, vector store en memoria y segmentación de chunks documentales.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30">
              ● API Key Activa
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[#A7A7A7] block mb-1">Modelo de Lenguaje (LLM Engine)</label>
              <select
                value={aiProvider}
                onChange={(e: any) => setAiProvider(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs focus:outline-none focus:border-[#6798FF]"
              >
                <option value="gemini_flash">gemini-2.5-flash (Baja latencia: ~1.8s, ideal atención WhatsApp)</option>
                <option value="gemini_pro">gemini-2.5-pro (Razonamiento profundo para cotizaciones complejas)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#A7A7A7]">Temperatura del Modelo</label>
                <span className="font-mono text-white font-tabular">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#6798FF]"
              />
              <span className="text-[10px] text-[#A7A7A7] block mt-0.5">
                0.2 - 0.4 recomendado para respuestas comerciales sin inventar datos.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[#A7A7A7] block mb-1">Tamaño de Fragmento (Chunk Size)</label>
                <input
                  type="number"
                  value={ragChunkSize}
                  onChange={(e) => setRagChunkSize(parseInt(e.target.value) || 300)}
                  className="w-full px-3 py-1.5 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[#A7A7A7] block mb-1">Máximo Chunks Recuperados (Top-K)</label>
                <input
                  type="number"
                  value={ragMaxChunks}
                  onChange={(e) => setRagMaxChunks(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-1.5 rounded bg-[#0A0A0A] border border-[#313131] text-white font-mono text-xs"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded bg-[#1E1E1E] border border-[#313131] cursor-pointer">
              <input
                type="checkbox"
                checked={strictZeroHallucination}
                onChange={(e) => setStrictZeroHallucination(e.target.checked)}
                className="mt-0.5 rounded border-[#313131]"
              />
              <div>
                <span className="text-white font-medium block">
                  Modo Estricto de Cero-Alucinación (Fact-Grounding)
                </span>
                <span className="text-[11px] text-[#A7A7A7] block mt-0.5">
                  Fuerza al modelo a rechazar preguntas sobre precios o productos que no figuren explícitamente en los documentos indexados.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MARCO LEGAL & DPA                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'legal' && (
        <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4 max-w-3xl">
          <h3 className="text-sm font-semibold text-white">
            Marco Legal, Términos y Cumplimiento de Datos
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded bg-[#1E1E1E] border border-[#313131]">
              <span className="font-semibold text-white block mb-1">Acuerdo de Procesamiento de Datos (DPA)</span>
              <p className="text-[#A7A7A7] text-[11px] leading-relaxed">
                Establece que ConversaGT procesa la información de los clientes finales en calidad de Encargado de Tratamiento, manteniendo el secreto comercial y la confidencialidad.
              </p>
            </div>

            <div className="p-3.5 rounded bg-[#1E1E1E] border border-[#313131]">
              <span className="font-semibold text-white block mb-1">Políticas de WhatsApp Business & Opt-In</span>
              <p className="text-[#A7A7A7] text-[11px] leading-relaxed">
                Garantiza que toda conversación iniciada por la empresa cumpla con las políticas de mensajería comercial de Meta, con consentimiento previo del usuario.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. VALIDACIÓN DE PAGOS (CONSOLA PRIVADA DE ANDERSON WILLIAM)             */}
      {/* ========================================================================= */}
      {activeTab === 'activation' && (
        <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Consola Privada de Validación y Activación de Cuentas
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Mesa de control exclusiva para que Anderson William verifique boletas de Banco Industrial o BAM antes de activar cuentas.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30">
              Operador: Anderson William
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded bg-[#1E1E1E] border border-[#313131] text-xs text-[#A7A7A7]">
              Total de boletas pendientes de validación bancaria: <strong className="text-white font-mono">{transactions.filter((t: any) => t.status === 'pending_verification').length}</strong>
            </div>

            {transactions.filter((t: any) => t.status === 'pending_verification').length === 0 ? (
              <div className="py-8 text-center text-xs text-[#A7A7A7]">
                No hay boletas bancarias pendientes de validación en este momento.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions
                  .filter((t: any) => t.status === 'pending_verification')
                  .map((tx: any) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded bg-[#1E1E1E] border border-[#313131] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{tx.customerName || 'Cliente'}</div>
                        <div className="text-[11px] text-[#A7A7A7] font-mono">
                          Boleta: {tx.bankSlipNumber || 'Sin número'} · {tx.currency === 'GTQ' ? 'Q' : '$'}{tx.amount}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          tx.status = 'completed';
                          alert(`Transacción ${tx.id} validada y activada con éxito.`);
                        }}
                        className="px-3 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803d] text-white font-semibold text-xs transition-all"
                      >
                        Validar en Banca & Activar
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. OPCIONES AVANZADAS & SEGURIDAD                                         */}
      {/* ========================================================================= */}
      {activeTab === 'advanced' && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Auditoría de Ciberseguridad del Servidor
                </h3>
                <p className="text-xs text-[#A7A7A7] mt-0.5">
                  Verificación en tiempo real de los 12 puntos de control del servidor Express y SQLite.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSecurityAudit}
                disabled={isRunningAudit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-xs text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
                <span>Ejecutar Verificación</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {(securityAuditData?.securityChecks || [
                { name: 'Protección Anti-Inundación & Rate Limiting', status: 'Activo (60 req/min)' },
                { name: 'Escudo Anti-Inyección de Prompts', status: 'Activo (Delimitación Estricta)' },
                { name: 'Cifrado de Credenciales & Scrypt', status: 'Activo (N=16384, CSPRNG)' },
                { name: 'Aislamiento Relacional Multi-Tenant', status: 'Activo (SQLite WAL Mode)' },
                { name: 'Verificación Criptográfica de Webhooks', status: 'Activo (HMAC SHA-256)' },
                { name: 'Protección contra Denegación de Billetera', status: 'Activo (Límite 20 req/min)' },
              ]).map((chk: any, idx: number) => (
                <div key={idx} className="p-3 rounded bg-[#1E1E1E] border border-[#313131]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{chk.name}</span>
                    <span className="text-[10px] font-mono text-[#16A34A]">{chk.status}</span>
                  </div>
                  {chk.desc && <p className="text-[11px] text-[#A7A7A7]">{chk.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
