import {
  EngineCapabilities,
  EngineType,
  Instance,
  MessagePayload,
  WooHubStatus
} from '../../types';

export interface SendMessageResult {
  success: boolean;
  messageId: string;
  rawEngineMessageId?: string;
  status: 'sent' | 'queued' | 'delivered';
  timestamp: string;
}

export interface WhatsAppProfile {
  id: string;
  pushname?: string;
  phoneNumber: string;
  pictureUrl?: string;
  isBusiness?: boolean;
}

export interface WhatsAppContact {
  id: string;
  name?: string;
  phoneNumber: string;
  isBusiness?: boolean;
  profilePicUrl?: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  participantsCount: number;
  creationTimestamp?: number;
}

export interface StatusResult {
  status: WooHubStatus;
  rawStatus: string;
  phoneNumber?: string;
  displayName?: string;
  batteryLevel?: number;
  isBusiness?: boolean;
  message?: string;
}

export interface QRCodeResult {
  qrCode: string;
  format: 'raw' | 'svg' | 'base64';
  expiresAt: string;
}

/**
 * Standard Engine contract for WooHub
 * Every engine adapter (WAHA, WuzAPI, whatsmeow, etc.) must implement this interface.
 */
export interface WhatsAppEngine {
  readonly engineType: EngineType;
  readonly name: string;
  readonly version: string;
  readonly capabilities: EngineCapabilities;

  createInstance(instance: Instance): Promise<{ engineInstanceId: string; status: WooHubStatus }>;
  removeInstance(engineInstanceId: string): Promise<boolean>;

  connect(engineInstanceId: string): Promise<{ status: WooHubStatus; qrCode?: string }>;
  disconnect(engineInstanceId: string): Promise<{ status: WooHubStatus }>;
  logout(engineInstanceId: string): Promise<{ status: WooHubStatus }>;
  restart(engineInstanceId: string): Promise<{ status: WooHubStatus }>;

  getStatus(engineInstanceId: string): Promise<StatusResult>;
  getQRCode(engineInstanceId: string): Promise<QRCodeResult>;

  sendText(engineInstanceId: string, to: string, text: string): Promise<SendMessageResult>;
  sendImage(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult>;
  sendVideo(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult>;
  sendAudio(engineInstanceId: string, to: string, mediaUrl: string): Promise<SendMessageResult>;
  sendDocument(engineInstanceId: string, to: string, mediaUrl: string, filename?: string): Promise<SendMessageResult>;
  sendLocation(engineInstanceId: string, to: string, latitude: number, longitude: number, name?: string): Promise<SendMessageResult>;
  sendContact(engineInstanceId: string, to: string, contactName: string, phoneNumber: string): Promise<SendMessageResult>;

  // Capability-dependent methods (checked by EngineCapabilityService before calling)
  sendButtons?(engineInstanceId: string, to: string, header: string | undefined, text: string, footer: string | undefined, buttons: Array<{ id: string; text: string }>): Promise<SendMessageResult>;
  sendReaction?(engineInstanceId: string, to: string, messageId: string, emoji: string): Promise<SendMessageResult>;

  markAsRead(engineInstanceId: string, messageId: string, chatJid: string): Promise<boolean>;

  getProfile(engineInstanceId: string): Promise<WhatsAppProfile | null>;
  getContacts(engineInstanceId: string): Promise<WhatsAppContact[]>;
  getGroups(engineInstanceId: string): Promise<WhatsAppGroup[]>;
}
