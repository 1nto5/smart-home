declare module 'miio' {
  interface MiioDeviceOptions {
    address: string;
    token: string;
  }

  export interface MiioDevice {
    call(method: string, params: unknown[]): Promise<unknown[]>;
    destroy(): void;
  }

  interface MiioBrowser {
    on(event: 'available', callback: (device: Record<string, unknown>) => void): void;
    stop(): void;
  }

  const miio: {
    device(options: MiioDeviceOptions): Promise<MiioDevice>;
    browse(): MiioBrowser;
  };

  export default miio;
}
