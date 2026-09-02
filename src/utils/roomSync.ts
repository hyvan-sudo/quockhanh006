import { GlobalGameState, Player, RoomDiscussionState, WonReward, GameStage, RoomGachaState } from '../types';
import { INITIAL_PLAYERS, ROUNDS_DATA } from '../data/gameData';

const GAME_STORAGE_KEY = 'gacha_game_state_29';
const CHANNEL_NAME = 'gacha_game_channel_29';

const DEFAULT_INITIAL_STATE: GlobalGameState = {
  status: 'join',
  hostId: 'p1',
  maxPlayers: 8,
  players: INITIAL_PLAYERS,
  currentRoundIndex: 0,
  rounds: ROUNDS_DATA,
  discussion: {
    phase: 'idle',
    discussionStartedAt: null,
    discussionDuration: 120000,
    discussionEndedAt: null,
  },
  gacha: {
    phase: 'idle',
    currentGachaPlayerId: null,
    gachaQueue: [],
    playerSpins: {},
    activeSpin: null,
    currentResult: null,
    wonRewards: [],
  },
};

/**
 * Get current single-room game state
 */
export function getStoredGameState(): GlobalGameState {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_STATE;

  try {
    const raw = localStorage.getItem(GAME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_INITIAL_STATE,
        ...parsed,
        maxPlayers: parsed.maxPlayers || 8,
        rounds: parsed.rounds && parsed.rounds.length > 0 ? parsed.rounds : ROUNDS_DATA,
        discussion: {
          ...DEFAULT_INITIAL_STATE.discussion,
          ...(parsed.discussion || {}),
        },
        gacha: {
          ...DEFAULT_INITIAL_STATE.gacha,
          ...(parsed.gacha || {}),
        },
      };
    }
  } catch (err) {
    console.error('Failed to read game state', err);
  }

  return DEFAULT_INITIAL_STATE;
}


/**
 * Save game state and broadcast to all connected tabs/players
 */
export function saveGameState(state: GlobalGameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'GAME_STATE_UPDATE', state });
      channel.close();
    }
  } catch (err) {
    console.error('Failed to save game state', err);
  }
}

/**
 * Calculate remaining discussion milliseconds based on synchronized timestamp
 */
export function calculateRemainingDiscussionMs(state: RoomDiscussionState): number {
  if (state.phase !== 'discussion' || !state.discussionStartedAt) {
    return state.discussionDuration;
  }
  const now = Date.now();
  const elapsed = now - state.discussionStartedAt;
  const remaining = state.discussionDuration - elapsed;
  return Math.max(0, remaining);
}

/**
 * Subscribe to realtime game state changes across tabs
 */
export function subscribeToGameState(onUpdate: (state: GlobalGameState) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key === GAME_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        onUpdate(parsed);
      } catch {}
    }
  };

  window.addEventListener('storage', handleStorage);

  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === 'GAME_STATE_UPDATE' && event.data.state) {
        onUpdate(event.data.state);
      }
    };
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (channel) channel.close();
  };
}
