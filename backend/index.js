const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { attachSocketHandlers } = require('./services/socketManager');
const { loadData } = require('./services/gameService');
const { GAMES } = require('./config/games');

// Minimal .env loader (no extra dependency): lets ADMIN_PASSWORD etc. live
// in a local, gitignored file instead of the source code.
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/games', (_req, res) => {
  // Timing/scoring config only — safe to expose publicly, used by the
  // pre-game "Règles" recap so it stays in sync with the real server config.
  res.json(Object.values(GAMES).map((g) => {
    let itemCount = null;
    try { itemCount = loadData(g.dataFile).length; } catch { itemCount = null; }
    return {
      id: g.id,
      label: g.label,
      itemCount,
      totalDuration: g.totalDuration ?? null,
      perItemDuration: g.perItemDuration ?? null,
      perTextDuration: g.perTextDuration ?? null,
      displayDuration: g.displayDuration ?? null,
      inputDuration: g.inputDuration ?? null,
      observeDuration: g.observeDuration ?? null
    };
  }));
});
app.use('/admin', require('./routes/admin'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*' }
});

attachSocketHandlers(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Cérébr'Ose V2.0 backend listening on port ${PORT}`);
});
