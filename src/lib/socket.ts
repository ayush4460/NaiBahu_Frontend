/**
 * WebSocket Client (Socket.IO)
 * Handles real-time communication with the backend
 */

import { io, Socket } from 'socket.io-client';
import { WS_URL } from './utils';
import {
  SocketOrderCreatedEvent,
  SocketOrderUpdatedEvent,
  SocketTableStatusEvent,
  SocketPaymentCompletedEvent,
} from '@/types';

let socket: Socket | null = null;

// ============================================
// SOCKET CONNECTION
// ============================================

/**
 * Initialize socket connection
 */
export function initSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
  });

  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
    console.log('🔌 WebSocket disconnected manually');
  }
}

/**
 * Get socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

// ============================================
// ROOM MANAGEMENT
// ============================================

/**
 * Join table room
 */
export function joinTableRoom(tableId: number): void {
  socket?.emit('join_table', { table_id: tableId });
  console.log('📍 Joined table room:', tableId);
}

/**
 * Leave table room
 */
export function leaveTableRoom(tableId: number): void {
  socket?.emit('leave_table', { table_id: tableId });
  console.log('📍 Left table room:', tableId);
}

/**
 * Join admin room
 */
export function joinAdminRoom(): void {
  socket?.emit('join_admin');
  console.log('👑 Joined admin room');
}

/**
 * Leave admin room
 */
export function leaveAdminRoom(): void {
  socket?.emit('leave_admin');
  console.log('👑 Left admin room');
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Listen for order created event
 */
export function onOrderCreated(callback: (data: SocketOrderCreatedEvent) => void): void {
  socket?.on('order_created', callback);
}

/**
 * Listen for order updated event
 */
export function onOrderUpdated(callback: (data: SocketOrderUpdatedEvent) => void): void {
  socket?.on('order_updated', callback);
}

/**
 * Listen for table status updated event
 */
export function onTableStatusUpdated(callback: (data: SocketTableStatusEvent) => void): void {
  socket?.on('table_status_updated', callback);
}

/**
 * Listen for payment completed event
 */
export function onPaymentCompleted(callback: (data: SocketPaymentCompletedEvent) => void): void {
  socket?.on('payment_completed', callback);
}

/**
 * Remove all event listeners
 */
export function removeAllListeners(): void {
  socket?.removeAllListeners();
  console.log('🧹 Removed all WebSocket listeners');
}

/**
 * Remove specific event listener
 */
export function removeListener(event: string, callback?: Function): void {
  if (callback) {
    socket?.off(event, callback as any);
  } else {
    socket?.off(event);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Emit custom event
 */
export function emitEvent(event: string, data: any): void {
  socket?.emit(event, data);
}

// ============================================
// HOOK HELPERS (for React components)
// ============================================

/**
 * Setup socket with cleanup
 * Use this in useEffect
 */
export function setupSocket(
  onConnect?: () => void,
  onDisconnect?: () => void
): () => void {
  const socket = initSocket();

  if (onConnect) {
    socket.on('connect', onConnect);
  }

  if (onDisconnect) {
    socket.on('disconnect', onDisconnect);
  }

  // Cleanup function
  return () => {
    if (onConnect) {
      socket.off('connect', onConnect);
    }
    if (onDisconnect) {
      socket.off('disconnect', onDisconnect);
    }
  };
}

// ============================================
// EXPORT
// ============================================

const socketService = {
  initSocket,
  disconnectSocket,
  getSocket,
  joinTableRoom,
  leaveTableRoom,
  joinAdminRoom,
  leaveAdminRoom,
  onOrderCreated,
  onOrderUpdated,
  onTableStatusUpdated,
  onPaymentCompleted,
  removeAllListeners,
  removeListener,
  isSocketConnected,
  emitEvent,
  setupSocket,
};

export default socketService;
