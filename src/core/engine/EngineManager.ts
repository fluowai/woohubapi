import {
  EngineCapabilities,
  EngineType,
  Instance,
  MessagePayload,
  WooHubStatus
} from '../../types';
import { EngineCapabilityService } from './EngineCapabilityService';
import { EngineRegistry } from './EngineRegistry';
import {
  QRCodeResult,
  SendMessageResult,
  StatusResult,
  WhatsAppContact,
  WhatsAppEngine,
  WhatsAppGroup,
  WhatsAppProfile
} from './WhatsAppEngine';

export class EngineManager {
  private static instance: EngineManager;

  private constructor() {}

  public static getInstance(): EngineManager {
    if (!EngineManager.instance) {
      EngineManager.instance = new EngineManager();
    }
    return EngineManager.instance;
  }

  /**
   * Retrieves the adapter for the given engine type.
   * Centralizes engine retrieval — prevents any scattered `if (engine === 'waha')` logic.
   */
  public get(engineType: EngineType): WhatsAppEngine {
    return EngineRegistry.getAdapter(engineType);
  }

  /**
   * Returns capabilities for the given engine
   */
  public getCapabilities(engineType: EngineType): EngineCapabilities {
    return EngineRegistry.get(engineType).info.capabilities;
  }

  /**
   * Asserts that the instance's engine supports the required capability before execution
   */
  public assertCapability(
    engineType: EngineType,
    capability: keyof EngineCapabilities,
    customMessage?: string
  ): void {
    const capabilities = this.getCapabilities(engineType);
    EngineCapabilityService.assertCapability(engineType, capabilities, capability, customMessage);
  }

  public async createInstance(
    instance: Instance
  ): Promise<{ engineInstanceId: string; status: WooHubStatus }> {
    const engine = this.get(instance.engine);
    return await engine.createInstance(instance);
  }

  public async removeInstance(engineType: EngineType, engineInstanceId: string): Promise<boolean> {
    const engine = this.get(engineType);
    return await engine.removeInstance(engineInstanceId);
  }

  public async connect(
    engineType: EngineType,
    engineInstanceId: string
  ): Promise<{ status: WooHubStatus; qrCode?: string }> {
    const engine = this.get(engineType);
    return await engine.connect(engineInstanceId);
  }

  public async disconnect(
    engineType: EngineType,
    engineInstanceId: string
  ): Promise<{ status: WooHubStatus }> {
    const engine = this.get(engineType);
    return await engine.disconnect(engineInstanceId);
  }

  public async logout(
    engineType: EngineType,
    engineInstanceId: string
  ): Promise<{ status: WooHubStatus }> {
    const engine = this.get(engineType);
    return await engine.logout(engineInstanceId);
  }

  public async restart(
    engineType: EngineType,
    engineInstanceId: string
  ): Promise<{ status: WooHubStatus }> {
    const engine = this.get(engineType);
    return await engine.restart(engineInstanceId);
  }

  public async getStatus(engineType: EngineType, engineInstanceId: string): Promise<StatusResult> {
    const engine = this.get(engineType);
    return await engine.getStatus(engineInstanceId);
  }

  public async getQRCode(engineType: EngineType, engineInstanceId: string): Promise<QRCodeResult> {
    const engine = this.get(engineType);
    return await engine.getQRCode(engineInstanceId);
  }

  /**
   * Unified message sending dispatcher with automatic capability enforcement.
   */
  public async sendMessage(
    engineType: EngineType,
    engineInstanceId: string,
    payload: MessagePayload
  ): Promise<SendMessageResult> {
    const engine = this.get(engineType);

    if (payload.text && !payload.mediaUrl && !payload.buttons) {
      this.assertCapability(engineType, 'text');
      return await engine.sendText(engineInstanceId, payload.to, payload.text);
    }

    if (payload.mediaUrl) {
      // Check specific media capability
      if (payload.caption || payload.mediaUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        this.assertCapability(engineType, 'image');
        return await engine.sendImage(engineInstanceId, payload.to, payload.mediaUrl, payload.caption);
      }
      if (payload.mediaUrl.match(/\.(mp4|mkv|mov|avi)$/i)) {
        this.assertCapability(engineType, 'video');
        return await engine.sendVideo(engineInstanceId, payload.to, payload.mediaUrl, payload.caption);
      }
      if (payload.mediaUrl.match(/\.(mp3|ogg|wav|m4a|aac)$/i)) {
        this.assertCapability(engineType, 'audio');
        return await engine.sendAudio(engineInstanceId, payload.to, payload.mediaUrl);
      }
      // default to document
      this.assertCapability(engineType, 'document');
      return await engine.sendDocument(engineInstanceId, payload.to, payload.mediaUrl, payload.filename);
    }

    if (payload.buttons && payload.buttons.length > 0) {
      // Must check capability
      this.assertCapability(
        engineType,
        'buttons',
        `O motor '${engineType}' não possui suporte oficial para botões interativos.`
      );
      if (engine.sendButtons) {
        return await engine.sendButtons(
          engineInstanceId,
          payload.to,
          payload.header,
          payload.text || '',
          payload.footer,
          payload.buttons
        );
      }
      throw new Error('Método sendButtons não implementado no adapter.');
    }

    if (payload.latitude && payload.longitude) {
      this.assertCapability(engineType, 'location');
      return await engine.sendLocation(
        engineInstanceId,
        payload.to,
        payload.latitude,
        payload.longitude
      );
    }

    if (payload.contactName && payload.to) {
      this.assertCapability(engineType, 'contact');
      return await engine.sendContact(
        engineInstanceId,
        payload.to,
        payload.contactName,
        payload.to
      );
    }

    // Default fallback to text
    return await engine.sendText(engineInstanceId, payload.to, payload.text || '');
  }

  public async getProfile(engineType: EngineType, engineInstanceId: string): Promise<WhatsAppProfile | null> {
    const engine = this.get(engineType);
    return await engine.getProfile(engineInstanceId);
  }

  public async getContacts(engineType: EngineType, engineInstanceId: string): Promise<WhatsAppContact[]> {
    const engine = this.get(engineType);
    return await engine.getContacts(engineInstanceId);
  }

  public async getGroups(engineType: EngineType, engineInstanceId: string): Promise<WhatsAppGroup[]> {
    const engine = this.get(engineType);
    return await engine.getGroups(engineInstanceId);
  }
}

export const engineManager = EngineManager.getInstance();
