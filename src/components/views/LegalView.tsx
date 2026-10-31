import React, { useState } from 'react';
import { LegalDocument } from '../../types';
import {
  Scale,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  Lock,
  Globe,
  Sparkles,
  Award,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Search
} from 'lucide-react';

interface LegalViewProps {
  legalDocs: LegalDocument[];
}

export const LegalView: React.FC<LegalViewProps> = ({ legalDocs }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(legalDocs[0]?.id || '');
  const [searchClause, setSearchClause] = useState('');
  const [copied, setCopied] = useState(false);

  const activeDoc = legalDocs.find((d) => d.id === selectedDocId) || legalDocs[0];

  const handleCopyText = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(`${activeDoc.title}\nVersión: ${activeDoc.version}\nActualizado: ${activeDoc.lastUpdated}\n\n${activeDoc.fullText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-emerald-400" />
            <span>Centro Legal, Gobernanza & Compliance 360°</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Marco normativo, contratos vinculantes, cumplimiento RGPD/CCPA, gobernanza de IA Gemini y políticas Meta WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Contrato'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Compliance Shield Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl luxury-glass border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Protección RGPD / CCPA</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Tratamiento de datos conforme al Reglamento General Europeo y Leyes LATAM.
          </p>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-blue-500/30">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Gobernanza IA Gemini</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Garantía estricta de NO re-entrenamiento con datos confidenciales de clientes.
          </p>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
            <Globe className="w-4 h-4" />
            <span>Meta WhatsApp Business</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Plantillas aprobadas y cláusulas de Opt-in vinculantes para evitar bloqueos.
          </p>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
            <Lock className="w-4 h-4" />
            <span>SLA 99.9% Contractual</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Créditos de compensación directa en factura en caso de interrupción.
          </p>
        </div>
      </div>

      {/* Main Legal Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Selector Menu (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Documentos Contractuales Oficiales ({legalDocs.length})
          </span>

          {legalDocs.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-950/70 to-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-950/40 text-white'
                    : 'bg-slate-950 luxury-glass text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {doc.badge}
                  </span>
                  <span className="text-[10px] text-slate-500">{doc.version}</span>
                </div>

                <h3 className={`font-bold text-xs mt-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {doc.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {doc.summary}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Actualizado: {doc.lastUpdated}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Contract Reader & Clause Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeDoc ? (
            <div className="p-6 lg:p-8 rounded-3xl luxury-glass border border-slate-800 space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {activeDoc.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Versión {activeDoc.version}</span>
                  </div>
                  <h2 className="text-lg lg:text-xl font-bold text-white mt-2">
                    {activeDoc.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{activeDoc.summary}</p>
                </div>

                <div className="shrink-0 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right text-xs">
                  <span className="text-[10px] text-slate-500 block">Jurisdicciones Aplicables:</span>
                  <div className="flex flex-wrap justify-end gap-1 mt-1">
                    {activeDoc.enforceableJurisdictions.map((j, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {j}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Special Golden Certificate Card for ingenieroai.pro License */}
              {activeDoc.key === 'ingenieroai_license' && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/50 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-lg shadow-lg shadow-amber-500/10">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-amber-300">
                            CERTIFICADO OFICIAL DE AUTENTICIDAD & LICENCIA
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            VERIFICADA
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Desarrollado y Blindado por <strong>Anderson William (Ingeniero AI Senior)</strong>
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://ingenieroai.pro"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 transition-all active:scale-95"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Visitar ingenieroai.pro (Oficial)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold block">PORTAL OFICIAL:</span>
                      <span className="font-mono text-white text-xs font-bold">https://ingenieroai.pro</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold block">LICENCIA SERIAL:</span>
                      <span className="font-mono text-white text-xs font-bold">LIC-INGENIEROAI-PRO-GT-2026-X99</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold block">WHATSAPP DIRECTO SOPORTE:</span>
                      <a
                        href="https://wa.me/50254154016"
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-emerald-400 hover:underline text-xs font-bold block"
                      >
                        +502 54154016 (Anderson William)
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Clauses Quick Summary */}
              {activeDoc.keyClauses && activeDoc.keyClauses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Cláusulas Clave Resumidas
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDoc.keyClauses.map((clause, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1"
                      >
                        <span className="font-bold text-slate-200 block">{clause.title}</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{clause.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Legal Contract Text */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Texto Completo Vinculante del Contrato
                </span>
                <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap selection:bg-emerald-500/30">
                  {activeDoc.fullText}
                </div>
              </div>

              {/* Sign-off & Legal Representation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-white block">
                    Emitido por ConversaGT Soluciones Tecnológicas, S.A.
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Registro Mercantil y SAT Guatemala • NIT 10293848-1 • Departamento Jurídico: legal@conversagt.com
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20">
                    ✓ Vigente & Auditado
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Selecciona un documento legal para visualizarlo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
