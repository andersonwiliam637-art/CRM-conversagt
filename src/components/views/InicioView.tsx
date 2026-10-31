import React from 'react';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Bot,
  UserCheck,
  Building2,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { Conversation, Client, TransactionRecord, ViewType } from '../../types';

interface InicioViewProps {
  conversations: Conversation[];
  clients: Client[];
  transactions: TransactionRecord[];
  onNavigate: (view: ViewType) => void;
  onOpenConversation?: (convId: string) => void;
  onOpenPaymentModal?: () => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  conversations,
  clients,
  transactions,
  onNavigate,
  onOpenConversation,
  onOpenPaymentModal,
}) => {
  // Operational Metrics
  const activeConversations = conversations.filter((c) => c.status === 'open');
  const pendingHuman = conversations.filter(
    (c) => c.status === 'pending' || c.priority === 'vip' || c.priority === 'high'
  );
  const newClients = clients.filter((c) => c.stage === 'nuevo' || c.stage === 'contactado');
  const aiHandled = conversations.filter(
    (c) => c.assignedAgent.toLowerCase().includes('asistente') || c.assignedAgent.toLowerCase().includes('bot') || c.assignedAgent.toLowerCase().includes('ia')
  );
  const humanTransfers = conversations.filter(
    (c) => !c.assignedAgent.toLowerCase().includes('asistente') && !c.assignedAgent.toLowerCase().includes('bot') && (c.priority === 'vip' || c.priority === 'high' || c.status === 'pending')
  );
  const hotOpportunities = clients.filter((c) => c.stage === 'negociacion' || c.stage === 'vip');
  const totalLtv = clients.reduce((acc, c) => acc + (c.ltv || 0), 0);
  const pendingTransactions = transactions.filter((t) => t.status === 'pending_verification');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#A7A7A7] uppercase tracking-wider">Centro de Operaciones</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-xs text-[#16A34A] font-medium font-mono">Consola Activa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Resumen Operativo
          </h1>
          <p className="text-sm text-[#A7A7A7] mt-0.5">
            Estado de atención comercial: conversaciones pendientes, clientes nuevos y transferencias en curso.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('conversations')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ir a Bandeja Omnicanal</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('clients')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-white text-xs font-medium transition-all"
          >
            <Users className="w-3.5 h-3.5 text-[#A7A7A7]" />
            <span>Directorio Clientes</span>
          </button>
        </div>
      </div>

      {/* KPI Grid (6 Concise Operational Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1: Pendientes de Agente */}
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Por Atender</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-white font-tabular">
              {pendingHuman.length}
            </div>
            <div className="text-[11px] text-[#D97706] mt-0.5 font-medium">
              Requieren respuesta
            </div>
          </div>
        </div>

        {/* KPI 2: Activas en Curso */}
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">En Atención</span>
            <MessageSquare className="w-3.5 h-3.5 text-[#6798FF]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-white font-tabular">
              {activeConversations.length}
            </div>
            <div className="text-[11px] text-[#A7A7A7] mt-0.5">
              En bandeja abierta
            </div>
          </div>
        </div>

        {/* KPI 3: Clientes Nuevos */}
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Nuevos Leads</span>
            <Users className="w-3.5 h-3.5 text-[#6798FF]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-white font-tabular">
              {newClients.length}
            </div>
            <div className="text-[11px] text-[#A7A7A7] mt-0.5">
              En etapa inicial
            </div>
          </div>
        </div>

        {/* KPI 4: Atendidos por IA */}
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">En Asistente IA</span>
            <Bot className="w-3.5 h-3.5 text-[#6798FF]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-white font-tabular">
              {aiHandled.length}
            </div>
            <div className="text-[11px] text-[#16A34A] mt-0.5 font-medium">
              Respuestas 24/7
            </div>
          </div>
        </div>

        {/* KPI 5: Transferencias a Humano */}
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Transferencias</span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#6798FF]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-white font-tabular">
              {humanTransfers.length}
            </div>
            <div className="text-[11px] text-[#A7A7A7] mt-0.5">
              Derivadas a asesor
            </div>
          </div>
        </div>

        {/* KPI 6: Oportunidades Calientes */}
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A7A7A7]">
            <span className="text-[11px] font-medium uppercase tracking-wider font-mono">Oportunidades</span>
            <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-white font-tabular">
              {hotOpportunities.length}
            </div>
            <div className="text-[11px] text-[#16A34A] mt-0.5 font-medium">
              Negociación activa
            </div>
          </div>
        </div>
      </div>

      {/* Main Command Split: Urgent Atención vs Canales & Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Conversaciones que requieren atención */}
        <div className="lg:col-span-2 rounded-lg bg-[#141414] border border-[#313131] p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
            <div>
              <h2 className="text-base font-semibold text-white">
                Conversaciones que Requieren Respuesta
              </h2>
              <p className="text-xs text-[#A7A7A7]">
                Mensajes que necesitan confirmación comercial o intervención de un asesor humano
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('conversations')}
              className="text-xs text-[#6798FF] hover:underline flex items-center gap-1 font-medium font-mono"
            >
              Ver todas ({conversations.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#1E1E1E] mt-2">
            {conversations.slice(0, 5).map((conv) => {
              const isUrgent = conv.priority === 'vip' || conv.priority === 'high' || conv.status === 'pending';
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (onOpenConversation) {
                      onOpenConversation(conv.id);
                    }
                    onNavigate('conversations');
                  }}
                  className="py-3 px-2 rounded-lg hover:bg-[#1E1E1E] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#1E1E1E] border border-[#313131] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {conv.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate group-hover:text-[#6798FF] transition-colors">
                          {conv.customerName}
                        </span>
                        <span className="text-[11px] text-[#A7A7A7] font-mono capitalize">
                          · {conv.channel}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#D97706] bg-[#D97706]/10 px-1.5 py-0.5 rounded border border-[#D97706]/30">
                            Prioritario
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A7A7A7] truncate max-w-md mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-[#A7A7A7] font-tabular">
                      {conv.lastMessageTime}
                    </span>
                    <div className="text-[11px] text-[#A7A7A7] mt-0.5">
                      {conv.assignedAgent || 'Sin asignar'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Estado de Canales y Pagos Pendientes */}
        <div className="space-y-6">
          {/* Canales Integrados (Honest Declaration of Real Verification Status) */}
          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Estado de Integraciones
            </h2>
            <div className="mt-4 space-y-3">
              {/* WhatsApp Cloud API */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E1E1E] border border-[#313131]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#7C7C7C]" />
                  <div>
                    <div className="text-xs font-medium text-white">WhatsApp Business</div>
                    <div className="text-[11px] text-[#A7A7A7]">Meta Cloud API</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#A7A7A7] bg-[#141414] px-1.5 py-0.5 rounded border border-[#313131]">
                  NO CONFIGURADO
                </span>
              </div>

              {/* WhatsApp Web — Sesión vinculada */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E1E1E] border border-[#313131]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#6798FF]" />
                  <div>
                    <div className="text-xs font-medium text-white">WhatsApp Web</div>
                    <div className="text-[11px] text-[#A7A7A7]">Sesión vinculada</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#6798FF] bg-[#6798FF]/10 px-1.5 py-0.5 rounded border border-[#6798FF]/30">
                  DEMO — DATOS DE PRUEBA
                </span>
              </div>

              {/* Telegram Bot */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E1E1E] border border-[#313131]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#6798FF]" />
                  <div>
                    <div className="text-xs font-medium text-white">Telegram Bot</div>
                    <div className="text-[11px] text-[#A7A7A7]">Simulador @BotFather</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#6798FF] bg-[#6798FF]/10 px-1.5 py-0.5 rounded border border-[#6798FF]/30">
                  DEMO — DATOS DE PRUEBA
                </span>
              </div>

              {/* Checkout Tarjeta 3DS */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E1E1E] border border-[#313131]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#6798FF]" />
                  <div>
                    <div className="text-xs font-medium text-white">Tarjetas 3D-Secure</div>
                    <div className="text-[11px] text-[#A7A7A7]">Pasarela de cobro</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#6798FF] bg-[#6798FF]/10 px-1.5 py-0.5 rounded border border-[#6798FF]/30">
                  DEMO — DATOS DE PRUEBA
                </span>
              </div>

              {/* PayPal Webhook Listener */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E1E1E] border border-[#313131]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                  <div>
                    <div className="text-xs font-medium text-white">PayPal Pasarela</div>
                    <div className="text-[11px] text-[#A7A7A7]">Webhook registrado</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#D97706] bg-[#D97706]/10 px-1.5 py-0.5 rounded border border-[#D97706]/30">
                  CONFIGURACIÓN PENDIENTE
                </span>
              </div>

              {/* Facturación SAT FEL */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E1E1E] border border-[#313131]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                  <div>
                    <div className="text-xs font-medium text-white">Facturación SAT FEL</div>
                    <div className="text-[11px] text-[#A7A7A7]">DTE / Certificador</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#D97706] bg-[#D97706]/10 px-1.5 py-0.5 rounded border border-[#D97706]/30">
                  CONFIGURACIÓN PENDIENTE
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#313131] flex justify-between items-center text-xs">
              <span className="text-[#A7A7A7]">Gestionar credenciales</span>
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="text-[#6798FF] hover:underline font-medium font-mono text-xs"
              >
                Configuración →
              </button>
            </div>
          </div>

          {/* Cuentas Bancarias / Boletas */}
          <div className="rounded-lg bg-[#141414] border border-[#313131] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Boletas y Pagos
              </h2>
              {pendingTransactions.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30">
                  {pendingTransactions.length} pendiente
                </span>
              )}
            </div>

            <div className="mt-3">
              <div className="text-xl font-semibold text-white font-tabular">
                Q {totalLtv.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Volumen acumulado de clientes registrados
              </p>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  if (onOpenPaymentModal) onOpenPaymentModal();
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-xs font-medium text-white transition-all text-center"
              >
                + Generar Enlace de Cobro / Boleta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
