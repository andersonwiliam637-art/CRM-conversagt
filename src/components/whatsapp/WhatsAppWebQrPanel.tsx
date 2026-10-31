// src/components/whatsapp/WhatsAppWebQrPanel.tsx
import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  RefreshCw,
  Power,
  ShieldAlert,
  AlertCircle,
  ServerOff,
  CheckCircle2,
  Clock,
  Layers,
  Info,
  Terminal,
  Activity,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type { WhatsAppWebSession, WhatsAppWebStatus } from '../../types';

export interface WhatsAppWebQrPanelProps {
  session: WhatsAppWebSession;
  onRequestNewQr?: () => void;
  onDisconnect?: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
}

export const WhatsAppWebQrPanel: React.FC<WhatsAppWebQrPanelProps> = ({
  session,
  onRequestNewQr,
  onDisconnect,
  onRetry,
  isLoading = false,
}) => {
  // Dynamic countdown timer for QR expiration based strictly on qrExpiresAt
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (session.status === 'QR_DISPONIBLE' && session.qrExpiresAt) {
      const updateTimer = () => {
        const diffMs = new Date(session.qrExpiresAt!).getTime() - Date.now();
        const secs = Math.max(0, Math.floor(diffMs / 1000));
        setSecondsRemaining(secs);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setSecondsRemaining(null);
    }
  }, [session.status, session.qrExpiresAt]);

  const isExpired = session.status === 'QR_DISPONIBLE' && secondsRemaining !== null && secondsRemaining <= 0;

  // Status Badge Renderer
  const renderStatusBadge = (status: WhatsAppWebStatus) => {
    switch (status) {
      case 'CONECTADO':
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            CONECTADO
          </span>
        );
      case 'QR_DISPONIBLE':
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6798FF] animate-pulse" />
            QR DISPONIBLE
          </span>
        );
      case 'ESPERANDO_QR':
      case 'CONFIGURACION_PENDIENTE':
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 flex items-center gap-1.5">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            ESPERANDO QR
          </span>
        );
      case 'VERIFICANDO':
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30 flex items-center gap-1.5">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            VERIFICANDO
          </span>
        );
      case 'DESCONECTADO':
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#1E1E1E] text-[#A7A7A7] border border-[#313131] flex items-center gap-1.5">
            <Power className="w-2.5 h-2.5" />
            DESCONECTADO
          </span>
        );
      case 'ERROR':
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 flex items-center gap-1.5">
            <AlertCircle className="w-2.5 h-2.5" />
            ERROR
          </span>
        );
      case 'DEMO':
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#6798FF]/10 text-[#6798FF] border border-[#6798FF]/30 flex items-center gap-1.5">
            <Terminal className="w-2.5 h-2.5" />
            DEMO — DATOS DE PRUEBA
          </span>
        );
      case 'NO_CONFIGURADO':
      default:
        return (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-[#1E1E1E] text-[#A7A7A7] border border-[#313131]">
            NO CONFIGURADO
          </span>
        );
    }
  };

  // Safe Dynamic QR Rendering
  const renderDynamicQrContent = () => {
    if (!session.qr) return null;

    // 1. Data URL image or external secure URL
    if (session.qr.startsWith('data:image/') || session.qr.startsWith('http')) {
      return (
        <img
          src={session.qr}
          alt="Código QR de vinculación WhatsApp Web"
          className="w-52 h-52 object-contain"
        />
      );
    }

    // 2. Inline SVG string payload from worker
    if (session.qr.trim().startsWith('<svg')) {
      return (
        <div
          className="w-52 h-52 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: session.qr }}
        />
      );
    }

    // 3. Raw payload string
    return (
      <div className="w-52 h-52 p-3 bg-white text-black flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-800">Payload QR Recibido</span>
        <div className="text-[9px] font-mono break-all line-clamp-6 text-slate-600 bg-slate-100 p-2 rounded w-full">
          {session.qr}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Explicit Security & Risk Notice (Never hidden from client) */}
      <div className="p-4 rounded-lg bg-[#D97706]/10 border border-[#D97706]/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#D97706] font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Conector alternativo mediante sesión vinculada. No corresponde a Meta Cloud API.</span>
        </div>
        <p className="text-[#A7A7A7] text-[11px] leading-relaxed">
          <strong className="text-white">Aviso de Seguridad y Riesgos:</strong> Este método vincula una sesión mediante el protocolo de WhatsApp Web y requiere un microservicio dedicado. No es una integración oficial respaldada por Meta Platforms Inc. Puede presentar riesgos de compatibilidad, desconexión por reposo de batería en el teléfono móvil asociado o suspensión de cuenta si se utiliza para envíos masivos o no solicitados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Panel: QR & State Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-lg bg-[#141414] border border-[#313131] flex flex-col items-center text-center space-y-4">
            <div className="w-full flex items-center justify-between border-b border-[#313131] pb-3 text-xs">
              <span className="text-[#A7A7A7] font-mono text-[11px] uppercase">Estado de Sesión</span>
              {renderStatusBadge(session.status)}
            </div>

            {/* Display Area: strictly based on session state */}
            <div className="w-full flex justify-center">
              {/* STATE: QR_DISPONIBLE (With dynamic QR from backend) */}
              {session.status === 'QR_DISPONIBLE' && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3.5 rounded-lg bg-white border border-[#313131] shadow-md relative">
                    {renderDynamicQrContent()}

                    {isExpired && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <Clock className="w-8 h-8 text-[#D97706]" />
                        <span className="text-xs font-semibold text-white">Código QR Expirado</span>
                        <p className="text-[11px] text-[#A7A7A7] leading-tight">
                          El código expira por seguridad tras 60 segundos. Solicite un nuevo código.
                        </p>
                        {onRequestNewQr && (
                          <button
                            type="button"
                            onClick={onRequestNewQr}
                            disabled={isLoading}
                            className="mt-1 px-3 py-1.5 rounded-md bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Solicitar Nuevo QR</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expiration Progress */}
                  {!isExpired && secondsRemaining !== null && (
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#A7A7A7]">
                        <span>Tiempo restante:</span>
                        <span className="text-white font-semibold">{secondsRemaining}s</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden">
                        <div
                          className="h-full bg-[#6798FF] transition-all duration-1000 ease-linear"
                          style={{ width: `${Math.min(100, Math.max(0, (secondsRemaining / 60) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STATE: NO_CONFIGURADO */}
              {session.status === 'NO_CONFIGURADO' && (
                <div className="w-56 h-56 p-4 rounded-lg bg-[#0A0A0A] border border-[#313131] flex flex-col items-center justify-center text-center space-y-2 text-xs">
                  <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#313131] flex items-center justify-center text-[#7C7C7C]">
                    <ServerOff className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-white text-xs">Microservicio no configurado</span>
                  <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
                    El microservicio dedicado de WhatsApp Web no está configurado en el backend.
                  </p>
                  <span className="text-[9px] font-mono text-[#7C7C7C]">
                    WHATSAPP_WEB_SERVICE_URL: ausente
                  </span>
                </div>
              )}

              {/* STATE: ESPERANDO_QR */}
              {(session.status === 'ESPERANDO_QR' || session.status === 'CONFIGURACION_PENDIENTE') && (
                <div className="w-56 h-56 p-4 rounded-lg bg-[#0A0A0A] border border-[#313131] flex flex-col items-center justify-center text-center space-y-3 text-xs">
                  <div className="w-10 h-10 rounded-full bg-[#6798FF]/10 border border-[#6798FF]/30 flex items-center justify-center text-[#6798FF]">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block text-xs">Esperando código QR...</span>
                    <p className="text-[11px] text-[#A7A7A7] mt-1 leading-relaxed">
                      Solicitando sesión al microservicio. No se ha recibido todavía un código QR.
                    </p>
                  </div>
                </div>
              )}

              {/* STATE: VERIFICANDO */}
              {session.status === 'VERIFICANDO' && (
                <div className="w-56 h-56 p-4 rounded-lg bg-[#0A0A0A] border border-[#313131] flex flex-col items-center justify-center text-center space-y-3 text-xs">
                  <div className="w-10 h-10 rounded-full bg-[#6798FF]/10 border border-[#6798FF]/30 flex items-center justify-center text-[#6798FF]">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block text-xs">Verificando sincronización...</span>
                    <p className="text-[11px] text-[#A7A7A7] mt-1 leading-relaxed">
                      Validando vinculación del dispositivo con el microservicio.
                    </p>
                  </div>
                </div>
              )}

              {/* STATE: CONECTADO */}
              {session.status === 'CONECTADO' && (
                <div className="w-56 h-56 p-4 rounded-lg bg-[#141414] border border-[#16A34A]/40 flex flex-col items-center justify-center text-center space-y-2 text-xs">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-white text-xs">Sesión Activa</span>
                  <div className="text-[11px] font-mono text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded border border-[#16A34A]/20">
                    {session.phoneNumber || '+502 •••• 4016'}
                  </div>
                  <p className="text-[10px] text-[#A7A7A7]">
                    {session.displayName || 'Terminal WhatsApp vinculada'}
                  </p>
                  {session.lastHeartbeatAt && (
                    <span className="text-[9px] font-mono text-[#7C7C7C]">
                      Heartbeat: {new Date(session.lastHeartbeatAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}

              {/* STATE: DESCONECTADO */}
              {session.status === 'DESCONECTADO' && (
                <div className="w-56 h-56 p-4 rounded-lg bg-[#0A0A0A] border border-[#313131] flex flex-col items-center justify-center text-center space-y-2 text-xs">
                  <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#313131] flex items-center justify-center text-[#7C7C7C]">
                    <Power className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-white text-xs">Sesión Desconectada</span>
                  <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
                    La sesión previa fue cerrada o finalizada. Genere un nuevo código para re-vincular.
                  </p>
                </div>
              )}

              {/* STATE: ERROR */}
              {session.status === 'ERROR' && (
                <div className="w-56 h-56 p-4 rounded-lg bg-[#DC2626]/5 border border-[#DC2626]/30 flex flex-col items-center justify-center text-center space-y-2 text-xs">
                  <div className="w-12 h-12 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-center justify-center text-[#DC2626]">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-[#DC2626] text-xs">Fallo en Microservicio</span>
                  {session.errorCode && (
                    <span className="font-mono text-[10px] text-[#DC2626] bg-[#DC2626]/10 px-1.5 py-0.5 rounded">
                      Código: {session.errorCode}
                    </span>
                  )}
                  <p className="text-[11px] text-[#A7A7A7] leading-tight line-clamp-3">
                    {session.errorMessage || 'No se pudo contactar el microservicio de WhatsApp Web.'}
                  </p>
                </div>
              )}

              {/* STATE: DEMO (Explicit Sandbox Mode - Zero Fake QR) */}
              {session.status === 'DEMO' && (
                <div className="w-56 h-56 p-4 rounded-lg bg-[#0A0A0A] border border-[#6798FF]/30 flex flex-col items-center justify-center text-center space-y-2 text-xs">
                  <div className="w-12 h-12 rounded-lg bg-[#6798FF]/10 border border-[#6798FF]/30 flex items-center justify-center text-[#6798FF]">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#6798FF] uppercase">
                    PREVISUALIZACIÓN — NO FUNCIONAL
                  </span>
                  <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
                    Esta vista utiliza datos simulados. No existe una sesión real de WhatsApp vinculada ni código QR activo.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center justify-center gap-2 pt-1 text-xs">
              {session.status === 'CONECTADO' ? (
                <button
                  type="button"
                  onClick={onDisconnect}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-[#DC2626] hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs font-medium"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Desconectar Sesión</span>
                </button>
              ) : session.status === 'ERROR' ? (
                <button
                  type="button"
                  onClick={onRetry || onRequestNewQr}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-[#6798FF] hover:bg-[#5584eb] text-black font-semibold transition-all flex items-center justify-center gap-1.5 text-xs"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Reintentar Conexión</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequestNewQr}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] border border-[#313131] text-white hover:border-[#6798FF] transition-all flex items-center justify-center gap-1.5 text-xs font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {session.status === 'QR_DISPONIBLE' ? 'Solicitar Nuevo Código QR' : 'Solicitar Código QR al Microservicio'}
                  </span>
                </button>
              )}
            </div>

            <div className="w-full pt-2 border-t border-[#313131] text-[10px] text-[#A7A7A7] font-mono flex items-center justify-between">
              <span>Contrato de Integración</span>
              <span>v1.0.0 (Desacoplado)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Instructions, Technical Checklist & Architecture (7 cols) */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Instructions Box */}
          <div className="p-5 rounded-lg bg-[#141414] border border-[#313131] space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider font-mono">
              <Smartphone className="w-4 h-4 text-[#6798FF]" />
              <span>Instrucciones de Vinculación</span>
            </div>

            <p className="text-[#A7A7A7] text-xs leading-relaxed">
              Cuando el microservicio dedicado se encuentre activo y entregue un código QR auténtico:
            </p>

            <ol className="space-y-2 text-xs text-[#A7A7A7] list-decimal list-inside bg-[#0A0A0A] p-3.5 rounded-lg border border-[#313131]">
              <li className="leading-relaxed">
                Abre la aplicación de <strong className="text-white">WhatsApp</strong> en tu teléfono móvil.
              </li>
              <li className="leading-relaxed">
                Toca en <strong className="text-white">Ajustes / Configuración</strong> y selecciona <strong className="text-white">Dispositivos vinculados</strong>.
              </li>
              <li className="leading-relaxed">
                Toca en <strong className="text-white">Vincular un dispositivo</strong>.
              </li>
              <li className="leading-relaxed">
                Apunta la cámara de tu teléfono hacia el código QR mostrado en esta pantalla antes de que expire.
              </li>
            </ol>
          </div>

          {/* Technical Contract Details Box */}
          <div className="p-5 rounded-lg bg-[#141414] border border-[#313131] space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-[#313131] pb-2">
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <Layers className="w-4 h-4 text-[#6798FF]" />
                <span>Estado del Contrato de Datos</span>
              </div>
              <span className="text-[10px] text-[#6798FF] bg-[#6798FF]/10 px-2 py-0.5 rounded border border-[#6798FF]/20">
                REST / WebSocket
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#313131]">
                <span className="text-[#7C7C7C] block text-[10px]">Connection ID:</span>
                <span className="text-white">{session.connectionId || 'conn-wa-web-default'}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#313131]">
                <span className="text-[#7C7C7C] block text-[10px]">Tenant ID:</span>
                <span className="text-white">{session.tenantId || 'tenant-default'}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#313131]">
                <span className="text-[#7C7C7C] block text-[10px]">Estado Actual:</span>
                <span className="text-[#6798FF] font-semibold">{session.status}</span>
              </div>
              <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#313131]">
                <span className="text-[#7C7C7C] block text-[10px]">QR Dinámico:</span>
                <span className={session.qr ? 'text-[#16A34A]' : 'text-[#7C7C7C]'}>
                  {session.qr ? 'Presente en payload' : 'Ausente (Null)'}
                </span>
              </div>
            </div>

            {session.errorMessage && (
              <div className="p-2.5 rounded bg-[#DC2626]/10 border border-[#DC2626]/30 text-[11px] text-[#DC2626]">
                Detalle del error: {session.errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
