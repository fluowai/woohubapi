export type EngineType = 'waha' | 'wuzapi' | 'whatsmeow';

export type WooHubStatus =
  | 'CREATED'
  | 'STARTING'
  | 'WAITING_QR'
  | 'PAIRING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'DISCONNECTED'
  | 'LOGGED_OUT'
  | 'ERROR';

export interface EngineCapabilities {
  text: boolean;
  image: boolean;
  video: boolean;
  audio: boolean;
  document: boolean;
  contact: boolean;
  location: boolean;
  reaction: boolean;
  buttons: boolean;
  lists: boolean;
  groups: boolean;
  readReceipts: boolean;
}

export interface EngineInfo {
  id: EngineType;
  name: string;
  badgeName: string;
  version: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  description: string;
  technology: string;
  memoryUsage: string;
  latencyMs: number;
  allowsNewInstances: boolean;
  capabilities: EngineCapabilities;
  docsUrl: string;
}

export interface Instance {
  id: string; // inst_xxx
  organizationId: string;
  projectId?: string;
  name: string;
  engine: EngineType;
  engineInstanceId: string;
  phoneNumber?: string;
  displayName?: string;
  profilePicUrl?: string;
  status: WooHubStatus;
  statusMessage?: string;
  qrCode?: string; // base64 or raw string
  qrExpiresAt?: string;
  batteryLevel?: number;
  isBusiness?: boolean;
  createdAt: string;
  updatedAt: string;
  lastConnectedAt?: string;
  lastDisconnectedAt?: string;
  messageCount: {
    sent: number;
    received: number;
  };
  serverNode?: string;
  customWebhookUrl?: string;
}

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'contact'
  | 'location'
  | 'reaction'
  | 'buttons'
  | 'list';

export type MessageDirection = 'inbound' | 'outbound';

export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessagePayload {
  instanceId: string;
  to: string;
  text?: string;
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactVcard?: string;
  reactionText?: string;
  targetMessageId?: string;
  buttons?: Array<{ id: string; text: string }>;
  header?: string;
  footer?: string;
}

export interface WooHubMessage {
  id: string; // msg_xxx
  instanceId: string;
  organizationId: string;
  engine: EngineType;
  from: string;
  to: string;
  direction: MessageDirection;
  type: MessageType;
  content: {
    text?: string;
    mediaUrl?: string;
    caption?: string;
    filename?: string;
    mimeType?: string;
    location?: { lat: number; lng: number };
    contact?: { name: string; phone: string };
    reaction?: string;
    buttons?: Array<{ id: string; text: string }>;
  };
  status: MessageStatus;
  rawEngineMessageId?: string;
  timestamp: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
}

export interface WooHubEvent<T = any> {
  id: string;
  event:
    | 'instance.created'
    | 'connection.qr'
    | 'connection.connected'
    | 'connection.disconnected'
    | 'connection.reconnecting'
    | 'message.received'
    | 'message.sent'
    | 'message.delivered'
    | 'message.read'
    | 'message.failed'
    | 'contact.updated'
    | 'group.created'
    | 'group.updated';
  instanceId: string;
  organizationId: string;
  engine: EngineType;
  timestamp: string;
  data: T;
}

export interface WebhookConfig {
  id: string; // whk_xxx
  organizationId: string;
  name: string;
  url: string;
  secret: string;
  isActive: boolean;
  events: string[];
  instanceIds: string[]; // empty means all instances
  createdAt: string;
  lastTriggeredAt?: string;
  successRate?: number;
}

export interface WebhookDelivery {
  id: string; // del_xxx
  webhookId: string;
  webhookName: string;
  event: string;
  url: string;
  statusCode: number;
  durationMs: number;
  attempts: number;
  status: 'success' | 'failed' | 'retrying';
  headers: Record<string, string>;
  payload: any;
  responseBody: string;
  createdAt: string;
}

export interface ApiKey {
  id: string; // key_xxx
  organizationId: string;
  name: string;
  prefix: string; // wh_live_xxxx...
  keyHash: string;
  permissions: ('read' | 'write' | 'instances' | 'messages' | 'admin')[];
  createdAt: string;
  lastUsedAt?: string;
  status: 'active' | 'revoked';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  instanceId?: string;
  instanceName?: string;
  engine?: EngineType;
  level: 'info' | 'warn' | 'error' | 'debug';
  event: string;
  message: string;
  durationMs?: number;
  statusCode?: number;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planId: 'starter' | 'professional' | 'business' | 'enterprise';
  createdAt: string;
  instancesLimit: number;
  messagesMonthlyLimit: number;
  usersLimit: number;
}

export interface ServerNode {
  id: string;
  name: string;
  host: string;
  region: string;
  status: 'ONLINE' | 'DRAINING' | 'OFFLINE';
  engines: EngineType[];
  instancesCount: number;
  capacity: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
}
