import { useEffect, useState, useRef } from 'react';
import { engineManager } from '../core/engine/EngineManager';
import { EngineRegistry } from '../core/engine/EngineRegistry';
import { eventBus } from '../core/events/EventBus';
import { EventNormalizer } from '../core/events/EventNormalizer';
import { WebhookDispatcher } from '../core/events/WebhookDispatcher';
import {
  ApiKey,
  EngineInfo,
  EngineType,
  Instance,
  LogEntry,
  MessagePayload,
  Organization,
  ServerNode,
  WebhookConfig,
  WebhookDelivery,
  WooHubEvent,
  WooHubMessage,
  WooHubStatus
} from '../types';

const INITIAL_ORGANIZATION: Organization = {
  id: 'org_woodesk_01',
  name: 'Woodesk Tecnologia',
  slug: 'woodesk',
  planId: 'professional',
  createdAt: '2026-01-10T10:00:00Z',
  instancesLimit: 20,
  messagesMonthlyLimit: 50000,
  usersLimit: 10
};

const INITIAL_ORGANIZATIONS: Organization[] = [
  INITIAL_ORGANIZATION,
  {
    id: 'org_acme_corp',
    name: 'Acme Soluções SaaS',
    slug: 'acme-corp',
    planId: 'business',
    createdAt: '2026-02-01T14:30:00Z',
    instancesLimit: 50,
    messagesMonthlyLimit: 150000,
    usersLimit: 25
  },
  {
    id: 'org_varejo_prime',
    name: 'Varejo Prime Brasil',
    slug: 'varejoprime',
    planId: 'enterprise',
    createdAt: '2026-03-05T09:15:00Z',
    instancesLimit: 100,
    messagesMonthlyLimit: 500000,
    usersLimit: 50
  }
];

const INITIAL_INSTANCES: Instance[] = [
  {
    id: 'inst_01_comercial',
    organizationId: 'org_woodesk_01',
    name: 'Comercial & Vendas',
    engine: 'wuzapi',
    engineInstanceId: 'wuz_01_comercial',
    phoneNumber: '+55 48 99123-4567',
    displayName: 'Woodesk Comercial',
    status: 'CONNECTED',
    statusMessage: 'Conexão estável via WuzAPI Go',
    batteryLevel: 92,
    isBusiness: true,
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-09-19T08:00:00Z',
    lastConnectedAt: '2026-09-19T07:15:00Z',
    messageCount: { sent: 4892, received: 3410 },
    serverNode: 'node-br-01'
  },
  {
    id: 'inst_02_suporte',
    organizationId: 'org_woodesk_01',
    name: 'Suporte Técnico',
    engine: 'whatsmeow',
    engineInstanceId: 'meow_02_suporte',
    phoneNumber: '+55 48 98844-3322',
    displayName: 'Woodesk Suporte 24/7',
    status: 'CONNECTED',
    statusMessage: 'Socket conectado em modo de alto desempenho',
    batteryLevel: 88,
    isBusiness: true,
    createdAt: '2026-08-15T09:30:00Z',
    updatedAt: '2026-09-19T08:10:00Z',
    lastConnectedAt: '2026-09-18T22:00:00Z',
    messageCount: { sent: 3210, received: 3950 },
    serverNode: 'node-br-01'
  },
  {
    id: 'inst_03_financeiro',
    organizationId: 'org_woodesk_01',
    name: 'Financeiro & Cobrança',
    engine: 'waha',
    engineInstanceId: 'waha_03_financeiro',
    phoneNumber: '+55 48 99655-1100',
    displayName: 'Financeiro Woodesk',
    status: 'CONNECTED',
    statusMessage: 'Sessão ativa com suporte a botões interativos',
    batteryLevel: 99,
    isBusiness: true,
    createdAt: '2026-08-20T16:00:00Z',
    updatedAt: '2026-09-19T07:45:00Z',
    lastConnectedAt: '2026-09-19T06:30:00Z',
    messageCount: { sent: 2150, received: 1102 },
    serverNode: 'node-br-02'
  },
  {
    id: 'inst_04_cobranca_rec',
    organizationId: 'org_woodesk_01',
    name: 'Cobrança Extraordinária',
    engine: 'wuzapi',
    engineInstanceId: 'wuz_04_cobranca',
    phoneNumber: '+55 48 99888-0011',
    displayName: 'Notificações Cobrança',
    status: 'DISCONNECTED',
    statusMessage: 'Aparelho desconectado pelo usuário',
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-18T18:20:00Z',
    lastDisconnectedAt: '2026-09-18T18:20:00Z',
    messageCount: { sent: 412, received: 89 },
    serverNode: 'node-br-02'
  }
];

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key_live_01',
    organizationId: 'org_woodesk_01',
    name: 'Chave Produção CRM Woodesk',
    prefix: 'wh_live_a8f9c2d1',
    keyHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    permissions: ['read', 'write', 'instances', 'messages'],
    createdAt: '2026-08-10T14:00:00Z',
    lastUsedAt: '2026-09-19T08:14:22Z',
    status: 'active'
  },
  {
    id: 'key_live_02',
    organizationId: 'org_woodesk_01',
    name: 'Chave Integração n8n & Typebot',
    prefix: 'wh_live_4b7e19a3',
    keyHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    permissions: ['read', 'write', 'messages'],
    createdAt: '2026-08-25T11:20:00Z',
    lastUsedAt: '2026-09-19T07:55:01Z',
    status: 'active'
  }
];

