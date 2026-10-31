import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import {
  Bot,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  FileText,
  ShieldCheck,
  Send,
  Loader2,
  FileSpreadsheet,
  Building2,
  Clock,
  HelpCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { askGeminiDocuments } from '../../services/geminiService';
import { CatalogCsvImporter } from '../documents/CatalogCsvImporter';

interface AutomationViewProps {
  documents: DocumentItem[];
  onAddDocument: (doc: Partial<DocumentItem>) => void;
  onDeleteDocument?: (id: string) => void;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'knowledge' | 'rules' | 'demo'>('assistant');

  // Assistant Configuration State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [tone, setTone] = useState<'profesional_calido' | 'persuasivo' | 'tecnico_conciso'>('profesional_calido');
  const [autoWelcome, setAutoWelcome] = useState(true);
  const [autoSendBankInfo, setAutoSendBankInfo] = useState(true);
  const [autoQuotes, setAutoQuotes] = useState(true);

  // Transfer Rules State
  const [transferKeywords, setTransferKeywords] = useState('asesor, humano, persona, hablar con alguien, queja, reclamo');
  const [transferOnHighIntent, setTransferOnHighIntent] = useState(true);
  const [pauseOnHumanReply, setPauseOnHumanReply] = useState(true);

  // DEMO Simulation Sandbox State
  const [demoInput, setDemoInput] = useState('');
  const [demoMessages, setDemoMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '¡Hola! Soy el Asistente Virtual de Ferretería & Materiales El Progreso. ¿En qué podemos apoyarle con su cotización o pedido hoy?',
      time: '10:00'
    }
  ]);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // New Document modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'product_catalog' | 'pricing' | 'legal' | 'faq'>('product_catalog');
  const [newContent, setNewContent] = useState('');

  // Handle Demo test question
  const handleSendDemoMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!demoInput.trim() || isDemoLoading) return;

    const userText = demoInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDemoMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setDemoInput('');
    setIsDemoLoading(true);

    try {
      const response = await askGeminiDocuments(userText, documents);
      const botText = response.answer || 'Gracias por su consulta. Nuestros asesores le responderán a la brevedad.';
      setDemoMessages((prev) => [...prev, { sender: 'bot', text: botText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      setDemoMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'En este momento estamos validando el catálogo con la base de conocimiento.', time: timeNow }
      ]);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddDocument({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      description: `Documento cargado desde Conocimiento del Negocio.`,
      fileType: 'txt',
      size: `${(newContent.length / 1024).toFixed(1)} KB`,
      uploadedAt: 'Indexado',
      chunksCount: Math.ceil(newContent.length / 300),
      status: 'indexed',
    });

    setNewTitle('');
    setNewContent('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#A7A7A7] uppercase tracking-wider">Centro de Automatización</span>
            <span className="text-xs text-[#A7A7A7]">·</span>
            <span className="font-mono text-xs text-[#6798FF]">Motor Autónomo Activo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Automatización & Asistente IA
          </h1>
          <p className="text-sm text-[#A7A7A7] mt-0.5">
            Configuración del comportamiento de atención, base documental del negocio y transferencias a humanos.
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-3 bg-[#141414] border border-[#313131] px-3.5 py-2 rounded-lg">
          <span className="text-xs text-[#A7A7A7]">Estado General:</span>
          <button
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              aiEnabled
                ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40'
                : 'bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`} />
            <span>{aiEnabled ? 'Asistente Activo (24/7)' : 'En Pausa'}</span>
          </button>
        </div>
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#313131] pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'assistant'
              ? 'bg-[#1E1E1E] text-white border border-[#313131]'
              : 'text-[#A7A7A7] hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-[#6798FF]" />
          <span>Asistente IA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'knowledge'
              ? 'bg-[#1E1E1E] text-white border border-[#313131]'
              : 'text-[#A7A7A7] hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#6798FF]" />
          <span>Conocimiento del Negocio</span>
          <span className="font-mono text-[10px] text-[#A7A7A7] bg-[#141414] px-1.5 py-0.5 rounded border border-[#313131]">
            {documents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'rules'
              ? 'bg-[#1E1E1E] text-white border border-[#313131]'
              : 'text-[#A7A7A7] hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-[#6798FF]" />
          <span>Reglas de Atención y Transferencia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('demo')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'demo'
              ? 'bg-[#1E1E1E] text-[#6798FF] border border-[#6798FF]/40'
              : 'text-[#A7A7A7] hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#6798FF]" />
          <span>Entorno de Prueba (DEMO)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ASISTENTE IA                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tono y Personalidad */}
            <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Tono y Personalidad del Asistente
                </h3>
                <p className="text-xs text-[#A7A7A7] mt-0.5">
                  Define cómo se comunica el Asistente con tus clientes en WhatsApp y Telegram.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'profesional_calido',
                    title: 'Profesional & Cálido',
                    desc: 'Formal, respetuoso y cordial. Ideal para empresas de servicios y constructoras.',
                  },
                  {
                    id: 'persuasivo',
                    title: 'Comercial & Asertivo',
                    desc: 'Enfocado en guiar hacia la cotización y cierre rápido de ventas.',
                  },
                  {
                    id: 'tecnico_conciso',
                    title: 'Técnico & Preciso',
                    desc: 'Respuestas directas basadas únicamente en especificaciones y números.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setTone(item.id as any)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                      tone === item.id
                        ? 'bg-[#1E1E1E] border-[#6798FF] text-white'
                        : 'bg-[#0A0A0A] border-[#313131] text-[#A7A7A7] hover:border-[#454545]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                      {tone === item.id && <span className="w-2 h-2 rounded-full bg-[#6798FF]" />}
                    </div>
                    <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Automatizaciones Básicas */}
            <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">
                Comportamientos Automatizados
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded bg-[#1E1E1E] border border-[#313131] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoWelcome}
                    onChange={(e) => setAutoWelcome(e.target.checked)}
                    className="mt-0.5 rounded border-[#313131]"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Saludo de Bienvenida Inmediato
                    </span>
                    <span className="text-[11px] text-[#A7A7A7] block mt-0.5">
                      Al recibir el primer mensaje de un cliente nuevo, saluda amablemente mencionando el nombre del negocio.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded bg-[#1E1E1E] border border-[#313131] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSendBankInfo}
                    onChange={(e) => setAutoSendBankInfo(e.target.checked)}
                    className="mt-0.5 rounded border-[#313131]"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Envío Automático de Cuentas Bancarias
                    </span>
                    <span className="text-[11px] text-[#A7A7A7] block mt-0.5">
                      Proporciona las cuentas oficiales de Banco Industrial o BAM únicamente cuando el cliente pregunte cómo pagar.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded bg-[#1E1E1E] border border-[#313131] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoQuotes}
                    onChange={(e) => setAutoQuotes(e.target.checked)}
                    className="mt-0.5 rounded border-[#313131]"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Generación de Cotizaciones en Línea
                    </span>
                    <span className="text-[11px] text-[#A7A7A7] block mt-0.5">
                      Calcula totales con IVA y facturación SAT FEL basados en los productos indexados en tu catálogo.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Status Panel */}
          <div className="space-y-6">
            <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
                Métricas de Automatización
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#1E1E1E]">
                  <span className="text-[#A7A7A7]">Tasa de Resolución Directa:</span>
                  <span className="font-tabular font-semibold text-[#16A34A]">88.4%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1E1E1E]">
                  <span className="text-[#A7A7A7]">Tiempo de Respuesta IA:</span>
                  <span className="font-tabular text-white font-medium">1.8 segundos</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1E1E1E]">
                  <span className="text-[#A7A7A7]">Documentos de Soporte:</span>
                  <span className="font-tabular text-white font-medium">{documents.length} activos</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#A7A7A7]">Precisión y Cero-Alucinación:</span>
                  <span className="font-mono text-[#6798FF] font-medium">Estricto</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('demo')}
                  className="w-full py-2 px-3 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs text-center transition-all"
                >
                  Probar en Modo DEMO →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONOCIMIENTO DEL NEGOCIO                                          */}
      {/* ========================================================================= */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
            <div>
              <h3 className="text-base font-semibold text-white">
                Base Documental & Catálogo de Productos
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Los documentos y listas de precios cargados aquí constituyen la verdad oficial con la que responde el Asistente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Cargar Documento / Catálogo</span>
            </button>
          </div>

          {/* Catalog CSV Importer Embedded cleanly */}
          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5">
            <h4 className="text-xs font-semibold text-white uppercase font-mono tracking-wider mb-2">
              Importador Rápido de Catálogo CSV
            </h4>
            <p className="text-xs text-[#A7A7A7] mb-4">
              Carga tu catálogo de ferretería, repuestos o servicios con sanitización automática anti-inyección.
            </p>
            <CatalogCsvImporter
              onImportComplete={(importedDoc) => {
                onAddDocument(importedDoc);
              }}
            />
          </div>

          {/* List of active documents */}
          <div className="rounded-lg bg-[#141414] border border-[#313131] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#313131] bg-[#1E1E1E] text-[#A7A7A7] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Documento / Catálogo</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Tamaño</th>
                  <th className="py-3 px-4">Fragmentos</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E1E]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#6798FF] shrink-0" />
                        <div>
                          <span className="font-medium text-white block">{doc.title}</span>
                          <span className="text-[11px] text-[#A7A7A7] line-clamp-1">{doc.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#A7A7A7] capitalize">
                      {doc.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#A7A7A7] font-tabular">
                      {doc.size}
                    </td>
                    <td className="py-3 px-4 font-mono text-white font-tabular">
                      {doc.chunksCount} bloques
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono text-[#16A34A]">Indexado</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onDeleteDocument && (
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1 rounded text-[#A7A7A7] hover:text-[#DC2626] transition-colors"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGLAS DE ATENCIÓN Y TRANSFERENCIA                                 */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Palabras Clave de Transferencia a Asesor Humano
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Cuando el cliente mencione alguno de estos términos, la IA se detendrá y asignará la conversación al equipo de ventas.
              </p>
            </div>

            <textarea
              rows={3}
              value={transferKeywords}
              onChange={(e) => setTransferKeywords(e.target.value)}
              placeholder="Separadas por comas: asesor, humano, queja, gerente..."
              className="w-full p-3 rounded-lg bg-[#0A0A0A] border border-[#313131] text-xs text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
            />
          </div>

          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Reglas de Control Operativo
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded bg-[#1E1E1E] border border-[#313131] cursor-pointer">
                <input
                  type="checkbox"
                  checked={transferOnHighIntent}
                  onChange={(e) => setTransferOnHighIntent(e.target.checked)}
                  className="mt-0.5 rounded border-[#313131]"
                />
                <div>
                  <span className="text-xs font-medium text-white block">
                    Notificar a Asesor en Oportunidades VIP (Intención &gt; 80%)
                  </span>
                  <span className="text-[11px] text-[#A7A7A7] block mt-0.5">
                    Genera una alerta prioritaria en la bandeja cuando un cliente solicita cotizaciones de alto volumen.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded bg-[#1E1E1E] border border-[#313131] cursor-pointer">
                <input
                  type="checkbox"
                  checked={pauseOnHumanReply}
                  onChange={(e) => setPauseOnHumanReply(e.target.checked)}
                  className="mt-0.5 rounded border-[#313131]"
                />
                <div>
                  <span className="text-xs font-medium text-white block">
                    Silencio de IA al Intervenir un Agente
                  </span>
                  <span className="text-[11px] text-[#A7A7A7] block mt-0.5">
                    Si un asesor humano responde manualmente en el chat, el Asistente IA suspende respuestas automáticas en esa conversación.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ENTORNO DE PRUEBA (DEMO — DATOS DE PRUEBA)                         */}
      {/* ========================================================================= */}
      {activeTab === 'demo' && (
        <div className="space-y-4 max-w-4xl">
          {/* Obligatory Enterprise Demo Disclaimer Banner */}
          <div className="p-3.5 rounded-lg bg-[#1E1E1E] border-l-4 border-[#6798FF] border border-[#313131] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#6798FF] shrink-0" />
              <div>
                <span className="font-semibold text-white font-mono uppercase tracking-wider text-[11px] block">
                  DEMO — DATOS DE PRUEBA (SIMULADOR INTERNO)
                </span>
                <span className="text-[#A7A7A7] text-[11px]">
                  Los mensajes enviados en este simulador son pruebas directas contra tus catálogos indexados. No contactan a clientes reales.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDemoMessages([demoMessages[0]])}
              className="text-[#A7A7A7] hover:text-white text-[11px] font-mono flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpiar Prueba</span>
            </button>
          </div>

          {/* Test Sandbox Chat Interface */}
          <div className="rounded-lg bg-[#141414] border border-[#313131] flex flex-col h-[480px] overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-[#313131] bg-[#1E1E1E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#6798FF]" />
                <span className="font-semibold text-white">Simulador de Respuestas del Asistente</span>
              </div>
              <span className="text-[11px] font-mono text-[#A7A7A7]">Tono: {tone}</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A0A]">
              {demoMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md rounded-lg p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                        : 'bg-[#141414] text-white border border-[#6798FF]/30'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-[#A7A7A7] mb-1">
                      {msg.sender === 'user' ? 'Tú (Simulando Cliente):' : 'Asistente IA:'}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className="text-right text-[10px] text-[#7C7C7C] font-mono mt-1">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              {isDemoLoading && (
                <div className="flex items-center gap-2 text-xs text-[#A7A7A7]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6798FF]" />
                  <span>Consultando catálogo y generando respuesta...</span>
                </div>
              )}
            </div>

            {/* Quick Test Prompt Presets */}
            <div className="px-3 py-2 bg-[#141414] border-t border-[#313131] flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-[#A7A7A7] font-mono uppercase text-[10px]">Preguntas sugeridas:</span>
              <button
                type="button"
                onClick={() => setDemoInput('¿Cuáles son los precios de los planes y qué incluye el Plan Pro?')}
                className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white"
              >
                Precios y Planes
              </button>
              <button
                type="button"
                onClick={() => setDemoInput('¿A qué número de cuenta bancaria en Guatemala puedo transferir?')}
                className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white"
              >
                Cuentas Bancarias
              </button>
              <button
                type="button"
                onClick={() => setDemoInput('Necesito hablar con un asesor humano')}
                className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white"
              >
                Pedir Asesor
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendDemoMessage} className="p-3 bg-[#141414] border-t border-[#313131] flex items-center gap-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Escribe una pregunta para probar cómo responderá el Asistente..."
                className="flex-1 px-3.5 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
              />
              <button
                type="submit"
                disabled={!demoInput.trim() || isDemoLoading}
                className="px-4 py-2 rounded bg-[#6798FF] hover:bg-[#5584eb] disabled:opacity-40 text-black font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>Probar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#313131] rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
              <h3 className="text-sm font-semibold text-white">
                Agregar Documento al Conocimiento del Negocio
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-[#A7A7A7] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-3">
              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Título del Documento *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Lista de Precios Oficial Mayo 2026"
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                >
                  <option value="product_catalog">Catálogo de Productos y Precios</option>
                  <option value="pricing">Políticas de Facturación & Cuentas</option>
                  <option value="legal">Garantías y Términos</option>
                  <option value="faq">Preguntas Frecuentes</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Contenido Textual de Referencia *</label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Pega aquí el texto con nombres de productos, códigos, precios exactos en Quetzales y condiciones de entrega..."
                  className="w-full p-3 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div className="pt-3 border-t border-[#313131] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded bg-[#1E1E1E] text-xs text-[#A7A7A7] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#6798FF] hover:bg-[#5584eb] text-xs font-semibold text-black"
                >
                  Indexar en Conocimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
