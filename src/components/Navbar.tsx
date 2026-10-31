import React, { useState } from 'react';
import {
  Pyramid,
  ShieldCheck,
  Zap,
  CreditCard,
  Search,
  FileText,
  Menu,
  X,
  Phone,
  Building2,
  Bot
} from 'lucide-react';
import { ViewType } from '../types';

export interface NavNotification {
  id: string | number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

interface NavbarProps {
  onOpenPaymentModal?: () => void;
  onNavigate?: (view: ViewType) => void;
  activeView?: ViewType;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  notificationsList?: NavNotification[];
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPaymentModal,
  onNavigate,
  activeView,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  notificationsList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-14 border-b border-[#313131] bg-[#141414] sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-4 font-sans select-none">
      {/* Zone 1: Brand & Operational Status */}
      <div className="flex items-center gap-3">
        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg bg-[#1E1E1E] border border-[#313131] text-[#A7A7A7] hover:text-white"
          aria-label="Abrir menú de navegación"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Brand */}
        <div
          onClick={() => onNavigate && onNavigate('inicio')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="navbar-brand-logo"
        >
          <div className="w-7 h-7 rounded bg-[#1E1E1E] border border-[#313131] flex items-center justify-center text-white">
            <Pyramid className="w-4 h-4 text-[#6798FF]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-white">
              Conversa<span className="text-[#6798FF]">GT</span>
            </span>
            <span className="text-[10px] font-mono text-[#A7A7A7] uppercase tracking-wider hidden sm:inline">
              Enterprise CRM
            </span>
          </div>
        </div>

        {/* Discreet System Status */}
        <div className="hidden xl:flex items-center gap-3 pl-3 border-l border-[#313131] text-xs text-[#A7A7A7]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span className="font-mono text-[11px] text-[#A7A7A7]">Asistente IA: Activo</span>
          </div>
          <span className="text-[#313131]">·</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            <span className="font-mono text-[11px] text-[#A7A7A7]">Canales: Configuración pendiente</span>
          </div>
        </div>
      </div>

      {/* Zone 2: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A7A7A7]" />
          <input
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversaciones, clientes o DTE... ⌘K"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#0A0A0A] border border-[#313131] text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF] transition-all"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Audit Report */}
      <div className="flex items-center gap-2.5">
        {/* Direct Link to Official Audit Report & Download */}
        <a
          href="/audit-report"
          target="_blank"
          rel="noreferrer"
          id="btn-navbar-audit-report"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#A7A7A7] hover:text-white font-medium text-xs transition-colors"
          title="Ver o descargar Informe Oficial de Seguridad y Dictamen de Arquitectura en PDF o Word"
        >
          <FileText className="w-3.5 h-3.5 text-[#6798FF]" />
          <span className="hidden sm:inline">Auditoría (PDF/Doc)</span>
          <span className="sm:hidden">Auditoría</span>
        </a>

        {/* Primary Action Button */}
        {onOpenPaymentModal && (
          <button
            type="button"
            onClick={onOpenPaymentModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs transition-all shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Generar Cobro</span>
            <span className="sm:hidden">Cobrar</span>
          </button>
        )}
      </div>
    </header>
  );
};
