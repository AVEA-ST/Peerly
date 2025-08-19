import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true })
  }
  return socket
}
