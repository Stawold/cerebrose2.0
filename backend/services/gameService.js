const fs = require('fs');
const path = require('path');
const { GAMES } = require('../config/games');

function loadData(fileName) {
  const filePath = path.join(__dirname, '..', 'data', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Base class: handles broadcasting helpers shared by every runner.
class BaseRunner {
  constructor(gameId, players, io, room, onFinish, getHostSocketId) {
    this.config = GAMES[gameId];
    this.gameId = gameId;
    this.players = players; // [{ id, socketId, pseudo }]
    this.io = io;
    this.room = room;
    this.onFinish = onFinish;
    this.getHostSocketId = getHostSocketId;
    this.scores = {};
    this.timers = [];
    this.lastPhase = null;
    this.players.forEach((p) => { this.scores[p.id] = 0; });
  }

  emitPhase(phase, payload, duration, progress) {
    const data = {
      game: this.gameId,
      phase,
      payload,
      duration: duration || 0,
      progress: progress || null, // { index, total } — current item/question number
      serverTime: Date.now()
    };
    this.lastPhase = data;
    this.io.to(this.room).emit('game:phase', data);
  }

  replayToSocket(socket) {
    if (this.lastPhase) {
      socket.emit('game:phase', { ...this.lastPhase, serverTime: Date.now() });
      socket.emit('game:scoreUpdate', { scores: this.scores });
    }
  }

  emitScores() {
    this.io.to(this.room).emit('game:scoreUpdate', { scores: this.scores });
  }

  emitFeedbackTo(playerId, correct, extra) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;
    this.io.to(player.socketId).emit('game:answerFeedback', { correct, ...extra });
  }

  // Host-only channel: the current item's correct answer(s), so the host can
  // reveal/confirm them to players on request. Never broadcast to the room.
  emitHostAnswer(text) {
    const hostSocketId = this.getHostSocketId && this.getHostSocketId();
    if (!hostSocketId) return;
    this.io.to(hostSocketId).emit('game:hostAnswer', { text });
  }

  schedule(fn, ms) {
    const t = setTimeout(fn, ms);
    this.timers.push(t);
    this.advanceFn = fn;
    return t;
  }

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  // Test-mode helper: force the current phase to end immediately, as if its
  // timer had fired. No-op if nothing is scheduled.
  skip() {
    const fn = this.advanceFn;
    if (!fn) return;
    this.advanceFn = null;
    this.clearTimers();
    fn();
  }

  finish() {
    this.clearTimers();
    this.onFinish(this.scores);
  }
}

class CalculsRunner extends BaseRunner {
  start() {
    this.questions = loadData(this.config.dataFile);
    this.answered = {}; // playerId -> Set of questionId already scored
    this.players.forEach((p) => { this.answered[p.id] = new Set(); });
    this.emitPhase('play', { questions: this.questions }, this.config.totalDuration);
    this.emitHostAnswer(this.questions.map((q) => `${q.operation} = ${q.answer}`).join('\n'));
    this.schedule(() => this.finish(), this.config.totalDuration * 1000);
  }

  handleAnswer(playerId, { questionId, value }) {
    if (this.answered[playerId].has(questionId)) return;
    this.answered[playerId].add(questionId);
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) return;
    const correct = String(value).trim() === String(question.answer).trim();
    if (correct) this.scores[playerId] += 1;
    this.emitFeedbackTo(playerId, correct, { questionId });
    this.emitScores();
  }
}

class TexteRunner extends BaseRunner {
  start() {
    this.texts = loadData(this.config.dataFile);
    this.textIndex = 0;
    this.playerState = {};
    this.startText();
  }

  startText() {
    const text = this.texts[this.textIndex];
    // Reset each player: 10 attempts, no corrections found yet
    this.players.forEach((p) => {
      this.playerState[p.id] = { attempts: 0, found: new Set() };
    });
    this.emitPhase('play', {
      textIndex: this.textIndex,
      title: text.title,
      words: text.words,
      faultyIndices: text.faultyIndices,
      totalCorrections: text.faultyIndices.length
    }, this.config.perTextDuration, { index: this.textIndex, total: this.texts.length });
    this.emitHostAnswer(Object.values(text.corrections).join(', '));
    this.schedule(() => this.nextText(), this.config.perTextDuration * 1000);
  }

