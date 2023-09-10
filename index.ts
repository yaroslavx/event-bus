type EventHandler = (payload: any) => void;

interface EventBus {
  on(key: string, handler: EventHandler): () => void;
  off(key: string, handler: EventHandler): void;
  emit(key: string, ...payload: Parameters<EventHandler>): void;
  once(key: string, handler: EventHandler): void;
}

type Bus = Record<string, EventHandler[]>;

export function eventbus(config?: { onError: (...params: any[]) => void }): {
  on: EventBus['on'];
} {
  const bus: Bus = {};

  const on: EventBus['on'] = (key, handler) => {
    if (bus[key] === undefined) {
      bus[key] = [];
    }
    bus[key]?.push(handler);
    return () => {
      off(key, handler);
    };
  };

  const off: EventBus['off'] = (key, handler) => {
    const index = bus[key]?.indexOf(handler) ?? -1;
    bus[key]?.splice(index >>> 0, 1);
  };

  const emit: EventBus['emit'] = (key, payload) => {
    bus[key]?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        config?.onError(e);
      }
    });
  };

  const once: EventBus['once'] = (key, handler) => {
    const handleOnce = (payload: Parameters<typeof handler>) => {
      handler(payload);
      off(key, handleOnce as typeof handler);
    };
    on(key, handleOnce as typeof handler);
  };

  return { on };
}
