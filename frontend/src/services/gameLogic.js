export const RULES_TEXT = {
  calculs: 'Résolvez le plus de calculs possible en 200 secondes, à votre rythme. +1 point par bonne réponse.',
  texte: 'Deux textes truffés de fautes (10 chacun). Repérez le mot fautif et tapez-le corrigé, bien orthographié. +1 si juste, -1 si faux. 90s par texte.',
  memoire: 'Mémorisez la suite de chiffres affichée à l\'écran (12s), puis retapez-la de mémoire (10s). +1 si exact.',
  balance: 'Plusieurs balances montrent les poids relatifs de boules colorées, affichées 35 secondes. Déduisez quelle boule est la plus lourde et appuyez sur sa couleur — la réponse ne s\'ouvre qu\'au bout de 5 secondes. Plus vous êtes rapide, plus vous gagnez de points (4/3/2/1).',
  heures: 'Observez les deux horloges (6s) puis indiquez la différence en minutes — vous avez 6 secondes pour répondre.',
  pfc: 'Une image impose de "Gagner" ou "Perdre" contre la forme affichée : cliquez sur le bon choix. +1 si juste, -1 si faux.',
  anagramme: 'Trouvez le mot caché derrière les lettres mélangées. Le premier à valider gagne le point !',
  couleurs: 'Cliquez sur la couleur dans laquelle le mot est écrit (pas le mot lui-même). +1 si juste, -1 si faux.',
  grille: 'Identifiez la couleur dominante de la grille affichée. +1 si juste.'
};

export function getRulesText(gameId) {
  return RULES_TEXT[gameId] || '';
}

export const GAMES_LIST = [
  { id: 'calculs', label: 'Calculs mentaux' },
  { id: 'texte', label: 'Correction de texte' },
  { id: 'memoire', label: 'Mémoire des chiffres' },
  { id: 'balance', label: 'Balance' },
  { id: 'heures', label: "Différence d'heures" },
  { id: 'pfc', label: 'Pierre Feuille Ciseaux' },
  { id: 'anagramme', label: 'Anagramme' },
  { id: 'couleurs', label: 'Test des couleurs' },
  { id: 'grille', label: 'Grille spatiale' }
];

// The one iconography system of the app: each game is a two-digit number, a
// two-letter symbol, and a family color. Logique = cobalt, Langage = corail,
// Perception = ambre.
export const GAME_ICONS = {
  calculs: { number: '01', symbol: 'Ca', family: 'logique' },
  texte: { number: '02', symbol: 'Tx', family: 'langage' },
  memoire: { number: '03', symbol: 'Mé', family: 'perception' },
  balance: { number: '04', symbol: 'Ba', family: 'logique' },
  heures: { number: '05', symbol: 'Hr', family: 'perception' },
  pfc: { number: '06', symbol: 'Pf', family: 'perception' },
  anagramme: { number: '07', symbol: 'An', family: 'langage' },
  couleurs: { number: '08', symbol: 'Cl', family: 'perception' },
  grille: { number: '09', symbol: 'Gr', family: 'logique' }
};

export const FAMILY_COLOR = {
  logique: 'var(--cobalt)',
  langage: 'var(--coral)',
  perception: 'var(--amber)'
};

// Human-readable timing/scoring summary built from the public /games stats
// endpoint, so it can't drift out of sync with the real server config.
export function describeGameStats(gameId, stats) {
  if (!stats) return '';
  const { itemCount, totalDuration, perItemDuration, perTextDuration, displayDuration, inputDuration, observeDuration, answerDelay } = stats;
  switch (gameId) {
    case 'calculs':
      return `${itemCount} calculs disponibles — ${totalDuration}s au total`;
    case 'texte':
      return `${itemCount} textes — ${perTextDuration}s chacun`;
    case 'memoire':
      return `${itemCount} séquences — ${displayDuration}s d'observation puis ${inputDuration}s de saisie`;
    case 'balance':
      return `${itemCount} balances — ${totalDuration}s chacune, réponse possible au bout de ${answerDelay}s`;
    case 'heures':
      return `${itemCount} paires d'horloges — ${observeDuration}s d'observation puis ${perItemDuration}s de réponse`;
    default:
      return `${itemCount} manches — ${perItemDuration}s de réponse chacune`;
  }
}

// Player pastilles cycle cobalt -> corail -> ambre -> vert, per the design system.
const AVATAR_COLORS = ['#1f4fff', '#ff5a3c', '#ffb020', '#0f9b8e'];

export function avatarColor(seed) {
  const str = String(seed || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(pseudo) {
  return (pseudo || '?').trim().slice(0, 2).toUpperCase();
}

const COLOR_HEX = {
  red: '#ef4444', rouge: '#ef4444',
  blue: '#3b82f6', bleu: '#3b82f6',
  green: '#22c55e', vert: '#22c55e',
  yellow: '#f59e0b', jaune: '#f59e0b',
  purple: '#a855f7', violet: '#a855f7',
  orange: '#f97316',
  blanc: '#ffffff'
};

export function colorHex(name) {
  return COLOR_HEX[String(name).toLowerCase()] || '#9b9b9b';
}

export const PFC_ICONS = { pierre: '✊', feuille: '✋', ciseaux: '✌️' };