const INITIAL_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'whk_01',
    organizationId: 'org_woodesk_01',
    name: 'Webhook Woodesk CRM',
    url: 'https://crm.woodesk.com.br/api/v1/webhooks/woohub',
    secret: 'whsec_99a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4',
    isActive: true,
    events: ['message.received', 'message.sent', 'message.delivered', 'connection.connected', 'connection.disconnected'],
    instanceIds: [],
    createdAt: '2026-08-12T10:00:00Z',
    lastTriggeredAt: '2026-09-19T08:18:10Z',
    successRate: 99.8
  },
  {
    id: 'whk_02',
    organizationId: 'org_woodesk_01',
    name: 'Webhook Chatwoot / Atendimento',
    url: 'https://chat.woodesk.com.br/webhooks/whatsapp',
    secret: 'whsec_11223344556677889900aabbccddeeff',
    isActive: true,
    events: ['message.received', 'message.delivered', 'message.read'],
    instanceIds: ['inst_01_comercial', 'inst_02_suporte'],
    createdAt: '2026-08-22T15:30:00Z',
    lastTriggeredAt: '2026-09-19T08:15:44Z',
    successRate: 100.0
  }
];

const INITIAL_DELIVERIES: WebhookDelivery[] = [
  {
    id: 'del_01_recent',
    webhookId: 'whk_01',
    webhookName: 'Webhook Woodesk CRM',
    event: 'message.received',
    url: 'https://crm.woodesk.com.br/api/v1/webhooks/woohub',
    statusCode: 200,
    durationMs: 42,
    attempts: 1,
    status: 'success',
    headers: {
      'Content-Type': 'application/json',
      'X-WooHub-Event': 'message.received',
      'X-WooHub-Delivery': 'del_01_recent',
      'X-WooHub-Timestamp': '1789808290',
      'X-WooHub-Signature': 'sha256=d3f2894ba873523bf1c8502fef32678bb341054a836a9926bdfc36e88514ec64'
    },
    payload: {
      id: 'evt_1789808290_1a2b',
      event: 'message.received',
      instanceId: 'inst_01_comercial',
      organizationId: 'org_woodesk_01',
      engine: 'wuzapi',
      timestamp: '2026-09-19T08:18:10Z',
      data: {
        messageId: 'msg_884920192',
        from: '5548999998888',
        to: '5548991234567',
        body: 'Olá! Gostaria de uma demonstração do sistema para minha equipe comercial.',
        hasMedia: false,
        type: 'text'
      }
    },
    responseBody: '{"success":true,"ticketId":"tkt_99214","assigned":true}',
    createdAt: '2026-09-19T08:18:10Z'
  },
  {
    id: 'del_02_ack',
    webhookId: 'whk_01',
    webhookName: 'Webhook Woodesk CRM',
    event: 'message.delivered',
    url: 'https://crm.woodesk.com.br/api/v1/webhooks/woohub',
    statusCode: 200,
    durationMs: 38,
    attempts: 1,
    status: 'success',
    headers: {
      'Content-Type': 'application/json',
      'X-WooHub-Event': 'message.delivered',
      'X-WooHub-Delivery': 'del_02_ack',
      'X-WooHub-Timestamp': '1789808285',
      'X-WooHub-Signature': 'sha256=a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0'
    },
    payload: {
      id: 'evt_1789808285_3c4d',
      event: 'message.delivered',
      instanceId: 'inst_03_financeiro',
      organizationId: 'org_woodesk_01',
      engine: 'waha',
      timestamp: '2026-09-19T08:17:40Z',
      data: {
        messageId: 'msg_771829102',
        from: '5548996551100',
        to: '5511988887777',
        status: 'delivered'
      }
    },
    responseBody: '{"received":true}',
    createdAt: '2026-09-19T08:17:40Z'
  }
];

