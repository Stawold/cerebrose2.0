const fs = require('fs');
const path = require('path');
const express = require('express');
const { GAMES } = require('../config/games');
const { verifyAdminPassword } = require('../services/adminAuth');

const DATA_DIR = path.join(__dirname, '..', 'data');

const router = express.Router();

router.use((req, res, next) => {
  if (verifyAdminPassword(req.get('x-admin-password'))) return next();
  res.status(401).json({ error: 'Mot de passe admin invalide ou manquant' });
});

function dataFilePath(gameId) {
  const config = GAMES[gameId];
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
  const filePath = dataFilePath(req.params.id);
  if (!filePath) return res.status(404).json({ error: 'Jeu inconnu' });
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    res.json({ gameId: req.params.id, dataFile: GAMES[req.params.id].dataFile, content: JSON.parse(raw) });
  } catch (err) {
    res.status(500).json({ error: `Lecture impossible : ${err.message}` });
  }
});

router.put('/games/:id/data', (req, res) => {
  const filePath = dataFilePath(req.params.id);
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
