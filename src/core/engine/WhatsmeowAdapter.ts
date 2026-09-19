import {
  EngineCapabilities,
  EngineType,
  Instance,
  WooHubStatus
} from '../../types';
import {
  QRCodeResult,
  SendMessageResult,
  StatusResult,
  WhatsAppContact,
  WhatsAppEngine,
  WhatsAppGroup,
  WhatsAppProfile
} from './WhatsAppEngine';

export class WhatsmeowAdapter implements WhatsAppEngine {
  public readonly engineType: EngineType = 'whatsmeow';
  public readonly name = 'whatsmeow';
  public readonly version = '0.0.124-go1.23';

  public readonly capabilities: EngineCapabilities = {
    text: true,
    image: true,
    video: true,
    audio: true,
    document: true,
    contact: true,
    location: true,
    reaction: true,
    buttons: false, // Pure multi-device binary protocol does not support old template buttons
    lists: false,
    groups: true,
    readReceipts: true
  };

  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:3000/api/mock/whatsmeow') {
    this.baseUrl = baseUrl;
  }

  // Normalizes whatsmeow internal states to standard WooHub status
  public normalizeStatus(whatsmeowStatus: string): WooHubStatus {
    switch (whatsmeowStatus?.toLowerCase()) {
      case 'unpaired':
      case 'disconnected':
        return 'DISCONNECTED';
      case 'connecting':
        return 'STARTING';
      case 'qr':
      case 'waiting_code':
        return 'WAITING_QR';
      case 'paired':
      case 'logged_in':
      case 'connected':
        return 'CONNECTED';
      case 'reconnecting':
        return 'RECONNECTING';
      case 'logged_out':
        return 'LOGGED_OUT';
      case 'error':
        return 'ERROR';
      default:
        return 'DISCONNECTED';
    }
  }

  async createInstance(instance: Instance): Promise<{ engineInstanceId: string; status: WooHubStatus }> {
    const engineInstanceId = `meow_${instance.id.replace('inst_', '')}`;
    return {
      engineInstanceId,
      status: 'STARTING'
    };
  }

  async removeInstance(engineInstanceId: string): Promise<boolean> {
    return true;
  }

  async connect(engineInstanceId: string): Promise<{ status: WooHubStatus; qrCode?: string }> {
    const qrCode = `2@whatsmeow-${engineInstanceId}-${Date.now()}`;
    return {
      status: 'WAITING_QR',
      qrCode
    };
  }

  async disconnect(engineInstanceId: string): Promise<{ status: WooHubStatus }> {
    return { status: 'DISCONNECTED' };
  }

  async logout(engineInstanceId: string): Promise<{ status: WooHubStatus }> {
    return { status: 'LOGGED_OUT' };
  }

  async restart(engineInstanceId: string): Promise<{ status: WooHubStatus }> {
    return { status: 'STARTING' };
  }

  async getStatus(engineInstanceId: string): Promise<StatusResult> {
    return {
      status: 'CONNECTED',
      rawStatus: 'logged_in',
      phoneNumber: '5548977665544',
      displayName: 'Whatsmeow Go Core',
      batteryLevel: 98,
      isBusiness: false
    };
  }

  async getQRCode(engineInstanceId: string): Promise<QRCodeResult> {
    const rawQr = `2@whatsmeow-${engineInstanceId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      qrCode: rawQr,
      format: 'raw',
      expiresAt: new Date(Date.now() + 45000).toISOString()
    };
  }

  async sendText(engineInstanceId: string, to: string, text: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendImage(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendVideo(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendAudio(engineInstanceId: string, to: string, mediaUrl: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendDocument(engineInstanceId: string, to: string, mediaUrl: string, filename?: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendLocation(engineInstanceId: string, to: string, latitude: number, longitude: number, name?: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_loc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendContact(engineInstanceId: string, to: string, contactName: string, phoneNumber: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_ctc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendReaction(engineInstanceId: string, to: string, messageId: string, emoji: string): Promise<SendMessageResult> {
    const rawMsgId = `meow_rct_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async markAsRead(engineInstanceId: string, messageId: string, chatJid: string): Promise<boolean> {
    return true;
  }

  async getProfile(engineInstanceId: string): Promise<WhatsAppProfile | null> {
    return {
      id: `${engineInstanceId}@s.whatsapp.net`,
      phoneNumber: '5548977665544',
      pushname: 'whatsmeow Core Service',
      isBusiness: false
    };
  }

  async getContacts(engineInstanceId: string): Promise<WhatsAppContact[]> {
    return [
      { id: '554799887766@s.whatsapp.net', name: 'Ana Oliveira', phoneNumber: '554799887766' }
    ];
  }

  async getGroups(engineInstanceId: string): Promise<WhatsAppGroup[]> {
    return [
      { id: '12036306@g.us', name: 'DevOps & Infra', participantsCount: 12 }
    ];
  }
}
