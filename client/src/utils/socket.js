import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL.replace('/api', '');

// Initialize socket instance (autoConnect: false so we connect manually after auth)
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});

export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
    }
    // Register the userId with the backend socket map
    if (userId) {
        socket.emit("register", userId);
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
