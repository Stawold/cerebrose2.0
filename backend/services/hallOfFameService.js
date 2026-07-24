const fs = require('fs');
const path = require('path');
const { GAMES } = require('../config/games');

const FILE_PATH = path.join(__dirname, '..', 'hallOfFame.json');
const TOP_N = 5;

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// entries: [{ pseudo, rawScore }] — one game's round results, all participants.
// Keeps only the top TOP_N raw scores ever recorded for that game.
function recordGameResult(gameId, entries) {
  if (!GAMES[gameId] || !entries.length) return;
  const data = load();
  const list = data[gameId] || [];
  const date = new Date().toISOString();
  entries.forEach(({ pseudo, rawScore }) => {
    list.push({ pseudo, score: rawScore, date });
  });
  list.sort((a, b) => b.score - a.score);
  data[gameId] = list.slice(0, TOP_N);
  save(data);
}

function getHallOfFame() {
  const data = load();
  // Always return every known game, even if it has no records yet.
  const result = {};
  Object.keys(GAMES).forEach((gameId) => {
    result[gameId] = data[gameId] || [];
  });
  return result;
}

module.exports = { recordGameResult, getHallOfFame };
