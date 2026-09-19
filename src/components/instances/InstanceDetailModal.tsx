import React, { useState } from 'react';
import {
  X,
  Smartphone,
  QrCode,
  Power,
  RotateCcw,
  LogOut,
  Trash2,
  CheckCircle2,
  Wifi,
  Radio,
  Server,
  Calendar,
  MessageSquare,
  Shield,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Instance, LogEntry, WebhookConfig, WooHubMessage } from '../../types';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { EngineBadge, StatusBadge } from '../common/StatusBadge';

interface InstanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: Instance | null;
  messages: WooHubMessage[];
  logs: LogEntry[];
  webhooks: WebhookConfig[];
  onConnect: (id: string) => Promise<any>;
  onDisconnect: (id: string) => Promise<any>;
  onRestart: (id: string) => Promise<any>;
  onLogout: (id: string) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onOpenQR: (instance: Instance) => void;
  onSendMessage: () => void;
}

export const InstanceDetailModal: React.FC<InstanceDetailModalProps> = ({
  isOpen,
  onClose,
  instance,
  messages,
  logs,
  webhooks,
  onConnect,
  onDisconnect,
  onRestart,
  onLogout,
  onDelete,
  onOpenQR,
  onSendMessage
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'connection' | 'messages' | 'webhooks' | 'logs' | 'settings'
  >('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isOpen || !instance) return null;

  const instanceMessages = messages.filter((m) => m.instanceId === instance.id);
  const instanceLogs = logs.filter((l) => l.instanceId === instance.id);

  const handleAction = async (actionName: string, fn: () => Promise<any>) => {
    setActionLoading(actionName);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  const isConnected = instance.status === 'CONNECTED';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-sm">
              {instance.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{instance.name}</h2>
                <EngineBadge engine={instance.engine} size="sm" />
                <StatusBadge status={instance.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {instance.phoneNumber || 'Sem número vinculado'} • ID: {instance.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-slate-50/50 text-xs font-medium">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'connection', label: 'Conexão' },
            { id: 'messages', label: `Mensagens (${instanceMessages.length})` },
            { id: 'webhooks', label: 'Webhooks' },
            { id: 'logs', label: `Logs (${instanceLogs.length})` },
            { id: 'settings', label: 'Configurações' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 font-semibold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Status da Conexão</span>
                  <p className="text-base font-bold text-slate-900 mt-1">{instance.status}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{instance.statusMessage}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Mensagens Enviadas</span>
                  <p className="text-base font-bold text-slate-900 mt-1">
                    {instance.messageCount.sent.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {instance.messageCount.received.toLocaleString('pt-BR')} recebidas
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Bateria do Aparelho</span>
                  <p className="text-base font-bold text-slate-900 mt-1">
                    {instance.batteryLevel ? `${instance.batteryLevel}%` : 'N/A'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {instance.isBusiness ? 'Conta WhatsApp Business' : 'WhatsApp Padrão'}
                  </p>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h3 className="font-semibold text-slate-900 text-sm">Detalhes da Infraestrutura</h3>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Motor Selecionado:</span>
                    <span className="font-semibold text-slate-800 ml-2 uppercase">
                      {instance.engine}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Node / Servidor:</span>
                    <span className="font-mono text-slate-800 ml-2">
                      {instance.serverNode || 'node-br-01'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">ID Interno do Motor:</span>
                    <span className="font-mono text-slate-800 ml-2">
                      {instance.engineInstanceId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Última Conexão:</span>
                    <span className="text-slate-800 ml-2">
                      {instance.lastConnectedAt
                        ? new Date(instance.lastConnectedAt).toLocaleString('pt-BR')
                        : 'Nunca'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {!isConnected ? (
                  <button
                    onClick={() => onOpenQR(instance)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Conectar WhatsApp (QR Code)</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onSendMessage}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Disparar Mensagem</span>
                    </button>
                    <button
                      onClick={() => handleAction('disconnect', () => onDisconnect(instance.id))}
                      disabled={actionLoading !== null}
                      className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5"
                    >
                      <Power className="w-3.5 h-3.5 text-rose-500" />
                      <span>Desconectar</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleAction('restart', () => onRestart(instance.id))}
                  disabled={actionLoading !== null}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar Motor</span>
                </button>

                <button
                  onClick={() => handleAction('logout', () => onLogout(instance.id))}
                  disabled={actionLoading !== null}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-600" />
                  <span>Logout Sessão</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Sessão do WhatsApp</h3>
                  <p className="text-slate-500 mt-0.5">
                    {isConnected
                      ? 'Aparelho conectado e sincronizado com o motor interno.'
                      : 'Sessão desconectada. Clique em Conectar para gerar novo QR Code.'}
                  </p>
                </div>
                <StatusBadge status={instance.status} />
              </div>

              {!isConnected && (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                  <QrCode className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">Nenhum QR Code ativo no momento</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Inicie a conexão para ler o QR Code com seu WhatsApp.
                  </p>
                  <button
                    onClick={() => onOpenQR(instance)}
                    className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Iniciar Conexão & Exibir QR</span>
                  </button>
                </div>
              )}

              {isConnected && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Conexão Ativa via WooHub Unified Gateway
                  </div>
                  <p className="text-xs text-emerald-700">
                    Todas as mensagens enviadas para o endpoint <code>/v1/messages/text</code> com este
                    instanceId serão roteadas automaticamente para o motor <strong>{instance.engine}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-3">
              {instanceMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma mensagem registrada nesta instância.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {instanceMessages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-white hover:bg-slate-50">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">
                          {msg.direction === 'outbound' ? 'Para: ' : 'De: '}
                          <span className="font-mono">{msg.to || msg.from}</span>
                        </span>
                        <span className="font-mono">
                          {new Date(msg.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-800 mt-1">
                        {msg.content.text || msg.content.caption || `[${msg.type}]`}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] uppercase font-mono text-slate-600">
                          {msg.type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono text-emerald-700">
                          {msg.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-3">
              <p className="text-slate-600">
                Webhooks que escutam eventos originados por esta instância:
              </p>
              <div className="space-y-2">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{wh.name}</p>
                      <p className="text-slate-500 font-mono text-[11px] truncate max-w-md">{wh.url}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              {instanceLogs.length === 0 ? (
                <p className="text-slate-400 text-center py-6">Nenhum log para esta instância.</p>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  {instanceLogs.map((l) => (
                    <div key={l.id} className="p-2 rounded bg-slate-50 border border-slate-200/60 flex items-start gap-2">
                      <span className="text-slate-400 shrink-0">
                        {new Date(l.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                      <span className="font-semibold text-slate-700 uppercase">[{l.event}]</span>
                      <span className="text-slate-600">{l.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">Configurações Avançadas</h3>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Webhook Customizado (Opcional para esta instância)
                  </label>
                  <input
                    type="url"
                    defaultValue={instance.customWebhookUrl || ''}
                    placeholder="https://seu-sistema.com/webhook-exclusivo"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Se configurado, substitui os webhooks globais para esta conexão.
                  </p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-rose-100 space-y-3">
                <h3 className="font-semibold text-rose-800 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Zona de Perigo
                </h3>
                <p className="text-slate-500">
                  A remoção da instância desconecta permanentemente a sessão e revoga o identificador.
                </p>

                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium border border-rose-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir esta Instância</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                    <p className="font-semibold text-rose-900 text-xs">
                      Tem certeza absoluta que deseja excluir a instância &quot;{instance.name}&quot;?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await onDelete(instance.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-xs"
                      >
                        Confirmar Exclusão
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
