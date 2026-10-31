import React, { useState } from 'react';
import { Campaign } from '../../types';
import {
  Send,
  Sparkles,
  Plus,
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
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';
import { generateAiCampaignCopy } from '../../services/geminiService';

interface MarketingViewProps {
  campaigns: Campaign[];
  onLaunchCampaign: (campaign: Partial<Campaign>) => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  campaigns,
  onLaunchCampaign,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [goal, setGoal] = useState('Promoción de materiales con descuento por transferencia bancaria');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [audience, setAudience] = useState('Clientes VIP & En Negociación');
  const [productOrOffer, setProductOrOffer] = useState('Laminas, cemento y materiales de construcción');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [campaignName, setCampaignName] = useState('Campaña Fin de Mes - WhatsApp');
  const [copied, setCopied] = useState(false);

  // Default approved templates from Meta Cloud
  const approvedTemplates = [
    {
      id: 'tpl-1',
      name: 'confirmacion_pago_fel',
      category: 'Transaccional',
      status: 'Aprobada por Meta',
      language: 'Español (es)',
      body: 'Estimado(a) {{1}}, hemos confirmado su transferencia por Q{{2}}. Adjuntamos su Factura SAT FEL: {{3}}.'
    },
    {
      id: 'tpl-2',
      name: 'bienvenida_lead_web',
      category: 'Marketing',
      status: 'Aprobada por Meta',
      language: 'Español (es)',
      body: '¡Hola {{1}}! Gracias por contactar a Ferretería El Progreso. ¿Le enviamos nuestro catálogo de precios en PDF?'
    },
    {
      id: 'tpl-3',
      name: 'recordatorio_renovacion',
      category: 'Transaccional',
      status: 'Aprobada por Meta',
      language: 'Español (es)',
      body: 'Estimado(a) {{1}}, su plan mensual vence en {{2}} días. Puede depositar a BI (1402158) para renovar sin interrupciones.'
    }
  ];

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
      audienceSize: 450,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      templateBody: generatedText || 'Estimado/a {{nombre}}, le compartimos nuestra oferta exclusiva de temporada.',
      buttons: [
        { text: '💳 Ver Catálogo', action: 'catalog' },
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#A7A7A7] uppercase tracking-wider">Mensajería Masiva</span>
            <span className="text-xs text-[#A7A7A7]">·</span>
            <span className="font-mono text-xs text-[#D97706] bg-[#D97706]/10 px-1.5 py-0.5 rounded border border-[#D97706]/30">Meta WABA: Configuración Pendiente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Marketing & Difusión
          </h1>
          <p className="text-sm text-[#A7A7A7] mt-0.5">
            Gestión y redacción de campañas de difusión omnicanal y catálogo de plantillas autorizadas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowWizard(true);
            if (!generatedText) handleGenerateCopy();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nueva Campaña</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block">Campañas Enviadas</span>
          <span className="text-xl font-semibold text-white font-tabular mt-1 block">
            {campaigns.length}
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block">Tasa de Entrega</span>
          <span className="text-xl font-semibold text-[#16A34A] font-tabular mt-1 block">
            99.2%
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block">Tasa de Lectura</span>
          <span className="text-xl font-semibold text-white font-tabular mt-1 block">
            84.5%
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block">Respuestas Generadas</span>
          <span className="text-xl font-semibold text-[#6798FF] font-tabular mt-1 block">
            18.6%
          </span>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-lg bg-[#141414] border border-[#313131] overflow-hidden">
        <div className="p-3.5 border-b border-[#313131] bg-[#1E1E1E] flex items-center justify-between text-xs">
          <span className="font-semibold text-white uppercase font-mono text-[11px] tracking-wider">
            Historial de Difusiones
          </span>
          <span className="text-[#A7A7A7] font-mono text-[11px]">Canal: WhatsApp Business</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#313131] bg-[#141414] text-[#A7A7A7] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Campaña</th>
              <th className="py-3 px-4">Canal</th>
              <th className="py-3 px-4">Audiencia</th>
              <th className="py-3 px-4 text-right">Destinatarios</th>
              <th className="py-3 px-4 text-right">Apertura</th>
              <th className="py-3 px-4 text-right">Conversión</th>
              <th className="py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1E1E]">
            {campaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-[#1A1A1A] transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-white">{camp.name}</div>
                  <div className="text-[11px] text-[#A7A7A7] font-mono">{camp.createdAt}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[11px] font-mono text-white capitalize bg-[#1E1E1E] border border-[#313131] px-2 py-0.5 rounded">
                    {camp.channel}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#A7A7A7]">{camp.targetSegment}</td>
                <td className="py-3 px-4 text-right font-tabular text-white">{camp.audienceSize}</td>
                <td className="py-3 px-4 text-right font-tabular text-[#16A34A]">{camp.openRate}%</td>
                <td className="py-3 px-4 text-right font-tabular text-[#6798FF]">{camp.conversionRate}%</td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-mono uppercase ${
                    camp.status === 'running'
                      ? 'text-[#16A34A]'
                      : camp.status === 'completed'
                      ? 'text-[#A7A7A7]'
                      : 'text-[#D97706]'
                  }`}>
                    ● {camp.status === 'running' ? 'Enviando' : camp.status === 'completed' ? 'Completada' : 'Programada'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Meta Approved Templates Section */}
      <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Plantillas Oficiales de WhatsApp (Meta WABA)
          </h3>
          <p className="text-xs text-[#A7A7A7] mt-0.5">
            Plantillas pre-aprobadas para envío de notificaciones fuera de la ventana de 24 horas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {approvedTemplates.map((tpl) => (
            <div key={tpl.id} className="p-3.5 rounded-lg bg-[#1E1E1E] border border-[#313131] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-white">{tpl.name}</span>
                <span className="text-[10px] font-mono text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded border border-[#16A34A]/30">
                  Aprobada
                </span>
              </div>
              <p className="text-[#A7A7A7] text-[11px] leading-relaxed line-clamp-3">
                {tpl.body}
              </p>
              <div className="pt-2 border-t border-[#313131] flex justify-between items-center text-[10px] text-[#7C7C7C] font-mono">
                <span>{tpl.category}</span>
                <span>{tpl.language}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Creation Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#313131] rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
              <h3 className="text-sm font-semibold text-white">
                Crear Campaña de Difusión
              </h3>
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="text-[#A7A7A7] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A7A7A7] block mb-1">Nombre de la Campaña</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-white focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div>
                <label className="text-[#A7A7A7] block mb-1">Segmento de Destinatarios</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-white focus:outline-none focus:border-[#6798FF]"
                >
                  <option value="Clientes VIP & En Negociación">Clientes VIP & En Negociación (450)</option>
                  <option value="Todos los Clientes Registrados">Todos los Clientes Registrados (1,240)</option>
                  <option value="Prospectos Nuevos sin Compra">Prospectos Nuevos sin Compra (380)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[#A7A7A7]">Mensaje de la Plantilla</label>
                  <button
                    type="button"
                    onClick={handleGenerateCopy}
                    disabled={isGenerating}
                    className="text-[#6798FF] hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Optimizar con IA</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  placeholder="Escribe el texto de la campaña o pulsa 'Optimizar con IA'..."
                  className="w-full p-3 rounded bg-[#0A0A0A] border border-[#313131] text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#313131] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="px-3 py-1.5 rounded bg-[#1E1E1E] text-xs text-[#A7A7A7] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAndLaunch}
                className="px-4 py-1.5 rounded bg-[#6798FF] hover:bg-[#5584eb] text-xs font-semibold text-black"
              >
                Programar Envío
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
