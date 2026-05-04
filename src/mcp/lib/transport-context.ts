import type { TransportType } from '../auth/middleware';

let currentTransport: TransportType = 'http';

export function getCurrentTransport(): TransportType {
  return currentTransport;
}

export function setCurrentTransport(transport: TransportType): void {
  currentTransport = transport;
}
