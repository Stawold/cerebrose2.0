const { pointsForRank } = require('../config/games');

// players: [{ id, pseudo, rawScore }]. Returns [{ id, pseudo, rawScore, rank, points }]
// Ties share the same rank and the same points.
function computeRoundRanking(players) {
  const sorted = [...players].sort((a, b) => b.rawScore - a.rawScore);
  const result = [];
  let rank = 0;
  let lastScore = null;
  sorted.forEach((p, index) => {
    if (lastScore === null || p.rawScore !== lastScore) {
      rank = index + 1;
      lastScore = p.rawScore;
    }
    result.push({ ...p, rank, points: pointsForRank(rank) });
  });
  return result;
}

// Merges round ranking points into a running global score map { id: total }
function applyRoundToGlobal(globalScores, roundRanking) {
  roundRanking.forEach(({ id, points }) => {
    globalScores[id] = (globalScores[id] || 0) + points;
  });
  return globalScores;
}

function computeLeaderboard(players, globalScores) {
  return players
    .map((p) => ({ id: p.id, pseudo: p.pseudo, total: globalScores[p.id] || 0 }))
    .sort((a, b) => b.total - a.total);
}

module.exports = { computeRoundRanking, applyRoundToGlobal, computeLeaderboard };
