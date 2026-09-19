import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Plus,
  Terminal,
  Menu,
  ShieldCheck,
  Container,
  Send,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Organization } from '../../types';

interface TopBarProps {
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  onOpenCreateInstance: () => void;
  onOpenSendMessage: () => void;
  onOpenDockerGuide: () => void;
  onOpenMobileMenu: () => void;
  unacknowledgedLogsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentOrg,
  organizations,
  onSelectOrg,
  onOpenCreateInstance,
  onOpenSendMessage,
  onOpenDockerGuide,
  onOpenMobileMenu,
  unacknowledgedLogsCount = 0
}) => {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile trigger & Organization switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 text-sm font-medium text-slate-800 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="truncate max-w-[140px] md:max-w-[200px]">{currentOrg.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showOrgDropdown && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Organizações Multi-Tenant
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrg(org);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 ${
                    org.id === currentOrg.id ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  <span className="text-[10px] uppercase font-mono text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                    {org.planId}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Engine Operational Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Motores Ativos:</span>
          <span className="text-emerald-700 font-mono text-[11px]">WAHA • WuzAPI • whatsmeow</span>
        </div>
      </div>

      {/* Right: Quick actions & user menu */}
      <div className="flex items-center gap-2.5">
        {/* Docker & Portainer Quick Button */}
        <button
          onClick={onOpenDockerGuide}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors"
          title="Ver Docker Compose e Portainer Stack"
        >
          <Container className="w-3.5 h-3.5 text-blue-600" />
          <span>Portainer / Docker</span>
        </button>

        {/* Send message quick button */}
        <button
          onClick={onOpenSendMessage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Disparar</span> Mensagem
        </button>

        {/* Create instance primary CTA */}
        <button
          onClick={onOpenCreateInstance}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Instância</span>
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Eventos Recentes</span>
                <span className="text-[11px] text-emerald-600 font-medium">Gateway 100% OK</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                <div className="px-4 py-2.5 hover:bg-slate-50">
                  <p className="font-medium text-slate-800">Instância Comercial conectada</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Motor WuzAPI sincronizado com sucesso</p>
                </div>
                <div className="px-4 py-2.5 hover:bg-slate-50">
                  <p className="font-medium text-slate-800">Webhook Woodesk CRM entregue</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">HTTP 200 OK em 38ms com assinatura HMAC</p>
                </div>
                <div className="px-4 py-2.5 hover:bg-slate-50">
                  <p className="font-medium text-slate-800">Socket whatsmeow ativo</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Memória: 28MB | Latência: 4ms</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            PA
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">Paulo Argolo</p>
            <p className="text-[10px] text-slate-500 leading-tight">argolopaulo5@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};
