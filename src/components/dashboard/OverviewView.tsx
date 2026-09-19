import React from 'react';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Activity,
  QrCode,
  Send,
  Zap,
  ShieldCheck,
  Server
} from 'lucide-react';
import { Instance, LogEntry, WooHubMessage, WooHubStatus } from '../../types';
import { EngineBadge, StatusBadge } from '../common/StatusBadge';

interface OverviewViewProps {
  instances: Instance[];
  messages: WooHubMessage[];
  logs: LogEntry[];
  onOpenCreateInstance: () => void;
  onOpenSendMessage: () => void;
  onOpenQR: (instance: Instance) => void;
  onViewInstanceDetail: (instance: Instance) => void;
  onNavigate: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  instances,
  messages,
  logs,
  onOpenCreateInstance,
  onOpenSendMessage,
  onOpenQR,
  onViewInstanceDetail,
  onNavigate
}) => {
  const connectedCount = instances.filter((i) => i.status === 'CONNECTED').length;
  const disconnectedCount = instances.filter((i) => i.status !== 'CONNECTED').length;
  const totalSent = instances.reduce((acc, i) => acc + i.messageCount.sent, 0);
  const totalReceived = instances.reduce((acc, i) => acc + i.messageCount.received, 0);
  const totalTodayMessages = totalSent + totalReceived || 12458;

  // Engine distribution stats
  const wahaCount = instances.filter((i) => i.engine === 'waha').length;
  const wuzapiCount = instances.filter((i) => i.engine === 'wuzapi').length;
  const whatsmeowCount = instances.filter((i) => i.engine === 'whatsmeow').length;

  return (
    <div className="space-y-6">
      {/* Top Greeting & Operational Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Olá, Paulo
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aqui está o status operacional unificado das suas conexões WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSendMessage}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Testar Disparo</span>
          </button>
          <button
            onClick={onOpenCreateInstance}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Nova Instância</span>
          </button>
        </div>
      </div>

      {/* Row 1: The 4 Key Metrics Requested in Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Instâncias */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Instâncias
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{instances.length}</span>
            <span className="text-xs font-medium text-emerald-600">
              {connectedCount} conectadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Multi-motor ativo</p>
        </div>

        {/* Card 2: Conectadas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conectadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{connectedCount}</span>
            <span className="text-xs font-medium text-slate-400">em operação</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sessões sincronizadas</p>
        </div>

        {/* Card 3: Desconectadas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Desconectadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{disconnectedCount}</span>
            <span className="text-xs font-medium text-rose-600">requer atenção</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Prontas para pareamento</p>
        </div>

        {/* Card 4: Mensagens Hoje */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mensagens Hoje
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {totalTodayMessages.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Taxa de entrega de 99.8%</p>
        </div>
      </div>

      {/* Row 2: Status das Instâncias & Motores WooHub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Status das Instâncias */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Status das Conexões</h2>
              <p className="text-xs text-slate-500 mt-0.5">Visão unificada das instâncias WhatsApp</p>
            </div>
            <button
              onClick={() => onNavigate('instances')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver todas ({instances.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {instances.slice(0, 5).map((inst) => (
              <div
                key={inst.id}
                onClick={() => onViewInstanceDetail(inst)}
                className="p-4 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-medium text-xs">
                    {inst.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">{inst.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {inst.phoneNumber || 'Sem número vinculado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <EngineBadge engine={inst.engine} size="sm" />
                  <StatusBadge status={inst.status} size="sm" />

                  {inst.status === 'WAITING_QR' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQR(inst);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100/80 text-amber-800 rounded-md border border-amber-200 flex items-center gap-1 transition-colors"
                    >
                      <QrCode className="w-3 h-3" />
                      Escanear
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Distribuição dos Motores */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 text-sm">Motores Ativos</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                3 Operacionais
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              A WooHub orquestra os 3 motores em uma única API padronizada.
            </p>

            <div className="space-y-3">
              {/* WAHA */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800">WAHA PLUS</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600">{wahaCount} instâncias</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Suporte completo a botões, listas e multimídia
                </p>
              </div>

              {/* WuzAPI */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800">WuzAPI Go</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600">{wuzapiCount} instâncias</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  REST em Go de alta performance (~45MB)
                </p>
              </div>

              {/* whatsmeow */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800">whatsmeow</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600">{whatsmeowCount} instâncias</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Conexão socket pura sem browser (~30MB)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Latência de despacho:</span>
            <span className="font-mono font-semibold text-emerald-700">~8.4ms</span>
          </div>
        </div>
      </div>

      {/* Row 3: Atividade Recente & Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Recente */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Atividade Recente da Plataforma
            </h2>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Ver logs completos
            </button>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs p-2.5 rounded-lg hover:bg-slate-50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800 font-medium leading-tight">{log.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                    {log.engine && <span className="uppercase text-[10px] bg-slate-100 px-1 rounded">{log.engine}</span>}
                    {log.requestId && <span className="font-mono text-slate-400">{log.requestId}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagens Recentes */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Últimas Mensagens Processadas
            </h2>
            <button
              onClick={() => onNavigate('messages')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Ver histórico
            </button>
          </div>

          <div className="space-y-3">
            {messages.slice(0, 4).map((msg) => (
              <div key={msg.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {msg.direction === 'outbound' ? 'Envio para: ' : 'Recebido de: '}
                    <span className="font-mono">{msg.to || msg.from}</span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 truncate">
                  {msg.content.text || msg.content.caption || `[Mídia: ${msg.type}]`}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <EngineBadge engine={msg.engine} size="sm" />
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                    {msg.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
