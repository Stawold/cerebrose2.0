export const RULES_TEXT = {
  calculs: 'Résolvez le plus de calculs possible en 240 secondes, à votre rythme. +1 point par bonne réponse.',
  texte: 'Deux textes truffés de fautes (10 chacun). Tapez le mot fautif tel qu\'il apparaît. +1 si juste, -1 si faux. 60s par texte.',
  memoire: 'Mémorisez la suite de chiffres affichée à l\'écran (20s), puis retapez-la de mémoire (10s). +1 si exact.',
  balance: 'Observez la balance et cliquez sur la couleur la plus lourde. Plus vous êtes rapide, plus vous gagnez de points (4/3/2/1).',
  heures: 'Observez les deux horloges (6s) puis indiquez la différence en minutes (20s).',
  pfc: 'Une image impose de "Gagner" ou "Perdre" contre la forme affichée : cliquez sur le bon choix. +1 si juste, -1 si faux.',
  anagramme: 'Trouvez le mot caché derrière les lettres mélangées. Le premier à valider gagne le point !',
  couleurs: 'Cliquez sur la couleur dans laquelle le mot est écrit (pas le mot lui-même). +1 si juste, -1 si faux.',
  grille: 'Identifiez la couleur dominante de la grille affichée. +1 si juste.'
};

export function getRulesText(gameId) {
  return RULES_TEXT[gameId] || '';
}
