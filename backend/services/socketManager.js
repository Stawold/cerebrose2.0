const { randomUUID } = require('crypto');
const { GAMES, DIFFICULTIES } = require('../config/games');
const { createRunner } = require('./gameService');
const { computeRoundRanking, applyRoundToGlobal, computeLeaderboard } = require('./scoringService');
const { recordGameResult, getGameHallOfFame } = require('./hallOfFameService');
const { verifyAdminPassword, isAdminPasswordConfigured } = require('./adminAuth');

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
    phase: party.phase,
    difficulty: party.difficulty
  });
}

function startNextGame(io, party) {
  party.currentGameIndex += 1;
  if (party.currentGameIndex >= party.selectedGames.length) {
    party.phase = 'finished';
    const leaderboard = computeLeaderboard(Array.from(party.players.values()), party.globalScores);
    io.to(party.code).emit('party:gameOver', { leaderboard, roundHistory: party.roundHistory });
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
  party.currentRunner = createRunner(gameId, party.difficulty, players, io, party.code, (rawScores) => {
    onGameFinish(io, party, gameId, rawScores);
  }, () => party.hostSocketId);
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
  } else if (party.phase === 'roundFinished' && party.pendingReveal) {
    socket.emit('party:roundFinished', { game: party.pendingReveal.game });
    const stages = ['results', 'hallOfFame', 'leaderboard'];
    const reached = stages.indexOf(party.revealStage);
    if (reached >= 0) {
      socket.emit('party:revealResults', { game: party.pendingReveal.game, ranking: party.pendingReveal.ranking });
    }
    if (reached >= 1) {
      socket.emit('party:revealHallOfFame', { game: party.pendingReveal.game, entries: party.pendingReveal.hallOfFame });
    }
    if (reached >= 2) {
      socket.emit('party:revealLeaderboard', { leaderboard: party.pendingReveal.leaderboard });
    }
  }
}

// Each round's results are computed all at once when the game engine finishes,
// but only handed to clients stage by stage as the host reveals them (see the
// host:reveal* handlers below) — nothing is broadcast here.
function onGameFinish(io, party, gameId, rawScores) {
  const playersArr = Array.from(party.players.values());
  const roundPlayers = playersArr.map((p) => ({ id: p.id, pseudo: p.pseudo, rawScore: rawScores[p.id] || 0 }));
  const ranking = computeRoundRanking(roundPlayers);
  applyRoundToGlobal(party.globalScores, ranking);
  const leaderboard = computeLeaderboard(playersArr, party.globalScores);
  party.roundHistory.push({ game: gameId, ranking });
  recordGameResult(gameId, ranking.map((r) => ({ pseudo: r.pseudo, rawScore: r.rawScore })));

  party.phase = 'roundFinished';
  party.revealStage = null; // null | 'results' | 'hallOfFame' | 'leaderboard'
  party.pendingReveal = {
    game: gameId,
    ranking,
    leaderboard,
    hallOfFame: getGameHallOfFame(gameId)
  };
  io.to(party.code).emit('party:roundFinished', { game: gameId });

  // Solo test parties have no separate host/player split to stage a reveal
  // for — skip straight through all three stages.
  if (party.isTest) {
    revealResults(io, party);
    revealHallOfFame(io, party);
    revealLeaderboard(io, party);
  }
}

function revealResults(io, party) {
  party.revealStage = 'results';
  io.to(party.code).emit('party:revealResults', {
    game: party.pendingReveal.game,
    ranking: party.pendingReveal.ranking
  });
}

function revealHallOfFame(io, party) {
  party.revealStage = 'hallOfFame';
  io.to(party.code).emit('party:revealHallOfFame', {
    game: party.pendingReveal.game,
    entries: party.pendingReveal.hallOfFame
  });
}

function revealLeaderboard(io, party) {
  party.revealStage = 'leaderboard';
  io.to(party.code).emit('party:revealLeaderboard', {
    leaderboard: party.pendingReveal.leaderboard
  });
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
        difficulty: 'normal',
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
    });

    socket.on('host:selectGames', ({ code, gameIds }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      party.selectedGames = gameIds.filter((id) => GAMES[id]);
      broadcastPartyUpdate(io, party);
      if (ack) ack({ ok: true });
    });

    socket.on('host:setDifficulty', ({ code, difficulty }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      if (!DIFFICULTIES.includes(difficulty)) return ack && ack({ ok: false, error: 'Difficulté inconnue' });
      party.difficulty = difficulty;
      broadcastPartyUpdate(io, party);
      if (ack) ack({ ok: true });
    });

    // Host commands are gated on socket.id === party.hostSocketId, which goes
    // stale the instant the host's socket reconnects (screen lock, wifi blip,
    // dev-server HMR reload...) — a fresh connection means a new socket.id.
    // 'host:rejoinParty' is what refreshes hostSocketId, but if this command
    // was queued client-side before that rejoin lands (e.g. emitted while
    // briefly offline), the server used to just silently drop it — the host
    // would sit frozen on the current screen with no error and no retry.
    // Acks let the client detect that and self-heal by rejoining then retrying.
    socket.on('host:startParty', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      if (!party.selectedGames.length) return ack && ack({ ok: false, error: 'Aucun jeu sélectionné' });
      party.currentGameIndex = -1;
      startNextGame(io, party);
      if (ack) ack({ ok: true });
    });

    socket.on('host:beginGame', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      runCurrentGame(io, party);
      if (ack) ack({ ok: true });
    });

    socket.on('host:revealRoundResults', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId || !party.pendingReveal) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      revealResults(io, party);
      if (ack) ack({ ok: true });
    });

    socket.on('host:revealHallOfFame', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId || !party.pendingReveal) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      revealHallOfFame(io, party);
      if (ack) ack({ ok: true });
    });

    socket.on('host:revealLeaderboard', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId || !party.pendingReveal) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      revealLeaderboard(io, party);
      if (ack) ack({ ok: true });
    });

    socket.on('host:nextRound', ({ code }, ack) => {
      const party = parties.get(code);
      if (!party || socket.id !== party.hostSocketId) return ack && ack({ ok: false, error: 'Session animateur périmée' });
      party.pendingReveal = null;
      party.revealStage = null;
      startNextGame(io, party);
      if (ack) ack({ ok: true });
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
      if (!verifyAdminPassword(password)) {
        const error = isAdminPasswordConfigured()
          ? 'Mot de passe admin invalide'
          : "ADMIN_PASSWORD n'est pas configuré côté serveur — copiez backend/.env.example en backend/.env, renseignez ADMIN_PASSWORD, puis redémarrez le backend.";
        return ack && ack({ ok: false, error });
      }
      if (!GAMES[gameId]) return ack && ack({ ok: false, error: 'Jeu inconnu' });
      const code = generateCode();
      const playerId = randomUUID();
      const party = {
        code,
        hostSocketId: socket.id,
        players: new Map([[playerId, { id: playerId, pseudo: 'Testeur', socketId: socket.id, connected: true }]]),
        selectedGames: [gameId],
        difficulty: 'normal',
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
