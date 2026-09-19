import { EngineType, WooHubEvent } from '../../types';

export class EventNormalizer {
  /**
   * Normalizes incoming raw payload from any engine into standard WooHubEvent
   */
  public static normalize(
    engine: EngineType,
    instanceId: string,
    organizationId: string,
    rawPayload: any
  ): WooHubEvent {
    const timestamp = new Date().toISOString();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    switch (engine) {
      case 'waha':
        return this.normalizeWaha(rawPayload, eventId, instanceId, organizationId, timestamp);
      case 'wuzapi':
        return this.normalizeWuzapi(rawPayload, eventId, instanceId, organizationId, timestamp);
      case 'whatsmeow':
        return this.normalizeWhatsmeow(rawPayload, eventId, instanceId, organizationId, timestamp);
      default:
        return {
          id: eventId,
          event: 'message.received',
          instanceId,
          organizationId,
          engine,
          timestamp,
          data: rawPayload
        };
    }
  }

  private static normalizeWaha(
    raw: any,
    id: string,
    instanceId: string,
    organizationId: string,
    timestamp: string
  ): WooHubEvent {
    let eventName: WooHubEvent['event'] = 'message.received';

    if (raw.event === 'message') {
      eventName = raw.payload?.fromMe ? 'message.sent' : 'message.received';
    } else if (raw.event === 'message.ack') {
      eventName = raw.payload?.ack === 3 ? 'message.read' : 'message.delivered';
    } else if (raw.event === 'session.status') {
      if (raw.payload?.status === 'WORKING') eventName = 'connection.connected';
      else if (raw.payload?.status === 'STOPPED') eventName = 'connection.disconnected';
      else if (raw.payload?.status === 'SCAN_QR_CODE') eventName = 'connection.qr';
    }

    return {
      id,
      event: eventName,
      instanceId,
      organizationId,
      engine: 'waha',
      timestamp,
      data: {
        messageId: raw.payload?.id || `waha_${Date.now()}`,
        from: raw.payload?.from || '',
        to: raw.payload?.to || '',
        body: raw.payload?.body || raw.payload?.text || '',
        hasMedia: Boolean(raw.payload?.hasMedia),
        mediaUrl: raw.payload?.media?.url,
        type: raw.payload?.hasMedia ? 'image' : 'text',
        sourceEngineRaw: raw
      }
    };
  }

  private static normalizeWuzapi(
    raw: any,
    id: string,
    instanceId: string,
    organizationId: string,
    timestamp: string
  ): WooHubEvent {
    let eventName: WooHubEvent['event'] = 'message.received';
    const isFromMe = raw.event?.Info?.IsFromMe || false;

    if (raw.type === 'Message') {
      eventName = isFromMe ? 'message.sent' : 'message.received';
    } else if (raw.type === 'Connected') {
      eventName = 'connection.connected';
    } else if (raw.type === 'Disconnected') {
      eventName = 'connection.disconnected';
    } else if (raw.type === 'QR') {
      eventName = 'connection.qr';
    }

    return {
      id,
      event: eventName,
      instanceId,
      organizationId,
      engine: 'wuzapi',
      timestamp,
      data: {
        messageId: raw.event?.Info?.ID || `wuz_${Date.now()}`,
        from: raw.event?.Info?.Sender || '',
        to: raw.event?.Info?.Chat || '',
        body: raw.event?.Message?.conversation || raw.event?.Message?.extendedTextMessage?.text || '',
        hasMedia: Boolean(raw.event?.Message?.imageMessage || raw.event?.Message?.videoMessage),
        type: raw.event?.Message?.imageMessage ? 'image' : 'text',
        sourceEngineRaw: raw
      }
    };
  }

  private static normalizeWhatsmeow(
    raw: any,
    id: string,
    instanceId: string,
    organizationId: string,
    timestamp: string
  ): WooHubEvent {
    let eventName: WooHubEvent['event'] = 'message.received';
    const isFromMe = raw.data?.Info?.IsFromMe || false;

    if (raw.type === 'Message') {
      eventName = isFromMe ? 'message.sent' : 'message.received';
    } else if (raw.type === 'Connected' || raw.type === 'PairSuccess') {
      eventName = 'connection.connected';
    } else if (raw.type === 'LoggedOut' || raw.type === 'Disconnected') {
      eventName = 'connection.disconnected';
    } else if (raw.type === 'QR') {
      eventName = 'connection.qr';
    }

    return {
      id,
      event: eventName,
      instanceId,
      organizationId,
      engine: 'whatsmeow',
      timestamp,
      data: {
        messageId: raw.data?.Info?.ID || `meow_${Date.now()}`,
        from: raw.data?.Info?.Sender || '',
        to: raw.data?.Info?.Chat || '',
        body: raw.data?.Message?.conversation || '',
        hasMedia: Boolean(raw.data?.Message?.imageMessage),
        type: 'text',
        sourceEngineRaw: raw
      }
    };
  }
}
