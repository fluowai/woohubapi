import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  QrCode,
  Power,
  RotateCcw,
  MoreVertical,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Send
} from 'lucide-react';
import { EngineType, Instance, WooHubStatus } from '../../types';
import { EngineBadge, StatusBadge } from '../common/StatusBadge';

interface InstancesViewProps {
  instances: Instance[];
  onOpenCreateInstance: () => void;
  onOpenQR: (instance: Instance) => void;
  onViewDetail: (instance: Instance) => void;
  onDisconnect: (id: string) => Promise<any>;
  onOpenSendMessage: () => void;
}

export const InstancesView: React.FC<InstancesViewProps> = ({
  instances,
  onOpenCreateInstance,
  onOpenQR,
  onViewDetail,
  onDisconnect,
  onOpenSendMessage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [engineFilter, setEngineFilter] = useState<'all' | EngineType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'disconnected'>('all');

  const filteredInstances = instances.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.phoneNumber && inst.phoneNumber.includes(searchTerm)) ||
      inst.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEngine = engineFilter === 'all' || inst.engine === engineFilter;

    let matchesStatus = true;
    if (statusFilter === 'connected') matchesStatus = inst.status === 'CONNECTED';
    if (statusFilter === 'disconnected') matchesStatus = inst.status !== 'CONNECTED';

    return matchesSearch && matchesEngine && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Instâncias</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie suas conexões do WhatsApp através da API unificada da WooHub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateInstance}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova instância</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, número ou ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-hidden"
          />
        </div>

        {/* Engine and Status Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 mr-1">Motor:</span>
            {(['all', 'waha', 'wuzapi', 'whatsmeow'] as const).map((eng) => (
              <button
                key={eng}
                onClick={() => setEngineFilter(eng)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  engineFilter === eng
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {eng === 'all' ? 'Todos' : eng === 'whatsmeow' ? 'whatsmeow' : eng.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Status filter */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('connected')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'connected'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Conectados
            </button>
            <button
              onClick={() => setStatusFilter('disconnected')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'disconnected'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Desconectados
            </button>
          </div>
        </div>
      </div>

      {/* Instances Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Número</th>
                <th className="py-3 px-4">Motor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Última conexão</th>
                <th className="py-3 px-4">Mensagens</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-slate-600">Nenhuma instância encontrada</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Crie sua primeira conexão clicando em &quot;+ Nova instância&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInstances.map((inst) => (
                  <tr
                    key={inst.id}
                    onClick={() => onViewDetail(inst)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    {/* Nome */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[11px] shrink-0">
                          {inst.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{inst.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{inst.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Número */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {inst.phoneNumber || <span className="text-slate-400 italic">Pendente</span>}
                    </td>

                    {/* Motor */}
                    <td className="py-3.5 px-4">
                      <EngineBadge engine={inst.engine} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inst.status} size="sm" />
                    </td>

                    {/* Última Conexão */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {inst.lastConnectedAt ? (
                        new Date(inst.lastConnectedAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Mensagens */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      <span>↑ {inst.messageCount.sent.toLocaleString('pt-BR')}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span>↓ {inst.messageCount.received.toLocaleString('pt-BR')}</span>
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {inst.status !== 'CONNECTED' ? (
                          <button
                            onClick={() => onOpenQR(inst)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200 flex items-center gap-1 transition-colors"
                            title="Conectar WhatsApp via QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Conectar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onDisconnect(inst.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Desconectar"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onViewDetail(inst)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Detalhes da Instância"
                        >
                          <ChevronRight className="w-4 h-4" />
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
    </div>
  );
};