const INITIAL_MESSAGES: WooHubMessage[] = [
  {
    id: 'msg_01_hello',
    instanceId: 'inst_01_comercial',
    organizationId: 'org_woodesk_01',
    engine: 'wuzapi',
    from: '5548999998888',
    to: '5548991234567',
    direction: 'inbound',
    type: 'text',
    content: {
      text: 'Olá! Gostaria de uma demonstração do sistema para minha equipe comercial.'
    },
    status: 'read',
    timestamp: '2026-09-19T08:18:05Z'
  },
  {
    id: 'msg_02_reply',
    instanceId: 'inst_01_comercial',
    organizationId: 'org_woodesk_01',
    engine: 'wuzapi',
    from: '5548991234567',
    to: '5548999998888',
    direction: 'outbound',
    type: 'text',
    content: {
      text: 'Olá! Com certeza. Temos horários disponíveis hoje às 14h ou amanhã às 10h. Qual prefere?'
    },
    status: 'read',
    timestamp: '2026-09-19T08:18:18Z'
  },
  {
    id: 'msg_03_receipt',
    instanceId: 'inst_03_financeiro',
    organizationId: 'org_woodesk_01',
    engine: 'waha',
    from: '5548996551100',
    to: '5511988887777',
    direction: 'outbound',
    type: 'document',
    content: {
      caption: 'Segue em anexo a fatura referente ao ciclo de Setembro/2026.',
      filename: 'fatura_setembro_2026.pdf',
      mediaUrl: 'https://cdn.woodesk.com.br/faturas/2026/09/fat_9912.pdf'
    },
    status: 'delivered',
    timestamp: '2026-09-19T08:17:22Z'
  },
  {
    id: 'msg_04_buttons',
    instanceId: 'inst_03_financeiro',
    organizationId: 'org_woodesk_01',
    engine: 'waha',
    from: '5548996551100',
    to: '5511988887777',
    direction: 'outbound',
    type: 'buttons',
    content: {
      text: 'Como deseja efetuar o pagamento?',
      buttons: [
        { id: 'btn_pix', text: 'Chave Pix Copia e Cola' },
        { id: 'btn_boleto', text: 'Boleto Bancário' },
        { id: 'btn_card', text: 'Cartão de Crédito' }
      ]
    },
    status: 'sent',
    timestamp: '2026-09-19T08:17:25Z'
  },
  {
    id: 'msg_05_support',
    instanceId: 'inst_02_suporte',
    organizationId: 'org_woodesk_01',
    engine: 'whatsmeow',
    from: '5511977776666',
    to: '5548988443322',
    direction: 'inbound',
    type: 'text',
    content: {
      text: 'Bom dia! O webhook da nossa instância está retornando 200 certinho, obrigado pelo suporte!'
    },
    status: 'read',
    timestamp: '2026-09-19T08:15:10Z'
  }
];

const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log_01',
    timestamp: '2026-09-19T08:18:18Z',
    instanceId: 'inst_01_comercial',
    instanceName: 'Comercial & Vendas',
    engine: 'wuzapi',
    level: 'info',
    event: 'message.sent',
    message: 'Mensagem de texto enviada para +55 48 99999-8888 com sucesso via WuzAPI',
    requestId: 'req_88a91b2c'
  },
  {
    id: 'log_02',
    timestamp: '2026-09-19T08:18:10Z',
    instanceId: 'inst_01_comercial',
    instanceName: 'Comercial & Vendas',
    engine: 'wuzapi',
    level: 'info',
    event: 'message.received',
    message: 'Mensagem recebida normalizada pelo EventNormalizer (ID: msg_884920192)',
    requestId: 'req_99b82c1a'
  },
  {
    id: 'log_03',
    timestamp: '2026-09-19T08:17:40Z',
    instanceId: 'inst_03_financeiro',
    instanceName: 'Financeiro & Cobrança',
    engine: 'waha',
    level: 'info',
    event: 'webhook.dispatched',
    message: 'Webhook disparado para https://crm.woodesk.com.br com assinatura HMAC sha256 (HTTP 200)',
    requestId: 'req_11a88c77'
  },
  {
    id: 'log_04',
    timestamp: '2026-09-19T08:00:15Z',
    instanceId: 'inst_02_suporte',
    instanceName: 'Suporte Técnico',
    engine: 'whatsmeow',
    level: 'info',
    event: 'engine.heartbeat',
    message: 'Socket Go whatsmeow ativo - latência média 4ms - memória 28MB',
    requestId: 'req_33f77b99'
  }
];

