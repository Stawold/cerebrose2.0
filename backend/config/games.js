const GAMES = {
  calculs: {
    id: 'calculs',
    label: 'Calculs mentaux',
    dataFile: 'calculs.json',
    engine: 'calculs',
    totalDuration: 240
  },
  texte: {
    id: 'texte',
    label: 'Correction de texte',
    dataFile: 'texte.json',
    engine: 'texte',
    perTextDuration: 90
  },
  memoire: {
    id: 'memoire',
    label: 'Mémoire des chiffres',
    dataFile: 'memoire.json',
    engine: 'memoire',
    displayDuration: 20,
    inputDuration: 10
  },
  balance: {
    id: 'balance',
    label: 'Balance',
    dataFile: 'balance.json',
    engine: 'balance',
    observeDuration: 20,
    perItemDuration: 15,
    grayoutDuration: 3,
    speedBonus: true
  },
  heures: {
    id: 'heures',
    label: "Différence d'heures",
    dataFile: 'heures.json',
    engine: 'generic',
    inputType: 'number',
    answerField: 'answerMinutes',
    altAnswerField: 'answerMinutesAlt',
    observeDuration: 6,
    perItemDuration: 20
  },
  pfc: {
    id: 'pfc',
    label: 'Pierre Feuille Ciseaux',
    dataFile: 'pfc.json',
    engine: 'generic',
    inputType: 'buttons',
    options: ['pierre', 'feuille', 'ciseaux'],
    answerField: 'correctAnswer',
    perItemDuration: 10,
    wrongPenalty: true
  },
  anagramme: {
    id: 'anagramme',
    label: 'Anagramme',
    dataFile: 'anagramme.json',
    engine: 'anagramme',
    answerField: 'answer',
    perItemDuration: 30,
    transitionDuration: 3
  },
  couleurs: {
    id: 'couleurs',
    label: 'Test des couleurs (Stroop)',
    dataFile: 'couleurs.json',
    engine: 'generic',
    inputType: 'buttons',
    options: ['rouge', 'bleu', 'vert'],
    answerField: 'color',
    perItemDuration: 7,
    grayoutDuration: 3,
    wrongPenalty: true,
    noFeedback: true
  },
  grille: {
    id: 'grille',
    label: 'Grille spatiale',
    dataFile: 'grille.json',
    engine: 'generic',
    inputType: 'buttons',
    options: ['vert', 'rouge', 'jaune', 'violet'],
    answerField: 'dominantColor',
    perItemDuration: 10,
    grayoutDuration: 3,
    noFeedback: true
  }
};

const RANKING_POINTS = [100, 80, 60, 50];
const RANKING_POINTS_DEFAULT = 40;

function pointsForRank(rank) {
  if (rank >= 1 && rank <= RANKING_POINTS.length) return RANKING_POINTS[rank - 1];
  return RANKING_POINTS_DEFAULT;
}

module.exports = { GAMES, pointsForRank };
