require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const gameRoutes = require('./routes/game');
const { socketHandler } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/game', gameRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

io.on('connection', (socket) => {
  socketHandler(io, socket);
});

const PORT = process.env.PORT || 3001;

const startServer = async (port) => {
  const { connectDB } = require('./db');
  try {
    await connectDB();
    await server.listen(port || PORT);
    console.log(`Server running on port ${port || PORT}`);
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    throw err;
  }
};

// Only auto-start when run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io, startServer };