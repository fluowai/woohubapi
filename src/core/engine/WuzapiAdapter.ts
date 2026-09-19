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

export class WuzapiAdapter implements WhatsAppEngine {
  public readonly engineType: EngineType = 'wuzapi';
  public readonly name = 'WuzAPI';
  public readonly version = '1.2.4';

  public readonly capabilities: EngineCapabilities = {
    text: true,
    image: true,
    video: true,
    audio: true,
    document: true,
    contact: true,
    location: true,
    reaction: true,
    buttons: false, // NOT supported in standard WuzAPI
    lists: false,   // NOT supported in standard WuzAPI
    groups: true,
    readReceipts: true
  };

  private baseUrl: string;
  private userToken?: string;

  constructor(baseUrl = 'http://localhost:3000/api/mock/wuzapi', userToken?: string) {
    this.baseUrl = baseUrl;
    this.userToken = userToken;
  }

  // Converts WuzAPI status strings to standard WooHub status
  public normalizeStatus(wuzapiStatus: string): WooHubStatus {
    switch (wuzapiStatus?.toLowerCase()) {
      case 'disconnected':
        return 'DISCONNECTED';
      case 'starting':
        return 'STARTING';
      case 'scanning':
      case 'qr':
        return 'WAITING_QR';
      case 'pairing':
        return 'PAIRING';
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
    const engineInstanceId = `wuz_${instance.id.replace('inst_', '')}`;
    return {
      engineInstanceId,
      status: 'STARTING'
    };
  }

  async removeInstance(engineInstanceId: string): Promise<boolean> {
    return true;
  }

  async connect(engineInstanceId: string): Promise<{ status: WooHubStatus; qrCode?: string }> {
    const qrCode = `1@WuzAPI-${engineInstanceId}-${Date.now()}`;
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
      rawStatus: 'connected',
      phoneNumber: '5548991234567',
      displayName: 'WuzAPI Bot Comercial',
      batteryLevel: 88,
      isBusiness: false
    };
  }

  async getQRCode(engineInstanceId: string): Promise<QRCodeResult> {
    const rawQr = `1@WuzAPI-${engineInstanceId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      qrCode: rawQr,
      format: 'raw',
      expiresAt: new Date(Date.now() + 45000).toISOString()
    };
  }

  async sendText(engineInstanceId: string, to: string, text: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendImage(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendVideo(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendAudio(engineInstanceId: string, to: string, mediaUrl: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendDocument(engineInstanceId: string, to: string, mediaUrl: string, filename?: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendLocation(engineInstanceId: string, to: string, latitude: number, longitude: number, name?: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_loc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendContact(engineInstanceId: string, to: string, contactName: string, phoneNumber: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_ctc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendReaction(engineInstanceId: string, to: string, messageId: string, emoji: string): Promise<SendMessageResult> {
    const rawMsgId = `wuz_rct_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
      phoneNumber: '5548991234567',
      pushname: 'WuzAPI Bot',
      isBusiness: false
    };
  }

  async getContacts(engineInstanceId: string): Promise<WhatsAppContact[]> {
    return [
      { id: '551199998888@s.whatsapp.net', name: 'Carlos Eduardo', phoneNumber: '551199998888' }
    ];
  }

  async getGroups(engineInstanceId: string): Promise<WhatsAppGroup[]> {
    return [
      { id: '12036304@g.us', name: 'Notificações CRM', participantsCount: 8 }
    ];
  }
}
