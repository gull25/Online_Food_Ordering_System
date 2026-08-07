import { io } from 'socket.io-client';

// VITE_API_URL is optional; reading `.replace` off an undefined value here used
// to throw at module load and take down every screen that imports the socket.
const URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Initialize socket instance (autoConnect: false so we connect manually after auth)
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// ── Connect and register user ─────────────────────────────────────────────────
export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
    }
    // Register the userId with the backend socket map for direct targeting
    if (userId) {
        socket.emit('register', userId);
    }
};

// ── Disconnect ────────────────────────────────────────────────────────────────
export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

// ── Join an order room (customer + restaurant both call this) ─────────────────
// Both parties join "order_<orderId>" so all order events reach them.
export const joinOrderRoom = (orderId) => {
    if (orderId) {
        socket.emit('join:order_room', orderId);
    }
};

// ── Leave an order room ───────────────────────────────────────────────────────
export const leaveOrderRoom = (orderId) => {
    if (orderId) {
        socket.emit('leave:order_room', orderId);
    }
};

// ── Rider: emit live GPS position (used by rider simulator in Admin Dashboard) ─
// Payload: { orderId, lat, lng, riderId }
export const emitRiderLocation = ({ orderId, lat, lng, riderId }) => {
    if (socket.connected) {
        socket.emit('rider:location_update', { orderId, lat, lng, riderId });
    }
};
