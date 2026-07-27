// Each game has fields shared across all difficulties (id, label, engine,
// input shape, ...) plus a `difficulties` map of overrides layered on top for
// 'normal' | 'difficile' | 'hardcore'. resolveGameConfig() flattens the two
// into the single config object the game engine actually runs with.
const GAMES = {
  calculs: {
    id: 'calculs',
    label: 'Calculs mentaux',
    engine: 'calculs',
    difficulties: {
      normal: { dataFile: 'calculs.json', totalDuration: 240, wrongPenalty: false },
      difficile: { dataFile: 'calculs_difficile.json', totalDuration: 180, wrongPenalty: true },
      hardcore: { dataFile: 'calculs_hardcore.json', totalDuration: 120, wrongPenalty: true }
    }
  },
  texte: {
    id: 'texte',
    label: 'Correction de texte',
    engine: 'texte',
    difficulties: {
      normal: { dataFile: 'texte.json', perTextDuration: 90, wrongPenalty: false },
      difficile: { dataFile: 'texte_difficile.json', perTextDuration: 40, wrongPenalty: true },
      hardcore: { dataFile: 'texte_hardcore.json', perTextDuration: 30, wrongPenalty: true }
    }
  },
  memoire: {
    id: 'memoire',
    label: 'Mémoire des chiffres',
    engine: 'memoire',
    difficulties: {
      normal: { dataFile: 'memoire.json', displayDuration: 20, inputDuration: 10, wrongPenalty: false },
      difficile: { dataFile: 'memoire_difficile.json', displayDuration: 20, inputDuration: 10, wrongPenalty: false },
      hardcore: { dataFile: 'memoire_hardcore.json', displayDuration: 20, inputDuration: 10, wrongPenalty: true }
    }
  },
  balance: {
    id: 'balance',
    label: 'Balance',
    engine: 'balance',
    difficulties: {
      normal: { dataFile: 'balance.json', observeDuration: 20, perItemDuration: 15, grayoutDuration: 3, pointsMode: 'speed' },
      difficile: { dataFile: 'balance_difficile.json', observeDuration: 20, perItemDuration: 15, grayoutDuration: 3, pointsMode: 'fixed', fixedPoints: [4, 1, 2, 4, 1, 2] },
      hardcore: { dataFile: 'balance_hardcore.json', observeDuration: 20, perItemDuration: 15, grayoutDuration: 3, pointsMode: 'fixed', fixedPoints: [3, 3, 3, 3, 3, 3] }
    }
  },
  heures: {
    id: 'heures',
    label: "Différence d'heures",
    engine: 'generic',
    inputType: 'number',
    answerField: 'answerMinutes',
    altAnswerField: 'answerMinutesAlt',
    difficulties: {
      normal: { dataFile: 'heures_normal.json', observeDuration: 6, perItemDuration: 20, wrongPenalty: false },
      difficile: { dataFile: 'heures_avance.json', observeDuration: 6, perItemDuration: 20, wrongPenalty: true },
      hardcore: { dataFile: 'heures_avance.json', observeDuration: 6, perItemDuration: 20, wrongPenalty: true }
    }
  },
  pfc: {
    id: 'pfc',
    label: 'Pierre Feuille Ciseaux',
    engine: 'generic',
    inputType: 'buttons',
    options: ['pierre', 'feuille', 'ciseaux'],
    answerField: 'correctAnswer',
    wrongPenalty: true,
    difficulties: {
      normal: { dataFile: 'pfc.json', perItemDuration: 10 },
      difficile: { dataFile: 'pfc.json', perItemDuration: 7 },
      hardcore: { dataFile: 'pfc.json', perItemDuration: 4 }
    }
  },
  anagramme: {
    id: 'anagramme',
    label: 'Anagramme',
    engine: 'anagramme',
    answerField: 'answer',
    transitionDuration: 3,
    difficulties: {
      normal: { dataFile: 'anagramme.json', perItemDuration: 30, pointsCorrect: 1, wrongPenalty: false },
      difficile: { dataFile: 'anagramme_difficile.json', perItemDuration: 20, pointsCorrect: 2, wrongPenalty: true, multiAnswer: true },
      hardcore: { dataFile: 'anagramme.json', perItemDuration: 15, pointsCorrect: 1, wrongPenalty: true }
    }
  },
  couleurs: {
    id: 'couleurs',
    label: 'Test des couleurs (Stroop)',
    engine: 'generic',
    inputType: 'buttons',
    options: ['rouge', 'bleu', 'vert', 'jaune', 'violet', 'orange', 'blanc'],
    answerField: 'color',
    perItemDuration: 7,
    grayoutDuration: 3,
    wrongPenalty: true,
    noFeedback: true,
    difficulties: {
      normal: { dataFile: 'couleurs.json' },
      difficile: { dataFile: 'couleurs.json' },
      hardcore: { dataFile: 'couleurs.json' }
    }
  },
  grille: {
    id: 'grille',
    label: 'Grille spatiale',
    engine: 'generic',
    inputType: 'buttons',
    options: ['vert', 'rouge', 'jaune', 'violet'],
    answerField: 'dominantColor',
    perItemDuration: 10,
    grayoutDuration: 3,
    noFeedback: true,
    difficulties: {
      normal: { dataFile: 'grille.json' },
      difficile: { dataFile: 'grille.json' },
      hardcore: { dataFile: 'grille.json' }
    }
  }
};

const DIFFICULTIES = ['normal', 'difficile', 'hardcore'];

// Flattens a game's base fields + the overrides for one difficulty into the
// single config object the engines read from (this.config.xxx).
function resolveGameConfig(gameId, difficulty) {
  const game = GAMES[gameId];
  if (!game) return null;
  const diff = DIFFICULTIES.includes(difficulty) ? difficulty : 'normal';
  const { difficulties, ...base } = game;
  return { ...base, difficulty: diff, ...(difficulties && difficulties[diff]) };
}

// Rank 1 → 100, rank 2 → 80, ... rank 14 → 5. Rank 15 and beyond → RANKING_POINTS_DEFAULT.
const RANKING_POINTS = [100, 80, 70, 60, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5];
const RANKING_POINTS_DEFAULT = 1;

function pointsForRank(rank) {
  if (rank >= 1 && rank <= RANKING_POINTS.length) return RANKING_POINTS[rank - 1];
  return RANKING_POINTS_DEFAULT;
}

module.exports = { GAMES, DIFFICULTIES, resolveGameConfig, pointsForRank };
