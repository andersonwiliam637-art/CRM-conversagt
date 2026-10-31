import React, { useState } from 'react';
import { Phone, MessageSquare, X, Sparkles } from 'lucide-react';

export const FloatingWhatsAppSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Quick Message Bubble */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-slate-950 border border-emerald-500/40 p-4 shadow-2xl shadow-emerald-950/60 animate-in fade-in slide-in-from-bottom-3 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Anderson William</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ingeniero AI • En Línea</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            ¿Necesitas soporte técnico, activación de tu bot o contratar un plan para tu negocio? Escríbeme directamente por WhatsApp.
          </p>

          <div className="space-y-1.5 pt-1">
            <a
              href="https://wa.me/50254154016?text=Hola%20Ingeniero%20AI%20Anderson%20William,%20quiero%20contratar%20ConversaGT%20para%20mi%20negocio"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contratar Plan (+502 54154016)</span>
            </a>

            <a
              href="https://wa.me/50254154016?text=Hola%20Ingeniero%20AI%20Anderson%20William,%20adjunto%20mi%20boleta%20de%20pago%20para%20activación"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enviar Boleta / Soporte</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        type="button"
        id="floating-whatsapp-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all group"
      >
        <div className="relative">
          <Phone className="w-5 h-5 animate-pulse text-slate-950" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-emerald-500" />
        </div>
        <span className="hidden sm:inline">WhatsApp Soporte: 54154016</span>
        <span className="sm:hidden font-mono">54154016</span>
      </button>
    </div>
  );
};
