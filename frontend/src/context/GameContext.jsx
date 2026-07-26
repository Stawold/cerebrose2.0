import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { getSocket } from '../services/socketService';

const initialState = {
  party: { code: null, players: [], selectedGames: [], phase: 'idle' },
  rules: null, // { game, label, gameIndex, totalGames }
  game: { type: null, phase: null, payload: null, duration: 0, scores: {} },
  // Host-controlled reveal sequence shown between two games:
  // stage: null | 'pending' (round over, waiting for host) | 'results' | 'hallOfFame' | 'leaderboard'
  reveal: { stage: null, game: null, ranking: null, hallOfFame: null, leaderboard: null },
  gameOver: null, // { leaderboard }
  feedback: null,
  hostAnswer: null, // { text } — host-only, current item's correct answer(s)
  ui: { isHost: false, playerId: null, pseudo: null, connected: true }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_HOST':
      return { ...state, ui: { ...state.ui, isHost: true } };
    case 'SET_PLAYER_IDENTITY':
      return { ...state, ui: { ...state.ui, playerId: action.playerId, pseudo: action.pseudo } };
    case 'SET_CONNECTED':
      return { ...state, ui: { ...state.ui, connected: action.connected } };
    case 'PARTY_UPDATE':
      return { ...state, party: { ...state.party, ...action.payload } };
    case 'RULES_PHASE':
      return { ...state, rules: action.payload, reveal: initialState.reveal, game: initialState.game, hostAnswer: null };
    case 'GAME_START':
      return { ...state, game: { type: action.payload.game, phase: null, payload: null, duration: 0, scores: {} }, hostAnswer: null };
    case 'GAME_PHASE':
      return {
        ...state,
        game: {
          ...state.game,
          type: action.payload.game,
          phase: action.payload.phase,
          payload: action.payload.payload,
          duration: action.payload.duration,
          progress: action.payload.progress,
          serverTime: action.payload.serverTime
        },
        feedback: null
      };
    case 'SCORE_UPDATE':
      return { ...state, game: { ...state.game, scores: action.payload.scores } };
    case 'ANSWER_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'HOST_ANSWER':
      return { ...state, hostAnswer: action.payload };
    case 'ROUND_FINISHED':
      return {
        ...state,
        reveal: { stage: 'pending', game: action.payload.game, ranking: null, hallOfFame: null, leaderboard: null },
        game: initialState.game
      };
    case 'REVEAL_RESULTS':
      return { ...state, reveal: { ...state.reveal, stage: 'results', ranking: action.payload.ranking } };
    case 'REVEAL_HALL_OF_FAME':
      return { ...state, reveal: { ...state.reveal, stage: 'hallOfFame', hallOfFame: action.payload.entries } };
    case 'REVEAL_LEADERBOARD':
      return { ...state, reveal: { ...state.reveal, stage: 'leaderboard', leaderboard: action.payload.leaderboard } };
    case 'GAME_OVER':
      return { ...state, gameOver: action.payload, party: { ...state.party, phase: 'finished' } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const socket = getSocket();

    const handlers = {
      'party:update': (payload) => dispatch({ type: 'PARTY_UPDATE', payload }),
      'party:rulesPhase': (payload) => dispatch({ type: 'RULES_PHASE', payload }),
      'party:gameStart': (payload) => dispatch({ type: 'GAME_START', payload }),
      'game:phase': (payload) => dispatch({ type: 'GAME_PHASE', payload }),
      'game:scoreUpdate': (payload) => dispatch({ type: 'SCORE_UPDATE', payload }),
      'game:answerFeedback': (payload) => dispatch({ type: 'ANSWER_FEEDBACK', payload }),
      'game:hostAnswer': (payload) => dispatch({ type: 'HOST_ANSWER', payload }),
      'party:roundFinished': (payload) => dispatch({ type: 'ROUND_FINISHED', payload }),
      'party:revealResults': (payload) => dispatch({ type: 'REVEAL_RESULTS', payload }),
      'party:revealHallOfFame': (payload) => dispatch({ type: 'REVEAL_HALL_OF_FAME', payload }),
      'party:revealLeaderboard': (payload) => dispatch({ type: 'REVEAL_LEADERBOARD', payload }),
      'party:gameOver': (payload) => dispatch({ type: 'GAME_OVER', payload })
    };
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    function onConnect() {
      dispatch({ type: 'SET_CONNECTED', connected: true });
      const { ui, party } = stateRef.current;
      // Auto-rejoin mid-session (socket drop without page reload)
      if (ui.playerId && ui.pseudo && party.code) {
        socket.emit('player:rejoinParty', { code: party.code, pseudo: ui.pseudo, playerId: ui.playerId });
      } else if (ui.isHost && party.code) {
        socket.emit('host:rejoinParty', { code: party.code });
      }
    }
    function onDisconnect() {
      dispatch({ type: 'SET_CONNECTED', connected: false });
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Clear saved session when game ends
  useEffect(() => {
    if (state.gameOver) {
      localStorage.removeItem('cerebrose_player');
      localStorage.removeItem('cerebrose_host');
    }
  }, [state.gameOver]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
