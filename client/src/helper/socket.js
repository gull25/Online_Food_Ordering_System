import { io } from 'socket.io-client';
import { LOCAL_STORAGE_KEYS } from '../constants/localStorageKeys';

// VITE_API_URL is optional; reading `.replace` off an undefined value here used
// to throw at module load and take down every screen that imports the socket.
const URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const readToken = () => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
};

/**
 * The realtime connection.
 *
 * `auth` is a function rather than a fixed object so socket.io re-reads it on
 * every reconnect — a token refreshed (or cleared by logout) mid-session is
 * picked up on the next attempt instead of the socket retrying forever with a
 * stale credential.
 *
 * The server now authenticates this handshake and derives identity from the
 * token. That replaces the old `register` event, which took a user id from the
 * client and trusted it: anyone could claim to be any user and receive their
 * order notifications.
 */
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: (cb) => cb({ token: readToken() }),
});

if (import.meta.env.DEV) {
  socket.on('connect_error', (error) => {
    console.warn('[socket] connection failed:', error.message);
  });
}

/**
 * Opens the connection. The `userId` argument is accepted for call-site
 * compatibility but is no longer sent — the server reads it from the token.
 */
export const connectSocket = () => {
  if (!readToken()) return;
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

/**
 * Subscribes to an order's live events.
 *
 * The server authorises the join against the order, so this resolves to `false`
 * when the caller is not a party to it — previously any client could join any
 * order room and watch a stranger's delivery.
 *
 * @returns {Promise<boolean>} whether the room was joined.
 */
export const joinOrderRoom = (orderId) =>
  new Promise((resolve) => {
    if (!orderId || !socket.connected) return resolve(false);

    socket.emit('join:order_room', orderId, (response) => resolve(Boolean(response?.ok)));

    // The server always acks, but a dropped connection mid-emit would otherwise
    // leave this promise pending forever.
    setTimeout(() => resolve(false), 5000);
  });

export const leaveOrderRoom = (orderId) => {
  if (orderId) socket.emit('leave:order_room', orderId);
};

/** Riders join their own room; the server resolves which one from the session. */
export const joinRiderRoom = () => {
  socket.emit('rider:join');
};

/**
 * Reports the courier's position. Only the rider assigned to the order is
 * allowed to; the server verifies that rather than broadcasting whatever
 * arrives.
 */
export const emitRiderLocation = ({ orderId, lat, lng }) => {
  if (socket.connected) socket.emit('rider:location_update', { orderId, lat, lng });
};
