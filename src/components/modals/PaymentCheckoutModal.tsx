import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Download,
  AlertCircle,
  Loader2,
  ExternalLink,
  Receipt,
  FileCheck,
  Phone
} from 'lucide-react';
import { BankAccountInfo } from '../../types';
import { processPaymentTransaction } from '../../services/geminiService';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planOrItem: string;
  amount: number;
  currency?: 'GTQ' | 'USD';
  customerName?: string;
  customerEmail?: string;
  banks: BankAccountInfo[];
  onPaymentSuccess?: (transaction: any) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  planOrItem,
  amount: initialAmount,
  currency: initialCurrency = 'GTQ',
  customerName = 'Ing. Marco Antonio Ruiz',
  customerEmail = 'marco.ruiz@corporaciongt.com',
  banks,
  onPaymentSuccess,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'emprendedor' | 'business' | 'platinum' | 'custom'>('platinum');
  const [currentPlanName, setCurrentPlanName] = useState(planOrItem || 'Plan Platinum Enterprise Anual');
  const [currentAmount, setCurrentAmount] = useState<number>(initialAmount || 2299.00);
  const [currentCurrency, setCurrentCurrency] = useState<'GTQ' | 'USD'>(initialCurrency);

  const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal' | 'bank_transfer'>('bank_transfer');
  const [selectedBankId, setSelectedBankId] = useState<string>(banks[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<any>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState(customerName);

  // Bank Transfer receipt state
  const [bankRefCode, setBankRefCode] = useState('');
  const [bankValidationErr, setBankValidationErr] = useState<string | null>(null);
  const [hasSentNotification, setHasSentNotification] = useState(false);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'emprendedor' as const,
      name: 'Plan Emprendedor',
      subtitle: '1 Agente + Bot IA 24/7',
      priceGTQ: 350.00,
      priceUSD: 45.00,
      period: '/ mes',
      badge: 'Básico',
      color: 'border-slate-800 hover:border-slate-700'
    },
    {
      id: 'business' as const,
      name: 'Plan Business Pro',
      subtitle: '3 Agentes + RAG Docs + Campañas',
      priceGTQ: 750.00,
      priceUSD: 95.00,
      period: '/ mes',
      badge: '★ Más Popular',
      color: 'border-blue-500/40 bg-blue-950/20'
    },
    {
      id: 'platinum' as const,
      name: 'Platinum Enterprise',
      subtitle: 'Agentes Ilimitados + SAT DTE FEL',
      priceGTQ: 2299.00,
      priceUSD: 295.00,
      period: '/ año',
      badge: 'Ahorro 25%',
      color: 'border-emerald-500/50 bg-emerald-950/20'
    }
  ];

  const handleSelectPlan = (planId: 'emprendedor' | 'business' | 'platinum') => {
    setSelectedPlanId(planId);
    const target = plans.find(p => p.id === planId);
    if (target) {
      setCurrentPlanName(`${target.name} ${target.period}`);
      setCurrentAmount(currentCurrency === 'GTQ' ? target.priceGTQ : target.priceUSD);
    }
  };

  const handleToggleCurrency = (newCurrency: 'GTQ' | 'USD') => {
    setCurrentCurrency(newCurrency);
    if (selectedPlanId !== 'custom') {
      const target = plans.find(p => p.id === selectedPlanId);
      if (target) {
        setCurrentAmount(newCurrency === 'GTQ' ? target.priceGTQ : target.priceUSD);
      }
    } else {
      if (newCurrency === 'USD') {
        setCurrentAmount(parseFloat((currentAmount / 7.80).toFixed(2)));
      } else {
        setCurrentAmount(parseFloat((currentAmount * 7.80).toFixed(2)));
      }
    }
  };

  const activeBank = banks.find((b) => b.id === selectedBankId) || banks[0];

  const handleCopyBankDetails = () => {
    if (!activeBank) return;
    const info = `BANCO: ${activeBank.bankName}
CUENTA: ${activeBank.accountNumber} (${activeBank.currency} ${activeBank.accountType})
TITULAR: ${activeBank.accountHolder}
NIT: ${activeBank.taxId}
MONTO: ${currentCurrency === 'GTQ' ? `Q ${currentAmount.toFixed(2)}` : `$ ${currentAmount.toFixed(2)} USD`}
PLAN: ${currentPlanName}
REF DE PAGO: CONVERSAGT-${Date.now().toString().slice(-5)}`;
    navigator.clipboard.writeText(info);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleExecutePayment = async () => {
    setBankValidationErr(null);
    if (selectedMethod === 'bank_transfer') {
      if (!bankRefCode.trim() || bankRefCode.trim().length < 4) {
        setBankValidationErr('⚠️ Obligatorio: Ingresa el número de boleta o autorización bancaria (mínimo 4 caracteres).');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const details =
        selectedMethod === 'card'
          ? { brand: 'Visa Platinum 3DS', last4: '4242' }
          : selectedMethod === 'paypal'
          ? { paypalAccount: customerEmail, orderId: `PAYPAL-${Date.now()}` }
          : { bankName: activeBank?.bankName, accountNumber: activeBank?.accountNumber, refCode: bankRefCode.trim() };

      const res = await processPaymentTransaction(
        customerName,
        customerEmail,
        currentAmount,
        currentCurrency,
        selectedMethod,
        currentPlanName,
        details
      );

      if (res.success) {
        setInvoiceResult(res.transaction);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.transaction);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const formattedAmount =
    currentCurrency === 'GTQ'
      ? `Q ${currentAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })} GTQ`
      : `$ ${currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;

  const conversionNote =
    currentCurrency === 'GTQ'
      ? `(Aprox. $${(currentAmount / 7.80).toFixed(2)} USD)`
      : `(Aprox. Q${(currentAmount * 7.80).toFixed(2)} GTQ)`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-2xl space-y-5 my-auto max-h-[96vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {!invoiceResult ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Pasarela de Pago & Suscripciones ConversaGT
                  </h2>
                  <p className="text-xs text-slate-400">
                    Facturación Electrónica SAT (DTE / FEL) • Cuentas BI y BAM Guatemala
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 text-sm rounded-lg hover:bg-slate-900"
              >
                ✕
              </button>
            </div>

            {/* 1. Interactive 3-Plan Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  1. Selecciona el Plan deseado:
                </label>
                {/* Currency Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggleCurrency('GTQ')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                      currentCurrency === 'GTQ'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🇬🇹 Quetzales (Q)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCurrency('USD')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                      currentCurrency === 'USD'
                        ? 'bg-blue-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🇺🇸 Dólares ($)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  const price = currentCurrency === 'GTQ' ? `Q${p.priceGTQ}` : `$${p.priceUSD}`;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPlan(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-lg'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {p.badge}
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-emerald-400">
                        {price} <span className="text-[10px] text-slate-400 font-normal">{p.period}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{p.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Pill */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Plan Seleccionado:</span>
                <span className="font-bold text-white text-xs sm:text-sm">{currentPlanName}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">Cliente: {customerName} ({customerEmail})</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Monto Total:</span>
                <span className="font-extrabold text-emerald-400 text-lg sm:text-xl block">
                  {formattedAmount}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {conversionNote}
                </span>
              </div>
            </div>

            {/* Method Select Tabs */}
            <div className="space-y-2">
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                2. Selecciona tu Método de Pago:
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bank_transfer')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedMethod === 'bank_transfer'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <span className="text-[11px] sm:text-xs">1. Bancos Guatemala (BI/BAM)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedMethod === 'card'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span className="text-[11px] sm:text-xs">2. Tarjeta (3D Secure)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('paypal')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedMethod === 'paypal'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base sm:text-lg font-black leading-none text-blue-400">P</span>
                  <span className="text-[11px] sm:text-xs">3. PayPal</span>
                </button>
              </div>
            </div>

            {/* Method Content */}
            {selectedMethod === 'card' && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-200">Tarjeta de Crédito o Débito</span>
                  <div className="flex gap-1.5 text-[10px] font-mono text-slate-400">
                    <span>VISA</span> • <span>MASTERCARD</span> • <span>AMEX</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nombre en la Tarjeta</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Vencimiento (MM/AA)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">CVV de Seguridad</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Option to pay with Card via PayPal directly */}
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">P</span>
                    <div>
                      <span className="text-white font-bold block">¿Pagar con Tarjeta vía PayPal?</span>
                      <span className="text-[10px] text-slate-400">Procesa tu Visa o Mastercard sin crear cuenta en PayPal</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('paypal')}
                    className="px-2.5 py-1 rounded-lg bg-blue-500 text-slate-950 font-bold text-[11px] hover:bg-blue-400 transition-all shrink-0"
                  >
                    Usar PayPal
                  </button>
                </div>
              </div>
            )}

            {selectedMethod === 'paypal' && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-black text-xl flex items-center justify-center">
                      P
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">PayPal & Pago con Tarjeta Internacional</h3>
                      <p className="text-slate-400 text-[11px]">
                        Acepta saldo PayPal y pagos directos con Tarjeta de Crédito/Débito.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Oficial Live
                  </span>
                </div>

                {/* Official PayPal Receiver Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-semibold">Cuenta Oficial de PayPal:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('andersonwiliam637@gmail.com');
                        alert('Correo de PayPal copiado: andersonwiliam637@gmail.com');
                      }}
                      className="text-blue-400 hover:text-blue-300 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar correo</span>
                    </button>
                  </div>
                  <div className="font-mono text-white text-xs font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span>andersonwiliam637@gmail.com</span>
                    <span className="text-[10px] text-emerald-400">Verificado</span>
                  </div>
                </div>

                {/* Direct Card via PayPal Notice */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Pago con Tarjeta Directo (Sin cuenta de PayPal)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Tu cliente puede seleccionar <strong className="text-white">"Pagar con tarjeta de débito o crédito"</strong> dentro de PayPal para pagar directamente con Visa o Mastercard a <strong className="text-white font-mono">andersonwiliam637@gmail.com</strong> sin necesidad de registrarse.
                  </p>
                </div>

                {/* External Checkout Link Button */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://www.paypal.com/paypalme/andersonwiliam637"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Abrir PayPal.Me Oficial (andersonwiliam637)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {selectedMethod === 'bank_transfer' && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Selecciona el Banco Monetario:</span>
                  <button
                    type="button"
                    onClick={handleCopyBankDetails}
                    className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    {copiedBank ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedBank ? 'Datos Copiados' : 'Copiar Cuentas'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {banks.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBankId(b.id)}
                      className={`p-3 rounded-xl cursor-pointer border transition-all ${
                        selectedBankId === b.id
                          ? 'bg-slate-950 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{b.bankName}</span>
                        <span className="text-[10px] text-emerald-400">{b.currency}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 mt-1">{b.accountNumber}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{b.accountType}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-slate-400 mb-1">
                    Número de Boleta o Referencia de Transferencia *
                  </label>
                  <input
                    type="text"
                    value={bankRefCode}
                    onChange={(e) => {
                      setBankRefCode(e.target.value);
                      if (bankValidationErr) setBankValidationErr(null);
                    }}
                    placeholder="Ej. 14029381 / BOLETA-981204"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {bankValidationErr && (
                    <div className="mt-2 p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{bankValidationErr}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    ⚠️ Nota de seguridad: La cuenta NO se activa de forma automática ni gratuita. Toda boleta es auditada en la banca en línea por Anderson William antes de activar el bot.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Transacción segura y encriptada</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{selectedMethod === 'bank_transfer' ? 'Registrando Boleta...' : 'Procesando y Facturando...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {selectedMethod === 'bank_transfer'
                          ? `Registrar Boleta ${formattedAmount}`
                          : `Confirmar y Pagar ${formattedAmount}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : invoiceResult.status === 'pending_verification' ? (
          /* Bank Deposit / Boleta Pending Admin Verification View */
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertCircle className="w-6 h-6" />
                <span className="text-base text-white">Boleta Registrada — En Espera de Verificación</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Anti-Fraud & Security Notice Box */}
            <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/40 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>ESTADO: PENDIENTE DE VALIDACIÓN (PLAN NO ACTIVO)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">{invoiceResult.date}</span>
              </div>

              <p className="text-slate-200 leading-relaxed">
                <strong className="text-amber-300">Aviso de Ciberseguridad:</strong> Tu comprobante bancario fue registrado con el código de referencia <span className="font-mono text-white font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{invoiceResult.authorizationCode}</span>.
                Para evitar uso fraudulento o no autorizado de la plataforma, <strong>tu plan y bots de WhatsApp/Telegram NO se activarán hasta que Anderson William confirme la acreditación de los fondos en la banca en línea de Banco Industrial o BAM</strong>.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Cliente:</span>
                  <span className="font-bold text-white">{invoiceResult.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Plan Solicitado:</span>
                  <span className="font-bold text-amber-300">{invoiceResult.planOrItem}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Banco Depositado:</span>
                  <span className="font-bold text-white">{invoiceResult.bankName || 'Banco Industrial / BAM'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Monto a Verificar:</span>
                  <span className="font-bold text-emerald-400">
                    {invoiceResult.currency === 'GTQ' ? `Q ${invoiceResult.amount.toFixed(2)} GTQ` : `$ ${invoiceResult.amount.toFixed(2)} USD`}
                  </span>
                </div>
              </div>
            </div>

            {/* Crucial WhatsApp Notification Action to Anderson William */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Paso 1 Obligatorio para Activar tu Cuenta</span>
                </span>
                {hasSentNotification ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Notificación Enviada</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold animate-pulse">
                    Paso Obligatorio
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Haz clic en el botón a continuación para enviar los datos de tu boleta por WhatsApp directamente a <strong>Anderson William (+502 54154016)</strong> para que revise su banca en línea y active tu cuenta de inmediato:
              </p>
              <a
                href={`https://wa.me/50254154016?text=${encodeURIComponent(
                  `🚨 *NOTIFICACIÓN DE BOLETA BANCARIA CONVERSAGT* 🚨\n\n` +
                  `👤 *Cliente:* ${invoiceResult.customerName}\n` +
                  `📧 *Correo:* ${invoiceResult.customerEmail}\n` +
                  `📦 *Plan Solicitado:* ${invoiceResult.planOrItem}\n` +
                  `💰 *Monto:* ${invoiceResult.currency === 'GTQ' ? 'Q ' : '$ '}${invoiceResult.amount.toFixed(2)} ${invoiceResult.currency}\n` +
                  `🏦 *Banco:* ${invoiceResult.bankName || 'Banco Industrial / BAM'}\n` +
                  `🧾 *No. Boleta / Referencia:* ${invoiceResult.authorizationCode}\n\n` +
                  `_Hola Anderson William, te adjunto la foto de mi boleta bancaria para que verifiques los fondos y actives mi plan en ConversaGT._`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setHasSentNotification(true)}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>1. Enviar Boleta por WhatsApp (+502 54154016) para Activación</span>
              </a>
            </div>

            {/* Warning if user didn't send WhatsApp */}
            {showWarningConfirm && !hasSentNotification && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-red-300 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>¿Ya enviaste tu boleta a Anderson William?</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Para evitar fraude, tu plan <strong>permanecerá en espera</strong> y tus bots no responderán hasta que Anderson confirme la boleta en Banco Industrial (1402158) o BAM (4030437443) y active tu servicio desde su panel administrativo.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <a
                    href={`https://wa.me/50254154016?text=${encodeURIComponent(
                      `🚨 *NOTIFICACIÓN DE BOLETA BANCARIA CONVERSAGT* 🚨\n\n` +
                      `👤 *Cliente:* ${invoiceResult.customerName}\n` +
                      `📦 *Plan:* ${invoiceResult.planOrItem}\n` +
                      `🧾 *No. Boleta:* ${invoiceResult.authorizationCode}\n` +
                      `_Hola Anderson William, te adjunto mi boleta para la activación de mi servicio._`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setHasSentNotification(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Enviar Ahora por WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cerrar de todos modos (Esperar en Cola)
                  </button>
                </div>
              </div>
            )}

            {/* Close / Acknowledge */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!hasSentNotification) {
                    setShowWarningConfirm(true);
                  } else {
                    onClose();
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                2. He Notificado a Anderson (Cerrar y Esperar Activación)
              </button>
            </div>
          </div>
        ) : (
          /* Electronic Invoice DTE SAT View */
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-base text-white">¡Pago Procesado y Facturado con Éxito!</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Tax Invoice Document Box */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-4 text-xs font-mono">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-sm font-extrabold text-white font-sans">
                    CONVERSAGT SOLUCIONES TECNOLÓGICAS, S.A.
                  </div>
                  <div className="text-[10px] text-slate-400">
                    NIT: 10293848-1 • Factura Electrónica SAT DTE
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Autorización: {invoiceResult.invoiceNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                    CERTIFICADO VÁLIDO
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">{invoiceResult.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Cliente Receptor:</span>
                  <span className="font-bold text-slate-200">{invoiceResult.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Correo Electrónico:</span>
                  <span className="text-slate-300">{invoiceResult.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Método de Pago:</span>
                  <span className="text-emerald-400 uppercase font-bold">{invoiceResult.method}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Código de Autorización:</span>
                  <span className="text-slate-200">{invoiceResult.authorizationCode}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between py-1 text-slate-300">
                  <span>{invoiceResult.planOrItem}</span>
                  <span className="font-bold">
                    {invoiceResult.currency === 'GTQ' ? `Q ${invoiceResult.amount.toFixed(2)} GTQ` : `$ ${invoiceResult.amount.toFixed(2)} USD`}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-400 text-[10px]">
                  <span>Impuestos incluidos (12% IVA SAT):</span>
                  <span>
                    {invoiceResult.currency === 'GTQ' ? `Q ${(invoiceResult.amount * 0.12).toFixed(2)} GTQ` : `$ ${(invoiceResult.amount * 0.12).toFixed(2)} USD`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-800 text-sm font-extrabold text-emerald-400">
                  <span>TOTAL PAGADO:</span>
                  <span>
                    {invoiceResult.currency === 'GTQ' ? `Q ${invoiceResult.amount.toFixed(2)} GTQ` : `$ ${invoiceResult.amount.toFixed(2)} USD`}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Notification to Anderson William (Ingeniero AI) */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Paso 1 Obligatorio: Notificación a Anderson William (+502 54154016)</span>
                </span>
                {hasSentNotification ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Notificación Enviada</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold animate-pulse">
                    Requerido para Activación
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Notifica tu pago directamente a Anderson William (Ingeniero AI) para que verifique y active tu bot de WhatsApp y Telegram desde su panel administrativo.
              </p>
              <a
                href={`https://wa.me/50254154016?text=${encodeURIComponent(
                  `🚨 *NOTIFICACIÓN DE PAGO CONVERSAGT* 🚨\n\n` +
                  `👤 *Cliente:* ${invoiceResult.customerName}\n` +
                  `📧 *Correo:* ${invoiceResult.customerEmail}\n` +
                  `📦 *Plan:* ${invoiceResult.planOrItem}\n` +
                  `💰 *Monto Pagado:* ${invoiceResult.currency === 'GTQ' ? 'Q ' : '$ '}${invoiceResult.amount.toFixed(2)} ${invoiceResult.currency}\n` +
                  `💳 *Método:* ${invoiceResult.method.toUpperCase()}\n` +
                  `🧾 *No. DTE / Factura:* ${invoiceResult.invoiceNumber}\n` +
                  `🔐 *Autorización:* ${invoiceResult.authorizationCode}\n\n` +
                  `_Hola Anderson William, adjunto comprobante para la activación de mi servicio._`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setHasSentNotification(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>1. Enviar Notificación a WhatsApp (+502 54154016) para Activación</span>
              </a>
            </div>

            {/* Warning if user didn't send WhatsApp */}
            {showWarningConfirm && !hasSentNotification && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-red-300 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>¿Ya le notificaste a Anderson William?</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Tu plan quedará pendiente de activación hasta que Anderson reciba tu mensaje y autorice el servicio en su panel administrativo.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Entendido, Cerrar y Esperar Activación
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePrintInvoice}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Factura DTE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!hasSentNotification) {
                    setShowWarningConfirm(true);
                  } else {
                    onClose();
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                2. He Notificado a Anderson (Cerrar y Esperar Activación)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
