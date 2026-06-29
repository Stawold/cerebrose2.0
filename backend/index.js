const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { attachSocketHandlers } = require('./services/socketManager');
const { GAMES } = require('./config/games');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/games', (_req, res) => {
  res.json(Object.values(GAMES).map((g) => ({ id: g.id, label: g.label })));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*' }
});

attachSocketHandlers(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Cérébr'Ose V2.0 backend listening on port ${PORT}`);
});
