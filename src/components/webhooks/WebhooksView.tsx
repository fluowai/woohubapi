import React, { useState } from 'react';
import {
  Webhook,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  AlertTriangle,
  X
} from 'lucide-react';
import { WebhookConfig, WebhookDelivery } from '../../types';

interface WebhooksViewProps {
  webhooks: WebhookConfig[];
  deliveries: WebhookDelivery[];
  onCreateWebhook: (name: string, url: string, events: string[], instanceIds: string[]) => void;
  onToggleWebhook: (id: string, active: boolean) => void;
  onDeleteWebhook: (id: string) => void;
  onRetryDelivery: (deliveryId: string) => Promise<any>;
  onTestPing: (webhookId: string) => Promise<any>;
}

export const WebhooksView: React.FC<WebhooksViewProps> = ({
  webhooks,
  deliveries,
  onCreateWebhook,
  onToggleWebhook,
  onDeleteWebhook,
  onRetryDelivery,
  onTestPing
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New webhook state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'message.received',
    'message.sent',
    'message.delivered',
    'connection.connected',
    'connection.disconnected'
  ]);

  const AVAILABLE_EVENTS = [
    'message.received',
    'message.sent',
    'message.delivered',
    'message.read',
    'message.failed',
    'connection.connected',
    'connection.disconnected',
    'connection.reconnecting',
    'connection.qr',
    'instance.created'
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onCreateWebhook(name.trim(), url.trim(), selectedEvents, []);
    setName('');
    setUrl('');
    setShowCreateModal(false);
  };

  const handleTestPing = async (id: string) => {
    const res = await onTestPing(id);
    setTestSuccess(`Ping disparado com sucesso! Status HTTP: ${res.statusCode} (${res.durationMs}ms)`);
    setTimeout(() => setTestSuccess(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Webhooks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Receba eventos de WhatsApp em tempo real com validação criptográfica HMAC SHA-256.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Webhook</span>
        </button>
      </div>

      {testSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testSuccess}</span>
        </div>
      )}

      {/* Webhook Endpoints List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Endpoints Cadastrados</h2>
          <span className="text-xs text-slate-500 font-mono">{webhooks.length} ativos</span>
        </div>

        <div className="divide-y divide-slate-100">
          {webhooks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum webhook cadastrado ainda.</p>
            </div>
          ) : (
            webhooks.map((wh) => (
              <div key={wh.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{wh.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        wh.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {wh.isActive ? 'Ativo' : 'Pausado'}
                    </span>
                    {wh.successRate && (
                      <span className="text-[11px] font-mono text-emerald-600">
                        {wh.successRate}% entrega
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-600 truncate max-w-xl">{wh.url}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {wh.events.map((ev) => (
                      <span
                        key={ev}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTestPing(wh.id)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                    title="Disparar evento ping de teste"
                  >
                    <Play className="w-3 h-3 text-emerald-600" />
                    <span>Testar Ping</span>
                  </button>

                  <button
                    onClick={() => onToggleWebhook(wh.id, !wh.isActive)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {wh.isActive ? 'Desativar' : 'Ativar'}
                  </button>

                  <button
                    onClick={() => onDeleteWebhook(wh.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir Webhook"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deliveries History Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Histórico de Disparos (Deliveries)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Logs completos com status HTTP, duração, assinatura HMAC e payload.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Evento</th>
                <th className="py-3 px-4">Destino</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4">Duração</th>
                <th className="py-3 px-4">Tentativas</th>
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Nenhum disparo registrado ainda.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr
                    key={del.id}
                    onClick={() => setSelectedDelivery(del)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {del.event}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 truncate max-w-xs">
                      {del.url}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                          del.statusCode >= 200 && del.statusCode < 300
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {del.statusCode} {del.statusCode === 200 ? 'OK' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{del.durationMs}ms</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      Tentativa {del.attempts}/5
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(del.createdAt).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDelivery(del)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Inspecionar Payload e Headers"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRetryDelivery(del.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center gap-1 transition-colors text-[11px]"
                          title="Reenviar este evento para o destino"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reenviar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Delivery Detail Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400">ID: {selectedDelivery.id}</span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  Detalhes do Disparo Webhook
                </h3>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-400">Status HTTP:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedDelivery.statusCode}</p>
                </div>
                <div>
                  <span className="text-slate-400">Latência:</span>
                  <p className="font-mono text-slate-900">{selectedDelivery.durationMs}ms</p>
                </div>
                <div>
                  <span className="text-slate-400">Tentativas de Envio:</span>
                  <p className="font-mono text-slate-900">{selectedDelivery.attempts} de 5</p>
                </div>
              </div>

              {/* Headers HMAC */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Headers Enviados (com Assinatura HMAC):
                </span>
                <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedDelivery.headers, null, 2)}
                </pre>
              </div>

              {/* Payload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Payload Normalizado (JSON):</span>
                  <button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(selectedDelivery.payload, null, 2), 'payload')
                    }
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'payload' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Payload</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedDelivery.payload, null, 2)}
                </pre>
              </div>

              {/* Resposta Recebida */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Resposta do Destino:</span>
                <pre className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {selectedDelivery.responseBody}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={async () => {
                  await onRetryDelivery(selectedDelivery.id);
                  setSelectedDelivery(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reenviar Agora</span>
              </button>

              <button
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Cadastrar Novo Webhook</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Webhook</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Webhook Woodesk CRM"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL de Destino (HTTPS)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://seu-servico.com/webhooks/woohub"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Eventos Subscritos
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-lg bg-slate-50/50">
                  {AVAILABLE_EVENTS.map((ev) => (
                    <label key={ev} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedEvents([...selectedEvents, ev]);
                          else setSelectedEvents(selectedEvents.filter((item) => item !== ev));
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-mono text-[11px]">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Cadastrar Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
