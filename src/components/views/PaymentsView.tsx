import React, { useState } from 'react';
import {
  PaymentGatewayConfig,
  BankAccountInfo,
  TransactionRecord
} from '../../types';
import {
  CreditCard,
  Building2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Lock,
  Zap,
  TrendingUp,
  Receipt,
  FileText,
  AlertCircle,
  Eye,
  Sliders,
  Globe,
  Sparkles
} from 'lucide-react';

interface PaymentsViewProps {
  paymentConfig: PaymentGatewayConfig;
  transactions: TransactionRecord[];
  onUpdatePaymentConfig: (newConfig: PaymentGatewayConfig) => void;
  onOpenCheckoutModal: (planOrItem?: string, amount?: number) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  paymentConfig,
  transactions,
  onUpdatePaymentConfig,
  onOpenCheckoutModal,
}) => {
  const [activeTab, setActiveTab] = useState<'gateways' | 'banks' | 'link_generator' | 'ledger'>('gateways');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Link Builder State
  const [linkCustomer, setLinkCustomer] = useState('Cliente Corporativo');
  const [linkAmount, setLinkAmount] = useState('2299.00');
  const [linkCurrency, setLinkCurrency] = useState<'GTQ' | 'USD' | 'EUR'>('GTQ');
  const [linkConcept, setLinkConcept] = useState('Suscripción Plan Platinum Anual ConversaGT');
  const [generatedLinkUrl, setGeneratedLinkUrl] = useState('https://conversagt.com/pay/checkout-vip-gt-99201');

  // Add Bank Modal State
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankCountry, setBankCountry] = useState('Guatemala');
  const [bankCurrency, setBankCurrency] = useState<'USD' | 'GTQ' | 'EUR' | 'MXN'>('GTQ');
  const [accountType, setAccountType] = useState<'Monetaria' | 'Ahorro' | 'Checking'>('Monetaria');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('ConversaGT Soluciones Tecnológicas, S.A.');
  const [taxId, setTaxId] = useState('10293848-1');
  const [swiftBic, setSwiftBic] = useState('');
  const [instructions, setInstructions] = useState('');

  const totalCollected = transactions
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleCopyBank = (bank: BankAccountInfo) => {
    const text = `🏦 DATOS BANCARIOS OFICIALES PARA TRANSFERENCIA:
Banco: ${bank.bankName} (${bank.country})
Moneda: ${bank.currency}
Tipo de Cuenta: ${bank.accountType}
No. de Cuenta: ${bank.accountNumber}
Beneficiario: ${bank.accountHolder}
NIT / Tax ID: ${bank.taxId}
SWIFT/BIC: ${bank.swiftBic || 'N/A'}
Instrucciones: ${bank.instructions}`;

    navigator.clipboard.writeText(text);
    setCopiedBankId(bank.id);
    setTimeout(() => setCopiedBankId(null), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleGateway = (type: 'card' | 'paypal' | 'bankTransfer') => {
    const updated = {
      ...paymentConfig,
      [type]: {
        ...paymentConfig[type],
        enabled: !paymentConfig[type].enabled,
      },
    };
    onUpdatePaymentConfig(updated);
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber) return;

    const newBank: BankAccountInfo = {
      id: `bank-${Date.now()}`,
      bankName,
      country: bankCountry,
      currency: bankCurrency,
      accountType,
      accountNumber,
      accountHolder,
      taxId,
      swiftBic,
      instructions: instructions || 'Enviar comprobante digital de pago para acreditación inmediata.',
      activeForCheckout: true,
    };

    const updated = {
      ...paymentConfig,
      bankTransfer: {
        ...paymentConfig.bankTransfer,
        banks: [...paymentConfig.bankTransfer.banks, newBank],
      },
    };

    onUpdatePaymentConfig(updated);
    setShowAddBankModal(false);
    setBankName('');
    setAccountNumber('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Pasarelas de Pago & Suscripciones Oficiales</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Planes adaptados para Guatemala (GTQ) y LATAM (USD) con Facturación SAT DTE, Banco Industrial, BAM, Tarjeta y PayPal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCheckoutModal('Plan Platinum Enterprise Anual', 2299.00)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Zap className="w-4 h-4" />
          <span>Abrir Pasarela de Pago</span>
        </button>
      </div>

      {/* 3 Official Pricing Plans Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tarifario de Suscripción Oficial (3 Planes Disponibles)</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">
            Factura SAT DTE / FEL incluida
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan 1: Emprendedor */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-white text-sm">Plan Emprendedor</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Básico
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                Q 350.00 <span className="text-xs text-slate-400 font-normal">/ mes</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mb-3">
                ($45.00 USD / mes aprox.)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 mb-4 border-t border-slate-800/80 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1 Agente de Atención</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Bot IA Gemini 24/7 en WhatsApp</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Depósito a Banco Industrial / BAM</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onOpenCheckoutModal('Plan Emprendedor (1 Agente + Bot IA)', 350.00)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cobrar / Contratar (Q350)</span>
            </button>
          </div>

          {/* Plan 2: Business Pro */}
          <div className="p-5 rounded-2xl bg-blue-950/20 border-2 border-blue-500/40 hover:border-blue-500/70 transition-all flex flex-col justify-between relative shadow-lg shadow-blue-950/50">
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-blue-500 text-slate-950 text-[10px] font-extrabold shadow-sm">
              ★ MÁS VENDIDO
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-white text-sm">Plan Business Pro</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Recomendado
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                Q 750.00 <span className="text-xs text-slate-400 font-normal">/ mes</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mb-3">
                ($95.00 USD / mes aprox.)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 mb-4 border-t border-slate-800/80 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>3 Agentes Simultáneos</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Motor RAG (Carga de PDFs y Precios)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Campañas y Difusión Masiva WhatsApp</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Pasarelas Tarjeta, PayPal y Bancos</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onOpenCheckoutModal('Plan Business Pro (3 Agentes + RAG Docs)', 750.00)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <CreditCard className="w-3.5 h-3.5 text-white" />
              <span>Cobrar / Contratar (Q750)</span>
            </button>
          </div>

          {/* Plan 3: Platinum Enterprise */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/50 hover:border-emerald-500 transition-all flex flex-col justify-between relative shadow-lg shadow-emerald-950/50">
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold shadow-sm">
              AHORRO 25% ANUAL
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-white text-sm">Platinum Enterprise</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Empresarial
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                Q 2,299.00 <span className="text-xs text-slate-400 font-normal">/ año</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mb-3">
                ($295.00 USD / año aprox.)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 mb-4 border-t border-slate-800/80 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Agentes Ilimitados para tu Empresa</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Facturación Electrónica SAT DTE / FEL</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cuentas BI y BAM activas</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Soporte Prioritario & SLA 99.9%</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onOpenCheckoutModal('Plan Platinum Enterprise Anual', 2299.00)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Cobrar / Contratar (Q2,299)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl luxury-glass border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Volumen Total Cobrado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>100% Conciliado con SAT / DTE</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pasarelas Activas</span>
            <Lock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">3 Métodos</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tarjetas • PayPal • 3 Bancos
          </div>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Seguridad Transaccional</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300">PCI-DSS L1</div>
          <div className="text-[11px] text-purple-400 mt-1">
            Tokenización TLS 256-bit
          </div>
        </div>

        <div className="p-4 rounded-2xl luxury-glass border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Transacciones Exitosas</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{transactions.length} Operaciones</div>
          <div className="text-[11px] text-slate-400 mt-1">
            0 Contracargos registrados
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'gateways'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Pasarelas (Tarjetas & PayPal)</span>
        </button>

        <button
          onClick={() => setActiveTab('banks')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'banks'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. Cuentas Bancarias Monetarias ({paymentConfig.bankTransfer.banks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('link_generator')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'link_generator'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>3. Generador de Enlaces de Pago</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>4. Historial de Transacciones</span>
        </button>
      </div>

      {/* Tab 1: Gateways Setup */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Gateway */}
          <div className="p-6 rounded-3xl luxury-glass border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Tarjetas de Crédito & Débito</h3>
                  <p className="text-xs text-slate-400">Procesamiento directo con 3D Secure 2.0 y tokenización</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentConfig.card.enabled}
                  onChange={() => handleToggleGateway('card')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Proveedor de Conexión:</span>
                <span className="font-bold text-emerald-400">Stripe / Cybersource Enterprise</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Modo de Operación:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                  ● PRODUCCIÓN (LIVE)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Franquicias Aceptadas:</span>
                <span className="font-mono text-slate-200">Visa, Mastercard, Amex, Diners</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Todos los cargos con tarjeta están respaldados por autenticación multifactor bancaria y seguro contra fraudes.
              </span>
            </div>
          </div>

          {/* PayPal Gateway */}
          <div className="p-6 rounded-3xl luxury-glass border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-xl">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">PayPal & Tarjeta Internacional</h3>
                  <p className="text-xs text-slate-400">Cobros con saldo PayPal y pagos directos con Tarjeta Visa/Mastercard</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentConfig.paypal.enabled}
                  onChange={() => handleToggleGateway('paypal')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Cuenta Receptora Oficial:</span>
                <span className="font-mono text-blue-300 font-bold">andersonwiliam637@gmail.com</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Pago con Tarjeta sin cuenta:</span>
                <span className="text-emerald-400 font-bold">Habilitado (Guest Card Checkout)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Depósito Instantáneo:</span>
                <span className="text-emerald-400 font-bold">Activo (Instant Payouts)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Cobro con Tarjeta por PayPal a andersonwiliam637@gmail.com</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Los clientes pueden elegir pagar con su tarjeta de crédito o débito a través de PayPal sin necesidad de iniciar sesión ni crear cuenta.
              </p>
            </div>

            <a
              href="https://www.paypal.com/paypalme/andersonwiliam637"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Abrir PayPal.Me (andersonwiliam637)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Tab 2: Bank Accounts Configuration */}
      {activeTab === 'banks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Cuentas Monetarias Oficiales de la Empresa</span>
              </h2>
              <p className="text-xs text-slate-400">
                Estas cuentas se muestran a los clientes al seleccionar 'Transferencia Bancaria' en el checkout o en WhatsApp.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddBankModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Cuenta Bancaria</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentConfig.bankTransfer.banks.map((bank) => (
              <div
                key={bank.id}
                className="p-6 rounded-3xl luxury-glass border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        {bank.currency} • {bank.accountType}
                      </span>
                      <h3 className="font-bold text-base text-white mt-1.5">{bank.bankName}</h3>
                      <p className="text-xs text-slate-400">{bank.country}</p>
                    </div>

                    <span className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Número de Cuenta:</span>
                      <span className="font-bold text-emerald-400 text-sm tracking-wide">
                        {bank.accountNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Beneficiario:</span>
                      <span className="text-slate-200 text-[11px] truncate block">{bank.accountHolder}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 block">NIT / Tax ID:</span>
                        <span className="text-slate-300 text-[11px]">{bank.taxId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">SWIFT/BIC:</span>
                        <span className="text-slate-300 text-[11px]">{bank.swiftBic || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    "{bank.instructions}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Activa para Checkout</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyBank(bank)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiedBankId === bank.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Datos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Payment Link Generator */}
      {activeTab === 'link_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl luxury-glass border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span>Generador de Link de Pago & Facturación</span>
            </h2>
            <p className="text-xs text-slate-400">
              Genera una pasarela temporal cifrada para enviar a tu cliente por WhatsApp o correo.
            </p>

            <div className="space-y-3 text-xs">
              {/* Presets Guatemala */}
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  Planes Recomendados para Guatemala:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkConcept('Plan Emprendedor (1 Agente + Bot IA)');
                      setLinkAmount('350.00');
                      setLinkCurrency('GTQ');
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all"
                  >
                    <div className="font-bold text-white text-[11px]">Emprendedor</div>
                    <div className="text-emerald-400 font-mono text-[10px]">Q350 / mes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkConcept('Plan Business Pro (3 Agentes + RAG)');
                      setLinkAmount('750.00');
                      setLinkCurrency('GTQ');
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all"
                  >
                    <div className="font-bold text-white text-[11px]">Business Pro</div>
                    <div className="text-emerald-400 font-mono text-[10px]">Q750 / mes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkConcept('Plan Platinum Enterprise Anual');
                      setLinkAmount('2299.00');
                      setLinkCurrency('GTQ');
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all"
                  >
                    <div className="font-bold text-emerald-300 text-[11px]">Platinum Anual</div>
                    <div className="text-emerald-400 font-mono text-[10px]">Q2,299 / año</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nombre del Cliente / Empresa</label>
                <input
                  type="text"
                  value={linkCustomer}
                  onChange={(e) => setLinkCustomer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Monto a Cobrar</label>
                  <input
                    type="number"
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Moneda</label>
                  <select
                    value={linkCurrency}
                    onChange={(e) => setLinkCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  >
                    <option value="GTQ">GTQ (Q Quetzales)</option>
                    <option value="USD">USD ($ Dólares)</option>
                    <option value="EUR">EUR (€ Euros)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Concepto / Plan</label>
                <input
                  type="text"
                  value={linkConcept}
                  onChange={(e) => setLinkConcept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const randomCode = Math.random().toString(36).substring(2, 8);
                  setGeneratedLinkUrl(`https://conversagt.com/pay/${linkCustomer.toLowerCase().replace(/\s+/g, '-')}-${randomCode}`);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
              >
                Generar Enlace Único
              </button>
            </div>
          </div>

          {/* Generated Card Preview */}
          <div className="p-6 rounded-3xl luxury-glass border border-emerald-500/30 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LINK DE PAGO ACTIVO
                </span>
                <span className="text-xs text-slate-400 font-mono">Expira en 48 hrs</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
                <span className="text-xs text-slate-400 block">{linkConcept}</span>
                <div className="text-3xl font-extrabold text-white">
                  {linkCurrency === 'GTQ' ? `Q ${parseFloat(linkAmount || '0').toLocaleString('es-GT', { minimumFractionDigits: 2 })} GTQ` : `$ ${parseFloat(linkAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {linkCurrency === 'GTQ' ? `(Aprox. $${(parseFloat(linkAmount || '0') / 7.80).toFixed(2)} USD)` : `(Aprox. Q${(parseFloat(linkAmount || '0') * 7.80).toFixed(2)} GTQ)`}
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Cliente: {linkCustomer}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-300 truncate">{generatedLinkUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenCheckoutModal(linkConcept, parseFloat(linkAmount || '2299'))}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Pasarela de Pago del Cliente</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Transactions Ledger */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-3xl luxury-glass border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Registro Contable de Cobros & Facturas SAT</span>
            </h2>
            <span className="text-xs text-slate-400">{transactions.length} Registros Oficiales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Factura DTE</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Concepto</th>
                  <th className="py-3 px-3">Monto</th>
                  <th className="py-3 px-3">Método</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {tx.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{tx.customerName}</div>
                      <div className="text-[10px] text-slate-500">{tx.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{tx.planOrItem}</td>
                    <td className="py-3 px-3 font-extrabold text-white">
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-[11px]">
                        {tx.method === 'bank_transfer'
                          ? '🏦 Banco Industrial/BAC'
                          : tx.method === 'paypal'
                          ? '🅿️ PayPal'
                          : '💳 Tarjeta 3DS'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✓ Liquidado
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Registrar Nueva Cuenta Bancaria</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddBankModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBankAccount} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre del Banco *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ej. Banco Industrial, S.A."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">País</label>
                  <input
                    type="text"
                    value={bankCountry}
                    onChange={(e) => setBankCountry(e.target.value)}
                    placeholder="Guatemala"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Moneda de la Cuenta</label>
                  <select
                    value={bankCurrency}
                    onChange={(e: any) => setBankCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  >
                    <option value="GTQ">GTQ (Quetzales)</option>
                    <option value="USD">USD (Dólares)</option>
                    <option value="EUR">EUR (Euros)</option>
                    <option value="MXN">MXN (Pesos Mexicanos)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tipo de Cuenta</label>
                  <select
                    value={accountType}
                    onChange={(e: any) => setAccountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  >
                    <option value="Monetaria">Monetaria / Corriente</option>
                    <option value="Ahorro">Ahorro</option>
                    <option value="Checking">Checking (USA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Número de Cuenta Bancaria *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="004-XXXXXX-X"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre del Titular</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">NIT o Tax ID</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Código SWIFT / BIC (Opcional)</label>
                <input
                  type="text"
                  value={swiftBic}
                  onChange={(e) => setSwiftBic(e.target.value)}
                  placeholder="BINDGTGC"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Instrucciones para el Pagador</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instrucciones al cliente al transferir..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