  // Normalize for comparison: trim, lowercase, strip trailing punctuation, strip leading d'/l'
  normalize(str) {
    return String(str).trim().toLowerCase()
      .replace(/[.,;:!?]/g, '')
      .replace(/^[dl]'/, '');
  }

  handleAnswer(playerId, { value }) {
    const text = this.texts[this.textIndex];
    const ps = this.playerState[playerId];
    if (!ps || ps.attempts >= 10) return;

    const normalized = this.normalize(value);

    // Check against all unfound corrections
    let matchKey = null;
    for (const [key, correction] of Object.entries(text.corrections)) {
      if (ps.found.has(key)) continue;
      if (this.normalize(correction) === normalized) { matchKey = key; break; }
    }

    ps.attempts += 1;
    const correct = matchKey !== null;
    if (correct) {
      ps.found.add(matchKey);
      this.scores[playerId] += 1;
    }

    this.emitFeedbackTo(playerId, correct, {
      attemptsLeft: 10 - ps.attempts,
      foundCount: ps.found.size,
      totalCorrections: text.faultyIndices.length
    });
    this.emitScores();
  }

  nextText() {
    this.textIndex += 1;
    if (this.textIndex >= this.texts.length) {
      this.finish();
    } else {
      this.startText();
    }
  }
}

class MemoireRunner extends BaseRunner {
  start() {
    this.sequences = loadData(this.config.dataFile);
    this.seqIndex = 0;
    this.showSequence();
  }

  showSequence() {
    const seq = this.sequences[this.seqIndex];
    this.answeredThisSeq = new Set();
    const progress = { index: this.seqIndex, total: this.sequences.length };
    this.emitPhase('display', { length: seq.length, sequence: seq.sequence }, this.config.displayDuration, progress);
    this.emitHostAnswer(`Séquence : ${seq.sequence}`);
    this.schedule(() => this.startInput(), this.config.displayDuration * 1000);
  }

  startInput() {
    const seq = this.sequences[this.seqIndex];
    this.currentAnswer = seq.sequence;
    const progress = { index: this.seqIndex, total: this.sequences.length };
    this.emitPhase('input', { length: seq.length }, this.config.inputDuration, progress);
    this.schedule(() => this.nextSequence(), this.config.inputDuration * 1000);
  }

  handleAnswer(playerId, { value }) {
    if (this.answeredThisSeq.has(playerId)) return;
    this.answeredThisSeq.add(playerId);
    const correct = String(value).trim() === this.currentAnswer;
    if (correct) this.scores[playerId] += 1;
    this.emitFeedbackTo(playerId, correct);
    this.emitScores();
  }

  nextSequence() {
    this.seqIndex += 1;
    if (this.seqIndex >= this.sequences.length) {
      this.finish();
    } else {
      this.showSequence();
    }
  }
}

class GenericRunner extends BaseRunner {
  start() {
    this.items = loadData(this.config.dataFile);
    this.itemIndex = 0;
    this.runItem();
  }

  answerText(item) {
    if (this.config.inputType === 'number') {
      const target = item[this.config.answerField] || [];
      const alt = this.config.altAnswerField ? (item[this.config.altAnswerField] || []) : [];
      return [...target, ...alt].join(' ou ');
    }
    return String(item[this.config.answerField]);
  }

  runItem() {
    const item = this.items[this.itemIndex];
    this.answers = {}; // playerId -> { value, time }
    const progress = { index: this.itemIndex, total: this.items.length };
    this.emitHostAnswer(`Réponse : ${this.answerText(item)}`);
    if (this.config.observeDuration) {
      this.emitPhase('observe', { item }, this.config.observeDuration, progress);
      this.schedule(() => this.openAnswering(item), this.config.observeDuration * 1000);
    } else {
      this.openAnswering(item);
    }
  }

  openAnswering(item) {
    const progress = { index: this.itemIndex, total: this.items.length };
    this.emitPhase('answer', {
      item,
      inputType: this.config.inputType,
      options: this.config.options || null
    }, this.config.perItemDuration, progress);
    this.schedule(() => this.resolveItem(item), this.config.perItemDuration * 1000);
  }

  handleAnswer(playerId, { value }) {
    if (this.answers[playerId]) return;
    this.answers[playerId] = { value, time: Date.now() };
  }

  isCorrect(item, value) {
    if (this.config.inputType === 'number') {
      const target = item[this.config.answerField] || [];
      const alt = this.config.altAnswerField ? (item[this.config.altAnswerField] || []) : [];
      const num = Number(value);
      return target.includes(num) || alt.includes(num);
    }
    return String(value).toLowerCase() === String(item[this.config.answerField]).toLowerCase();
  }

  resolveItem(item) {
    const correctEntries = [];
    this.players.forEach((p) => {
      const entry = this.answers[p.id];
      if (!entry) {
        this.emitFeedbackTo(p.id, null);
        return;
      }
      const correct = this.isCorrect(item, entry.value);
      if (correct) correctEntries.push({ id: p.id, time: entry.time });
      this.emitFeedbackTo(p.id, correct);
      if (!this.config.speedBonus) {
        if (correct) this.scores[p.id] += 1;
        else if (this.config.wrongPenalty) this.scores[p.id] -= 1;
      }
    });

    if (this.config.speedBonus) {
      correctEntries.sort((a, b) => a.time - b.time);
      const speedPoints = [4, 3, 2];
      correctEntries.forEach((entry, idx) => {
        this.scores[entry.id] += idx < 3 ? speedPoints[idx] : 1;
      });
    }

    this.emitScores();

    const afterGrayout = () => {
      this.itemIndex += 1;
      if (this.itemIndex >= this.items.length) {
        this.finish();
      } else {
        this.runItem();
      }
    };

    if (this.config.grayoutDuration) {
      this.emitPhase('grayout', {}, this.config.grayoutDuration);
      this.schedule(afterGrayout, this.config.grayoutDuration * 1000);
    } else {
      afterGrayout();
    }
  }
}

class AnagrammeRunner extends BaseRunner {
  start() {
    this.words = loadData(this.config.dataFile);
    this.wordIndex = 0;
    this.runWord();
  }

