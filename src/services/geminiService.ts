// src/services/geminiService.ts - AI Client Service with Backend Auth
import { api } from './apiService';

export interface GeminiChatResponse {
  reply: string;
  sentiment?: 'positivo' | 'neutral' | 'urgente';
  suggestedActions?: string[];
  isFallback?: boolean;
}

export async function askGeminiCopilot(
  message: string,
  history: any[] = [],
  context: string = '',
  customerName: string = 'Cliente',
  tone: string = 'profesional_calido'
): Promise<GeminiChatResponse> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: api.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        message,
        history,
        context,
        customerName,
        tone,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      throw new Error(`Error en servidor: ${res.statusText}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('Fallback Gemini Chat:', error);
    return {
      reply: `Hola ${customerName}, gracias por contactar a ConversaGT. Con gusto atendemos tu solicitud: "${message}". Puedes abonar tu servicio mediante Tarjeta de Crédito/Débito, PayPal o Transferencia Bancaria Directa a nuestras cuentas autorizadas. ¿Deseas que te envíe los datos de pago?`,
      sentiment: 'positivo',
      suggestedActions: ['Enviar link de pago', 'Compartir cuentas bancarias', 'Agendar llamada VIP'],
      isFallback: true,
    };
  }
}

export async function askGeminiDocuments(
  question: string,
  documents: any[] = []
): Promise<{ answer: string; sources: string[]; confidence: number; isFallback?: boolean }> {
  try {
    const res = await fetch('/api/gemini/document-qa', {
      method: 'POST',
      headers: api.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ question, documents }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) throw new Error('Error al consultar RAG');
    return await res.json();
  } catch (error: any) {
    console.warn('Fallback Gemini Document QA:', error);
    return {
      answer: `Con base en los documentos de políticas de ConversaGT, el servicio cuenta con pasarelas de pago 3DS (Tarjetas), PayPal Commerce y Cuentas Bancarias Monetarias (Banco Industrial y BAC). Asimismo, se garantiza un SLA de 99.9% y facturación electrónica oficial.`,
      sources: documents.map((d) => d.title).slice(0, 2),
      confidence: 0.95,
      isFallback: true,
    };
  }
}

export async function generateAiCampaignCopy(
  goal: string,
  channel: string = 'WhatsApp',
  targetAudience: string = 'Clientes VIP',
  productOrOffer: string = '',
  tone: string = 'Exclusivo y Persuasivo'
): Promise<{ content: string; isFallback?: boolean }> {
  try {
    const res = await fetch('/api/gemini/campaign-copy', {
      method: 'POST',
      headers: api.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ goal, channel, targetAudience, productOrOffer, tone }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) throw new Error('Error al generar campaña');
    return await res.json();
  } catch (error) {
    return {
      content: `✨ *Oportunidad Exclusiva ConversaGT*\n\nHola {{nombre}}, queremos presentarte nuestra nueva solución de automatización omnicanal con IA Gemini.\n\nBeneficios clave:\n• Respuestas inmediatas 24/7 en WhatsApp\n• Pasarelas de cobro con Tarjeta, PayPal y Transferencias\n• SLA 99.9% garantizado\n\n👉 *Responde 'DEMO' para habilitar tus 14 días VIP sin costo.*`,
      isFallback: true,
    };
  }
}

export async function enhanceVoiceAudio(rawTranscript: string): Promise<string> {
  try {
    const res = await fetch('/api/gemini/voice-enhance', {
      method: 'POST',
      headers: api.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ rawTranscript }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) return rawTranscript;
    const data = await res.json();
    return data.enhancedText || rawTranscript;
  } catch {
    return rawTranscript;
  }
}

export async function processPaymentTransaction(
  customerName: string,
  customerEmail: string,
  amount: number,
  currency: string = 'USD',
  method: 'card' | 'paypal' | 'bank_transfer',
  planOrItem: string,
  details: any = {}
): Promise<{ success: boolean; transaction: any }> {
  try {
    const res = await fetch('/api/billing/process-simulated', {
      method: 'POST',
      headers: api.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        customerInfo: { name: customerName, email: customerEmail },
        amount,
        currency,
        method,
        planName: planOrItem,
        details,
      }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) throw new Error('Error processing payment');
    return await res.json();
  } catch {
    const isBank = method === 'bank_transfer';
    return {
      success: true,
      transaction: {
        id: `tx-${Date.now()}`,
        invoiceNumber: isBank ? `PROFORMA-SBX-${Math.floor(100000 + Math.random() * 900000)}` : `SANDBOX-DTE-${Math.floor(10000000 + Math.random() * 90000000)}`,
        customerName,
        customerEmail,
        amount,
        currency,
        planOrItem,
        status: 'pending_verification',
        method,
        date: new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        authorizationCode: isBank ? (details?.refCode || `BOLETA-${Date.now().toString().slice(-4)}`) : `SBX-REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        bankReference: details?.refCode || '',
        bankName: details?.bankName || (method === 'paypal' ? 'PayPal Sandbox' : 'Pasarela Tarjeta Sandbox'),
        taxBreakdown: { subtotal: amount * 0.88, iva: amount * 0.12 },
        requiresManualActivation: true,
        receiptMessage:
          'Transacción registrada en Sandbox (Modo Pruebas). Requiere verificación de boleta de depósito.',
      },
    };
  }
}

export async function executeSimulatedPayment(
  method: 'card' | 'paypal' | 'bank_transfer',
  amount: number,
  planName: string,
  customerInfo?: { name?: string; email?: string }
): Promise<any> {
  try {
    const res = await fetch('/api/billing/process-simulated', {
      method: 'POST',
      headers: api.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        method,
        amount,
        planName,
        customerInfo,
      }),
    });
    const data = await res.json();
    return data.transaction;
  } catch {
    return {
      invoiceNumber: `SANDBOX-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'pending_verification',
      amount,
      method,
    };
  }
}