const INITIAL_SERVERS: ServerNode[] = [
  {
    id: 'node-br-01',
    name: 'Brasil SP 01 (Principal)',
    host: 'node-br-01.woohub.infra',
    region: 'São Paulo (sa-east-1)',
    status: 'ONLINE',
    engines: ['waha', 'wuzapi', 'whatsmeow'],
    instancesCount: 12,
    capacity: 50,
    cpuUsage: 14.2,
    memoryUsage: 38.5,
    uptime: '42 dias 18h'
  },
  {
    id: 'node-br-02',
    name: 'Brasil SP 02 (Secundário)',
    host: 'node-br-02.woohub.infra',
    region: 'São Paulo (sa-east-1)',
    status: 'ONLINE',
    engines: ['waha', 'wuzapi', 'whatsmeow'],
    instancesCount: 6,
    capacity: 50,
    cpuUsage: 9.8,
    memoryUsage: 22.1,
    uptime: '19 dias 04h'
  },
  {
    id: 'node-us-east',
    name: 'EUA N. Virginia (Global)',
    host: 'node-us-01.woohub.infra',
    region: 'N. Virginia (us-east-1)',
    status: 'ONLINE',
    engines: ['whatsmeow', 'wuzapi'],
    instancesCount: 0,
    capacity: 100,
    cpuUsage: 3.1,
    memoryUsage: 12.0,
    uptime: '60 dias 02h'
  }
];

