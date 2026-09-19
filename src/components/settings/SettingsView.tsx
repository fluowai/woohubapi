import React, { useState } from 'react';
import {
  Key,
  Building,
  Shield,
  Server,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Cpu
} from 'lucide-react';
import { ApiKey, Organization } from '../../types';

interface SettingsViewProps {
  currentOrg: Organization;
  apiKeys: ApiKey[];
  onCreateApiKey: (name: string, permissions: ApiKey['permissions']) => void;
  onRevokeApiKey: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentOrg,
  apiKeys,
  onCreateApiKey,
  onRevokeApiKey
}) => {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'org' | 'engines' | 'security'>('api-keys');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyRole, setKeyRole] = useState<'admin' | 'write' | 'read-only'>('admin');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    const perms: ApiKey['permissions'] =
      keyRole === 'admin'
        ? ['admin', 'instances', 'messages', 'read', 'write']
        : keyRole === 'write'
        ? ['write', 'messages']
        : ['read'];
    onCreateApiKey(keyName.trim(), perms);
    setKeyName('');
    setShowNewKeyModal(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gerenciamento de API Keys, Organização, Motores e Políticas de Segurança.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        {[
          { id: 'api-keys', label: 'Chaves de API', icon: Key },
          { id: 'org', label: 'Organização', icon: Building },
          { id: 'engines', label: 'Motores & Servidores', icon: Cpu },
          { id: 'security', label: 'Segurança & HMAC', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: API Keys */}
      {activeTab === 'api-keys' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Chaves de API (Tokens de Acesso)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Utilize estas chaves no cabeçalho <code>Authorization: Bearer &lt;token&gt;</code> para
                acessar a WooHub API.
              </p>
            </div>

            <button
              onClick={() => setShowNewKeyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Chave</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{key.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 text-slate-700">
                        {key.permissions.includes('admin') ? 'ADMIN' : key.permissions.join(', ')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Criada em {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-600 text-xs">
                      <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {key.prefix}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(key.prefix, key.id)}
                        className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        {copiedKeyId === key.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKeyId === key.id ? 'Copiado!' : 'Copiar Token'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRevokeApiKey(key.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Revogar chave de API"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Organização */}
      {activeTab === 'org' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4 max-w-xl text-xs">
          <h2 className="text-sm font-bold text-slate-900">Configurações da Organização</h2>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nome da Organização</label>
            <input
              type="text"
              defaultValue={currentOrg.name}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Identificador (Slug)</label>
            <input
              type="text"
              defaultValue={currentOrg.slug}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
              disabled
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Plano Atual</label>
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm">Plano Enterprise</span>
                <p className="text-[11px] text-emerald-700">Instâncias ilimitadas com alta disponibilidade.</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-xs">
                Ativo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Motores & Servidores */}
      {activeTab === 'engines' && (
        <div className="space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Cluster de Motores WhatsApp</h2>
            <p className="text-slate-500 mt-0.5">
              Status operacional dos nós e clusters que alimentam a arquitetura multi-motor WooHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WAHA Cluster */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Cluster WAHA PLUS</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Online
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Versão: 2024.12 • Node.js / Chromium Engine
              </p>
              <div className="text-[11px] text-slate-600 font-mono pt-2 border-t border-slate-100">
                Latência média: 14ms • Mem: ~180MB/inst
              </div>
            </div>

            {/* WuzAPI Cluster */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Cluster WuzAPI</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Online
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Versão: 1.8.4 • Golang REST / SQLite Engine
              </p>
              <div className="text-[11px] text-slate-600 font-mono pt-2 border-t border-slate-100">
                Latência média: 6ms • Mem: ~45MB/inst
              </div>
            </div>

            {/* whatsmeow Cluster */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Cluster whatsmeow</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Online
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Versão: 0.1.2 • Pure Go Socket Multi-Device
              </p>
              <div className="text-[11px] text-slate-600 font-mono pt-2 border-t border-slate-100">
                Latência média: 4ms • Mem: ~30MB/inst
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Segurança & HMAC */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4 max-w-xl text-xs">
          <h2 className="text-sm font-bold text-slate-900">Segurança & Verificação Criptográfica</h2>
          <p className="text-slate-600">
            Todos os webhooks disparados pela WooHub incluem a assinatura criptográfica HMAC-SHA256
            no cabeçalho <code>X-WooHub-Signature</code>.
          </p>

          <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px]">
            {`// Exemplo de verificação em Node.js
const crypto = require('crypto');
const expected = 'sha256=' + crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');

if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
  // Webhook autêntico da WooHub!
}`}
          </div>
        </div>
      )}

      {/* Modal: Nova Chave de API */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Criar Nova Chave de API</h3>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome da Chave</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="Ex: Integração Woodesk CRM Produção"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Perfil de Permissão</label>
                <select
                  value={keyRole}
                  onChange={(e) => setKeyRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="admin">Administrador (Total: Envio, Criação e Gestão)</option>
                  <option value="write">Escrita (Apenas Disparar Mensagens)</option>
                  <option value="read-only">Leitura (Apenas Consultar Status e Histórico)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewKeyModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Gerar Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
