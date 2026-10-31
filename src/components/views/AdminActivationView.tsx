import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiService';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  Ban,
  CheckCircle2,
  AlertCircle,
  Search,
  Bot,
  MessageSquare,
  CreditCard,
  Building2,
  ExternalLink,
  RefreshCw,
  Zap,
  Check,
  X,
  Phone,
  Filter,
  DollarSign,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Shield,
  FileCheck,
  Activity,
  Store,
  Plus
} from 'lucide-react';
import { Client, TransactionRecord, BusinessAccount } from '../../types';

interface AdminActivationViewProps {
  clients: Client[];
  transactions?: TransactionRecord[];
  activeBusiness?: BusinessAccount;
  onActivateBusiness?: () => void;
  onDeactivateBusiness?: () => void;
  onToggleClientActivation?: (clientId: string, newStatus: 'activo' | 'pendiente_verificacion' | 'inactivo') => void;
  onTogglePaymentConfirmed?: (clientId: string, confirmed: boolean) => void;
  onToggleBotEnabled?: (clientId: string, enabled: boolean) => void;
  onOpenChatWithClient?: (clientId: string) => void;
  onVerifyBankTransaction?: (transactionId: string, approved: boolean) => void;
  onSimulateTestRegistration?: () => void;
}

export const AdminActivationView: React.FC<AdminActivationViewProps> = ({
  clients,
  transactions = [],
  activeBusiness,
  onActivateBusiness,
  onDeactivateBusiness,
  onToggleClientActivation,
  onTogglePaymentConfirmed,
  onToggleBotEnabled,
  onOpenChatWithClient,
  onVerifyBankTransaction,
  onSimulateTestRegistration,
}) => {
  // Authentication State for Ingeniero AI (Verified on Server)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Anti-brute-force defense state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Verify server session on component mount
  useEffect(() => {
    const checkServerAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: api.getHeaders(),
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user && (data.user.role === 'SUPER_ADMIN' || data.user.role === 'TENANT_ADMIN')) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkServerAuth();
  }, []);

  // Filter and Search
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'pendiente_verificacion' | 'inactivo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [verifiedSlips, setVerifiedSlips] = useState<Record<string, 'approved' | 'rejected'>>({});

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Validate Login with Server-Side Verification
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (lockoutSeconds > 0) {
      setAuthError(`🛡️ Bloqueo de seguridad activo. Espera ${lockoutSeconds}s.`);
      return;
    }

    try {
      const payload =
        authMode === 'pin'
          ? { pin: adminPin.trim() }
          : { email: adminUser.trim(), password: adminPassword.trim() };

      const result = await api.adminLogin(payload);

      if (result.success && result.user && (result.user.role === 'SUPER_ADMIN' || result.user.role === 'TENANT_ADMIN')) {
        setIsAuthenticated(true);
        setAdminPassword('');
        setAdminPin('');
        setFailedAttempts(0);
        setAuthError(null);
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutSeconds(60);
          setAuthError('🚨 Escudo de Ciberseguridad activado: 5 intentos fallidos. Panel bloqueado por 60 segundos.');
        } else {
          setAuthError(
            authMode === 'pin'
              ? `PIN no autorizado. Intento ${newAttempts} de 5 antes de bloqueo temporal.`
              : `Credenciales inválidas. Intento ${newAttempts} de 5 antes de bloqueo temporal.`
          );
        }
      }
    } catch {
      setAuthError('Error de comunicación con el servidor seguro.');
    }
  };

  const handleAdminLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
  };

  // Bank Slip Approval / Rejection
  const handleApproveSlip = (clientId: string, txId?: string) => {
    if (onToggleClientActivation) onToggleClientActivation(clientId, 'activo');
    if (onTogglePaymentConfirmed) onTogglePaymentConfirmed(clientId, true);
    if (onToggleBotEnabled) onToggleBotEnabled(clientId, true);
    if (txId && onVerifyBankTransaction) onVerifyBankTransaction(txId, true);

    setVerifiedSlips((prev) => ({ ...prev, [clientId]: 'approved' }));
  };

  const handleRejectSlip = (clientId: string, txId?: string) => {
    if (onToggleClientActivation) onToggleClientActivation(clientId, 'inactivo');
    if (onTogglePaymentConfirmed) onTogglePaymentConfirmed(clientId, false);
    if (txId && onVerifyBankTransaction) onVerifyBankTransaction(txId, false);

    setVerifiedSlips((prev) => ({ ...prev, [clientId]: 'rejected' }));
  };

  const filteredClients = clients.filter((c) => {
    const statusMatch = filterStatus === 'all' || (c.activationStatus || 'pendiente_verificacion') === filterStatus;
    const searchMatch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activeCount = clients.filter((c) => c.activationStatus === 'activo').length;
  const pendingCount = clients.filter((c) => (c.activationStatus || 'pendiente_verificacion') === 'pendiente_verificacion').length;

  const pendingBankClients = clients.filter(
    (c) => (c.activationStatus || 'pendiente_verificacion') === 'pendiente_verificacion' && !c.paymentConfirmed
  );

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  // =========================================================================
  // VIEW A: LOCKED LOGIN SCREEN FOR INGENIERO AI
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex items-center justify-center min-h-[550px] bg-slate-950">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Cyber Armor Ambient Badge */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />

          {/* Header */}
          <div className="text-center space-y-2 relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Panel Privado • Acceso Restringido</span>
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white">
              Autenticación de Administrador
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Área de acceso exclusivo para la dirección del sistema. Ingresa tus credenciales maestras autorizadas.
            </p>
          </div>

          {/* Mode Switch: PIN vs Password */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode('pin'); setAuthError(null); }}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                authMode === 'pin'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PIN de Seguridad
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setAuthError(null); }}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                authMode === 'password'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Contraseña Maestra
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            {authMode === 'pin' ? (
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Ingresa tu PIN de Seguridad</span>
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  autoFocus
                  disabled={lockoutSeconds > 0}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Usuario / Identificador Autorizado
                  </label>
                  <input
                    type="text"
                    required
                    disabled={lockoutSeconds > 0}
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Usuario o ID de acceso"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">
                      Contraseña Maestra
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={lockoutSeconds > 0}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
                  />
                </div>
              </>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {lockoutSeconds > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px] flex items-center justify-between">
                <span>⏱️ Bloqueo de seguridad activo:</span>
                <span className="font-mono font-black text-amber-200">{lockoutSeconds}s restantes</span>
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutSeconds > 0}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound className="w-4 h-4" />
              <span>{lockoutSeconds > 0 ? 'Panel Bloqueado' : 'Acceder al Panel Seguro'}</span>
            </button>

            {/* Security Guarantee */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Cifrado TLS 256-Bit • Autenticación Criptográfica</span>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: UNLOCKED ADMIN PANEL (AUTHENTICATED)
  // =========================================================================
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-950">
      {/* Session Active Top Bar with Logout Button */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">
            Sesión de Administrador Autorizada:
          </span>
          <span className="text-emerald-300 font-semibold font-mono text-[11px]">
            Anderson William (Ingeniero AI Principal)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/50254154016"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-all"
          >
            <Phone className="w-3 h-3" />
            <span>WhatsApp +502 54154016</span>
          </a>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="px-3 py-1 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-bold text-[11px] flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3 h-3" />
            <span>Cerrar Sesión Admin</span>
          </button>
        </div>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-black text-white">
                  Panel de Activación & Auditoría de Boletas Bancarias
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Ingeniero AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valida comprobantes bancarios reales (BI 1402158, BAM 4030437443, PayPal andersonwiliam637@gmail.com) antes de activar el bot y la plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Ingeniero AI WhatsApp Support Badge */}
        <a
          href="https://wa.me/50254154016?text=Hola%20Ingeniero%20AI,%20solicito%20soporte%20técnico%20y%20activación"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 border border-emerald-400/40 transition-all group shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-white animate-bounce" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-emerald-200 uppercase font-semibold">Línea Directa WhatsApp</span>
            <span className="text-xs font-black tracking-wide">+502 54154016 • Anderson William</span>
          </div>
        </a>
      </div>

      {/* Escudos de Ciberseguridad Activos */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">ESCUDO WAF & RATE LIMIT</span>
            <span className="font-bold text-white text-xs">40 req/min por IP Activo</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">ANTI-TAMPERING PAGOS</span>
            <span className="font-bold text-white text-xs">Sin autoactivación fraudulenta</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">ZERO-TRUST AUDIT</span>
            <span className="font-bold text-white text-xs">PIN Anderson Requerido</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">BOTS WHATSAPP/TELEGRAM</span>
            <span className="font-bold text-white text-xs">Gemini 3.7 Integrado</span>
          </div>
        </div>
      </div>

      {/* Control Central de Empresa Principal del Portal */}
      {activeBusiness && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-white">
                    {activeBusiness.businessName}
                  </h3>
                  {activeBusiness.status === 'active' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>SERVICIO ACTIVO & AUTORIZADO</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>PENDIENTE DE ACTIVACIÓN MANUAL</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dueño: <strong>{activeBusiness.ownerName}</strong> • Tel: {activeBusiness.phone} • Plan: {activeBusiness.planName} (Q{activeBusiness.planPrice})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
              {activeBusiness.status !== 'active' ? (
                <button
                  type="button"
                  onClick={() => onActivateBusiness && onActivateBusiness()}
                  className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activar Servicio al Usuario</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onDeactivateBusiness && onDeactivateBusiness()}
                  className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Ban className="w-4 h-4 text-amber-400" />
                  <span>Pausar / Desactivar Servicio</span>
                </button>
              )}

              <a
                href={`https://wa.me/${getCleanPhone(activeBusiness.phone)}?text=${encodeURIComponent(
                  `¡Hola ${activeBusiness.ownerName}! 👋 Te saluda Anderson William, Ingeniero AI de ConversaGT.\n\n` +
                  (activeBusiness.status === 'active'
                    ? `✅ Confirmamos la recepción de tu boleta bancaria y tu cuenta para "${activeBusiness.businessName}" ha sido ACTIVADA con éxito en el ${activeBusiness.planName}. Tus bots de WhatsApp y Telegram están respondiendo 24/7.`
                    : `⏳ Hemos recibido tu solicitud para "${activeBusiness.businessName}". Por favor envíame la fotografía de tu boleta bancaria a Banco Industrial (Ahorro 1402158) o BAM (Ahorro 4030437443) para activar tu servicio de inmediato.`)
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Notificar por WhatsApp (+502 {activeBusiness.phone})</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Banco para Depósito:</span>
              <span className="font-bold text-white">Banco Industrial (1402158)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Titular de Cuenta:</span>
              <span className="font-bold text-emerald-300">Anderson William</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Días Restantes:</span>
              <span className="font-mono font-bold text-white">
                {activeBusiness.status === 'active' ? `${activeBusiness.daysRemaining} días` : '0 días (En Espera)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auditoría y Validación de Boletas Bancarias Pendientes */}
      {pendingBankClients.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>Boletas Bancarias Pendientes de Validación ({pendingBankClients.length})</span>
              </h2>
            </div>
            <span className="text-[11px] text-amber-300 font-semibold">
              Revisa tu banca en línea (BI No. 1402158 / BAM No. 4030437443)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingBankClients.map((client) => {
              const slipStatus = verifiedSlips[client.id];
              return (
                <div
                  key={client.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{client.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {client.selectedPlan || 'Plan Business Pro'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {client.company} • {client.phone}
                      </p>
                      <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Detalle de Pago:</span>
                        <span>Monto: Q{client.ltv || 225}.00 • Método: Transferencia Bancaria</span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${getCleanPhone(client.phone)}?text=Hola%20${encodeURIComponent(client.name)},%20te%20saluda%20Anderson%20William%20de%20ConversaGT.%20He%20recibido%20tu%20solicitud%20de%20activación.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold text-[11px] shrink-0"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {slipStatus === 'approved' ? (
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-center font-bold text-xs border border-emerald-500/30">
                      ✓ Boleta aprobada y Plan Activado
                    </div>
                  ) : slipStatus === 'rejected' ? (
                    <div className="p-2 rounded-xl bg-red-500/20 text-red-300 text-center font-bold text-xs border border-red-500/30">
                      ✕ Boleta Rechazada
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleApproveSlip(client.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Validar en Banca & Activar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectSlip(client.id)}
                        className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards: Active, Pending, Inactive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          onClick={() => setFilterStatus('all')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Clientes Registrados</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{clients.length}</div>
          <span className="text-[10px] text-slate-500">Base total de cuentas</span>
        </div>

        <div 
          onClick={() => setFilterStatus('activo')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'activo'
              ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Clientes Activos (Con Acceso & Bot)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</div>
          <span className="text-[10px] text-emerald-300/80">Pagos validados y bot operando</span>
        </div>

        <div 
          onClick={() => setFilterStatus('pendiente_verificacion')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'pendiente_verificacion'
              ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Por Activar / Pago por Confirmar</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-amber-300/80">Requiere aprobación de Ingeniero AI</span>
        </div>
      </div>

      {/* Security Rule Warning */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 flex items-start gap-3 text-xs">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300 block">
            Regla de Seguridad de Negocio Activada:
          </span>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Los clientes nuevos o en verificación <strong>NO reciben acceso automático</strong> hasta que el administrador verifique que el pago cayó efectivamente en:
            <span className="text-emerald-400 font-semibold ml-1">Banco Industrial (1402158)</span>, 
            <span className="text-emerald-400 font-semibold ml-1">BAM (4030437443)</span> o 
            <span className="text-blue-400 font-semibold ml-1">PayPal (andersonwiliam637@gmail.com)</span>.
            Usa los interruptores de cada tarjeta para aprobar el pago y encender el bot de WhatsApp.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono o empresa..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pendiente_verificacion')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'pendiente_verificacion'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('activo')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'activo'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Activos ({activeCount})
          </button>
        </div>
      </div>

      {/* Clients Management Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredClients.map((client) => {
          const isActivo = client.activationStatus === 'activo';
          const isPendiente = (client.activationStatus || 'pendiente_verificacion') === 'pendiente_verificacion';
          const isPagoConfirmado = Boolean(client.paymentConfirmed);
          const isBotOn = Boolean(client.botEnabled ?? isActivo);
          const cleanPhone = getCleanPhone(client.phone);

          return (
            <div
              key={client.id}
              className={`p-4 lg:p-5 rounded-3xl border transition-all ${
                isActivo
                  ? 'bg-slate-900/60 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                  : isPendiente
                  ? 'bg-slate-900/80 border-amber-500/30 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-900/40 border-slate-800 opacity-75'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Customer Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-slate-700"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                        isActivo ? 'bg-emerald-400' : isPendiente ? 'bg-amber-400' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-white truncate">
                        {client.name}
                      </h3>
                      {client.stage === 'vip' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          VIP
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActivo
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isPendiente
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isActivo ? '● Acceso Activo' : isPendiente ? '⏳ Esperando Verificación' : '○ Inactivo'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                      <span>{client.company}</span>
                      <span>•</span>
                      <span>{client.email}</span>
                    </div>

                    {/* Phone and direct WhatsApp Web link */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-mono text-xs text-emerald-400 font-semibold">
                        {client.phone}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopy(client.phone)}
                        className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700"
                      >
                        {copiedPhone === client.phone ? '✓ Copiado' : 'Copiar'}
                      </button>

                      {/* Direct WhatsApp linking button */}
                      <a
                        href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(client.name)},%20te%20saluda%20Anderson%20William%20(Ingeniero%20AI)%20de%20ConversaGT.`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-all"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Abrir en WhatsApp</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right: Controls for Ingeniero AI */}
                <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Payment Confirmation Toggle */}
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Pago Real Verificado
                      </span>
                      <span className={`text-xs font-bold ${isPagoConfirmado ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isPagoConfirmado ? '✓ Verificado en Banco/PayPal' : '⚠️ Sin confirmar'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onTogglePaymentConfirmed && onTogglePaymentConfirmed(client.id, !isPagoConfirmado)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        isPagoConfirmado
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isPagoConfirmado ? <Check className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                      <span>{isPagoConfirmado ? 'Confirmado' : 'Validar Pago'}</span>
                    </button>
                  </div>

                  {/* WhatsApp Bot Toggle */}
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Bot Gemini 24/7
                      </span>
                      <span className={`text-xs font-bold ${isBotOn ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isBotOn ? '● Respondiendo' : '○ Apagado'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleBotEnabled && onToggleBotEnabled(client.id, !isBotOn)}
                      className={`p-1.5 rounded-xl border transition-all ${
                        isBotOn
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Activation / Deactivation Button */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!isActivo ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleClientActivation) onToggleClientActivation(client.id, 'activo');
                          if (onTogglePaymentConfirmed) onTogglePaymentConfirmed(client.id, true);
                          if (onToggleBotEnabled) onToggleBotEnabled(client.id, true);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Activar Servicio al Usuario</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleClientActivation) onToggleClientActivation(client.id, 'pendiente_verificacion');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                      >
                        Pausar Servicio
                      </button>
                    )}

                    <a
                      href={`https://wa.me/${getCleanPhone(client.phone)}?text=${encodeURIComponent(
                        `¡Hola ${client.name}! 👋 Te saluda Anderson William (Ingeniero AI) de ConversaGT.\n\n` +
                        (isActivo
                          ? `✅ Confirmamos que tu pago ha sido validado en la banca y tu plan "${client.selectedPlan || 'Plan Business'}" ha sido ACTIVADO con éxito. Tus bots de WhatsApp y Telegram están respondiendo 24/7.`
                          : `⏳ Hemos recibido tu solicitud para "${client.company}". Por favor envíame la fotografía de tu boleta a Banco Industrial (1402158) o BAM (4030437443) para activar tu servicio.`)
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
                      title="Notificar activación por WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    {onOpenChatWithClient && (
                      <button
                        type="button"
                        onClick={() => onOpenChatWithClient(client.id)}
                        className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                        title="Ver chat del cliente"
                      >
                        <Bot className="w-4 h-4 text-purple-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