export function useWooHubStore() {
  const [currentOrg, setCurrentOrg] = useState<Organization>(() => {
    const saved = localStorage.getItem('woohub_org');
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATION;
  });

  const [organizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);

  const [instances, setInstances] = useState<Instance[]>(() => {
    const saved = localStorage.getItem('woohub_instances');
    return saved ? JSON.parse(saved) : INITIAL_INSTANCES;
  });

  const [messages, setMessages] = useState<WooHubMessage[]>(() => {
    const saved = localStorage.getItem('woohub_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    const saved = localStorage.getItem('woohub_apikeys');
    return saved ? JSON.parse(saved) : INITIAL_API_KEYS;
  });

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => {
    const saved = localStorage.getItem('woohub_webhooks');
    return saved ? JSON.parse(saved) : INITIAL_WEBHOOKS;
  });

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(() => {
    const saved = localStorage.getItem('woohub_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('woohub_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [servers, setServers] = useState<ServerNode[]>(INITIAL_SERVERS);
  const [engines, setEngines] = useState<EngineInfo[]>(() => EngineRegistry.getAllInfo());

  // Mutable ref to always have synchronous access to the latest instances,
  // preventing race conditions where newly created instances are not found in stale closures.
  const instancesRef = useRef<Instance[]>(instances);
  useEffect(() => {
    instancesRef.current = instances;
  }, [instances]);

  // Helper to reliably find an instance across ref, state, and storage
  const getInstance = (id: string): Instance | undefined => {
    let found = instancesRef.current.find((i) => i.id === id);
    if (found) return found;
    found = instances.find((i) => i.id === id);
    if (found) return found;
    try {
      const saved = localStorage.getItem('woohub_instances');
      if (saved) {
        const parsed: Instance[] = JSON.parse(saved);
        found = parsed.find((i) => i.id === id);
        if (found) return found;
      }
    } catch (_) {}
    return INITIAL_INSTANCES.find((i) => i.id === id);
  };

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('woohub_instances', JSON.stringify(instances));
  }, [instances]);

  useEffect(() => {
    localStorage.setItem('woohub_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('woohub_apikeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('woohub_webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  useEffect(() => {
    localStorage.setItem('woohub_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('woohub_logs', JSON.stringify(logs.slice(0, 100)));
  }, [logs]);

  // Helper to append a log
  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Create Instance
  const createInstance = async (name: string, engine: EngineType): Promise<Instance> => {
    const newId = `inst_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const partialInstance: Instance = {
      id: newId,
      organizationId: currentOrg.id,
      name,
      engine,
      engineInstanceId: `${engine}_${newId.replace('inst_', '')}`,
      status: 'STARTING',
      statusMessage: `Inicializando motor ${engine.toUpperCase()}...`,
      createdAt: now,
      updatedAt: now,
      messageCount: { sent: 0, received: 0 },
      serverNode: 'node-br-01'
    };

    // Call EngineManager
    const res = await engineManager.createInstance(partialInstance);
    partialInstance.engineInstanceId = res.engineInstanceId;
    partialInstance.status = res.status;

    // Synchronously update instancesRef so immediate subsequent calls can find it
    const updated = [partialInstance, ...instancesRef.current.filter((i) => i.id !== newId)];
    instancesRef.current = updated;
    setInstances(updated);
    try {
      localStorage.setItem('woohub_instances', JSON.stringify(updated));
    } catch (_) {}

    addLog({
      instanceId: newId,
      instanceName: name,
      engine,
      level: 'info',
      event: 'instance.created',
      message: `Instância '${name}' criada com sucesso utilizando o motor ${engine.toUpperCase()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });

    return partialInstance;
  };

  // Connect / Get QR Code
  const connectInstance = async (id: string): Promise<{ qrCode?: string; status: WooHubStatus }> => {
    const inst = getInstance(id);
    if (!inst) {
      console.warn(`[WooHub] Instância '${id}' não encontrada.`);
      return { status: 'DISCONNECTED' };
    }

    // EngineManager connect
    const res = await engineManager.connect(inst.engine, inst.engineInstanceId);
    const qr = await engineManager.getQRCode(inst.engine, inst.engineInstanceId);

    const updatedStatus: WooHubStatus = 'WAITING_QR';

    const updated = instancesRef.current.map((i) =>
      i.id === id
        ? {
            ...i,
            status: updatedStatus,
            statusMessage: 'Aguardando leitura do QR Code...',
            qrCode: qr.qrCode,
            qrExpiresAt: qr.expiresAt,
            updatedAt: new Date().toISOString()
          }
        : i
    );
    instancesRef.current = updated;
    setInstances(updated);
    try {
      localStorage.setItem('woohub_instances', JSON.stringify(updated));
    } catch (_) {}

    addLog({
      instanceId: inst.id,
      instanceName: inst.name,
      engine: inst.engine,
      level: 'info',
      event: 'connection.qr',
      message: `Sessão de QR Code gerada para a instância '${inst.name}'. Expira em 45 segundos.`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });

    return { qrCode: qr.qrCode, status: updatedStatus };
  };

  // Simulate scanning QR Code (for instant user testing without real phone)
  const simulateScanQRCode = async (id: string): Promise<void> => {
    const inst = getInstance(id);
    if (!inst) return;

    // Step 1: Pairing
    let updated = instancesRef.current.map((i) =>
      i.id === id
        ? {
            ...i,
            status: 'PAIRING' as WooHubStatus,
            statusMessage: 'Validando chaves criptográficas com WhatsApp...'
          }
        : i
    );
    instancesRef.current = updated;
    setInstances(updated);

    await new Promise((r) => setTimeout(r, 1200));

    // Step 2: Connected
    const generatedPhone = `+55 48 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    updated = instancesRef.current.map((i) =>
      i.id === id
        ? {
            ...i,
            status: 'CONNECTED' as WooHubStatus,
            statusMessage: 'Conectado com sucesso via WooHub',
            phoneNumber: i.phoneNumber || generatedPhone,
            displayName: i.displayName || `${i.name} WhatsApp`,
            batteryLevel: Math.floor(75 + Math.random() * 25),
            isBusiness: true,
            lastConnectedAt: now,
            updatedAt: now,
            qrCode: undefined
          }
        : i
    );
    instancesRef.current = updated;
    setInstances(updated);
    try {
      localStorage.setItem('woohub_instances', JSON.stringify(updated));
    } catch (_) {}

    addLog({
      instanceId: inst.id,
      instanceName: inst.name,
      engine: inst.engine,
      level: 'info',
      event: 'connection.connected',
      message: `WhatsApp conectado com sucesso para '${inst.name}' (+55 48 9****-****)`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });

    // Dispatch webhook for connection.connected
    triggerWebhooksForEvent({
      id: `evt_${Date.now()}`,
      event: 'connection.connected',
      instanceId: inst.id,
      organizationId: currentOrg.id,
      engine: inst.engine,
      timestamp: now,
      data: {
        instanceId: inst.id,
        name: inst.name,
        phoneNumber: generatedPhone,
        status: 'CONNECTED'
      }
    });
  };

  // Disconnect
  const disconnectInstance = async (id: string): Promise<void> => {
    const inst = getInstance(id);
    if (!inst) return;

    await engineManager.disconnect(inst.engine, inst.engineInstanceId);
    const now = new Date().toISOString();

    const updated = instancesRef.current.map((i) =>
      i.id === id
        ? {
            ...i,
            status: 'DISCONNECTED' as WooHubStatus,
            statusMessage: 'Instância desconectada',
            lastDisconnectedAt: now,
            updatedAt: now
          }
        : i
    );
    instancesRef.current = updated;
    setInstances(updated);
    try {
      localStorage.setItem('woohub_instances', JSON.stringify(updated));
    } catch (_) {}

    addLog({
      instanceId: inst.id,
      instanceName: inst.name,
      engine: inst.engine,
      level: 'warn',
      event: 'connection.disconnected',
      message: `Instância '${inst.name}' foi desconectada.`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });
  };

  // Restart
  const restartInstance = async (id: string): Promise<void> => {
    const inst = getInstance(id);
    if (!inst) return;

    let updated = instancesRef.current.map((i) =>
      i.id === id ? { ...i, status: 'STARTING' as WooHubStatus, statusMessage: 'Reiniciando processo...' } : i
    );
    instancesRef.current = updated;
    setInstances(updated);

    await new Promise((r) => setTimeout(r, 1000));
    await engineManager.restart(inst.engine, inst.engineInstanceId);

    updated = instancesRef.current.map((i) =>
      i.id === id
        ? {
            ...i,
            status: 'CONNECTED' as WooHubStatus,
            statusMessage: 'Reiniciada e conectada',
            updatedAt: new Date().toISOString()
          }
        : i
    );
    instancesRef.current = updated;
    setInstances(updated);
    try {
      localStorage.setItem('woohub_instances', JSON.stringify(updated));
    } catch (_) {}

    addLog({
      instanceId: inst.id,
      instanceName: inst.name,
      engine: inst.engine,
      level: 'info',
      event: 'instance.restart',
      message: `Instância '${inst.name}' reiniciada com sucesso.`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });
  };

  // Logout
  const logoutInstance = async (id: string): Promise<void> => {
    const inst = getInstance(id);
    if (!inst) return;

    await engineManager.logout(inst.engine, inst.engineInstanceId);

    const updated = instancesRef.current.map((i) =>
      i.id === id
        ? {
            ...i,
            status: 'LOGGED_OUT' as WooHubStatus,
            statusMessage: 'Sessão desvinculada (Logout executado)',
            phoneNumber: undefined,
            qrCode: undefined,
            updatedAt: new Date().toISOString()
          }
        : i
    );
    instancesRef.current = updated;
    setInstances(updated);
    try {
      localStorage.setItem('woohub_instances', JSON.stringify(updated));
    } catch (_) {}

    addLog({
      instanceId: inst.id,
      instanceName: inst.name,
      engine: inst.engine,
      level: 'warn',
      event: 'connection.logout',
      message: `Logout da sessão de '${inst.name}' realizado. Necessário escanear novo QR Code para reconectar.`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });
  };

  // Delete
  const deleteInstance = async (id: string): Promise<void> => {
    const inst = getInstance(id);
    if (inst) {
      await engineManager.removeInstance(inst.engine, inst.engineInstanceId);
      const updated = instancesRef.current.filter((i) => i.id !== id);
      instancesRef.current = updated;
      setInstances(updated);
      try {
        localStorage.setItem('woohub_instances', JSON.stringify(updated));
      } catch (_) {}
      addLog({
        instanceId: inst.id,
        instanceName: inst.name,
        engine: inst.engine,
        level: 'warn',
        event: 'instance.deleted',
        message: `Instância '${inst.name}' removida da organização.`,
        requestId: `req_${Math.random().toString(36).substring(2, 8)}`
      });
    }
  };

  // Trigger webhooks for any WooHubEvent
  const triggerWebhooksForEvent = async (event: WooHubEvent) => {
    eventBus.emit(event);

    // Find eligible webhooks
    const matchingWebhooks = webhooks.filter((w) => {
      if (!w.isActive) return false;
      if (w.instanceIds.length > 0 && !w.instanceIds.includes(event.instanceId)) return false;
      return w.events.includes(event.event);
    });

    for (const wh of matchingWebhooks) {
      const delivery = await WebhookDispatcher.dispatch(wh, event);
      setDeliveries((prev) => [delivery, ...prev.slice(0, 99)]);
    }
  };

  // Send Message (The Unified API core action!)
  const sendMessage = async (payload: MessagePayload): Promise<WooHubMessage> => {
    const inst =
      getInstance(payload.instanceId) ||
      instancesRef.current.find((i) => i.status === 'CONNECTED') ||
      instancesRef.current[0];

    if (!inst) {
      throw {
        error: {
          code: 'INSTANCE_NOT_FOUND',
          message: 'Nenhuma instância disponível para envio de mensagem.'
        }
      };
    }

    if (inst.status !== 'CONNECTED') {
      throw {
        error: {
          code: 'INSTANCE_NOT_CONNECTED',
          message: `A instância '${inst.name}' não está conectada. Status atual: ${inst.status}`
        }
      };
    }

    // EngineManager enforces capabilities and routes to adapter
    const result = await engineManager.sendMessage(inst.engine, inst.engineInstanceId, payload);

    const now = new Date().toISOString();
    let messageType: WooHubMessage['type'] = 'text';
    if (payload.mediaUrl) {
      if (payload.mediaUrl.match(/\.(mp4|mov|avi)$/i)) messageType = 'video';
      else if (payload.mediaUrl.match(/\.(mp3|ogg|wav|m4a)$/i)) messageType = 'audio';
      else if (payload.caption || payload.mediaUrl.match(/\.(png|jpg|jpeg|webp)$/i)) messageType = 'image';
      else messageType = 'document';
    } else if (payload.buttons && payload.buttons.length > 0) {
      messageType = 'buttons';
    } else if (payload.latitude && payload.longitude) {
      messageType = 'location';
    } else if (payload.contactName) {
      messageType = 'contact';
    }

    const newMsg: WooHubMessage = {
      id: result.messageId,
      instanceId: inst.id,
      organizationId: currentOrg.id,
      engine: inst.engine,
      from: inst.phoneNumber || 'WooHub',
      to: payload.to,
      direction: 'outbound',
      type: messageType,
      content: {
        text: payload.text,
        mediaUrl: payload.mediaUrl,
        caption: payload.caption,
        filename: payload.filename,
        buttons: payload.buttons,
        location: payload.latitude && payload.longitude ? { lat: payload.latitude, lng: payload.longitude } : undefined,
        contact: payload.contactName ? { name: payload.contactName, phone: payload.to } : undefined
      },
      status: 'sent',
      rawEngineMessageId: result.rawEngineMessageId,
      timestamp: now
    };

    setMessages((prev) => [newMsg, ...prev]);

    // Update instance message counter
    setInstances((prev) =>
      prev.map((i) =>
        i.id === inst.id
          ? {
              ...i,
              messageCount: {
                ...i.messageCount,
                sent: i.messageCount.sent + 1
              }
            }
          : i
      )
    );

    addLog({
      instanceId: inst.id,
      instanceName: inst.name,
      engine: inst.engine,
      level: 'info',
      event: 'message.sent',
      message: `Mensagem (${messageType}) enviada para ${payload.to} com ID ${newMsg.id}`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });

    // Dispatch webhook for message.sent
    const event: WooHubEvent = {
      id: `evt_${Date.now()}`,
      event: 'message.sent',
      instanceId: inst.id,
      organizationId: currentOrg.id,
      engine: inst.engine,
      timestamp: now,
      data: {
        messageId: newMsg.id,
        to: payload.to,
        from: inst.phoneNumber,
        type: messageType,
        status: 'sent'
      }
    };
    triggerWebhooksForEvent(event);

    return newMsg;
  };

  // Simulate receiving a message (e.g. from a client WhatsApp to WooHub)
  const simulateReceiveMessage = async (
    instanceId: string,
    fromPhone: string,
    text: string
  ): Promise<WooHubMessage> => {
    const inst =
      getInstance(instanceId) ||
      instancesRef.current.find((i) => i.status === 'CONNECTED') ||
      instancesRef.current[0];

    if (!inst) throw new Error('Nenhuma instância disponível.');

    const now = new Date().toISOString();
    const rawMsgId = `raw_in_${Date.now()}`;

    // Use EventNormalizer to simulate how raw engine webhook turns into normalized WooHubEvent
    const rawMockPayload = {
      event: 'message',
      payload: {
        id: rawMsgId,
        from: `${fromPhone.replace(/\D/g, '')}@c.us`,
        to: `${inst.phoneNumber?.replace(/\D/g, '')}@c.us`,
        body: text,
        fromMe: false,
        timestamp: Math.floor(Date.now() / 1000)
      }
    };

    const normalizedEvent = EventNormalizer.normalize(
      inst.engine,
      inst.id,
      currentOrg.id,
      rawMockPayload
    );

    const newMsg: WooHubMessage = {
      id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      instanceId: inst.id,
      organizationId: currentOrg.id,
      engine: inst.engine,
      from: fromPhone,
      to: inst.phoneNumber || 'WooHub',
      direction: 'inbound',
      type: 'text',
      content: { text },
      status: 'read',
      rawEngineMessageId: rawMsgId,
      timestamp: now
    };

    setMessages((prev) => [newMsg, ...prev]);

    setInstances((prev) =>
      prev.map((i) =>
        i.id === inst.id
          ? {
              ...i,
              messageCount: {
                ...i.messageCount,
                received: i.messageCount.received + 1
              }
            }
          : i
      )
    );

    addLog({
      instanceId: inst.id,
      instanceName: inst.name,
      engine: inst.engine,
      level: 'info',
      event: 'message.received',
      message: `Mensagem inbound recebida de ${fromPhone} na instância '${inst.name}'`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });

    // Trigger webhooks for message.received
    triggerWebhooksForEvent(normalizedEvent);

    return newMsg;
  };

  // API Key creation
  const createApiKey = (
    name: string,
    permissions: ApiKey['permissions']
  ): { key: ApiKey; fullSecret: string } => {
    const rawSecretPart = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const fullSecret = `wh_live_${rawSecretPart}`;
    const prefix = fullSecret.substring(0, 16) + '...';

    const newKey: ApiKey = {
      id: `key_${Date.now().toString(36)}`,
      organizationId: currentOrg.id,
      name,
      prefix,
      keyHash: `hash_${rawSecretPart.substring(0, 12)}`,
      permissions,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setApiKeys((prev) => [newKey, ...prev]);

    addLog({
      level: 'info',
      event: 'apikey.created',
      message: `Nova chave de API '${name}' (${prefix}) gerada pelo administrador`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });

    return { key: newKey, fullSecret };
  };

  const revokeApiKey = (id: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k))
    );
    addLog({
      level: 'warn',
      event: 'apikey.revoked',
      message: `Chave de API ${id} foi revogada`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });
  };

  // Webhook management
  const createWebhook = (
    name: string,
    url: string,
    events: string[],
    instanceIds: string[]
  ): WebhookConfig => {
    const secretPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const secret = `whsec_${secretPart}`;

    const newWebhook: WebhookConfig = {
      id: `whk_${Date.now().toString(36)}`,
      organizationId: currentOrg.id,
      name,
      url,
      secret,
      isActive: true,
      events,
      instanceIds,
      createdAt: new Date().toISOString(),
      successRate: 100
    };

    setWebhooks((prev) => [newWebhook, ...prev]);

    addLog({
      level: 'info',
      event: 'webhook.created',
      message: `Endpoint de webhook '${name}' (${url}) cadastrado`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });

    return newWebhook;
  };

  const toggleWebhook = (id: string, active: boolean) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: active } : w))
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const retryWebhookDelivery = async (deliveryId: string) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return;
    const wh = webhooks.find((w) => w.id === del.webhookId) || {
      id: del.webhookId,
      organizationId: currentOrg.id,
      name: del.webhookName,
      url: del.url,
      secret: 'whsec_retry_secret',
      isActive: true,
      events: [del.event],
      instanceIds: [],
      createdAt: del.createdAt
    };

    const newDelivery = await WebhookDispatcher.dispatch(wh, del.payload, del.attempts + 1);
    setDeliveries((prev) => [newDelivery, ...prev]);
    addLog({
      level: 'info',
      event: 'webhook.retry',
      message: `Reenvio manual do webhook ${del.id} executado (Status ${newDelivery.statusCode})`,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`
    });
  };

  // Test ping webhook
  const testPingWebhook = async (webhookId: string): Promise<WebhookDelivery> => {
    const wh = webhooks.find((w) => w.id === webhookId);
    if (!wh) throw new Error('Webhook não encontrado');

    const testEvent: WooHubEvent = {
      id: `evt_ping_${Date.now()}`,
      event: 'connection.connected',
      instanceId: instances[0]?.id || 'inst_test',
      organizationId: currentOrg.id,
      engine: 'wuzapi',
      timestamp: new Date().toISOString(),
      data: {
        ping: true,
        message: 'Teste de conectividade do Webhook WooHub com assinatura HMAC SHA-256',
        testId: Math.random().toString(36).substring(2, 8)
      }
    };

    const delivery = await WebhookDispatcher.dispatch(wh, testEvent);
    setDeliveries((prev) => [delivery, ...prev]);
    return delivery;
  };

  // Admin: toggle allowsNewInstances
  const toggleEngineNewInstances = (engineId: EngineType, allows: boolean) => {
    EngineRegistry.setAllowsNewInstances(engineId, allows);
    setEngines(EngineRegistry.getAllInfo());
    addLog({
      level: 'warn',
      event: 'engine.config',
      message: `Configuração do motor ${engineId.toUpperCase()} alterada: permite novas instâncias = ${allows}`
    });
  };

  const updateEngineStatus = (engineId: EngineType, status: 'ONLINE' | 'DEGRADED' | 'OFFLINE') => {
    EngineRegistry.updateStatus(engineId, status);
    setEngines(EngineRegistry.getAllInfo());
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('woohub_logs');
  };

  return {
    currentOrg,
    setCurrentOrg,
    organizations,
    instances,
    messages,
    apiKeys,
    webhooks,
    deliveries,
    logs,
    servers,
    engines,
    createInstance,
    connectInstance,
    simulateScanQRCode,
    disconnectInstance,
    restartInstance,
    logoutInstance,
    deleteInstance,
    sendMessage,
    simulateReceiveMessage,
    createApiKey,
    revokeApiKey,
    createWebhook,
    toggleWebhook,
    deleteWebhook,
    retryWebhookDelivery,
    testPingWebhook,
    toggleEngineNewInstances,
    updateEngineStatus,
    addLog,
    clearLogs
  };
}
