import { WooHubEvent } from '../../types';

type EventHandler = (event: WooHubEvent) => void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(eventName: string | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);

    return () => {
      this.handlers.get(eventName)?.delete(handler);
    };
  }

  public emit(event: WooHubEvent): void {
    // Notify specific event listeners
    const specificHandlers = this.handlers.get(event.event);
    if (specificHandlers) {
      specificHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error('Error in event handler for', event.event, err);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error('Error in wildcard event handler', err);
        }
      });
    }
  }
}

export const eventBus = EventBus.getInstance();
