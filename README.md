# Cérébr'Ose V2.0

Jeu multijoueur de réflexion à la Dr. Kawashima, pour team buildings (10-30 joueurs).

## Architecture (Phase 1 MVP)

- `backend/` — Node.js + Express + Socket.io. Gère le cycle de vie des parties, le moteur de jeu (timers serveur-driven, scoring) et les données des 9 jeux.
- `frontend/` — React + Vite. Lobby, tableau de bord animateur, écran de règles, écran de jeu (joueur/host), écran de projection.

## Démarrage

```bash
cd backend && npm install && npm start      # http://localhost:4000
cd frontend && npm install && npm run dev   # http://localhost:5173
```

Copiez `frontend/.env.example` en `.env` pour configurer l'URL du backend (`VITE_SOCKET_URL`).

### Outil de test / contenu (`/test-lab`)

Accessible via la petite icône 🛠️ en bas à droite de l'écran (discrète, hors menu principal). Protégé par un mot de passe qui **n'est jamais commité** — pour qu'il fonctionne, copiez `backend/.env.example` en `backend/.env` et renseignez-y `ADMIN_PASSWORD` :

```bash
cp backend/.env.example backend/.env
# puis éditez backend/.env et changez ADMIN_PASSWORD=changeme
```

Sans ce fichier, le mot de passe est toujours refusé, quel qu'il soit — ce n'est pas un bug, c'est volontaire (l'outil reste fermé tant qu'aucun mot de passe n'est configuré côté serveur). Chaque environnement (poste local, serveur de déploiement) a besoin de son propre `backend/.env`.

## État d'implémentation

Architecture complète (parties, lobby, sélection des manches, scoring/classement, reconnexion joueur, écran de projection) et 3 jeux pleinement implémentés : **Calculs mentaux**, **Correction de texte**, **Mémoire des chiffres**.

Les 6 autres jeux (Balance, Différence d'heures, Pierre-Feuille-Ciseaux, Anagramme, Test des couleurs, Grille spatiale) sont enregistrés dans le moteur de jeu avec leurs données et leur logique de scoring, via des moteurs génériques (`generic`, `anagramme`) côté backend et un composant joueur générique (`GameGeneric`/`GameAnagramme`) côté frontend. Leur UI pourra être affinée dans une phase 2.
