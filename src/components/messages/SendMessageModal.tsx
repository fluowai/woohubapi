import React, { useState } from 'react';
import {
  X,
  Send,
  Smartphone,
  FileText,
  Image as ImageIcon,
  Headphones,
  MapPin,
  UserCheck,
  ToggleLeft,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { EngineRegistry } from '../../core/engine/EngineRegistry';
import { Instance, MessagePayload, MessageType } from '../../types';
import { EngineBadge } from '../common/StatusBadge';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  instances: Instance[];
  onSendMessage: (payload: MessagePayload) => Promise<any>;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  instances,
  onSendMessage
}) => {
  const connectedInstances = instances.filter((i) => i.status === 'CONNECTED');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(
    connectedInstances[0]?.id || instances[0]?.id || ''
  );

  React.useEffect(() => {
    if (!selectedInstanceId || !instances.some((i) => i.id === selectedInstanceId)) {
      const best = instances.find((i) => i.status === 'CONNECTED') || instances[0];
      if (best) setSelectedInstanceId(best.id);
    }
  }, [isOpen, instances, selectedInstanceId]);

  const [phoneTo, setPhoneTo] = useState('5548999998888');
  const [messageType, setMessageType] = useState<MessageType>('text');

  // Fields
  const [text, setText] = useState('Olá! Esta é uma mensagem de teste enviada via WooHub Unified API.');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe');
  const [caption, setCaption] = useState('Demonstração de imagem via WooHub');
  const [filename, setFilename] = useState('documento.pdf');
  const [latitude, setLatitude] = useState('-27.5954');
  const [longitude, setLongitude] = useState('-48.5480');
  const [contactName, setContactName] = useState('João da Silva');
  const [buttons, setButtons] = useState([
    { id: 'btn_1', text: 'Sim, quero conhecer' },
    { id: 'btn_2', text: 'Falar com Atendente' }
  ]);

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentInstance = instances.find((i) => i.id === selectedInstanceId);
  const capabilities = currentInstance
    ? EngineRegistry.get(currentInstance.engine).info.capabilities
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedInstanceId) {
      setError({ message: 'Selecione uma instância para envio.' });
      return;
    }

    if (!phoneTo.trim()) {
      setError({ message: 'Informe o número do destinatário.' });
      return;
    }

    // Prepare payload
    const payload: MessagePayload = {
      instanceId: selectedInstanceId,
      to: phoneTo.replace(/\D/g, '')
    };

    if (messageType === 'text') {
      payload.text = text;
    } else if (messageType === 'image') {
      payload.mediaUrl = mediaUrl;
      payload.caption = caption;
    } else if (messageType === 'document') {
      payload.mediaUrl = mediaUrl;
      payload.filename = filename;
    } else if (messageType === 'audio') {
      payload.mediaUrl = mediaUrl;
    } else if (messageType === 'buttons') {
      payload.text = text;
      payload.buttons = buttons;
    } else if (messageType === 'location') {
      payload.latitude = parseFloat(latitude);
      payload.longitude = parseFloat(longitude);
    } else if (messageType === 'contact') {
      payload.contactName = contactName;
    }

    setIsSending(true);
    try {
      const result = await onSendMessage(payload);
      setSuccess(`Mensagem enviada com sucesso! ID: ${result.id}`);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      if (err.error) {
        setError(err.error);
      } else {
        setError({ message: err.message || 'Falha no envio da mensagem' });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Disparar Mensagem WhatsApp</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{error.code || 'Erro no Envio'}</span>
              </div>
              <p className="text-[11px] text-rose-700">{error.message}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Instance Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Instância de Envio <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedInstanceId}
              onChange={(e) => setSelectedInstanceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 text-xs outline-hidden"
            >
              {instances.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.engine.toUpperCase()}) — {i.status}
                </option>
              ))}
            </select>
            {currentInstance && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span>Motor:</span>
                  <EngineBadge engine={currentInstance.engine} size="sm" />
                </div>
                <span>Status: {currentInstance.status}</span>
              </div>
            )}
          </div>

          {/* Recipient Phone */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Número de Destino (com DDI e DDD) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={phoneTo}
              onChange={(e) => setPhoneTo(e.target.value)}
              placeholder="Ex: 5548999998888"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 font-mono text-xs outline-hidden"
            />
          </div>

          {/* Message Type Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tipo de Mensagem</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'text', label: 'Texto' },
                { id: 'image', label: 'Imagem' },
                { id: 'document', label: 'Documento' },
                { id: 'buttons', label: 'Botões' }
              ].map((t) => {
                const isButtons = t.id === 'buttons';
                const buttonsSupported = capabilities?.buttons;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMessageType(t.id as MessageType)}
                    className={`py-1.5 px-2 rounded-md font-medium text-center border transition-all ${
                      messageType === t.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                    {isButtons && !buttonsSupported && (
                      <span className="block text-[9px] text-amber-500 font-mono leading-none mt-0.5">
                        (WAHA only)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Inputs based on type */}
          {messageType === 'text' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Conteúdo da Mensagem</label>
              <textarea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 text-xs outline-hidden"
              />
            </div>
          )}

          {messageType === 'image' && (
            <div className="space-y-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Legenda (Opcional)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {messageType === 'document' && (
            <div className="space-y-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL do Documento</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Arquivo</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {messageType === 'buttons' && (
            <div className="space-y-2">
              {currentInstance && !capabilities?.buttons && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Aviso de Capability: O motor <strong>{currentInstance.engine.toUpperCase()}</strong>{' '}
                    não suporta botões interativos. O sistema retornará o erro{' '}
                    <code>ENGINE_CAPABILITY_NOT_SUPPORTED</code> para proteger a integridade do envio.
                  </span>
                </div>
              )}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Texto do Corpo</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <label className="block text-slate-700 font-semibold mb-1">Botões Cadastrados</label>
              {buttons.map((btn, index) => (
                <input
                  key={btn.id}
                  type="text"
                  value={btn.text}
                  onChange={(e) => {
                    const newBtns = [...buttons];
                    newBtns[index].text = e.target.value;
                    setButtons(newBtns);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs mb-1"
                />
              ))}
            </div>
          )}

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
              disabled={isSending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Enviando...' : 'Enviar Mensagem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
