const { randomUUID } = require('crypto');
const { GAMES } = require('../config/games');
const { createRunner } = require('./gameService');
const { computeRoundRanking, applyRoundToGlobal, computeLeaderboard } = require('./scoringService');
const { verifyAdminPassword } = require('./adminAuth');

const parties = new Map();

function generateCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (parties.has(code));
  return code;
}

function publicPlayers(party) {
  return Array.from(party.players.values()).map((p) => ({
    id: p.id,
    pseudo: p.pseudo,
    connected: p.connected
  }));
}

function broadcastPartyUpdate(io, party) {
  io.to(party.code).emit('party:update', {
    code: party.code,
    players: publicPlayers(party),
    selectedGames: party.selectedGames,
    phase: party.phase
  });
}

function startNextGame(io, party) {
  party.currentGameIndex += 1;
  if (party.currentGameIndex >= party.selectedGames.length) {
    party.phase = 'finished';
    const leaderboard = computeLeaderboard(Array.from(party.players.values()), party.globalScores);
    io.to(party.code).emit('party:gameOver', { leaderboard });
    // Clean up party from memory after 2 hours
    setTimeout(() => parties.delete(party.code), 2 * 60 * 60 * 1000);
    return;
  }
  party.phase = 'rules';
  const gameId = party.selectedGames[party.currentGameIndex];
  io.to(party.code).emit('party:rulesPhase', {
    game: gameId,
    label: GAMES[gameId].label,
    gameIndex: party.currentGameIndex,
    totalGames: party.selectedGames.length
  });
}

function runCurrentGame(io, party) {
  const gameId = party.selectedGames[party.currentGameIndex];
  const players = Array.from(party.players.values()).map((p) => ({
    id: p.id,
    socketId: p.socketId,
    pseudo: p.pseudo
  }));
  party.phase = 'playing';
  party.currentRunner = createRunner(gameId, players, io, party.code, (rawScores) => {
    onGameFinish(io, party, gameId, rawScores);
  });
  io.to(party.code).emit('party:gameStart', { game: gameId, label: GAMES[gameId].label });
  party.currentRunner.start();
}

function replayPartyStateToSocket(socket, party) {
  const gameId = party.selectedGames[party.currentGameIndex];
  if (party.phase === 'rules' && gameId) {
    socket.emit('party:rulesPhase', {
      game: gameId,
      label: GAMES[gameId].label,
      gameIndex: party.currentGameIndex,
      totalGames: party.selectedGames.length
    });
  } else if (party.phase === 'playing' && party.currentRunner) {
    party.currentRunner.replayToSocket(socket);
  }
}

function onGameFinish(io, party, gameId, rawScores) {
  party.phase = 'roundResults';
  const playersArr = Array.from(party.players.values());
  const roundPlayers = playersArr.map((p) => ({ id: p.id, pseudo: p.pseudo, rawScore: rawScores[p.id] || 0 }));
  const ranking = computeRoundRanking(roundPlayers);
  applyRoundToGlobal(party.globalScores, ranking);
  const leaderboard = computeLeaderboard(playersArr, party.globalScores);
  party.roundHistory.push({ game: gameId, ranking });
  party.lastRoundResults = { game: gameId, ranking, leaderboard };
  io.to(party.code).emit('party:roundResults', { game: gameId, ranking, leaderboard });
}

function attachSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('host:createParty', (_payload, ack) => {
      const code = generateCode();
      const party = {
        code,
        hostSocketId: socket.id,
        players: new Map(),
        selectedGames: [],
        currentGameIndex: -1,
        currentRunner: null,
        globalScores: {},
        roundHistory: [],
        phase: 'lobby'
      };
      parties.set(code, party);
      socket.join(code);
      socket.data.role = 'host';
      socket.data.code = code;
      if (ack) ack({ ok: true, code });
    });

    socket.on('player:joinParty', ({ code, pseudo }, ack) => {
      const party = parties.get(code);
      if (!party) return ack && ack({ ok: false, error: 'Code de partie inconnu' });
      if (party.phase !== 'lobby') return ack && ack({ ok: false, error: 'La partie a déjà commencé' });
      const playerId = randomUUID();
      party.players.set(playerId, { id: playerId, pseudo, socketId: socket.id, connected: true });
      socket.join(code);
      socket.data.role = 'player';
      socket.data.code = code;
      socket.data.playerId = playerId;
      broadcastPartyUpdate(io, party);
      if (ack) ack({ ok: true, playerId, code });
    });

    socket.on('player:rejoinParty', ({ code, pseudo, playerId }, ack) => {
      const party = parties.get(code);
      if (!party) return ack && ack({ ok: false, error: 'Partie introuvable' });
      const player = party.players.get(playerId);
      if (!player || player.pseudo !== pseudo) return ack && ack({ ok: false, error: 'Joueur introuvable' });
      player.socketId = socket.id;
      player.connected = true;
      socket.join(code);
      socket.data.role = 'player';
      socket.data.code = code;
      socket.data.playerId = playerId;
      if (party.currentRunner) {
        party.currentRunner.players = party.currentRunner.players.map((p) =>
          p.id === playerId ? { ...p, socketId: socket.id } : p
        );
      }
      broadcastPartyUpdate(io, party);
      if (ack) ack({ ok: true, phase: party.phase, selectedGames: party.selectedGames });
      replayPartyStateToSocket(socket, party);
      if (party.phase === 'roundResults' && party.lastRoundResults) {
        socket.emit('party:roundResults', party.lastRoundResults);
      }
    });

    socket.on('host:rejoinParty', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party) return ack && ack({ ok: false, error: 'Partie introuvable' });
      party.hostSocketId = socket.id;
      socket.join(code);
      socket.data.role = 'host';
      socket.data.code = code;
      broadcastPartyUpdate(io, party);
      if (ack) ack({ ok: true, phase: party.phase, selectedGames: party.selectedGames });
      replayPartyStateToSocket(socket, party);
      if (party.phase === 'roundResults' && party.lastRoundResults) {
        socket.emit('party:roundResults', party.lastRoundResults);
      }
    });

    socket.on('host:selectGames', ({ code, gameIds }) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return;
      party.selectedGames = gameIds.filter((id) => GAMES[id]);
      broadcastPartyUpdate(io, party);
    });

    socket.on('host:startParty', ({ code }) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return;
      if (!party.selectedGames.length) return;
      party.currentGameIndex = -1;
      startNextGame(io, party);
    });

    socket.on('host:beginGame', ({ code }) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return;
      runCurrentGame(io, party);
    });

    socket.on('host:nextRound', ({ code }) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return;
      startNextGame(io, party);
    });

    socket.on('spectator:join', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party) return ack && ack({ ok: false, error: 'Code de partie inconnu' });
      socket.join(code);
      socket.data.role = 'spectator';
      socket.data.code = code;
      if (ack) ack({ ok: true });
    });

    socket.on('player:answer', (payload) => {
      const { code, playerId } = socket.data;
      const party = parties.get(code);
      if (!party || !party.currentRunner) return;
      party.currentRunner.handleAnswer(playerId, payload);
    });

    // --- Test mode: lets a single socket act as its own party of one, to
    // try out a game's flow/content without a real multiplayer session. ---
    socket.on('test:startSolo', ({ gameId, password }, ack) => {
      if (!verifyAdminPassword(password)) return ack && ack({ ok: false, error: 'Mot de passe admin invalide' });
      if (!GAMES[gameId]) return ack && ack({ ok: false, error: 'Jeu inconnu' });
      const code = generateCode();
      const playerId = randomUUID();
      const party = {
        code,
        hostSocketId: socket.id,
        players: new Map([[playerId, { id: playerId, pseudo: 'Testeur', socketId: socket.id, connected: true }]]),
        selectedGames: [gameId],
        currentGameIndex: 0,
        currentRunner: null,
        globalScores: {},
        roundHistory: [],
        phase: 'lobby',
        isTest: true
      };
      parties.set(code, party);
      socket.join(code);
      socket.data.role = 'player';
      socket.data.code = code;
      socket.data.playerId = playerId;
      runCurrentGame(io, party);
      if (ack) ack({ ok: true, code, playerId });
    });

    socket.on('test:skip', ({ code }) => {
      const party = parties.get(code);
      if (!party || !party.isTest || socket.id !== party.hostSocketId) return;
      if (party.currentRunner) party.currentRunner.skip();
    });

    socket.on('test:endSolo', ({ code }) => {
      const party = parties.get(code);
      if (!party || !party.isTest || socket.id !== party.hostSocketId) return;
      if (party.currentRunner) party.currentRunner.clearTimers();
      socket.leave(code);
      parties.delete(code);
    });

    socket.on('disconnect', () => {
      const { code, role, playerId } = socket.data;
      const party = parties.get(code);
      if (!party) return;
      if (party.isTest) {
        if (party.currentRunner) party.currentRunner.clearTimers();
        parties.delete(code);
        return;
      }
      if (role === 'player' && playerId) {
        const player = party.players.get(playerId);
        if (player) {
          player.connected = false;
          broadcastPartyUpdate(io, party);
        }
      } else if (role === 'host') {
        party.hostSocketId = null;
        io.to(party.code).emit('party:hostDisconnected');
      }
    });
  });
}

module.exports = { attachSocketHandlers, parties };
