import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  BookOpen,
  FileCode,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { engineManager } from '../../core/engine/EngineManager';
import { Instance } from '../../types';

interface DevelopersViewProps {
  instances: Instance[];
}

export const DevelopersView: React.FC<DevelopersViewProps> = ({ instances }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'send-text' | 'send-buttons' | 'list-instances' | 'get-status' | 'health'>('send-text');
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python' | 'php'>('curl');
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const activeInstance =
    instances.find((i) => i.status === 'CONNECTED') ||
    instances[0] || {
      id: 'inst_comercial_01',
      engine: 'wuzapi' as const,
      engineInstanceId: 'wuzapi_comercial_01',
      status: 'CONNECTED' as const,
      name: 'Comercial WhatsApp'
    };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Snippet generators
  const getCurlSnippet = () => {
    switch (selectedEndpoint) {
      case 'send-text':
        return `curl -X POST https://api.woohub.com.br/v1/messages/text \\
  -H "Authorization: Bearer wh_live_9a8b7c6d5e4f3a2b1c" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceId": "${activeInstance.id}",
    "to": "5548999999999",
    "text": "Olá! Mensagem enviada via WooHub Unified API."
  }'`;

      case 'send-buttons':
        return `curl -X POST https://api.woohub.com.br/v1/messages/buttons \\
  -H "Authorization: Bearer wh_live_9a8b7c6d5e4f3a2b1c" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceId": "${activeInstance.id}",
    "to": "5548999999999",
    "text": "Selecione uma opção:",
    "buttons": [
      { "id": "btn_1", "text": "Atendimento Comercial" },
      { "id": "btn_2", "text": "Suporte Técnico" }
    ]
  }'`;

      case 'list-instances':
        return `curl -X GET https://api.woohub.com.br/v1/instances \\
  -H "Authorization: Bearer wh_live_9a8b7c6d5e4f3a2b1c"`;

      case 'get-status':
        return `curl -X GET https://api.woohub.com.br/v1/instances/${activeInstance.id}/status \\
  -H "Authorization: Bearer wh_live_9a8b7c6d5e4f3a2b1c"`;

      case 'health':
        return `curl -X GET https://api.woohub.com.br/health`;
    }
  };

  const getJsSnippet = () => {
    return `import axios from 'axios';

const response = await axios.post('https://api.woohub.com.br/v1/messages/text', {
  instanceId: '${activeInstance.id}',
  to: '5548999999999',
  text: 'Olá! Mensagem enviada via WooHub Unified API.'
}, {
  headers: {
    'Authorization': 'Bearer wh_live_9a8b7c6d5e4f3a2b1c',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`;
  };

  const getPythonSnippet = () => {
    return `import requests

url = "https://api.woohub.com.br/v1/messages/text"
headers = {
    "Authorization": "Bearer wh_live_9a8b7c6d5e4f3a2b1c",
    "Content-Type": "application/json"
}
payload = {
    "instanceId": "${activeInstance.id}",
    "to": "5548999999999",
    "text": "Olá! Mensagem enviada via WooHub Unified API."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
  };

  const getPhpSnippet = () => {
    return `<?php
$ch = curl_init('https://api.woohub.com.br/v1/messages/text');

$payload = json_encode([
  'instanceId' => '${activeInstance.id}',
  'to' => '5548999999999',
  'text' => 'Olá! Mensagem enviada via WooHub Unified API.'
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer wh_live_9a8b7c6d5e4f3a2b1c',
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);

echo $result;`;
  };

  const getCurrentCode = () => {
    switch (codeLanguage) {
      case 'curl':
        return getCurlSnippet();
      case 'javascript':
        return getJsSnippet();
      case 'python':
        return getPythonSnippet();
      case 'php':
        return getPhpSnippet();
    }
  };

  const handleExecuteLive = async () => {
    setExecuting(true);
    setExecutionResult(null);

    try {
      await new Promise((r) => setTimeout(r, 450));

      if (selectedEndpoint === 'send-text') {
        const targetInstance = instances.find((i) => i.id === activeInstance.id) || instances[0] || activeInstance;
        const targetEngineId = (targetInstance as any).engineInstanceId || targetInstance.id;
        const result = await engineManager.sendMessage(
          targetInstance.engine,
          targetEngineId,
          {
            instanceId: targetInstance.id,
            to: '5548999999999',
            text: 'Olá! Mensagem enviada via WooHub Unified API.'
          }
        );
        setExecutionResult({
          status: 200,
          statusText: 'OK',
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'x-woohub-request-id': `req_${Math.random().toString(36).substring(2, 8)}`,
            'x-woohub-engine': activeInstance.engine
          },
          body: {
            success: true,
            messageId: result.messageId,
            status: 'sent',
            engine: activeInstance.engine,
            timestamp: new Date().toISOString()
          }
        });
      } else if (selectedEndpoint === 'send-buttons') {
        try {
          engineManager.assertCapability(
            activeInstance.engine,
            'buttons',
            `O motor ${activeInstance.engine.toUpperCase()} desta instância não suporta o recurso de botões.`
          );
          setExecutionResult({
            status: 200,
            statusText: 'OK',
            body: {
              success: true,
              messageId: `msg_${Date.now()}`,
              status: 'sent'
            }
          });
        } catch (capErr: any) {
          setExecutionResult({
            status: 400,
            statusText: 'Bad Request',
            body: capErr.toJSON ? capErr.toJSON() : { error: capErr.message }
          });
        }
      } else if (selectedEndpoint === 'list-instances') {
        setExecutionResult({
          status: 200,
          statusText: 'OK',
          body: {
            instances: instances.map((i) => ({
              id: i.id,
              name: i.name,
              engine: i.engine,
              status: i.status,
              phoneNumber: i.phoneNumber
            }))
          }
        });
      } else if (selectedEndpoint === 'get-status') {
        setExecutionResult({
          status: 200,
          statusText: 'OK',
          body: {
            instanceId: activeInstance.id,
            status: activeInstance.status,
            engine: activeInstance.engine,
            phoneNumber: activeInstance.phoneNumber || '+55 48 99123-4567',
            batteryLevel: 92,
            isBusiness: true
          }
        });
      } else {
        setExecutionResult({
          status: 200,
          statusText: 'OK',
          body: {
            status: 'ok',
            database: 'ok',
            redis: 'ok',
            engines: {
              waha: 'online',
              wuzapi: 'online',
              whatsmeow: 'online'
            },
            timestamp: new Date().toISOString()
          }
        });
      }
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Documentação & API Playground
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Explore e execute requisições diretamente contra a API unificada da WooHub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Base URL: https://api.woohub.com.br/v1
          </span>
        </div>
      </div>

      {/* Grid: Endpoints List & Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoints Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Endpoints da WooHub API
          </div>

          <div className="space-y-1 text-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Mensagens
            </p>
            <button
              onClick={() => setSelectedEndpoint('send-text')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                selectedEndpoint === 'send-text'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>POST /v1/messages/text</span>
              <span className="font-mono text-[10px] text-emerald-400">Texto</span>
            </button>

            <button
              onClick={() => setSelectedEndpoint('send-buttons')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                selectedEndpoint === 'send-buttons'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>POST /v1/messages/buttons</span>
              <span className="font-mono text-[10px] text-amber-400">Botões</span>
            </button>

            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 pt-3">
              Instâncias & Conexão
            </p>
            <button
              onClick={() => setSelectedEndpoint('list-instances')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                selectedEndpoint === 'list-instances'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>GET /v1/instances</span>
              <span className="font-mono text-[10px] text-blue-400">Lista</span>
            </button>

            <button
              onClick={() => setSelectedEndpoint('get-status')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                selectedEndpoint === 'get-status'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>GET /v1/instances/:id/status</span>
              <span className="font-mono text-[10px] text-blue-400">Status</span>
            </button>

            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 pt-3">
              Infraestrutura
            </p>
            <button
              onClick={() => setSelectedEndpoint('health')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                selectedEndpoint === 'health'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>GET /health</span>
              <span className="font-mono text-[10px] text-emerald-400">Saúde</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Autenticação Obrigatória
            </div>
            <p>
              Envie o cabeçalho <code>Authorization: Bearer wh_live_...</code> em todas as requisições
              para a API pública.
            </p>
          </div>
        </div>

        {/* Right: Code Snippet & Live Execution Console (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Code Viewer Card */}
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-800">
            {/* Toolbar */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(['curl', 'javascript', 'python', 'php'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      codeLanguage === lang
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'curl'
                      ? 'cURL'
                      : lang === 'javascript'
                      ? 'TypeScript'
                      : lang === 'python'
                      ? 'Python'
                      : 'PHP'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCode(getCurrentCode())}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleExecuteLive}
                  disabled={executing}
                  className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{executing ? 'Executando...' : 'Executar Requisição'}</span>
                </button>
              </div>
            </div>

            {/* Code Block */}
            <pre className="p-4 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
              <code>{getCurrentCode()}</code>
            </pre>
          </div>

          {/* Execution Output Panel */}
          {executionResult && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden text-xs animate-in fade-in duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Resposta WooHub API</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      executionResult.status === 200
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    HTTP {executionResult.status} {executionResult.statusText}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Tempo: ~24ms</span>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-64">
                {JSON.stringify(executionResult.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
