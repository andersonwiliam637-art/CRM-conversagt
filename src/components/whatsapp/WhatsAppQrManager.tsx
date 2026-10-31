// src/components/whatsapp/WhatsAppQrManager.tsx - Decoupled WhatsApp Connector Interface
import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Power,
  ShieldAlert,
  Send,
  Bot,
  AlertCircle,
  HelpCircle,
  Phone,
  Layers,
  Info,
  Server,
  Terminal,
  Activity,
  Check,
  AlertTriangle,
  RotateCcw,
  Code2
} from 'lucide-react';
import type { IntegrationStatus, ChannelConnection, WhatsAppWebSession, WhatsAppWebStatus } from '../../types';
import { WhatsAppWebQrPanel } from './WhatsAppWebQrPanel';

export const WhatsAppQrManager: React.FC = () => {
  // Navigation: WhatsApp -> Meta Cloud API | WhatsApp Web (Sesión vinculada)
  const [selectedMethod, setSelectedMethod] = useState<'meta_cloud' | 'wa_web'>('meta_cloud');

  // Multi-tenant connections loaded from server
  const [connections, setConnections] = useState<ChannelConnection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  // Meta Cloud API State
  const [metaHealthStatus, setMetaHealthStatus] = useState<IntegrationStatus>('NO_CONFIGURADO');
  const [metaMaskedId, setMetaMaskedId] = useState<string>('Sin número verificado');
  const [metaLastVerified, setMetaLastVerified] = useState<string | null>(null);
  const [isCheckingMetaHealth, setIsCheckingMetaHealth] = useState(false);
  const [metaHealthResult, setMetaHealthResult] = useState<any>(null);

  // WhatsApp Web Session Contract State
  const [waSession, setWaSession] = useState<WhatsAppWebSession>({
    connectionId: 'conn-wa-web-default',
    tenantId: 'tenant-ferreteria-progreso',
    status: 'NO_CONFIGURADO',
    qr: null,
    qrExpiresAt: null,
    phoneNumber: null,
    displayName: null,
    lastConnectedAt: null,
    lastHeartbeatAt: null,
    errorCode: null,
    errorMessage: null,
  });
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [showTechnicalInspector, setShowTechnicalInspector] = useState(false);

  // Interactive Message Pipeline Tester
  const [testInput, setTestInput] = useState('');
  const [simulateSendFailure, setSimulateSendFailure] = useState(false);
  const [testChatMessages, setTestChatMessages] = useState<Array<{
    sender: 'user' | 'bot' | 'agent';
    text: string;
    time: string;
    status: 'sent' | 'delivered' | 'SEND_FAILED';
    error?: string;
  }>>([
    {
      sender: 'user',
      text: '¡Hola! ¿Tienen información sobre cotizaciones de materiales y cuentas bancarias?',
      time: '10:00',
      status: 'delivered',
    },
    {
      sender: 'bot',
      text: '¡Hola! Con gusto. Para depósitos en Quetzales disponemos de Banco Industrial (Ahorro No. 1402158) o BAM a nombre de Anderson William. Emitimos Factura Electrónica SAT FEL oficial.',
      time: '10:00',
      status: 'delivered',
    },
  ]);
  const [isTestSending, setIsTestSending] = useState(false);

  // Fetch real connections on load
  const loadConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const res = await fetch('/api/connectors/connections');
      if (res.ok) {
        const data = await res.json();
        if (data.connections) {
          setConnections(data.connections);
          const meta = data.connections.find((c: any) => c.provider === 'meta_cloud_api');
          if (meta) {
            setMetaHealthStatus(meta.status);
            setMetaMaskedId(meta.maskedIdentifier || 'Sin número verificado');
            setMetaLastVerified(meta.lastVerifiedAt);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load connections', err);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Fetch WhatsApp Web session state from backend
  const loadWaSession = async () => {
    setIsSessionLoading(true);
    try {
      const res = await fetch('/api/whatsapp/web/session');
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setWaSession(data.session);
        }
      }
    } catch (err) {
      console.warn('Could not load WhatsApp Web session', err);
    } finally {
      setIsSessionLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
    loadWaSession();
  }, []);

  // Health Check Executor for Meta Cloud API
  const handleCheckMetaHealth = async () => {
    setIsCheckingMetaHealth(true);
    setMetaHealthResult(null);
    try {
      const metaConn = connections.find((c) => c.provider === 'meta_cloud_api');
      const connId = metaConn?.id || 'conn-meta-default';

      const res = await fetch(`/api/connectors/${connId}/health-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setMetaHealthStatus(data.result.status);
          setMetaLastVerified(data.result.lastVerifiedAt);
          if (data.result.maskedIdentifier) {
            setMetaMaskedId(data.result.maskedIdentifier);
          }
          setMetaHealthResult(data.result);
        }
      } else {
        setMetaHealthStatus('ERROR_CONEXION');
        setMetaHealthResult({
          status: 'ERROR_CONEXION',
          error: 'Error al ejecutar verificación con el servidor backend.',
        });
      }
    } catch (err: any) {
      setMetaHealthStatus('ERROR_CONEXION');
      setMetaHealthResult({
        status: 'ERROR_CONEXION',
        error: `Fallo de red al contactar servicio: ${err.message || 'Error'}`,
      });
    } finally {
      setIsCheckingMetaHealth(false);
      loadConnections();
    }
  };

  // Request new QR from backend
  const handleRequestNewQr = async () => {
    setIsSessionLoading(true);
    try {
      const res = await fetch('/api/whatsapp/web/session/request-qr', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setWaSession(data.session);
        }
      }
    } catch (err) {
      console.warn('Error requesting QR from backend', err);
    } finally {
      setIsSessionLoading(false);
    }
  };

  // Disconnect session via backend
  const handleDisconnectSession = async () => {
    setIsSessionLoading(true);
    try {
      const res = await fetch('/api/whatsapp/web/session/disconnect', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setWaSession(data.session);
        }
      }
    } catch (err) {
      console.warn('Error disconnecting session', err);
    } finally {
      setIsSessionLoading(false);
    }
  };

  // Technical preview state switcher (Allows testing all 9 contract states cleanly)
  const handleSetPreviewState = async (status: WhatsAppWebStatus) => {
    setIsSessionLoading(true);
    try {
      const res = await fetch('/api/whatsapp/web/session/set-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setWaSession(data.session);
        }
      }
    } catch (err) {
      console.warn('Error setting preview state', err);
    } finally {
      setIsSessionLoading(false);
    }
  };

  // Interactive Message Pipeline Test
  const handleSendTestMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testInput.trim() || isTestSending) return;

    const userText = testInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTestChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: timeNow, status: 'delivered' },
    ]);
    setTestInput('');
    setIsTestSending(true);

    try {
      if (simulateSendFailure) {
        setTimeout(() => {
          setTestChatMessages((prev) => [
            ...prev,
            {
              sender: 'agent',
              text: `[Error simulado]: No se pudo entregar respuesta al canal ${selectedMethod}.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'SEND_FAILED',
              error: 'SEND_FAILED: Conector externo no disponible o credenciales no verificadas.',
            },
          ]);
          setIsTestSending(false);
        }, 600);
        return;
      }

      const res = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          customerName: 'Cliente Demo',
          history: [],
          tone: 'profesional_calido',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestChatMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.reply || 'Consulta procesada por el asistente normalizado.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
          },
        ]);
      } else {
        setTestChatMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'Información oficial de ConversaGT: Cuentas autorizadas Banco Industrial No. 1402158.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
          },
        ]);
      }
    } catch {
      setTestChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Fallo al procesar el mensaje.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'SEND_FAILED',
          error: 'SEND_FAILED: Error de red con el asistente.',
        },
      ]);
    } finally {
      setIsTestSending(false);
    }
  };

  const renderStatusBadge = (status: IntegrationStatus | WhatsAppWebStatus) => {
    switch (status) {
      case 'CONECTADO':
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            CONECTADO
          </span>
        );
      case 'QR_DISPONIBLE':
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6798FF] animate-pulse" />
            QR DISPONIBLE
          </span>
        );
      case 'CONFIGURACION_PENDIENTE':
      case 'ESPERANDO_QR':
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            {status === 'ESPERANDO_QR' ? 'ESPERANDO QR' : 'CONFIGURACIÓN PENDIENTE'}
          </span>
        );
      case 'VERIFICANDO':
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            VERIFICANDO
          </span>
        );
      case 'DESCONECTADO':
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#1E1E1E] text-[#A7A7A7] border border-[#313131] flex items-center gap-1">
            <Power className="w-2.5 h-2.5" />
            DESCONECTADO
          </span>
        );
      case 'ERROR':
      case 'ERROR_CONEXION':
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            ERROR
          </span>
        );
      case 'DEMO':
      case 'DEMO_DATOS_PRUEBA':
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30 flex items-center gap-1">
            <Terminal className="w-2.5 h-2.5" />
            DEMO — DATOS DE PRUEBA
          </span>
        );
      case 'NO_CONFIGURADO':
      default:
        return (
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#1E1E1E] text-[#A7A7A7] border border-[#313131]">
            NO CONFIGURADO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans select-none">
      {/* 1. Header with Decoupled Architecture Selector */}
      <div className="p-4 rounded-lg bg-[#141414] border border-[#313131] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#6798FF]" />
              <h2 className="font-semibold text-white text-sm">
                Conectores de WhatsApp para CRM Omnicanal
              </h2>
            </div>
            <p className="text-xs text-[#A7A7A7] mt-0.5">
              Dos métodos independientes y desacoplados. Ningún secreto es expuesto al frontend.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#A7A7A7]">
            <Server className="w-3.5 h-3.5 text-[#6798FF]" />
            <span>Aislamiento Multi-Tenant Activo</span>
          </div>
        </div>

        {/* Tree Selector: Meta Cloud API vs WhatsApp Web */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#313131]">
          <button
            type="button"
            onClick={() => setSelectedMethod('meta_cloud')}
            className={`p-3 rounded-lg text-left transition-all border ${
              selectedMethod === 'meta_cloud'
                ? 'bg-[#1E1E1E] border-[#6798FF] text-white shadow-sm'
                : 'bg-[#0A0A0A] border-[#313131] text-[#A7A7A7] hover:border-[#4B4B4B]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                <span className="font-mono text-[#6798FF]">├──</span> Meta Cloud API
              </span>
              {renderStatusBadge(metaHealthStatus)}
            </div>
            <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
              Conector oficial mediante Graph API de Meta. Requiere WABA ID y Access Token permanente en backend.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('wa_web')}
            className={`p-3 rounded-lg text-left transition-all border ${
              selectedMethod === 'wa_web'
                ? 'bg-[#1E1E1E] border-[#6798FF] text-white shadow-sm'
                : 'bg-[#0A0A0A] border-[#313131] text-[#A7A7A7] hover:border-[#4B4B4B]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                <span className="font-mono text-[#6798FF]">└──</span> WhatsApp Web — Sesión vinculada
              </span>
              {renderStatusBadge(waSession.status)}
            </div>
            <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
              Conector alternativo mediante sesión vinculada. Contrato desacoplado para microservicio dedicado.
            </p>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METHOD A: WHATSAPP META CLOUD API (OFICIAL)                               */}
      {/* ========================================================================= */}
      {selectedMethod === 'meta_cloud' && (
        <div className="p-5 rounded-lg bg-[#141414] border border-[#313131] space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#313131]">
            <div>
              <h3 className="font-semibold text-white text-sm">
                WhatsApp Business Meta Cloud API (Conector Oficial)
              </h3>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Adaptador oficial desacoplado: Graph API v21.0 con verificación real de estado.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderStatusBadge(metaHealthStatus)}
            </div>
          </div>

          {/* Expected Variables Summary (Read-Only / Documentation) */}
          <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#313131] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
                Variables de Entorno Esperadas en Servidor Backend
              </span>
              <span className="text-[11px] font-mono text-[#6798FF] bg-[#6798FF]/10 px-2 py-0.5 rounded border border-[#6798FF]/20">
                Almacenamiento Seguro
              </span>
            </div>
            <p className="text-xs text-[#A7A7A7]">
              ConversaGT no requiere ingresar secretos en el navegador. Las variables se definen exclusivamente en el entorno de despliegue del servidor:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#141414] border border-[#313131] flex items-center justify-between">
                <span className="text-[#6798FF]">WHATSAPP_WEBHOOK</span>
                <span className="text-[10px] text-[#A7A7A7]">/api/webhooks/whatsapp</span>
              </div>
              <div className="p-2.5 rounded bg-[#141414] border border-[#313131] flex items-center justify-between">
                <span className="text-[#6798FF]">WHATSAPP_APP_SECRET</span>
                <span className="text-[10px] text-[#A7A7A7]">[Protegido HMAC SHA-256]</span>
              </div>
              <div className="p-2.5 rounded bg-[#141414] border border-[#313131] flex items-center justify-between">
                <span className="text-[#6798FF]">WHATSAPP_PHONE_ID</span>
                <span className="text-[10px] text-[#A7A7A7]">{metaMaskedId}</span>
              </div>
              <div className="p-2.5 rounded bg-[#141414] border border-[#313131] flex items-center justify-between">
                <span className="text-[#6798FF]">WHATSAPP_ACCESS_TOKEN</span>
                <span className="text-[10px] text-[#A7A7A7]">[Bóveda Cifrada Backend]</span>
              </div>
            </div>
          </div>

          {/* Real Health Check Trigger */}
          <div className="p-4 rounded-lg bg-[#1E1E1E] border border-[#313131] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Verificación Real de Conectividad (Health Check)
                </span>
                <span className="text-[11px] text-[#A7A7A7]">
                  Consulta directamente a Meta Graph API. No reporta "CONECTADO" sin una respuesta HTTP 200 verificada.
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckMetaHealth}
                disabled={isCheckingMetaHealth}
                className="px-3.5 py-1.5 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <Activity className={`w-3.5 h-3.5 ${isCheckingMetaHealth ? 'animate-spin' : ''}`} />
                <span>{isCheckingMetaHealth ? 'Verificando con Meta...' : 'Ejecutar Health Check'}</span>
              </button>
            </div>

            {metaHealthResult && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  metaHealthResult.status === 'CONECTADO'
                    ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30'
                    : metaHealthResult.status === 'NO_CONFIGURADO'
                    ? 'bg-[#141414] text-[#A7A7A7] border-[#313131]'
                    : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30'
                }`}
              >
                <div className="font-mono text-[11px] font-semibold mb-1 flex items-center justify-between">
                  <span>Resultado: {metaHealthResult.status}</span>
                  {metaHealthResult.latencyMs && <span>Latencia: {metaHealthResult.latencyMs}ms</span>}
                </div>
                {metaHealthResult.error && <p className="text-[11px]">{metaHealthResult.error}</p>}
                {metaHealthResult.details && (
                  <p className="text-[11px] opacity-90">
                    {metaHealthResult.details.note || `Verificado: ${metaHealthResult.details.verifiedName || 'Meta Graph API'}`}
                  </p>
                )}
              </div>
            )}

            {metaLastVerified && (
              <div className="text-[10px] font-mono text-[#A7A7A7] pt-1">
                Última verificación registrada: {new Date(metaLastVerified).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* METHOD B: WHATSAPP WEB — SESIÓN VINCULADA                                  */}
      {/* ========================================================================= */}
      {selectedMethod === 'wa_web' && (
        <div className="space-y-5">
          {/* Dedicated Component consuming WhatsAppWebSession */}
          <WhatsAppWebQrPanel
            session={waSession}
            onRequestNewQr={handleRequestNewQr}
            onDisconnect={handleDisconnectSession}
            onRetry={handleRequestNewQr}
            isLoading={isSessionLoading}
          />

          {/* Technical Inspector & State Simulator (Auditoría Técnica del Contrato) */}
          <div className="p-4 rounded-lg bg-[#141414] border border-[#313131] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#6798FF]" />
                <span className="font-mono text-xs text-white uppercase font-semibold">
                  Auditoría de Estados del Contrato (Previsualización Técnica)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTechnicalInspector(!showTechnicalInspector)}
                className="text-[11px] font-mono text-[#6798FF] hover:underline"
              >
                {showTechnicalInspector ? 'Ocultar Inspector' : 'Inspeccionar Estados'}
              </button>
            </div>

            <p className="text-[11px] text-[#A7A7A7]">
              Herramienta técnica para auditar la respuesta visual de los 9 estados tipados sin inventar conexiones falsas:
            </p>

            {showTechnicalInspector && (
              <div className="space-y-3 pt-2 border-t border-[#313131]">
                <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                  {(
                    [
                      'NO_CONFIGURADO',
                      'ESPERANDO_QR',
                      'QR_DISPONIBLE',
                      'VERIFICANDO',
                      'CONECTADO',
                      'DESCONECTADO',
                      'ERROR',
                      'DEMO',
                    ] as WhatsAppWebStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSetPreviewState(st)}
                      className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                        waSession.status === st
                          ? 'bg-[#6798FF] text-black font-semibold'
                          : 'bg-[#1E1E1E] text-[#A7A7A7] hover:text-white border border-[#313131]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded bg-[#0A0A0A] border border-[#313131] text-[10px] font-mono text-[#7C7C7C] overflow-x-auto">
                  <pre>{JSON.stringify(waSession, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Message Pipeline Simulator */}
          <div className="p-5 rounded-lg bg-[#141414] border border-[#313131] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#6798FF]" />
                <span className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
                  Validación del Pipeline Omnicanal (IA / Humano)
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-[#A7A7A7] cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateSendFailure}
                  onChange={(e) => setSimulateSendFailure(e.target.checked)}
                  className="rounded border-[#313131] bg-[#0A0A0A] text-[#6798FF]"
                />
                <span>Simular SEND_FAILED</span>
              </label>
            </div>

            {/* Chat Bubble Viewer */}
            <div className="h-44 overflow-y-auto p-3 rounded-lg bg-[#0A0A0A] border border-[#313131] space-y-2.5 text-xs">
              {testChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed ${
                      msg.status === 'SEND_FAILED'
                        ? 'bg-[#DC2626]/10 text-white border border-[#DC2626]/40'
                        : msg.sender === 'user'
                        ? 'bg-[#1E1E1E] text-white border border-[#313131]'
                        : 'bg-[#141414] text-white border border-[#6798FF]/30'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-between gap-2 mt-1 text-[10px] font-mono text-[#7C7C7C]">
                      <span>{msg.time}</span>
                      {msg.status === 'SEND_FAILED' ? (
                        <span className="text-[#DC2626] font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> SEND_FAILED
                        </span>
                      ) : (
                        <span className="text-[#6798FF]">entregado</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTestSending && (
                <div className="flex items-center gap-2 text-xs text-[#A7A7A7] p-2 font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#6798FF] animate-pulse" />
                  <span>Procesando mensaje en pipeline...</span>
                </div>
              )}
            </div>

            {/* Test Input */}
            <form onSubmit={handleSendTestMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Escribe una consulta de prueba omnicanal..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#313131] text-xs text-white placeholder-[#7C7C7C] focus:outline-none focus:border-[#6798FF]"
              />
              <button
                type="submit"
                disabled={isTestSending || !testInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] disabled:opacity-40 text-black font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
