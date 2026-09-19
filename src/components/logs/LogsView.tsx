import React, { useState } from 'react';
import {
  Terminal,
  Search,
  Filter,
  Download,
  Trash2,
  Play,
  Pause,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { LogEntry } from '../../types';
import { EngineBadge } from '../common/StatusBadge';

interface LogsViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [engineFilter, setEngineFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.requestId && l.requestId.includes(searchTerm)) ||
      (l.instanceId && l.instanceId.includes(searchTerm));

    const matchesLevel = levelFilter === 'all' || l.level === levelFilter;
    const matchesEngine = engineFilter === 'all' || l.engine === engineFilter;

    return matchesSearch && matchesLevel && matchesEngine;
  });

  const copyLog = (log: LogEntry) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `woohub-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Logs Estruturados</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Observabilidade unificada em formato JSON estruturado para auditoria e tracing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>
          <button
            onClick={onClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por mensagem, evento, request_id..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:border-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Nível:</span>
            {(['all', 'info', 'warn', 'error'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-1 rounded font-medium ${
                  levelFilter === lvl
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <span className="text-slate-500">Motor:</span>
            {['all', 'waha', 'wuzapi', 'whatsmeow'].map((eng) => (
              <button
                key={eng}
                onClick={() => setEngineFilter(eng)}
                className={`px-2 py-1 rounded font-medium ${
                  engineFilter === eng
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {eng === 'all' ? 'TODOS' : eng.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Console Window */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-lg overflow-hidden font-mono text-xs">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200 text-xs">WooHub Tracing Stream</span>
            <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full">
              {filteredLogs.length} eventos
            </span>
          </div>
          <span className="text-[11px] text-slate-500">JSON Lines Format</span>
        </div>

        <div className="p-3 space-y-1.5 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Nenhum log encontrado para os filtros selecionados.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const levelColor =
                log.level === 'error'
                  ? 'text-rose-400'
                  : log.level === 'warn'
                  ? 'text-amber-400'
                  : 'text-emerald-400';

              return (
                <div
                  key={log.id}
                  className="p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 flex items-start justify-between gap-3 group transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500">
                        {new Date(log.timestamp).toISOString()}
                      </span>
                      <span className={`font-bold uppercase ${levelColor}`}>[{log.level}]</span>
                      <span className="text-purple-300 font-semibold">{log.event}</span>
                      {log.engine && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                          {log.engine}
                        </span>
                      )}
                      {log.durationMs !== undefined && (
                        <span className="text-slate-500">{log.durationMs}ms</span>
                      )}
                      {log.requestId && (
                        <span className="text-slate-600 truncate max-w-[120px]">
                          {log.requestId}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 text-xs">{log.message}</p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-[11px] text-slate-400 pl-2 border-l border-slate-800">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => copyLog(log)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-opacity shrink-0"
                    title="Copiar JSON do log"
                  >
                    {copiedId === log.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
