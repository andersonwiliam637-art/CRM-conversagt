import React, { useState } from 'react';
import { Client, ClientStage } from '../../types';
import {
  Users,
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Filter,
  Download,
  FileSpreadsheet,
  ArrowUpDown,
  Tag,
  Clock,
  UserCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface ClientsViewProps {
  clients: Client[];
  onOpenChatWithClient: (clientId: string) => void;
  onOpenPaymentModal: (client: Client) => void;
  onAddClient: (newClient: Partial<Client>) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onOpenChatWithClient,
  onOpenPaymentModal,
  onAddClient,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClientForDrawer, setSelectedClientForDrawer] = useState<Client | null>(null);

  // New Client Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+502 ');
  const [stage, setStage] = useState<ClientStage>('nuevo');
  const [paymentPreferred, setPaymentPreferred] = useState<'card' | 'paypal' | 'bank_transfer'>('bank_transfer');

  const filteredClients = clients.filter((c) => {
    const matchStage = selectedStage === 'all' || c.stage === selectedStage;
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    return matchStage && matchSearch;
  });

  const totalLtv = clients.reduce((acc, c) => acc + (c.ltv || 0), 0);
  const vipCount = clients.filter((c) => c.stage === 'vip').length;

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onAddClient({
      name,
      company: company || 'Empresa Independiente',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@empresa.com`,
      phone,
      stage,
      paymentMethodPreferred: paymentPreferred,
      avatar: '/default_avatar_director.png',
      ltv: 0,
      dealsCount: 0,
      channelOrigin: 'whatsapp',
      tags: ['Nuevo Lead'],
      lastContactDate: 'Hoy',
      notes: 'Registrado desde la consola ejecutiva.',
      assignedTo: 'Valeria Méndez',
      isDemo: false,
    });
    setName('');
    setCompany('');
    setEmail('');
    setPhone('+502 ');
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    if (!clients.length) return;
    const headers = [
      'ID_Cliente',
      'Nombre',
      'Empresa',
      'Correo',
      'Telefono',
      'Etapa',
      'LTV_GTQ',
      'Canal_Origen',
      'Ultima_Interaccion',
      'Agente_Asignado',
      'Metodo_Pago',
      'Notas'
    ];

    const rows = filteredClients.map((c) => [
      `"${c.id || ''}"`,
      `"${c.name || ''}"`,
      `"${c.company || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.stage || ''}"`,
      c.ltv || 0,
      `"${c.channelOrigin || ''}"`,
      `"${c.lastContactDate || ''}"`,
      `"${c.assignedTo || ''}"`,
      `"${c.paymentMethodPreferred || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REPORTES_CLIENTES_CONVERSAGT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#A7A7A7] uppercase tracking-wider">Directorio de Clientes</span>
            <span className="text-xs text-[#A7A7A7]">·</span>
            <span className="font-mono text-xs text-white font-tabular">{clients.length} contactos registrados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Gestión de Clientes & CRM
          </h1>
          <p className="text-sm text-[#A7A7A7] mt-0.5">
            Registro comercial estructurado, etapas en el embudo, agentes y valor de ciclo de vida (LTV).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white text-xs font-medium transition-all"
            title="Exportar base de clientes en formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Metric summary counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block font-mono uppercase text-[11px]">Total Clientes</span>
          <span className="text-xl font-semibold text-white font-tabular mt-1 block">
            {clients.length}
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block font-mono uppercase text-[11px]">Cuentas VIP</span>
          <span className="text-xl font-semibold text-[#6798FF] font-tabular mt-1 block">
            {vipCount}
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block font-mono uppercase text-[11px]">Pipeline Acumulado</span>
          <span className="text-xl font-semibold text-white font-tabular mt-1 block">
            Q {totalLtv.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#141414] border border-[#313131]">
          <span className="text-xs text-[#A7A7A7] block font-mono uppercase text-[11px]">Promedio LTV</span>
          <span className="text-xl font-semibold text-white font-tabular mt-1 block">
            Q {(totalLtv / (clients.length || 1)).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'vip', label: 'VIP' },
            { id: 'ganado', label: 'Ganados' },
            { id: 'negociacion', label: 'Negociación' },
            { id: 'contactado', label: 'Contactados' },
            { id: 'nuevo', label: 'Nuevos' },
          ].map((stg) => (
            <button
              key={stg.id}
              onClick={() => setSelectedStage(stg.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedStage === stg.id
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              {stg.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A7A7A7]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, empresa o teléfono..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#141414] border border-[#313131] text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF] transition-all"
          />
        </div>
      </div>

      {/* Enterprise CRM Table */}
      <div className="rounded-lg bg-[#141414] border border-[#313131] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#313131] bg-[#1E1E1E] text-[#A7A7A7] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Cliente / Empresa</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Etapa</th>
                <th className="py-3 px-4 text-right">LTV Acumulado</th>
                <th className="py-3 px-4">Última Interacción</th>
                <th className="py-3 px-4">Agente Asignado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A7A7A7]">
                    No se encontraron clientes que coincidan con la búsqueda o filtro.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                      onClick={() => setSelectedClientForDrawer(client)}
                    >
                      {/* Name & Company */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-[#1E1E1E] border border-[#313131] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-white group-hover:text-[#6798FF] transition-colors">
                                {client.name}
                              </span>
                              {client.isDemo && (
                                <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#6798FF]/20 text-[#6798FF] border border-[#6798FF]/40">
                                  DEMO — DATOS DE PRUEBA
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#A7A7A7] block">
                              {client.company}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 font-mono text-[#A7A7A7]">
                        <div>{client.phone}</div>
                        <div className="text-[11px] text-[#7C7C7C]">{client.email}</div>
                      </td>

                      {/* Origin Channel */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-white capitalize bg-[#1E1E1E] border border-[#313131] px-2 py-0.5 rounded">
                          {client.channelOrigin || 'whatsapp'}
                        </span>
                      </td>

                      {/* Commercial Stage */}
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-medium capitalize ${
                          client.stage === 'vip'
                            ? 'text-[#6798FF]'
                            : client.stage === 'ganado'
                            ? 'text-[#16A34A]'
                            : client.stage === 'negociacion'
                            ? 'text-[#D97706]'
                            : 'text-[#A7A7A7]'
                        }`}>
                          ● {client.stage}
                        </span>
                      </td>

                      {/* LTV */}
                      <td className="py-3 px-4 text-right font-tabular text-white font-medium">
                        Q {(client.ltv || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Last Interaction Date */}
                      <td className="py-3 px-4 text-[#A7A7A7] font-mono text-[11px]">
                        {client.lastContactDate || 'Sin registro'}
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3 px-4 text-[#A7A7A7] font-mono text-[11px]">
                        {client.assignedTo || 'Valeria Méndez'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenChatWithClient(client.id)}
                            className="p-1.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white transition-colors"
                            title="Abrir chat en bandeja omnicanal"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#6798FF]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(client)}
                            className="p-1.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-[#16A34A] transition-colors"
                            title="Generar cobro / Factura SAT"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-3 border-t border-[#313131] bg-[#141414] text-[11px] text-[#A7A7A7] flex items-center justify-between font-mono">
          <span>Mostrando {filteredClients.length} de {clients.length} clientes</span>
          <span>Sincronización de Base de Datos: Activa</span>
        </div>
      </div>

      {/* Slide-over Client Dossier Drawer */}
      {selectedClientForDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
          onClick={() => setSelectedClientForDrawer(null)}
        >
          <div
            className="w-full max-w-md bg-[#141414] border-l border-[#313131] h-full p-6 overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#313131]">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#A7A7A7]">Expediente Comercial</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-base font-semibold text-white">
                    {selectedClientForDrawer.name}
                  </h3>
                  {selectedClientForDrawer.isDemo && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#6798FF]/20 text-[#6798FF] border border-[#6798FF]/40">
                      DEMO — DATOS DE PRUEBA
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientForDrawer(null)}
                className="text-[#A7A7A7] hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="space-y-3">
              <div className="p-3 rounded bg-[#1E1E1E] border border-[#313131] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Empresa / Razón Social:</span>
                  <span className="text-white font-medium">{selectedClientForDrawer.company}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Teléfono / WhatsApp:</span>
                  <span className="text-white font-mono">{selectedClientForDrawer.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Correo Electrónico:</span>
                  <span className="text-white font-mono">{selectedClientForDrawer.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Canal de Adquisición:</span>
                  <span className="text-white font-mono capitalize">{selectedClientForDrawer.channelOrigin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Etapa en Pipeline:</span>
                  <span className="text-[#6798FF] font-medium capitalize">{selectedClientForDrawer.stage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Agente Responsable:</span>
                  <span className="text-white font-mono">{selectedClientForDrawer.assignedTo || 'Valeria Méndez'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Última Interacción:</span>
                  <span className="text-white font-mono">{selectedClientForDrawer.lastContactDate || 'Hoy'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A7A7A7]">Valor Histórico (LTV):</span>
                  <span className="text-white font-tabular font-semibold">
                    Q {(selectedClientForDrawer.ltv || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {selectedClientForDrawer.tags && selectedClientForDrawer.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-white uppercase font-mono text-[11px]">
                  Etiquetas Comerciales
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClientForDrawer.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#1E1E1E] border border-[#313131] text-[11px] text-[#A7A7A7] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white uppercase font-mono text-[11px]">
                Notas y Acuerdos
              </span>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-[#A7A7A7] leading-relaxed">
                {selectedClientForDrawer.notes || 'Sin notas registradas para este cliente.'}
              </div>
            </div>

            {/* Activity History */}
            <div className="space-y-2 pt-2 border-t border-[#313131]">
              <span className="text-xs font-semibold text-white uppercase font-mono text-[11px]">
                Historial de Actividad
              </span>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#313131] space-y-2 text-xs text-[#A7A7A7]">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Registro en sistema:</span>
                  <span className="font-mono text-white">{selectedClientForDrawer.registeredDate || 'Agosto 2026'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Método preferido:</span>
                  <span className="font-mono text-white capitalize">{selectedClientForDrawer.paymentMethodPreferred || 'Transferencia'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Tratos cerrados:</span>
                  <span className="font-mono text-white font-tabular">{selectedClientForDrawer.dealsCount || 1}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-[#313131] space-y-2">
              <button
                type="button"
                onClick={() => {
                  onOpenChatWithClient(selectedClientForDrawer.id);
                  setSelectedClientForDrawer(null);
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir en Bandeja Omnicanal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenPaymentModal(selectedClientForDrawer);
                  setSelectedClientForDrawer(null);
                }}
                className="w-full py-2 px-4 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4 text-[#16A34A]" />
                <span>Emitir Factura SAT / Boleta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#313131] rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#313131]">
              <h3 className="text-sm font-semibold text-white">
                Registrar Nuevo Cliente en CRM
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#A7A7A7] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Licda. Sofía Morales"
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Empresa / Negocio</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ej: Constructora San Jerónimo"
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#A7A7A7] block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+502 5555-4433"
                    className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#A7A7A7] block mb-1">Etapa Inicial</label>
                  <select
                    value={stage}
                    onChange={(e: any) => setStage(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="contactado">Contactado</option>
                    <option value="negociacion">Negociación</option>
                    <option value="ganado">Ganado</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A7A7A7] block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@empresa.gt"
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#313131] text-xs text-white focus:outline-none focus:border-[#6798FF]"
                />
              </div>

              <div className="pt-3 border-t border-[#313131] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-[#1E1E1E] text-xs text-[#A7A7A7] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#6798FF] hover:bg-[#5584eb] text-xs font-semibold text-black"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
