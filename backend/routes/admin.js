const fs = require('fs');
const path = require('path');
const express = require('express');
const { GAMES, DIFFICULTIES, resolveGameConfig } = require('../config/games');
const { verifyAdminPassword, isAdminPasswordConfigured } = require('../services/adminAuth');

const DATA_DIR = path.join(__dirname, '..', 'data');

const router = express.Router();

router.use((req, res, next) => {
  if (verifyAdminPassword(req.get('x-admin-password'))) return next();
  if (!isAdminPasswordConfigured()) {
    return res.status(401).json({
      error: "ADMIN_PASSWORD n'est pas configuré côté serveur — copiez backend/.env.example en backend/.env, renseignez ADMIN_PASSWORD, puis redémarrez le backend."
    });
  }
  res.status(401).json({ error: 'Mot de passe admin invalide' });
});

function resolveDifficulty(req) {
  return DIFFICULTIES.includes(req.query.difficulty) ? req.query.difficulty : 'normal';
}

function dataFilePath(gameId, difficulty) {
  const config = resolveGameConfig(gameId, difficulty);
  if (!config) return null;
  const filePath = path.join(DATA_DIR, config.dataFile);
  // Guard against path traversal via unexpected config values.
  if (path.dirname(filePath) !== DATA_DIR) return null;
  return filePath;
}

router.get('/games', (_req, res) => {
  res.json(Object.values(GAMES));
});

router.get('/games/:id/data', (req, res) => {
  const difficulty = resolveDifficulty(req);
  const filePath = dataFilePath(req.params.id, difficulty);
  if (!filePath) return res.status(404).json({ error: 'Jeu inconnu' });
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    res.json({ gameId: req.params.id, difficulty, dataFile: path.basename(filePath), content: JSON.parse(raw) });
  } catch (err) {
    res.status(500).json({ error: `Lecture impossible : ${err.message}` });
  }
});

router.put('/games/:id/data', (req, res) => {
  const difficulty = resolveDifficulty(req);
  const filePath = dataFilePath(req.params.id, difficulty);
  if (!filePath) return res.status(404).json({ error: 'Jeu inconnu' });

  const { content } = req.body;
  if (content === undefined) {
    return res.status(400).json({ error: 'Champ "content" manquant' });
  }
  if (!Array.isArray(content)) {
    return res.status(400).json({ error: 'Le contenu doit être un tableau JSON' });
  }

  try {
    const serialized = JSON.stringify(content, null, 2);
    fs.writeFileSync(filePath, serialized, 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: `Écriture impossible : ${err.message}` });
  }
});

module.exports = router;
