import { EngineInfo, EngineType } from '../../types';
import { WahaAdapter } from './WahaAdapter';
import { WhatsAppEngine } from './WhatsAppEngine';
import { WhatsmeowAdapter } from './WhatsmeowAdapter';
import { WuzapiAdapter } from './WuzapiAdapter';

export interface RegisteredEngine {
  info: EngineInfo;
  adapter: WhatsAppEngine;
}

export class EngineRegistry {
  private static engines: Map<EngineType, RegisteredEngine> = new Map();

  static {
    const waha = new WahaAdapter();
    const wuzapi = new WuzapiAdapter();
    const whatsmeow = new WhatsmeowAdapter();

    EngineRegistry.engines.set('waha', {
      info: {
        id: 'waha',
        name: 'WAHA (WhatsApp HTTP API)',
        badgeName: 'WAHA',
        version: waha.version,
        status: 'ONLINE',
        description: 'Motor robusto em Node.js com suporte completo a mídia, botões, listas e webhooks com alta fidelidade.',
        technology: 'Node.js / Chromium / Baileys',
        memoryUsage: '~180MB/instância',
        latencyMs: 14,
        allowsNewInstances: true,
        capabilities: waha.capabilities,
        docsUrl: 'https://waha.devlike.pro'
      },
      adapter: waha
    });

    EngineRegistry.engines.set('wuzapi', {
      info: {
        id: 'wuzapi',
        name: 'WuzAPI (Go REST Service)',
        badgeName: 'WuzAPI',
        version: wuzapi.version,
        status: 'ONLINE',
        description: 'Serviço REST em Go leve e rápido, ideal para alto volume de disparos de texto e mídias essenciais.',
        technology: 'Golang / SQLite / Multi-Device',
        memoryUsage: '~45MB/instância',
        latencyMs: 6,
        allowsNewInstances: true,
        capabilities: wuzapi.capabilities,
        docsUrl: 'https://github.com/asternic/wuzapi'
      },
      adapter: wuzapi
    });

    EngineRegistry.engines.set('whatsmeow', {
      info: {
        id: 'whatsmeow',
        name: 'whatsmeow (Pure Go Engine)',
        badgeName: 'whatsmeow',
        version: whatsmeow.version,
        status: 'ONLINE',
        description: 'Conexão direta multi-device em Go sem navegador, altíssimo throughput e consumo mínimo de recursos.',
        technology: 'Golang Native Protocol',
        memoryUsage: '~30MB/instância',
        latencyMs: 4,
        allowsNewInstances: true,
        capabilities: whatsmeow.capabilities,
        docsUrl: 'https://github.com/tulir/whatsmeow'
      },
      adapter: whatsmeow
    });
  }

  public static get(engineType: EngineType): RegisteredEngine {
    const entry = this.engines.get(engineType);
    if (!entry) {
      throw new Error(`Motor desconhecido ou não registrado: '${engineType}'`);
    }
    return entry;
  }

  public static getAdapter(engineType: EngineType): WhatsAppEngine {
    return this.get(engineType).adapter;
  }

  public static getAllInfo(): EngineInfo[] {
    return Array.from(this.engines.values()).map((e) => e.info);
  }

  public static setAllowsNewInstances(engineType: EngineType, allows: boolean): void {
    const entry = this.engines.get(engineType);
    if (entry) {
      entry.info.allowsNewInstances = allows;
    }
  }

  public static updateStatus(engineType: EngineType, status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'): void {
    const entry = this.engines.get(engineType);
    if (entry) {
      entry.info.status = status;
    }
  }
}
