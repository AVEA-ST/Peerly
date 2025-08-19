require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { createAdapter } = require('@socket.io/redis-adapter');
const { Redis } = require('ioredis');

const usersRouter = require('./routes/users');
const conversationsRouter = require('./routes/conversations');
const messagesRouter = require('./routes/messages');

const app = express();
const server = http.createServer(app);
// Support single or multiple origins via comma-separated env
const RAW_CORS = process.env.CORS_ORIGIN || 'http://localhost:5173';
const CORS_ORIGINS = RAW_CORS.split(',').map((s) => s.trim()).filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true,
  },
});

// Socket.IO Redis adapter for horizontal scaling
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
  try {
    const pubClient = new Redis(REDIS_URL);
    const subClient = new Redis(REDIS_URL);
    io.adapter(createAdapter(pubClient, subClient));
    pubClient.on('error', (err) => console.error('Redis pubClient error:', err.message));
    subClient.on('error', (err) => console.error('Redis subClient error:', err.message));
    console.log('Socket.IO Redis adapter configured');
  } catch (err) {
    console.error('Failed to configure Redis adapter:', err.message);
  }
} else {
  console.warn('REDIS_URL not set; running without Redis adapter (single instance only)');
}

// Middleware
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Inject io into request for message POSTs if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Socket.IO
io.on('connection', (socket) => {
  // Expect client to join rooms by conversation id
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('typing', ({ conversationId, userId, isTyping }) => {
    socket.to(`conversation:${conversationId}`).emit('typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
})();
