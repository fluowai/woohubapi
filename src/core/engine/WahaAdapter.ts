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

export class WahaAdapter implements WhatsAppEngine {
  public readonly engineType: EngineType = 'waha';
  public readonly name = 'WAHA';
  public readonly version = '2025.1.2-PLUS';

  public readonly capabilities: EngineCapabilities = {
    text: true,
    image: true,
    video: true,
    audio: true,
    document: true,
    contact: true,
    location: true,
    reaction: true,
    buttons: true, // Supported via WAHA PLUS
    lists: true,
    groups: true,
    readReceipts: true
  };

  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl = 'http://localhost:3000/api/mock/waha', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Normalizes WAHA status strings to WooHub standard status
  public normalizeStatus(wahaStatus: string): WooHubStatus {
    switch (wahaStatus?.toUpperCase()) {
      case 'STOPPED':
        return 'DISCONNECTED';
      case 'STARTING':
        return 'STARTING';
      case 'SCAN_QR_CODE':
        return 'WAITING_QR';
      case 'PAIRING':
        return 'PAIRING';
      case 'WORKING':
      case 'CONNECTED':
        return 'CONNECTED';
      case 'FAILED':
        return 'ERROR';
      default:
        return 'DISCONNECTED';
    }
  }

  async createInstance(instance: Instance): Promise<{ engineInstanceId: string; status: WooHubStatus }> {
    const engineInstanceId = `waha_${instance.id.replace('inst_', '')}`;
    return {
      engineInstanceId,
      status: 'STARTING'
    };
  }

  async removeInstance(engineInstanceId: string): Promise<boolean> {
    return true;
  }

  async connect(engineInstanceId: string): Promise<{ status: WooHubStatus; qrCode?: string }> {
    const qrCode = `2@${Math.random().toString(36).substring(2)},${Math.random().toString(36).substring(2)}==,${Date.now()}`;
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
      rawStatus: 'WORKING',
      phoneNumber: '5548988234567',
      displayName: 'Comercial WAHA',
      batteryLevel: 94,
      isBusiness: true
    };
  }

  async getQRCode(engineInstanceId: string): Promise<QRCodeResult> {
    const rawQr = `2@WAHA-${engineInstanceId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      qrCode: rawQr,
      format: 'raw',
      expiresAt: new Date(Date.now() + 45000).toISOString()
    };
  }

  async sendText(engineInstanceId: string, to: string, text: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendImage(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendVideo(engineInstanceId: string, to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendAudio(engineInstanceId: string, to: string, mediaUrl: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendDocument(engineInstanceId: string, to: string, mediaUrl: string, filename?: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendLocation(engineInstanceId: string, to: string, latitude: number, longitude: number, name?: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_loc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendContact(engineInstanceId: string, to: string, contactName: string, phoneNumber: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_ctc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendButtons(
    engineInstanceId: string,
    to: string,
    header: string | undefined,
    text: string,
    footer: string | undefined,
    buttons: Array<{ id: string; text: string }>
  ): Promise<SendMessageResult> {
    const rawMsgId = `waha_btn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      messageId: `msg_${rawMsgId.slice(-9)}`,
      rawEngineMessageId: rawMsgId,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async sendReaction(engineInstanceId: string, to: string, messageId: string, emoji: string): Promise<SendMessageResult> {
    const rawMsgId = `waha_rct_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
      id: `${engineInstanceId}@c.us`,
      phoneNumber: '5548988234567',
      pushname: 'Suporte WooHub (WAHA)',
      isBusiness: true
    };
  }

  async getContacts(engineInstanceId: string): Promise<WhatsAppContact[]> {
    return [
      { id: '5548999881122@c.us', name: 'João Silva', phoneNumber: '5548999881122' },
      { id: '5511988776655@c.us', name: 'Maria Santos', phoneNumber: '5511988776655' }
    ];
  }

  async getGroups(engineInstanceId: string): Promise<WhatsAppGroup[]> {
    return [
      { id: '12036302@g.us', name: 'Time WooHub Devs', participantsCount: 14 }
    ];
  }
}
