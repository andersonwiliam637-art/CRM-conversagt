import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  MessageSquare,
  Bot,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Building2,
  Percent
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#A7A7A7] uppercase tracking-wider">Métricas de Rendimiento</span>
            <span className="text-xs text-[#A7A7A7]">·</span>
            <span className="font-mono text-xs text-white">Últimos 30 días</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Analítica de Operaciones & CSAT
          </h1>
          <p className="text-sm text-[#A7A7A7] mt-0.5">
            Monitoreo cuantitativo de satisfacción, tiempos de respuesta y resolución autónoma.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#313131] text-[#A7A7A7]">
            Rango: Sep 2026
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#16A34A] font-medium">
            ● SLA 99.9%
          </span>
        </div>
      </div>

      {/* KPI Cards (4 Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-xs font-medium uppercase tracking-wider">Satisfacción (CSAT)</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-tabular">
              98.4%
            </div>
            <div className="text-xs text-[#16A34A] mt-1 font-medium font-tabular">
              Meta superada (&gt;95.0%)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-xs font-medium uppercase tracking-wider">Tiempo 1ra Respuesta</span>
            <Clock className="w-4 h-4 text-[#6798FF]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-tabular">
              1.8 seg <span className="text-xs text-[#A7A7A7] font-normal font-sans">(IA)</span>
            </div>
            <div className="text-xs text-[#A7A7A7] mt-1 font-tabular">
              Humano promedio: 3.4 min
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-xs font-medium uppercase tracking-wider">Resolución por IA</span>
            <Bot className="w-4 h-4 text-[#6798FF]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-tabular">
              82.6%
            </div>
            <div className="text-xs text-[#A7A7A7] mt-1 font-tabular">
              614 de 743 sin intervención
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-xs font-medium uppercase tracking-wider">Recaudación Reportada</span>
            <DollarSign className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-tabular">
              Q 48,220.00
            </div>
            <div className="text-xs text-[#16A34A] mt-1 flex items-center gap-1 font-tabular">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* Split Rows: Volume by Channel & Agent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Volume */}
        <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Volumen por Canal de Mensajería
          </h2>

          <div className="space-y-4 pt-1">
            {/* WhatsApp */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white font-medium">WhatsApp Business (Oficial Meta)</span>
                <span className="font-tabular text-white font-mono">1,840 msgs · 84.2%</span>
              </div>
              <div className="h-2 w-full bg-[#1E1E1E] rounded-full overflow-hidden">
                <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '84.2%' }} />
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white font-medium">Telegram Bot</span>
                <span className="font-tabular text-white font-mono">210 msgs · 9.6%</span>
              </div>
              <div className="h-2 w-full bg-[#1E1E1E] rounded-full overflow-hidden">
                <div className="h-full bg-[#6798FF] rounded-full" style={{ width: '9.6%' }} />
              </div>
            </div>

            {/* WebChat */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white font-medium">Widget Web / Landing</span>
                <span className="font-tabular text-white font-mono">135 msgs · 6.2%</span>
              </div>
              <div className="h-2 w-full bg-[#1E1E1E] rounded-full overflow-hidden">
                <div className="h-full bg-[#7C7C7C] rounded-full" style={{ width: '6.2%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Team & Agent Performance Table */}
        <div className="rounded-lg bg-[#141414] border border-[#313131] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Rendimiento del Equipo & Asistente
          </h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#313131] text-[#A7A7A7] font-mono text-[11px] uppercase">
                <th className="pb-2">Operador / Agente</th>
                <th className="pb-2 text-right">Atendidas</th>
                <th className="pb-2 text-right">1ra Respuesta</th>
                <th className="pb-2 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              <tr>
                <td className="py-2.5">
                  <div className="font-medium text-white">Asistente IA (Automático)</div>
                  <div className="text-[10px] text-[#A7A7A7] font-mono">Motor Gemini 3.7</div>
                </td>
                <td className="py-2.5 text-right font-tabular text-white">614</td>
                <td className="py-2.5 text-right font-tabular text-[#6798FF]">1.8s</td>
                <td className="py-2.5 text-right font-tabular text-[#16A34A]">98.6%</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  <div className="font-medium text-white">Valeria Méndez</div>
                  <div className="text-[10px] text-[#A7A7A7] font-mono">Asesora Senior</div>
                </td>
                <td className="py-2.5 text-right font-tabular text-white">84</td>
                <td className="py-2.5 text-right font-tabular text-white">2.8m</td>
                <td className="py-2.5 text-right font-tabular text-[#16A34A]">99.0%</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  <div className="font-medium text-white">Carlos Ramos</div>
                  <div className="text-[10px] text-[#A7A7A7] font-mono">Asesor Ventas</div>
                </td>
                <td className="py-2.5 text-right font-tabular text-white">45</td>
                <td className="py-2.5 text-right font-tabular text-white">4.1m</td>
                <td className="py-2.5 text-right font-tabular text-white">96.5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
