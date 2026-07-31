import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL.replace('/api', '');

// Initialize socket instance (autoConnect: false so we connect manually after auth)
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
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
    if (orderId && socket.connected) {
        socket.emit('join:order_room', orderId);
    }
};

// ── Leave an order room ───────────────────────────────────────────────────────
export const leaveOrderRoom = (orderId) => {
    if (orderId && socket.connected) {
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
