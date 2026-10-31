import React, { useState } from 'react';
import {
  FileText,
  Download,
  Send,
  X,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Building2,
  Phone,
  CreditCard,
  Share2
} from 'lucide-react';

interface QuotationPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerName?: string;
  defaultCustomerPhone?: string;
}

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export const QuotationPdfModal: React.FC<QuotationPdfModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerName = 'Constructora Los Altos, S.A.',
  defaultCustomerPhone = '+502 5415-4016'
}) => {
  const [companyName, setCompanyName] = useState('ConversaGT Soluciones Tecnológicas, S.A.');
  const [companyNit, setCompanyNit] = useState('10293848-1');
  const [companyPhone, setCompanyPhone] = useState('+502 5415-4016');
  const [clientName, setClientName] = useState(defaultCustomerName);
  const [clientNit, setClientNit] = useState('CF / Consumidor Final');
  const [clientPhone, setClientPhone] = useState(defaultCustomerPhone);
  const [quoteNumber, setQuoteNumber] = useState(`COT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [currency, setCurrency] = useState<'GTQ' | 'USD'>('GTQ');
  
  const [items, setItems] = useState<QuotationItem[]>([
    { description: 'Cemento Progreso Especial 50kg (Sacos)', quantity: 50, unitPrice: 82.00 },
    { description: 'Varilla de Hierro Corrugado 3/8" Grado 40 (Tiras 6m)', quantity: 100, unitPrice: 48.50 },
    { description: 'Flete Express con Descarga Perímetro Ciudad de Guatemala', quantity: 1, unitPrice: 250.00 }
  ]);

  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const iva = subtotal * 0.12;
  const total = subtotal; // Assuming gross includes IVA or subtotal + iva

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: 'Nuevo Producto / Servicio', quantity: 1, unitPrice: 100 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof QuotationItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppLink = () => {
    const text = `📄 *COTIZACIÓN FORMAL ${quoteNumber}*\n` +
      `🏢 Empresa: *${companyName}*\n` +
      `👤 Cliente: *${clientName}*\n\n` +
      `*DETALLE:*\n` +
      items.map(it => `• ${it.quantity}x ${it.description} = ${currency === 'GTQ' ? 'Q' : '$'}${(it.quantity * it.unitPrice).toFixed(2)}`).join('\n') +
      `\n\n*TOTAL A PAGAR: ${currency === 'GTQ' ? 'Q' : '$'}${total.toFixed(2)}*\n\n` +
      `💳 *Cuentas Bancarias para Depósito:*\n` +
      `• Banco Industrial (Ahorro): 1402158\n` +
      `• BAM Agromercantil (Ahorro): 4030437443\n` +
      `• Titular: Anderson William\n` +
      `• PayPal / Tarjetas: andersonwiliam637@gmail.com\n\n` +
      `Favor enviar comprobante para coordinar entrega.`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 my-8 space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Generador de Cotizaciones PDF & WhatsApp
              </h3>
              <p className="text-xs text-slate-400">
                Genera proformas oficiales con IVA y cuentas bancarias listas para cerrar ventas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable / Editable Quotation Sheet Preview */}
        <div id="quotation-print-area" className="p-6 rounded-2xl bg-white text-slate-900 shadow-inner space-y-4 text-xs">
          {/* Proforma Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
                {companyName}
              </h2>
              <p className="text-[11px] text-slate-600">NIT: {companyNit} • Tel: {companyPhone}</p>
              <p className="text-[11px] text-slate-600">Ciudad de Guatemala, Guatemala</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="px-3 py-1 rounded bg-slate-900 text-white font-bold text-xs uppercase tracking-wider block sm:inline-block">
                COTIZACIÓN FORMAL
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">{quoteNumber}</p>
              <p className="text-[11px] text-slate-500">Válida por 15 días</p>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-100 text-[11px]">
            <div>
              <span className="font-bold text-slate-500 block uppercase">CLIENTE:</span>
              <p className="font-bold text-slate-900 text-xs">{clientName}</p>
              <p className="text-slate-600">NIT: {clientNit}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase">CONTACTO WHATSAPP:</span>
              <p className="font-mono text-slate-900 font-semibold">{clientPhone}</p>
              <p className="text-slate-600">Atendido por: Asistente IA / Asesor Comercial</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600 uppercase font-bold">
                  <th className="py-1.5 w-16">Cant.</th>
                  <th className="py-1.5">Descripción del Producto / Servicio</th>
                  <th className="py-1.5 text-right w-24">Precio Unit.</th>
                  <th className="py-1.5 text-right w-24">Subtotal</th>
                  <th className="py-1.5 text-center w-10 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1.5">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value))}
                        className="w-12 p-1 border rounded text-center print:border-none print:p-0 font-bold"
                      />
                    </td>
                    <td className="py-1.5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                        className="w-full p-1 border rounded print:border-none print:p-0 font-medium"
                      />
                    </td>
                    <td className="py-1.5 text-right">
                      <input
                        type="number"
                        step="0.5"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(index, 'unitPrice', Number(e.target.value))}
                        className="w-20 p-1 border rounded text-right print:border-none print:p-0 font-mono"
                      />
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                      {currency === 'GTQ' ? 'Q' : '$'}{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-1.5 text-center print:hidden">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="py-1 px-2.5 rounded-lg border border-dashed border-slate-400 text-slate-600 hover:text-slate-900 hover:border-slate-600 text-[11px] font-semibold flex items-center gap-1 print:hidden"
          >
            <Plus className="w-3 h-3" />
            <span>+ Agregar Producto</span>
          </button>

          {/* Totals & Bank Accounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t-2 border-slate-900">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] space-y-1 text-slate-700">
              <span className="font-bold text-emerald-900 block text-[11px]">
                💳 Cuentas para Transferencia Bancaria Directa:
              </span>
              <p>• <strong>Banco Industrial (Ahorro):</strong> 1402158</p>
              <p>• <strong>BAM Agromercantil (Ahorro):</strong> 4030437443</p>
              <p>• <strong>Titular:</strong> Anderson William</p>
              <p>• <strong>PayPal / Tarjeta:</strong> andersonwiliam637@gmail.com</p>
            </div>

            <div className="space-y-1 text-right text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{currency === 'GTQ' ? 'Q' : '$'}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA 12% Incluido:</span>
                <span className="font-mono">{currency === 'GTQ' ? 'Q' : '$'}{iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-1 border-t border-slate-300">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-emerald-700">{currency === 'GTQ' ? 'Q' : '$'}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {copiedNotification ? (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Texto formateado copiado al portapapeles! Listo para pegar en WhatsApp.</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs">
              Lista para imprimir en PDF o compartir por WhatsApp con tu cliente.
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendWhatsAppLink}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Copiar para WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
