import React from 'react';
import { EngineType, WooHubStatus } from '../../types';

export const EngineBadge: React.FC<{ engine: EngineType; size?: 'sm' | 'md' }> = ({
  engine,
  size = 'md'
}) => {
  const styles: Record<EngineType, { label: string; bg: string; text: string; border: string }> = {
    waha: {
      label: 'WAHA',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200'
    },
    wuzapi: {
      label: 'WuzAPI',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    },
    whatsmeow: {
      label: 'whatsmeow',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200'
    }
  };

  const current = styles[engine] || styles.wuzapi;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClass}`}
    >
      {current.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: WooHubStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md'
}) => {
  const configs: Record<
    WooHubStatus,
    { label: string; dot: string; bg: string; text: string; border: string }
  > = {
    CONNECTED: {
      label: 'Conectado',
      dot: 'bg-emerald-500',
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    },
    WAITING_QR: {
      label: 'Aguardando QR',
      dot: 'bg-amber-500 animate-pulse',
      bg: 'bg-amber-50/70',
      text: 'text-amber-800',
      border: 'border-amber-200'
    },
    PAIRING: {
      label: 'Pareando...',
      dot: 'bg-purple-500 animate-pulse',
      bg: 'bg-purple-50/70',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    STARTING: {
      label: 'Iniciando',
      dot: 'bg-blue-500 animate-pulse',
      bg: 'bg-blue-50/70',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    RECONNECTING: {
      label: 'Reconectando',
      dot: 'bg-amber-500 animate-pulse',
      bg: 'bg-amber-50/70',
      text: 'text-amber-700',
      border: 'border-amber-200'
    },
    DISCONNECTED: {
      label: 'Desconectado',
      dot: 'bg-rose-500',
      bg: 'bg-rose-50/70',
      text: 'text-rose-700',
      border: 'border-rose-200'
    },
    LOGGED_OUT: {
      label: 'Desvinculado',
      dot: 'bg-slate-400',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200'
    },
    CREATED: {
      label: 'Criado',
      dot: 'bg-slate-400',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200'
    },
    ERROR: {
      label: 'Erro',
      dot: 'bg-rose-600',
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      border: 'border-rose-300'
    }
  };

  const current = configs[status] || configs.DISCONNECTED;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
