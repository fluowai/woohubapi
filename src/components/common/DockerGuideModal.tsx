import React, { useState } from 'react';
import {
  X,
  Container,
  Copy,
  Check,
  Terminal,
  FileCode,
  Layers,
  Server,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface DockerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DockerGuideModal: React.FC<DockerGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'vps-guide' | 'env'>('compose');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const COMPOSE_YAML = `version: '3.8'

services:
  # WooHub API Gateway & Orchestrator
  woohub-api:
    image: woohub/api:latest
    container_name: woohub-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - DATABASE_URL=postgresql://woohub:woohub_secret@postgres:5432/woohub
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=wh_jwt_super_secret_production_key_32_bytes
      - WAHA_URL=http://waha:3000
      - WUZAPI_URL=http://wuzapi:8080
      - WHATSMEOW_URL=http://whatsmeow:8081
    depends_on:
      - postgres
      - redis
      - waha
      - wuzapi
      - whatsmeow

  # Motor 1: WAHA PLUS (Node.js / Chromium)
  waha:
    image: devlikeapro/waha-plus:latest
    container_name: woohub-waha
    restart: always
    environment:
      - WAHA_ZIP_LOGS=true
      - WAHA_DASHBOARD_ENABLED=false
      - WAHA_PRINT_QR=false
    ports:
      - "3001:3000"

  # Motor 2: WuzAPI (Go REST SQLite)
  wuzapi:
    image: wuzapi/wuzapi:latest
    container_name: woohub-wuzapi
    restart: always
    environment:
      - WUZAPI_ADMIN_TOKEN=wuzapi_secret_token
    volumes:
      - wuzapi_data:/app/db
    ports:
      - "8080:8080"

  # Motor 3: whatsmeow (Pure Go socket)
  whatsmeow:
    image: woohub/whatsmeow-service:latest
    container_name: woohub-whatsmeow
    restart: always
    volumes:
      - whatsmeow_data:/data
    ports:
      - "8081:8081"

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: woohub-postgres
    restart: always
    environment:
      POSTGRES_DB: woohub
      POSTGRES_USER: woohub
      POSTGRES_PASSWORD: woohub_secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    container_name: woohub-redis
    restart: always
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
  wuzapi_data:
  whatsmeow_data:`;

  const VPS_COMMANDS = `# 1. Atualize pacotes e instale Docker + Git no Ubuntu 22.04/24.04
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw docker.io docker-compose-v2

# 2. Habilite e inicie o serviço do Docker
sudo systemctl enable --now docker

# 3. Clone o repositório da infraestrutura WooHub
git clone https://github.com/woohub/woohub-stack.git /opt/woohub
cd /opt/woohub

# 4. Configure o arquivo de ambiente
cp .env.example .env
nano .env

# 5. Suba toda a stack de motores e a WooHub API
docker compose up -d

# 6. Verifique se todos os contêineres estão saudáveis
docker compose ps

# 7. Configure o firewall para proteger os motores internos
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 8. Teste o endpoint de saúde da API WooHub
curl http://localhost:3000/health`;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Container className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Docker Compose & Guia de Implantação
              </h2>
              <p className="text-[11px] text-slate-500">
                Stack unificada com WAHA PLUS, WuzAPI e whatsmeow em uma única VPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 border-b border-slate-200 bg-slate-50 font-medium">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'compose'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            docker-compose.yml
          </button>
          <button
            onClick={() => setActiveTab('vps-guide')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'vps-guide'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Implantação VPS (8 Comandos)
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'compose' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Definição completa dos contêineres:
                </span>
                <button
                  onClick={() => copyText(COMPOSE_YAML, 'compose')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 font-mono text-[11px]"
                >
                  {copied === 'compose' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied === 'compose' ? 'Copiado!' : 'Copiar YAML'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96">
                <code>{COMPOSE_YAML}</code>
              </pre>
            </div>
          )}

          {activeTab === 'vps-guide' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Passo a passo no terminal do servidor (Ubuntu):
                </span>
                <button
                  onClick={() => copyText(VPS_COMMANDS, 'vps')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 font-mono text-[11px]"
                >
                  {copied === 'vps' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied === 'vps' ? 'Copiado!' : 'Copiar Comandos'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96">
                <code>{VPS_COMMANDS}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
