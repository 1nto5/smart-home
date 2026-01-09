/**
 * WebSocket broadcast utility for real-time status updates
 */

import type { ServerWebSocket } from 'bun';

const clients = new Set<ServerWebSocket<unknown>>();

export function addClient(ws: ServerWebSocket<unknown>): void {
  clients.add(ws);
  console.log(`WebSocket client connected (total: ${clients.size})`);
}

export function removeClient(ws: ServerWebSocket<unknown>): void {
  clients.delete(ws);
  console.log(`WebSocket client disconnected (total: ${clients.size})`);
}

export function broadcast(data: object): void {
  if (clients.size === 0) return;
  const msg = JSON.stringify(data);
  clients.forEach((ws) => {
    try {
      ws.send(msg);
    } catch {
      // Client disconnected, will be cleaned up
    }
  });
}

export function getClientCount(): number {
  return clients.size;
}
