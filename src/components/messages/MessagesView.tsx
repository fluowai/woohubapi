import React, { useState } from 'react';
import {
  Search,
  Filter,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { EngineType, Instance, MessageDirection, MessageStatus, WooHubMessage } from '../../types';
import { EngineBadge } from '../common/StatusBadge';

interface MessagesViewProps {
  messages: WooHubMessage[];
  instances: Instance[];
  onOpenSendMessage: () => void;
  onOpenSimulateInbound: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  messages,
  instances,
  onOpenSendMessage,
  onOpenSimulateInbound
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [engineFilter, setEngineFilter] = useState<'all' | EngineType>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | MessageDirection>('all');
  const [selectedMessage, setSelectedMessage] = useState<WooHubMessage | null>(null);

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.to.includes(searchTerm) ||
      m.from.includes(searchTerm) ||
      (m.content.text && m.content.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEngine = engineFilter === 'all' || m.engine === engineFilter;
    const matchesDirection = directionFilter === 'all' || m.direction === directionFilter;

    return matchesSearch && matchesEngine && matchesDirection;
  });

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'read':
        return <span title="Lida"><CheckCheck className="w-3.5 h-3.5 text-blue-500" /></span>;
      case 'delivered':
        return <span title="Entregue"><CheckCheck className="w-3.5 h-3.5 text-slate-400" /></span>;
      case 'sent':
        return <span title="Enviada"><Check className="w-3.5 h-3.5 text-slate-400" /></span>;
      case 'queued':
        return <span title="Na fila"><Clock className="w-3.5 h-3.5 text-amber-500" /></span>;
      case 'failed':
        return <span title="Falha"><AlertCircle className="w-3.5 h-3.5 text-rose-500" /></span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mensagens</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Histórico normalizado de mensagens inbound e outbound de todas as conexões.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSimulateInbound}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Simular Inbound</span>
          </button>
          <button
            onClick={onOpenSendMessage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nova Mensagem</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por telefone, conteúdo ou ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 outline-hidden"
          />
        </div>

        {/* Engine and Direction filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Motor:</span>
          {(['all', 'waha', 'wuzapi', 'whatsmeow'] as const).map((eng) => (
            <button
              key={eng}
              onClick={() => setEngineFilter(eng)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                engineFilter === eng
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {eng === 'all' ? 'Todos' : eng === 'whatsmeow' ? 'whatsmeow' : eng.toUpperCase()}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <button
            onClick={() => setDirectionFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              directionFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setDirectionFilter('inbound')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              directionFilter === 'inbound'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Entrada
          </button>
          <button
            onClick={() => setDirectionFilter('outbound')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              directionFilter === 'outbound'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Saída
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4">Instância</th>
                <th className="py-3 px-4">Motor</th>
                <th className="py-3 px-4">Destino / Origem</th>
                <th className="py-3 px-4">Conteúdo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Direção</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-slate-600">Nenhuma mensagem encontrada</p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => {
                  const inst = instances.find((i) => i.id === msg.instanceId);
                  return (
                    <tr
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Horário */}
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(msg.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>

                      {/* Instância */}
                      <td className="py-3 px-4 font-medium text-slate-900 truncate max-w-[140px]">
                        {inst?.name || msg.instanceId}
                      </td>

                      {/* Motor */}
                      <td className="py-3 px-4">
                        <EngineBadge engine={msg.engine} size="sm" />
                      </td>

                      {/* Destino / Origem */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {msg.direction === 'outbound' ? msg.to : msg.from}
                      </td>

                      {/* Conteúdo */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                        {msg.content.text ||
                          msg.content.caption ||
                          (msg.content.buttons ? `[Botões: ${msg.content.buttons.map(b => b.text).join(', ')}]` : `[${msg.type}]`)}
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4">
                        <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {msg.type}
                        </span>
                      </td>

                      {/* Direção */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-medium text-[11px] px-2 py-0.5 rounded-md ${
                            msg.direction === 'outbound'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {msg.direction === 'outbound' ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                              <span>Saída</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-blue-600" />
                              <span>Entrada</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(msg.status)}
                          <span className="capitalize text-[11px] text-slate-600">{msg.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Inspection Drawer/Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Detalhes da Mensagem</span>
                <EngineBadge engine={selectedMessage.engine} size="sm" />
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400">ID WooHub:</span>
                  <p className="font-mono font-semibold text-slate-800">{selectedMessage.id}</p>
                </div>
                <div>
                  <span className="text-slate-400">ID Motor Original:</span>
                  <p className="font-mono font-semibold text-slate-800">
                    {selectedMessage.rawEngineMessageId || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">De (Remetente):</span>
                  <p className="font-mono text-slate-800">{selectedMessage.from}</p>
                </div>
                <div>
                  <span className="text-slate-400">Para (Destinatário):</span>
                  <p className="font-mono text-slate-800">{selectedMessage.to}</p>
                </div>
                <div>
                  <span className="text-slate-400">Horário:</span>
                  <p className="text-slate-800">{new Date(selectedMessage.timestamp).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <p className="font-medium text-emerald-700 capitalize">{selectedMessage.status}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Payload Normalizado:</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedMessage, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