  runWord() {
    const word = this.words[this.wordIndex];
    this.winner = null;
    const progress = { index: this.wordIndex, total: this.words.length };
    this.emitPhase('play', { scrambled: word.scrambled }, this.config.perItemDuration, progress);
    this.emitHostAnswer(`Mot : ${word[this.config.answerField]}`);
    this.itemTimer = this.schedule(() => this.endWord(null), this.config.perItemDuration * 1000);
  }

  handleAnswer(playerId, { value }) {
    if (this.winner) return; // frozen after a winner is found
    const word = this.words[this.wordIndex];
    const correct = String(value).trim().toUpperCase() === String(word[this.config.answerField]).toUpperCase();
    this.emitFeedbackTo(playerId, correct);
    if (correct) {
      this.winner = playerId;
      this.scores[playerId] += 1;
      clearTimeout(this.itemTimer);
      this.endWord(playerId);
    }
  }

  endWord(winnerId) {
    const word = this.words[this.wordIndex];
    const player = winnerId ? this.players.find((p) => p.id === winnerId) : null;
    this.emitPhase('result', {
      winnerId,
      winnerPseudo: player ? player.pseudo : null,
      answer: word[this.config.answerField]
    }, this.config.transitionDuration);
    this.emitScores();
    this.schedule(() => {
      this.wordIndex += 1;
      if (this.wordIndex >= this.words.length) {
        this.finish();
      } else {
        this.runWord();
      }
    }, this.config.transitionDuration * 1000);
  }
}

class BalanceRunner extends BaseRunner {
  start() {
    this.puzzles = loadData(this.config.dataFile);
    this.puzzleIndex = 0;
    this.runPuzzle();
  }

  runPuzzle() {
    const puzzle = this.puzzles[this.puzzleIndex];
    this.answers = {};
    const progress = { index: this.puzzleIndex, total: this.puzzles.length };
    this.emitPhase('observe', { puzzle }, this.config.observeDuration, progress);
    this.emitHostAnswer(`Boule la plus lourde : ${puzzle.answer}`);
    this.schedule(() => this.openAnswer(puzzle), this.config.observeDuration * 1000);
  }

  openAnswer(puzzle) {
    const progress = { index: this.puzzleIndex, total: this.puzzles.length };
    this.emitPhase('answer', { puzzle }, this.config.perItemDuration, progress);
    this.schedule(() => this.resolvePuzzle(puzzle), this.config.perItemDuration * 1000);
  }

  handleAnswer(playerId, { value }) {
    if (this.answers[playerId]) return;
    this.answers[playerId] = { value, time: Date.now() };
  }

  resolvePuzzle(puzzle) {
    const correctEntries = [];
    this.players.forEach((p) => {
      const entry = this.answers[p.id];
      if (!entry) {
        this.emitFeedbackTo(p.id, null);
        return;
      }
      const correct = String(entry.value).toLowerCase() === String(puzzle.answer).toLowerCase();
      if (correct) correctEntries.push({ id: p.id, time: entry.time });
      this.emitFeedbackTo(p.id, correct);
    });

    correctEntries.sort((a, b) => a.time - b.time);
    const speedPoints = [4, 3, 2];
    correctEntries.forEach((entry, idx) => {
      this.scores[entry.id] += idx < 3 ? speedPoints[idx] : 1;
    });
    this.emitScores();

    const afterGrayout = () => {
      this.puzzleIndex += 1;
      if (this.puzzleIndex >= this.puzzles.length) {
        this.finish();
      } else {
        this.runPuzzle();
      }
    };

    if (this.config.grayoutDuration) {
      this.emitPhase('grayout', {}, this.config.grayoutDuration);
      this.schedule(afterGrayout, this.config.grayoutDuration * 1000);
    } else {
      afterGrayout();
    }
  }
}

const ENGINES = {
  calculs: CalculsRunner,
  texte: TexteRunner,
  memoire: MemoireRunner,
  generic: GenericRunner,
  anagramme: AnagrammeRunner,
  balance: BalanceRunner
};

function createRunner(gameId, players, io, room, onFinish, getHostSocketId) {
  const config = GAMES[gameId];
  if (!config) throw new Error(`Unknown game: ${gameId}`);
  const Runner = ENGINES[config.engine];
  return new Runner(gameId, players, io, room, onFinish, getHostSocketId);
}

module.exports = { createRunner, loadData };
