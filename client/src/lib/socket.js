import { io } from 'socket.io-client'

// Prefer explicit socket URL, then API base, then current origin (for same-origin deployments)
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000')

let socket

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // Let Socket.IO choose best transport (polling fallback helps on some hosts)
      autoConnect: true,
      withCredentials: false,
      path: '/socket.io',
    })

    // Basic diagnostics for production troubleshooting
    socket.on('connect', () => console.log('socket connected', socket.id, 'to', SOCKET_URL))
    socket.on('connect_error', (e) => console.error('socket connect_error:', e && e.message))
    socket.on('reconnect_attempt', (n) => console.log('socket reconnect_attempt', n))
  }
  return socket
}
