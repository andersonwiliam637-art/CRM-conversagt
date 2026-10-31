import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Zap,
  Megaphone,
  BarChart3,
  Settings,
  Phone,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onNavigate?: (view: ViewType) => void;
  unreadCount?: number;
  vipClientsCount?: number;
  pendingActivationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  unreadCount = 1,
  vipClientsCount = 2,
  pendingActivationCount = 2,
}) => {
  const mainNavItems = [
    {
      id: 'inicio' as ViewType,
      label: 'Inicio',
      icon: LayoutDashboard,
    },
    {
      id: 'conversations' as ViewType,
      label: 'Conversaciones',
      icon: MessageSquare,
      badgeText: unreadCount > 0 ? `${unreadCount}` : undefined,
      badgeHighlight: unreadCount > 0,
    },
    {
      id: 'clients' as ViewType,
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'automation' as ViewType,
      label: 'Automatización',
      icon: Zap,
    },
    {
      id: 'marketing' as ViewType,
      label: 'Marketing',
      icon: Megaphone,
    },
    {
      id: 'analytics' as ViewType,
      label: 'Analítica',
      icon: BarChart3,
    },
    {
      id: 'settings' as ViewType,
      label: 'Configuración',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#141414] border-r border-[#313131] flex flex-col justify-between h-[calc(100vh-4rem)] p-3 shrink-0 select-none font-sans">
      {/* Navigation Items */}
      <div className="space-y-1 overflow-y-auto pr-1">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-[#A7A7A7] uppercase font-mono">
          Centro de Operaciones
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.id ||
            (item.id === 'inicio' && activeView === 'business_portal') ||
            (item.id === 'automation' && activeView === 'documents') ||
            (item.id === 'marketing' && activeView === 'campaigns') ||
            (item.id === 'settings' && (activeView === 'payments' || activeView === 'legal' || activeView === 'admin_activation'));

          return (
            <button
              key={item.id}
              type="button"
              id={`nav-link-${item.id}`}
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150 group relative ${
                isActive
                  ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                  : 'text-[#A7A7A7] hover:text-white hover:bg-[#1A1A1A] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#6798FF]' : 'text-[#A7A7A7] group-hover:text-white'
                }`} />
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
              </div>

              {item.badgeText && (
                <span className={`text-[10px] font-mono font-tabular px-1.5 py-0.2 rounded ${
                  item.badgeHighlight
                    ? 'bg-[#6798FF] text-black font-semibold'
                    : 'bg-[#1E1E1E] text-[#A7A7A7] border border-[#313131]'
                }`}>
                  {item.badgeText}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Tenant & User Details */}
      <div className="pt-3 border-t border-[#313131] space-y-3">
        {/* Active Business Account */}
        <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#313131]">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#6798FF]" />
            <span className="text-xs font-semibold text-white truncate">
              Ferretería El Progreso
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#A7A7A7] mt-1 flex items-center justify-between">
            <span>Plan Pro Anual</span>
            <span className="text-[#16A34A]">● Activo</span>
          </div>
        </div>

        {/* User profile & direct VIP contact */}
        <div className="px-2 flex items-center justify-between text-xs">
          <div className="min-w-0">
            <div className="font-medium text-white text-xs truncate">Anderson William</div>
            <div className="text-[10px] text-[#A7A7A7] font-mono truncate">Administrador Principal</div>
          </div>
          <a
            href="https://wa.me/50254154016?text=Hola%20Anderson,%20necesito%20asistencia%20en%20ConversaGT"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-[#16A34A] transition-colors"
            title="Soporte VIP por WhatsApp (+502 5415-4016)"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};
