import React, { useState } from 'react';
import { Campaign } from '../../types';
import {
  Send,
  Sparkles,
  Smartphone,
  Plus,
  Play,
  CheckCircle2,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Layers,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  CreditCard
} from 'lucide-react';
import { generateAiCampaignCopy } from '../../services/geminiService';

interface CampaignsViewProps {
  campaigns: Campaign[];
  onLaunchCampaign: (campaign: Partial<Campaign>) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  onLaunchCampaign,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [goal, setGoal] = useState('Promoción de Plan Platinum con descuento por pago con Transferencia o Tarjeta');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [audience, setAudience] = useState('Clientes VIP & En Negociación');
  const [productOrOffer, setProductOrOffer] = useState('Suite Omnicanal ConversaGT con IA Gemini + Facturación Electrónica');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [campaignName, setCampaignName] = useState('Campaña VIP Omnicanal Gemini');
  const [copied, setCopied] = useState(false);

  const handleGenerateCopy = async () => {
    setIsGenerating(true);
    try {
      const res = await generateAiCampaignCopy(goal, channel, audience, productOrOffer, 'Exclusivo y Persuasivo');
      setGeneratedText(res.content);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndLaunch = () => {
    if (!campaignName) return;
    onLaunchCampaign({
      name: campaignName,
      channel,
      status: 'running',
      targetSegment: audience,
      audienceSize: 1450,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      templateBody: generatedText || 'Estimado/a {{nombre}}, active su suite ConversaGT con soporte VIP.',
      buttons: [
        { text: '💳 Pagar en Línea', action: 'pay_link' },
        { text: '💬 Hablar con Asesor', action: 'chat_agent' }
      ],
      createdAt: 'Hoy',
      geminiOptimized: true,
    });
    setShowWizard(false);
    setGeneratedText('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Send className="w-6 h-6 text-emerald-400" />
            <span>Campañas Masivas & Difusión Omnicanal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Transmisiones oficiales por WhatsApp Business API, segmentación inteligente y copy impulsado por Google Gemini.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowWizard(true);
            if (!generatedText) handleGenerateCopy();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Nueva Campaña con IA Gemini</span>
        </button>
      </div>

      {/* Campaigns Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl luxury-glass border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Tasa de Apertura Promedio (WhatsApp)</span>
          <div className="text-2xl font-extrabold text-emerald-400">98.2%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Plantillas oficiales aprobadas por Meta</span>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Impacto de Mensajes Enviados</span>
          <div className="text-2xl font-extrabold text-white">4,020 Contactos</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">+18.4% Conversión a ventas</span>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Cumplimiento Legal & Opt-in</span>
          <div className="text-2xl font-extrabold text-blue-400">100% Verificado</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Conforme a políticas anti-spam y RGPD</span>
        </div>
      </div>

      {/* Active Campaigns List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200">Campañas Programadas y en Ejecución</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 rounded-2xl luxury-glass border border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{camp.name}</h3>
                    {camp.geminiOptimized && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Gemini AI</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Segmento: <strong className="text-slate-300">{camp.targetSegment}</strong>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    camp.status === 'running'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : camp.status === 'scheduled'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {camp.status === 'running' ? '● En Envío' : camp.status === 'scheduled' ? 'Programada' : 'Finalizada'}
                </span>
              </div>

              {/* Template Body Preview */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {camp.templateBody}
              </div>

              {/* Buttons preview */}
              {camp.buttons && camp.buttons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {camp.buttons.map((btn, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>{btn.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900/50">
                  <span className="text-[10px] text-slate-500 block">Audiencia</span>
                  <span className="font-bold text-slate-200">{camp.audienceSize}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/50">
                  <span className="text-[10px] text-slate-500 block">Apertura</span>
                  <span className="font-bold text-emerald-400">{camp.openRate}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/50">
                  <span className="text-[10px] text-slate-500 block">Conversión</span>
                  <span className="font-bold text-blue-400">{camp.conversionRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Creation Wizard with Live Phone Preview */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  Generador de Campañas Inteligentes con Gemini 3.7
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Controls */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre de la Campaña</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Canal de Difusión</label>
                    <select
                      value={channel}
                      onChange={(e: any) => setChannel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                    >
                      <option value="whatsapp">WhatsApp Business API</option>
                      <option value="sms">SMS Masivo</option>
                      <option value="email">Email Corporativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Segmento Meta</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Objetivo Comercial</label>
                  <textarea
                    rows={2}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Producto u Oferta</label>
                  <input
                    type="text"
                    value={productOrOffer}
                    onChange={(e) => setProductOrOffer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCopy}
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isGenerating ? 'Generando con Gemini...' : 'Re-generar Texto con IA'}</span>
                </button>
              </div>

              {/* Live Smartphone WhatsApp Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
                <div className="w-72 bg-slate-950 border-4 border-slate-800 rounded-[36px] shadow-2xl p-3 space-y-2 text-xs">
                  {/* Phone Notch */}
                  <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto" />

                  {/* Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-300 text-[11px]">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-[10px]">
                      GT
                    </div>
                    <div>
                      <div className="font-bold text-white leading-none">ConversaGT Oficial</div>
                      <div className="text-[9px] text-emerald-400">Cuenta Verificada Meta</div>
                    </div>
                  </div>

                  {/* Chat Bubble Preview */}
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-100 text-[11px] leading-relaxed shadow-md space-y-2">
                    <p className="whitespace-pre-wrap">
                      {generatedText || 'Generando contenido optimizado para WhatsApp con variables personalizadas...'}
                    </p>
                    <div className="text-[9px] text-emerald-400/80 text-right">10:45 AM ✓✓</div>
                  </div>

                  {/* WhatsApp Action Buttons */}
                  <div className="space-y-1 pt-1">
                    <button
                      type="button"
                      className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>💳 Pagar con Tarjeta / PayPal</span>
                    </button>
                    <button
                      type="button"
                      className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] font-bold"
                    >
                      🏦 Ver Cuentas Bancarias
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Plantilla'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndLaunch}
                className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Lanzar Campaña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
