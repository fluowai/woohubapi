import React, { useEffect, useState } from 'react';
import {
  X,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Wifi
} from 'lucide-react';
import { Instance } from '../../types';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { EngineBadge, StatusBadge } from '../common/StatusBadge';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: Instance | null;
  onRefreshQR: (instanceId: string) => Promise<any>;
  onSimulateScan: (instanceId: string) => Promise<any>;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  instance,
  onRefreshQR,
  onSimulateScan
}) => {
  const [countdown, setCountdown] = useState(45);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!isOpen || !instance || instance.status === 'CONNECTED') return;
    setCountdown(45);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto refresh QR code if not connected
          if (instance.status !== 'CONNECTED') {
            Promise.resolve(onRefreshQR(instance.id)).catch(() => {});
          }
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, instance?.id, instance?.status]);

  if (!isOpen || !instance) return null;

  const isConnected = instance.status === 'CONNECTED';
  const isPairing = instance.status === 'PAIRING';

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshQR(instance.id);
      setCountdown(45);
    } catch (e) {
      console.warn('Manual QR refresh failed:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSimulateScan = async () => {
    setIsSimulating(true);
    try {
      await onSimulateScan(instance.id);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-center">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <span className="font-bold text-sm text-slate-900">{instance.name}</span>
            <EngineBadge engine={instance.engine} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Conectar WhatsApp
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Siga os passos abaixo para conectar seu aparelho à plataforma WooHub.
          </p>

          {/* QR Code Container */}
          <div className="flex justify-center mb-4">
            {isConnected ? (
              <div className="w-[230px] h-[230px] rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-center p-4 text-emerald-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2 animate-bounce" />
                <p className="font-bold text-sm">WhatsApp Conectado!</p>
                <p className="text-xs text-emerald-700 mt-1">{instance.phoneNumber}</p>
                <p className="text-[11px] text-slate-500 mt-3">Pronto para disparar e receber mensagens.</p>
              </div>
            ) : isPairing ? (
              <div className="w-[230px] h-[230px] rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col items-center justify-center p-4 text-purple-800">
                <RefreshCw className="w-10 h-10 text-purple-600 mb-2 animate-spin" />
                <p className="font-bold text-sm">Pareando com WhatsApp...</p>
                <p className="text-xs text-purple-700 mt-1">Negociando chaves do motor {instance.engine.toUpperCase()}</p>
              </div>
            ) : (
              <QRCodeDisplay
                value={instance.qrCode || `woohub-session-${instance.id}-${Date.now()}`}
                size={210}
              />
            )}
          </div>

          {!isConnected && !isPairing && (
            <>
              {/* Instructions */}
              <div className="bg-slate-50 rounded-xl p-3.5 text-left text-xs text-slate-600 mb-4 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  Como conectar:
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-slate-600">
                  <li>Abra o <strong>WhatsApp</strong> no seu telefone</li>
                  <li>Toque em <strong>Aparelhos conectados</strong></li>
                  <li>Toque em <strong>Conectar um aparelho</strong></li>
                  <li>Aponte a câmera para este QR Code</li>
                </ol>
              </div>

              {/* Countdown & Status */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Aguardando leitura do QR...</span>
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium text-[11px]"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Atualiza em {countdown}s</span>
                </button>
              </div>

              {/* Simulation Helper */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleSimulateScan}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isSimulating ? 'Pareando com WhatsApp...' : 'Simular Leitura no Celular (Teste Rápido)'}
                  </span>
                </button>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Permite testar o fluxo de conexão sem precisar de um aparelho físico.
                </p>
              </div>
            </>
          )}

          {isConnected && (
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Concluir e Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
