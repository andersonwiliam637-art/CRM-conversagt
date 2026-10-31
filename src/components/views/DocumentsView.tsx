import React, { useState, useRef } from 'react';
import { DocumentItem } from '../../types';
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ChevronRight,
  Loader2,
  Trash2,
  FileCheck,
  HelpCircle,
  Upload,
  FileUp,
  FolderPlus,
  Check,
  Globe,
  MessageSquareQuote,
  Tag,
  Store,
  Building2,
  ExternalLink,
  Copy,
  AlertCircle,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { askGeminiDocuments } from '../../services/geminiService';
import { BusinessTemplatesSection } from '../documents/BusinessTemplatesSection';
import { CatalogCsvImporter } from '../documents/CatalogCsvImporter';
import { QuotationPdfModal } from '../documents/QuotationPdfModal';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onAddDocument: (doc: Partial<DocumentItem>) => void;
  onDeleteDocument?: (id: string) => void;
}

type RagResourceType = 'file' | 'faq' | 'url' | 'product' | 'template' | 'csv';

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(documents[0] || null);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResponse, setRagResponse] = useState<any>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isZeroHallucinationActive, setIsZeroHallucinationActive] = useState(true);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  // Active Tab in Modal
  const [activeTab, setActiveTab] = useState<RagResourceType>('file');

  // Generic Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('product_catalog');
  const [newContent, setNewContent] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FAQ State
  const [faqQuestions, setFaqQuestions] = useState<Array<{ q: string; a: string }>>([
    { q: '¿Qué formas de pago aceptan en Guatemala e internacional?', a: 'Aceptamos transferencias bancarias a Banco Industrial (1402158) y BAM (4030437443), además de PayPal y tarjetas de crédito/débito a andersonwiliam637@gmail.com.' },
    { q: '¿Cuál es el tiempo de activación del bot de WhatsApp?', a: 'El servicio se activa en menos de 15 minutos una vez que el Ingeniero AI valida la boleta de pago o comprobante de transferencia.' }
  ]);

  // Product Catalog State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCurrency, setProductCurrency] = useState<'GTQ' | 'USD'>('GTQ');
  const [productDelivery, setProductDelivery] = useState('Envío a todo el país vía Guatex / Cargo Expreso (Q35)');
  const [productPaymentLink, setProductPaymentLink] = useState('Transferencia BI/BAM o PayPal andersonwiliam637@gmail.com');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    setIsReadingFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNewContent(text);
        if (!newDesc) {
          setNewDesc(`Archivo indexado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        }
      }
      setIsReadingFile(false);
    };

    reader.onerror = () => {
      setIsReadingFile(false);
      alert('No se pudo leer el archivo automáticamente. Puedes copiar y pegar el texto directamente.');
    };

    reader.readAsText(file);
  };

  // Add FAQ pair
  const handleAddFaqPair = () => {
    setFaqQuestions((prev) => [...prev, { q: '', a: '' }]);
  };

  const handleUpdateFaq = (index: number, field: 'q' | 'a', value: string) => {
    setFaqQuestions((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleRemoveFaq = (index: number) => {
    if (faqQuestions.length <= 1) return;
    setFaqQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (type: string) => {
    if (type === 'menu') {
      setNewTitle('Catálogo & Menú Restaurante Gourmet Guatemala');
      setNewCategory('product_catalog');
      setNewDesc('Menú de desayunos, almuerzos, carnes, combos familiares y horarios de entrega a domicilio.');
      setNewContent(`🍽️ MENÚ Y TARIFAS RESTAURANTE GOURMET GUATEMALA
Horario de atención: Lunes a Domingo 7:00 AM a 10:00 PM.
Zonas de cobertura delivery: Zona 1, 4, 9, 10, 14, 15 y Carretera a El Salvador.

PLATOS PRINCIPALES:
1. Desayuno Típico Chapín: Huevos al gusto, frijoles volteados, plátanos fritos, queso de capas y tortillas: Q45.00
2. Hamburguesa Artesanal Angus: 200g carne angus, queso cheddar, tocino ahumado y papas rústicas: Q65.00
3. Parrillada Mixta (2 personas): Petición de puyaso, pechuga de pollo, chorizo y guacamol: Q180.00
4. Combo Pizza Familiar + Bebida 1.5L: Q110.00

FORMAS DE PAGO:
- Transferencia Banco Industrial / BAM
- Pago contra entrega en efectivo o tarjeta POS
- Enlaces de cobro con tarjeta Visa / Mastercard`);
    } else if (type === 'inmobiliaria') {
      setNewTitle('Catálogo Inmobiliario & Proyectos Residenciales');
      setNewCategory('product_catalog');
      setNewDesc('Precios de apartamentos, casas en preventa y enganche fraccionado.');
      setNewContent(`🏢 BIENES RAÍCES Y PROYECTOS RESIDENCIALES GUATEMALA 2026
PROYECTO 1: 'Alturas de la Floresta' (Zona 11)
- Apartamento Modelo A (2 habitaciones, 1 parqueo, 65 m²): Desde Q650,000.00 (Enganche Q35,000 fraccionado en 12 cuotas).
- Apartamento Modelo B (3 habitaciones, 2 parqueos, 85 m²): Desde Q890,000.00.
- Amenidades: Piscina infinity, gimnasio, coworking, pet friendly y seguridad 24/7.

REQUISITOS PARA PRE-CALIFICACIÓN BANCARIA:
1. Copia de DPI del solicitante y cónyuge.
2. Constancia de ingresos o 3 últimos estados de cuenta bancarios.
3. NIT / RTU actualizado SAT.`);
    } else if (type === 'clinica') {
      setNewTitle('Servicios y Citas Clínica Médica & Dental');
      setNewCategory('product_catalog');
      setNewDesc('Precios de consultas, ortodoncia, limpiezas y horarios de citas.');
      setNewContent(`🦷 CLÍNICA DENTAL Y ESPECIALIDADES MÉDICAS
Ubicación: Edificio Sixtino II, Oficina 402, Zona 10, Ciudad de Guatemala.
Horario: Lunes a Viernes 8:00 AM a 6:00 PM, Sábados 8:00 AM a 1:00 PM.

TARIFARIO DE ATENCIÓN:
- Consulta Médica General / Evaluación Dental: Q200.00 (Incluye diagnóstico digital).
- Profilaxis / Limpieza Ultrasonido Profunda: Q250.00.
- Blanqueamiento Láser en 1 Sesión: Q850.00.
- Ortodoncia (Frenillos / Brackets Metálicos): Enganche inicial Q1,200 + Mensualidades de Q350.

POLÍTICA DE CITAS:
Las citas se reservan con un anticipo de Q100 deducibles del valor de la consulta.`);
    } else if (type === 'ferreteria') {
      setNewTitle('Catálogo de Ferretería, Repuestos y Herramientas');
      setNewCategory('product_catalog');
      setNewDesc('Precios de herramientas eléctricas, repuestos industriales y envíos.');
      setNewContent(`🔧 FERRETERÍA INDUSTRIAL Y REPUESTOS AUTOMOTRICES
Envíos a todo el país vía Guatex, Forvm y Cargo Expreso.

PRODUCTOS DESTACADOS:
1. Taladro Percutor Inalámbrico 20V Brushless (2 Baterías + Maletín): Q675.00
2. Pulidora Angular 4-1/2" 850W Industrial: Q395.00
3. Juego de Llaves Combinadas Cromo-Vanadio (12 piezas): Q185.00
4. Kit de Mantenimiento / Aceite Sintético 5W-30 + Filtro: Q240.00

GARANTÍA Y FORMAS DE PAGO:
- 1 año de garantía en herramientas eléctricas con centro de servicio autorizado.
- Depósito o transferencia a Banco Industrial o BAM.`);
    } else if (type === 'ecommerce') {
      setNewTitle('Tienda de Moda & Ropa: Políticas de Tallas y Envíos');
      setNewCategory('product_catalog');
      setNewDesc('Guía de tallas, tiempos de entrega y políticas de cambio.');
      setNewContent(`👗 TIENDA DE MODA & VESTIMENTA CONVERSAGT
COBERTURA Y COSTOS DE ENVÍO:
- Ciudad de Guatemala (Zonas 1-16): Q25.00 (Entrega el mismo día o 24 hrs).
- Departamentos de Guatemala: Q35.00 por Guatex o Cargo Expreso (24-48 hrs).
- Envío GRATIS en compras superiores a Q300.00.

POLÍTICA DE CAMBIOS Y GARANTÍA:
- Tienes hasta 7 días naturales tras recibir tu paquete para solicitar cambio de talla.
- Las prendas deben conservar sus etiquetas originales y no presentar uso.`);
    } else {
      setNewTitle('Cuentas Bancarias Oficiales & Métodos de Pago ConversaGT');
      setNewCategory('pricing');
      setNewDesc('Cuentas monetarias y de ahorro en BI, BAM y PayPal.');
      setNewContent(`💳 CUENTAS BANCARIAS Y MEDIOS DE PAGO OFICIALES 2026
CUENTAS EN GUATEMALA (QUETZALES GTQ):
- Banco Industrial (Ahorros): No. 1402158
- Banco Agromercantil BAM (Ahorros): No. 4030437443
- Titular de Cuentas: Anderson William

PAGO INTERNACIONAL & TARJETAS DE CRÉDITO / DÉBITO:
- PayPal Oficial: andersonwiliam637@gmail.com
- Enlace directo de cobro con tarjeta Visa o Mastercard sin necesidad de tener cuenta PayPal.

TIEMPO DE ACTIVACIÓN:
- Transferencias del mismo banco: Activación inmediata en menos de 15 minutos tras validar boleta.
- Transferencias interbancarias ACH: Acreditación estándar de 2 a 4 horas hábiles.`);
    }
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();

    let finalTitle = newTitle.trim();
    let finalContent = newContent.trim();
    let finalCategory = newCategory;
    let finalFileType: any = 'pdf';
    let finalDesc = newDesc.trim();

    if (activeTab === 'faq') {
      finalTitle = finalTitle || 'Preguntas Frecuentes (FAQ WhatsApp)';
      finalCategory = 'faq';
      finalFileType = 'faq';
      finalDesc = finalDesc || `${faqQuestions.length} Preguntas y Respuestas indexadas para respuesta rápida.`;
      finalContent = faqQuestions
        .filter((item) => item.q.trim() && item.a.trim())
        .map((item, idx) => `PREGUNTA ${idx + 1}: ${item.q}\nRESPUESTA DEL BOT: ${item.a}`)
        .join('\n\n---\n\n');
    } else if (activeTab === 'url') {
      finalTitle = finalTitle || `Página Web: ${sourceUrl}`;
      finalCategory = 'web_url';
      finalFileType = 'url';
      finalDesc = finalDesc || `Contenido extraído del sitio web: ${sourceUrl}`;
      finalContent = `URL DE ORIGEN: ${sourceUrl}\n\nCONTENIDO INDEXADO:\n${finalContent || 'Información corporativa y catálogo en línea.'}`;
    } else if (activeTab === 'product') {
      finalTitle = finalTitle || `Producto: ${productName}`;
      finalCategory = 'product_catalog';
      finalFileType = 'txt';
      finalDesc = `${productCurrency === 'GTQ' ? 'Q' : '$'}${productPrice} • ${productName}`;
      finalContent = `🏷️ FICHA DE PRODUCTO / SERVICIO
PRODUCTO: ${productName}
PRECIO: ${productCurrency === 'GTQ' ? `Q ${productPrice}` : `$ ${productPrice} USD`}
DETALLES Y ESPECIFICACIONES:
${finalContent || 'Disponibilidad inmediata.'}
POLÍTICA DE ENTREGA: ${productDelivery}
MÉTODO DE PAGO: ${productPaymentLink}`;
    }

    if (!finalTitle || !finalContent) {
      alert('Por favor ingresa un título y el contenido o preguntas a memorizar.');
      return;
    }

    const createdDoc: Partial<DocumentItem> = {
      title: finalTitle,
      category: finalCategory,
      content: finalContent,
      description: finalDesc || 'Documento indexado para el copiloto IA Gemini.',
      fileType: finalFileType,
      size: `${(finalContent.length / 1024).toFixed(1)} KB`,
      uploadedAt: 'Hoy',
      chunksCount: Math.max(1, Math.ceil(finalContent.length / 250)),
      status: 'indexed',
      sourceUrl: activeTab === 'url' ? sourceUrl : undefined,
      faqPairsCount: activeTab === 'faq' ? faqQuestions.length : undefined,
    };

    onAddDocument(createdDoc);
    setActiveDoc(createdDoc as DocumentItem);

    // Reset fields
    setNewTitle('');
    setNewContent('');
    setNewDesc('');
    setSourceUrl('');
    setUploadedFileName(null);
    setShowUploadModal(false);
  };

  const filteredDocs = documents.filter((d) => {
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalChunks = documents.reduce((acc, d) => acc + d.chunksCount, 0);

  const handleAskRAG = async () => {
    if (!ragQuery.trim()) return;
    setIsAsking(true);
    setRagResponse(null);
    try {
      const res = await askGeminiDocuments(ragQuery, documents);
      setRagResponse(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-black text-white">
                  Base de Conocimiento RAG & Recursos de Memoria
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Gemini 3.7 Pro RAG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Indexa archivos PDF, preguntas frecuentes (FAQ), enlaces web y catálogos de precios para que el Bot responda en WhatsApp con precisión quirúrgica.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={() => setShowQuotationModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-all shadow-sm shrink-0"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cotización PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowUploadModal(true);
              setActiveTab('csv');
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-all shadow-sm shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Importar Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowUploadModal(true);
              setActiveTab('file');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Añadir Recurso</span>
          </button>
        </div>
      </div>

      {/* 1-Click Business Templates & Anti-Hallucination Guardrail */}
      <BusinessTemplatesSection
        onAddDocument={onAddDocument}
        isZeroHallucinationActive={isZeroHallucinationActive}
        onToggleZeroHallucination={() => setIsZeroHallucinationActive(!isZeroHallucinationActive)}
      />

      {/* RAG Interactive Oraculum Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-emerald-500/30 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Consultar la Memoria RAG en Vivo (Simulación de Pregunta del Cliente)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {documents.length} recursos indexados • {totalChunks} fragmentos vectoriales
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskRAG()}
            placeholder="Ej. ¿A qué cuentas de Banco Industrial o BAM puedo transferir? o ¿Qué incluye el menú?"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs lg:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-medium"
          />
          <button
            type="button"
            onClick={handleAskRAG}
            disabled={isAsking}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all shrink-0"
          >
            {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Preguntar a RAG</span>
          </button>
        </div>

        {ragResponse && (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Respuesta Memorizada por Gemini RAG:</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Confianza Semántica: {((ragResponse.confidence || 0.98) * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {ragResponse.answer}
            </p>
            {ragResponse.sources && ragResponse.sources.length > 0 && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-300">Fuentes consultadas:</span>
                {ragResponse.sources.map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, contenido o palabras clave..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('pricing')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              selectedCategory === 'pricing' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tarifas & Bancos
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('product_catalog')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              selectedCategory === 'product_catalog' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Catálogos & Menús
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('faq')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              selectedCategory === 'faq' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Preguntas FAQ
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('web_url')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              selectedCategory === 'web_url' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Enlaces Web
          </button>
        </div>
      </div>

      {/* Main Grid: Document List & Document Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">Recursos Indexados ({filteredDocs.length})</h2>
            <span className="text-[11px] text-slate-400">{totalChunks} Chunks</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              const isFaq = doc.category === 'faq' || doc.fileType === 'faq';
              const isUrl = doc.category === 'web_url' || doc.fileType === 'url';

              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-xl border shrink-0 ${
                        isFaq
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : isUrl
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {isFaq ? (
                          <MessageSquareQuote className="w-4 h-4" />
                        ) : isUrl ? (
                          <Globe className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-white truncate">{doc.title}</h3>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {doc.size} • {doc.chunksCount} Fragmentos
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      ✓ Memoria Activa
                    </span>
                    <span className="text-slate-500">{doc.uploadedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Document Inspector */}
        <div className="lg:col-span-2">
          {activeDoc ? (
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase">
                      {activeDoc.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                      {activeDoc.fileType.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-2">{activeDoc.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{activeDoc.description}</p>
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0 space-y-1.5">
                  <div className="font-mono text-emerald-400 font-bold">{activeDoc.size}</div>
                  <div className="text-slate-400">Estado: Indexado</div>
                  {onDeleteDocument && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteDocument(activeDoc.id);
                        setActiveDoc(documents.find(d => d.id !== activeDoc.id) || null);
                      }}
                      className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-semibold text-[10px] flex items-center gap-1 transition-all ml-auto"
                      title="Eliminar de la memoria RAG"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Quitar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Document Raw Content Viewer */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">
                  Fragmentos de Texto Inyectados en el Contexto de Gemini:
                </span>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed scrollbar-thin">
                  {activeDoc.content}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Tokens estimados: ~{Math.ceil(activeDoc.content.length / 4)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRagQuery(`¿Qué dice el documento '${activeDoc.title}'?`);
                    handleAskRAG();
                  }}
                  className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Probar consulta sobre este archivo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs rounded-3xl bg-slate-900/50 border border-slate-800">
              Selecciona un documento para inspeccionar sus vectores.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* High-Grade Multi-Resource RAG Indexer Modal (Dify / Chatbase Reference) */}
      {/* FIXED SCROLL CONTAINER: Permite bajar fluidamente y el botón nunca se corta */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Indexar Nuevo Recurso en la Memoria RAG</h2>
                  <p className="text-[11px] text-slate-400">
                    Alimenta la memoria de Gemini para que responda con exactitud en WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Resource Type Navigation Tabs (like Chatbase & Dify) */}
            <div className="px-5 pt-3 pb-2 border-b border-slate-800 bg-slate-950/60 overflow-x-auto shrink-0 flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'file'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Archivo (PDF/DOCX/TXT)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'faq'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Preguntas FAQ (Q&A)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'url'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Enlace Web / URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('product')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'product'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Ficha de Producto</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'template'
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Plantillas de Negocio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('csv')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  activeTab === 'csv'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Catálogo Excel / CSV</span>
              </button>
            </div>

            {/* Modal Body: WITH VERTICAL SCROLLBAR SO USER CAN ALWAYS SCROLL DOWN */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
              {/* TAB 0: CSV Catalog Importer */}
              {activeTab === 'csv' && (
                <CatalogCsvImporter
                  onAddDocument={onAddDocument}
                  onSuccess={() => setShowUploadModal(false)}
                />
              )}

              {/* TAB 1: File Upload */}
              {activeTab === 'file' && (
                <div className="space-y-3.5">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-900/80 cursor-pointer text-center space-y-2.5 transition-all group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt,.pdf,.doc,.docx,.md,.csv,.json"
                      className="hidden"
                    />
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-all">
                      {isReadingFile ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">
                        {uploadedFileName ? `Archivo cargado: ${uploadedFileName}` : 'Toca aquí para subir PDF, Word, TXT, CSV o JSON'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        El contenido se extrae automáticamente para que la IA Gemini lo memorice
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">Título del Documento *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej. Manual de Políticas y Procedimientos 2026"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold text-xs">Categoría</label>
                      <select
                        value={newCategory}
                        onChange={(e: any) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none"
                      >
                        <option value="product_catalog">Catálogo de Productos / Menú</option>
                        <option value="pricing">Tarifas & Cuentas Bancarias</option>
                        <option value="legal">Legal & Términos</option>
                        <option value="sop">Manuales Operativos / SOP</option>
                        <option value="whatsapp_policy">Políticas de WhatsApp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold text-xs">Descripción</label>
                      <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Resumen del documento..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">Contenido del Texto a Indexar *</label>
                    <textarea
                      required
                      rows={5}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Pega aquí el texto, cláusulas, políticas de garantía o condiciones..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FAQ / Q&A Pair Form */}
              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
                    <span className="font-bold block mb-0.5">Módulo de Preguntas Frecuentes (FAQ):</span>
                    Escribe preguntas exactas que hacen los clientes y la respuesta precisa que el bot debe dar.
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">Título del Bloque FAQ *</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej. Preguntas Frecuentes de Pagos y Envíos Guatemala"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-3">
                    {faqQuestions.map((item, index) => (
                      <div key={index} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                            Pregunta #{index + 1}
                          </span>
                          {faqQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFaq(index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                              title="Eliminar pregunta"
                            >
                              ✕ Eliminar
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={item.q}
                          onChange={(e) => handleUpdateFaq(index, 'q', e.target.value)}
                          placeholder="¿Cuál es la pregunta del cliente?"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                        />

                        <textarea
                          rows={2}
                          value={item.a}
                          onChange={(e) => handleUpdateFaq(index, 'a', e.target.value)}
                          placeholder="Respuesta exacta del bot..."
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddFaqPair}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 font-bold text-xs border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Añadir Otra Pregunta Frecuente</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Web URL / Catálogo Online */}
              {activeTab === 'url' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                    <span className="font-bold block mb-0.5">Indexación de Enlaces Web y Catálogos:</span>
                    Ingresa el link de tu sitio web, tienda online o términos para que Gemini lo memorice como fuente citada.
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">URL del Sitio o Catálogo *</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => {
                          setSourceUrl(e.target.value);
                          if (!newTitle) setNewTitle(`Sitio Web: ${e.target.value}`);
                        }}
                        placeholder="https://tuempresa.com/catalogo o https://instagram.com/mitienda"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">Título del Enlace *</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej. Catálogo Oficial Web 2026"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">
                      Resumen del Contenido o Información Clave de la Web *
                    </label>
                    <textarea
                      rows={5}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Pega la información de la web, productos disponibles, formas de contacto o promociones..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: Ficha de Producto / Servicio */}
              {activeTab === 'product' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200">
                    <span className="font-bold block mb-0.5">Ficha de Producto o Servicio:</span>
                    Define productos con su precio en Quetzales o Dólares y métodos de entrega para que el bot dé cotizaciones exactas.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold text-xs">Nombre del Producto / Servicio *</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ej. Consulta Médica Especializada"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-slate-300 mb-1 font-semibold text-xs">Precio *</label>
                        <input
                          type="number"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          placeholder="250.00"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-slate-300 mb-1 font-semibold text-xs">Moneda</label>
                        <select
                          value={productCurrency}
                          onChange={(e: any) => setProductCurrency(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none"
                        >
                          <option value="GTQ">Q (GTQ)</option>
                          <option value="USD">$ (USD)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">Condición de Entrega o Reserva</label>
                    <input
                      type="text"
                      value={productDelivery}
                      onChange={(e) => setProductDelivery(e.target.value)}
                      placeholder="Ej. Envío departamental por Guatex Q35 o Reserva con anticipo Q100"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-xs">Descripción y Beneficios del Producto</label>
                    <textarea
                      rows={4}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Detalla qué incluye, características, garantía y condiciones..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: Quick Business Templates */}
              {activeTab === 'template' && (
                <div className="space-y-3.5">
                  <span className="text-xs text-slate-300 font-semibold block">
                    Selecciona una plantilla lista para cargar en tu memoria RAG:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleApplyTemplate('menu');
                        setActiveTab('file');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                    >
                      <span className="text-lg block mb-1">🍽️</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400">Restaurante Gourmet</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Menú, combos, precios y delivery por zonas.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleApplyTemplate('clinica');
                        setActiveTab('file');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
                    >
                      <span className="text-lg block mb-1">🦷</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400">Clínica Médica & Dental</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Consultas, limpiezas, ortodoncia y anticipo.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleApplyTemplate('inmobiliaria');
                        setActiveTab('file');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                    >
                      <span className="text-lg block mb-1">🏢</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400">Inmobiliaria & Bienes Raíces</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Venta de apartamentos, enganche y precalificación.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleApplyTemplate('ferreteria');
                        setActiveTab('file');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-left transition-all group"
                    >
                      <span className="text-lg block mb-1">🔧</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-orange-400">Ferretería & Repuestos</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Herramientas, refacciones y envíos departamentales.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleApplyTemplate('ecommerce');
                        setActiveTab('file');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 text-left transition-all group"
                    >
                      <span className="text-lg block mb-1">👗</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-pink-400">Tienda de Moda & Ropa</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tallas, cambios, envíos Guatex y garantías.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleApplyTemplate('bancos');
                        setActiveTab('file');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                    >
                      <span className="text-lg block mb-1">💳</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400">Cuentas Bancarias Oficiales</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">BI (1402158), BAM (4030437443) y PayPal.</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STICKY MODAL FOOTER: ALWAYS VISIBLE AND CLICKABLE */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-400 hidden sm:block">
                <span>Estado: Listo para vectorizar en Gemini 3.7</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateDoc}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Indexar en Memoria RAG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation PDF & WhatsApp Generator Modal */}
      <QuotationPdfModal
        isOpen={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
      />
    </div>
  );
};
