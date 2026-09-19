import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Instance } from '../../types';
import { EngineBadge } from '../common/StatusBadge';

interface SimulateInboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  instances: Instance[];
  onSimulateReceive: (instanceId: string, fromPhone: string, text: string) => Promise<any>;
}

export const SimulateInboundModal: React.FC<SimulateInboundModalProps> = ({
  isOpen,
  onClose,
  instances,
  onSimulateReceive
}) => {
  const connectedInstances = instances.filter((i) => i.status === 'CONNECTED');
  const [instanceId, setInstanceId] = useState(
    connectedInstances[0]?.id || instances[0]?.id || ''
  );

  React.useEffect(() => {
    if (!instanceId || !instances.some((i) => i.id === instanceId)) {
      const best = instances.find((i) => i.status === 'CONNECTED') || instances[0];
      if (best) setInstanceId(best.id);
    }
  }, [isOpen, instances, instanceId]);

  const [senderPhone, setSenderPhone] = useState('+55 11 98765-4321');
  const [text, setText] = useState('Olá! Gostaria de saber mais informações sobre os serviços da empresa.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instanceId || !text.trim()) return;

    setIsProcessing(true);
    try {
      await onSimulateReceive(instanceId, senderPhone, text.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Simular Mensagem Inbound (Cliente)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-slate-500">
            Simule o recebimento de uma mensagem vinda do WhatsApp de um cliente para testar a
            normalização de eventos (<code>EventNormalizer</code>) e o disparo automático de Webhook.
          </p>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mensagem recebida e webhook disparado!</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Instância de Destino</label>
            <select
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-hidden"
            >
              {instances.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.engine.toUpperCase()}) — {i.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Telefone do Cliente (Remetente)</label>
            <input
              type="text"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Texto Enviado pelo Cliente</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isProcessing ? 'Processando...' : 'Simular Entrada'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
