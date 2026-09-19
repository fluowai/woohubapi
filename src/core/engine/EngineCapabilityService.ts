import { EngineCapabilities, EngineType } from '../../types';

export class EngineCapabilityError extends Error {
  public readonly code = 'ENGINE_CAPABILITY_NOT_SUPPORTED';
  public readonly capability: keyof EngineCapabilities;
  public readonly engine: EngineType;

  constructor(engine: EngineType, capability: keyof EngineCapabilities, message?: string) {
    super(
      message ||
        `O motor ${engine.toUpperCase()} desta instância não suporta a funcionalidade: '${capability}'.`
    );
    this.name = 'EngineCapabilityError';
    this.capability = capability;
    this.engine = engine;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        capability: this.capability,
        engine: this.engine,
        message: this.message
      }
    };
  }
}

export class EngineCapabilityService {
  /**
   * Verifies if an engine supports a given capability.
   * Throws EngineCapabilityError if unsupported.
   */
  public static assertCapability(
    engine: EngineType,
    capabilities: EngineCapabilities,
    capability: keyof EngineCapabilities,
    customMessage?: string
  ): void {
    if (!capabilities[capability]) {
      throw new EngineCapabilityError(engine, capability, customMessage);
    }
  }

  /**
   * Checks if an engine supports a capability safely without throwing.
   */
  public static supports(
    capabilities: EngineCapabilities,
    capability: keyof EngineCapabilities
  ): boolean {
    return Boolean(capabilities[capability]);
  }
}
