import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  MessageSquare,
  Key,
  Webhook,
  BookOpen,
  ScrollText,
  Users,
  CreditCard,
  Settings,
  Shield,
  Cpu,
  Server,
  Building2,
  Container,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Organization } from '../../types';

export type NavigationTab =
  | 'overview'
  | 'instances'
  | 'messages'
  | 'api-keys'
  | 'webhooks'
  | 'developers'
  | 'logs'
  | 'team'
  | 'billing'
  | 'settings'
  | 'admin-clients'
  | 'admin-engines'
  | 'admin-servers'
  | 'docker-guide';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  organization: Organization;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  organization,
  isCollapsed,
  onToggleCollapse,
  isAdminMode,
  onToggleAdminMode
}) => {
  const mainItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'instances', label: 'Instâncias', icon: Smartphone },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare }
  ];

  const devItems = [
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'developers', label: 'Documentação', icon: BookOpen },
    { id: 'logs', label: 'Logs', icon: ScrollText }
  ];

  const manageItems = [
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'billing', label: 'Planos e Uso', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const adminItems = [
    { id: 'admin-engines', label: 'Motores', icon: Cpu },
    { id: 'admin-servers', label: 'Servidores', icon: Server },
    { id: 'admin-clients', label: 'Clientes', icon: Building2 },
    { id: 'docker-guide', label: 'Portainer & Docker', icon: Container }
  ];

  const renderNavButton = (item: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id as NavigationTab)}
        title={isCollapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-slate-900 text-white font-semibold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  return (
    <aside
      className={`h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              W
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">WooHub</span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded tracking-wide">
                  Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">Unified WhatsApp API</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            W
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Principal */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Principal
            </p>
          )}
          <div className="space-y-1">{mainItems.map(renderNavButton)}</div>
        </div>

        {/* Desenvolvedores */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Desenvolvedores
            </p>
          )}
          <div className="space-y-1">{devItems.map(renderNavButton)}</div>
        </div>

        {/* Gerenciamento */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Gerenciamento
            </p>
          )}
          <div className="space-y-1">{manageItems.map(renderNavButton)}</div>
        </div>

        {/* Administração WooHub */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 mb-2">
            {!isCollapsed && (
              <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-600" />
                Admin WooHub
              </p>
            )}
          </div>
          <div className="space-y-1">{adminItems.map(renderNavButton)}</div>
        </div>
      </div>

      {/* Bottom Tenant Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-slate-900 truncate">{organization.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span className="text-[11px] text-slate-500 capitalize">
                  Plano {organization.planId}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('billing')}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 shrink-0"
            >
              Uso
            </button>
          </div>
        ) : (
          <div className="flex justify-center" title={`${organization.name} - Plano ${organization.planId}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
