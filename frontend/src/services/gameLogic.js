export const RULES_TEXT = {
  calculs: 'Résolvez le plus de calculs possible en 240 secondes, à votre rythme. +1 point par bonne réponse.',
  texte: 'Deux textes truffés de fautes (10 chacun). Tapez le mot fautif tel qu\'il apparaît. +1 si juste, -1 si faux. 60s par texte.',
  memoire: 'Mémorisez la suite de chiffres affichée à l\'écran (20s), puis retapez-la de mémoire (10s). +1 si exact.',
  balance: 'Plusieurs balances montrent les poids relatifs de boules colorées. Déduisez quelle boule est la plus lourde et appuyez sur sa couleur. Plus vous êtes rapide, plus vous gagnez de points (4/3/2/1).',
  heures: 'Observez les deux horloges (6s) puis indiquez la différence en minutes (20s).',
  pfc: 'Une image impose de "Gagner" ou "Perdre" contre la forme affichée : cliquez sur le bon choix. +1 si juste, -1 si faux.',
  anagramme: 'Trouvez le mot caché derrière les lettres mélangées. Le premier à valider gagne le point !',
  couleurs: 'Cliquez sur la couleur dans laquelle le mot est écrit (pas le mot lui-même). +1 si juste, -1 si faux.',
  grille: 'Identifiez la couleur dominante de la grille affichée. +1 si juste.'
};

export function getRulesText(gameId) {
  return RULES_TEXT[gameId] || '';
}

const AVATAR_COLORS = ['#6366f1', '#fb7185', '#34d399', '#f59e0b', '#0ea5e9', '#a855f7'];

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
  blanc: '#f0ece0'
};

export function colorHex(name) {
  return COLOR_HEX[String(name).toLowerCase()] || '#9b9b9b';
}

export const PFC_ICONS = { pierre: '🪨', feuille: '📄', ciseaux: '✂️' };
