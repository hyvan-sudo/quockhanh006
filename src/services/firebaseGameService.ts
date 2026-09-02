/**
 * Firebase Realtime Database Service for Multiplayer Game State
 * Source of truth for single-room multiplayer synchronization.
 */

import {
  ref,
  set,
  get,
  update,
  onValue,
  onDisconnect,
  DatabaseReference,
} from 'firebase/database';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  GlobalGameState,
  Player,
  RoundData,
  WonReward,
  GameStage,
  RoomDiscussionState,
  RoomGachaState,
  GachaSpinEvent,
} from '../types';
import {
  INITIAL_PLAYERS,
  ROUNDS_DATA,
  generateGameRounds,
  initializeGachaState,
  GACHA_ITEMS,
} from '../data/gameData';
import {
  getStoredGameState,
  saveGameState as saveLocalFallbackState,
  subscribeToGameState as subscribeLocalFallback,
} from '../utils/roomSync';

const LOCAL_PLAYER_ID_KEY = 'gacha_player_id_29';
const LOCAL_PLAYER_NAME_KEY = 'gacha_user_session_name_29';

// Default initial room state
const DEFAULT_GAME_STATE: GlobalGameState = {
  status: 'join',
  hostId: '',
  maxPlayers: 8,
  players: [],
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
 * Get or create local persistent player ID
 */
export function getOrCreateLocalPlayerId(): string {
  if (typeof window === 'undefined') return 'p_server';
  let id = localStorage.getItem(LOCAL_PLAYER_ID_KEY);
  if (!id) {
    id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem(LOCAL_PLAYER_ID_KEY, id);
  }
  return id;
}

export function getStoredLocalPlayerName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LOCAL_PLAYER_NAME_KEY) || '';
}

export function setStoredLocalPlayerName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PLAYER_NAME_KEY, name.trim().toUpperCase());
  }
}

/**
 * Convert raw Firebase RTDB game object into typed GlobalGameState
 */
export function parseFirebaseGameState(rawData: any): GlobalGameState {
  if (!rawData || typeof rawData !== 'object') {
    return DEFAULT_GAME_STATE;
  }

  // Parse players object or array into Player[]
  let playersList: Player[] = [];
  if (rawData.players) {
    if (Array.isArray(rawData.players)) {
      playersList = rawData.players.filter(Boolean);
    } else if (typeof rawData.players === 'object') {
      playersList = Object.keys(rawData.players).map((key, idx) => {
        const p = rawData.players[key];
        return {
          id: p.id || key,
          number: p.number || (idx + 1).toString().padStart(2, '0'),
          name: p.name || `PLAYER ${idx + 1}`,
          isHost: Boolean(p.isHost),
          isReady: p.isReady !== undefined ? Boolean(p.isReady) : true,
          score: typeof p.score === 'number' ? p.score : 0,
          currentDelta: typeof p.currentDelta === 'number' ? p.currentDelta : 0,
          answer: p.answer || undefined,
          votedTargetId: p.votedTargetId || undefined,
          isImpostor: Boolean(p.isImpostor),
          joinedAt: p.joinedAt || Date.now(),
        };
      });
    }
  }

  // Sort players deterministically by joinedAt / number
  playersList.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  // Ensure formatted numbers '01', '02', ...
  playersList = playersList.map((p, idx) => ({
    ...p,
    number: (idx + 1).toString().padStart(2, '0'),
  }));

  // Parse rounds
  let roundsList: RoundData[] = ROUNDS_DATA;
  if (rawData.rounds) {
    if (Array.isArray(rawData.rounds)) {
      roundsList = rawData.rounds.filter(Boolean);
    } else if (typeof rawData.rounds === 'object') {
      roundsList = Object.values(rawData.rounds);
    }
  }

  // Parse gacha state
  const rawGacha = rawData.gacha || {};
  let wonRewardsList: WonReward[] = [];
  if (rawGacha.wonRewards) {
    if (Array.isArray(rawGacha.wonRewards)) {
      wonRewardsList = rawGacha.wonRewards.filter(Boolean);
    } else if (typeof rawGacha.wonRewards === 'object') {
      wonRewardsList = Object.values(rawGacha.wonRewards);
    }
  }

  let gachaQueueList: string[] = [];
  if (rawGacha.gachaQueue) {
    if (Array.isArray(rawGacha.gachaQueue)) {
      gachaQueueList = rawGacha.gachaQueue;
    } else if (typeof rawGacha.gachaQueue === 'object') {
      gachaQueueList = Object.values(rawGacha.gachaQueue);
    }
  }

  const gachaState: RoomGachaState = {
    phase: rawGacha.phase || 'idle',
    currentGachaPlayerId: rawGacha.currentGachaPlayerId || null,
    gachaQueue: gachaQueueList,
    playerSpins: rawGacha.playerSpins || {},
    activeSpin: rawGacha.activeSpin || null,
    currentResult: rawGacha.currentResult || null,
    wonRewards: wonRewardsList,
  };

  const discussionState: RoomDiscussionState = {
    phase: rawData.discussion?.phase || 'idle',
    discussionStartedAt: rawData.discussion?.discussionStartedAt || null,
    discussionDuration: rawData.discussion?.discussionDuration || 120000,
    discussionEndedAt: rawData.discussion?.discussionEndedAt || null,
  };

  return {
    status: (rawData.status as GameStage) || 'join',
    hostId: rawData.hostId || (playersList.find((p) => p.isHost)?.id || ''),
    maxPlayers: rawData.maxPlayers || 8,
    players: playersList,
    currentRoundIndex: typeof rawData.currentRoundIndex === 'number' ? rawData.currentRoundIndex : (rawData.currentRound || 0),
    rounds: roundsList.length > 0 ? roundsList : ROUNDS_DATA,
    discussion: discussionState,
    gacha: gachaState,
  };
}

/**
 * Subscribe to Realtime Database game state updates
 */
export function subscribeToGame(
  onUpdate: (state: GlobalGameState) => void
): () => void {
  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    const unsubscribe = onValue(
      gameRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const state = parseFirebaseGameState(snapshot.val());
          onUpdate(state);
        } else {
          // Initialize empty game state in RTDB if not exists
          initFreshGameInRTDB();
        }
      },
      (error) => {
        console.warn('Firebase RTDB subscription error:', error);
      }
    );

    return () => {
      // Firebase onValue teardown
      unsubscribe();
    };
  }

  // Fallback to local BroadcastChannel/localStorage if Firebase credentials are not yet configured
  return subscribeLocalFallback(onUpdate);
}

/**
 * Initialize fresh room in Firebase RTDB if missing
 */
export async function initFreshGameInRTDB(): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  const gameRef = ref(db, 'game');
  const initialData: Record<string, any> = {
    status: 'join',
    hostId: '',
    maxPlayers: 8,
    currentRound: 0,
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
  try {
    await set(gameRef, initialData);
  } catch (err) {
    console.error('Failed to init fresh game in RTDB:', err);
  }
}

/**
 * Join Game Realtime: Registers player into /game/players/{playerId}
 */
export async function joinGameRealtime(playerName: string): Promise<{
  playerId: string;
  isHost: boolean;
}> {
  const cleanName = playerName.trim().toUpperCase();
  const playerId = getOrCreateLocalPlayerId();
  setStoredLocalPlayerName(cleanName);

  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    const playersRef = ref(db, 'game/players');
    const snapshot = await get(playersRef);
    const existingPlayers = snapshot.val() || {};

    const existingKeys = Object.keys(existingPlayers);
    const isFirstPlayer = existingKeys.length === 0;

    // Check if player ID already exists
    const currentPlayerData = existingPlayers[playerId];
    const isHost = currentPlayerData ? Boolean(currentPlayerData.isHost) : isFirstPlayer;

    const newPlayerRecord = {
      id: playerId,
      name: cleanName,
      isHost: isHost,
      isReady: true,
      score: currentPlayerData?.score || 0,
      currentDelta: currentPlayerData?.currentDelta || 0,
      connected: true,
      joinedAt: currentPlayerData?.joinedAt || Date.now(),
    };

    const playerRef = ref(db, `game/players/${playerId}`);
    await set(playerRef, newPlayerRecord);

    // If first player or no host exists, set hostId in game
    const gameSnap = await get(gameRef);
    const currentHostId = gameSnap.val()?.hostId;
    if (!currentHostId || isFirstPlayer) {
      await update(gameRef, {
        hostId: playerId,
        status: 'lobby',
      });
    }

    // Handle connection status on disconnect
    const connectedRef = ref(db, `game/players/${playerId}/connected`);
    try {
      onDisconnect(connectedRef).set(false);
    } catch {}

    return { playerId, isHost };
  }

  // Local fallback
  const localState = getStoredGameState();
  const isFirst = localState.players.length === 0;
  let players = [...localState.players];
  const existingIdx = players.findIndex((p) => p.id === playerId || p.name === cleanName);

  let isHost = isFirst;
  if (existingIdx >= 0) {
    isHost = Boolean(players[existingIdx].isHost);
    players[existingIdx] = {
      ...players[existingIdx],
      id: playerId,
      name: cleanName,
      isUser: true,
      isReady: true,
    };
  } else {
    players.push({
      id: playerId,
      number: (players.length + 1).toString().padStart(2, '0'),
      name: cleanName,
      isHost: isFirst,
      isUser: true,
      isReady: true,
      score: 0,
      currentDelta: 0,
      joinedAt: Date.now(),
    });
  }

  const updatedState: GlobalGameState = {
    ...localState,
    status: 'lobby',
    hostId: players.find((p) => p.isHost)?.id || playerId,
    players,
  };
  saveLocalFallbackState(updatedState);

  return { playerId, isHost };
}

/**
 * Toggle ready status for a player
 */
export async function togglePlayerReadyRealtime(
  playerId: string,
  newReady: boolean
): Promise<void> {
  if (db && isFirebaseConfigured) {
    const readyRef = ref(db, `game/players/${playerId}/isReady`);
    await set(readyRef, newReady);
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    players: localState.players.map((p) =>
      p.id === playerId ? { ...p, isReady: newReady } : p
    ),
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Update player name in lobby
 */
export async function updatePlayerNameRealtime(
  playerId: string,
  newName: string
): Promise<void> {
  const formatted = newName.trim().toUpperCase();
  setStoredLocalPlayerName(formatted);

  if (db && isFirebaseConfigured) {
    const nameRef = ref(db, `game/players/${playerId}/name`);
    await set(nameRef, formatted);
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    players: localState.players.map((p) =>
      p.id === playerId ? { ...p, name: formatted } : p
    ),
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Add test bot player
 */
export async function addBotPlayerRealtime(currentCount: number): Promise<void> {
  if (currentCount >= 8) return;
  const botNames = ['THẮNG', 'QUANG', 'TRANG', 'HƯƠNG', 'BẢO', 'KHÁNH', 'DŨNG', 'ÁNH'];
  const botId = `bot_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  const botName = botNames[currentCount % botNames.length];

  if (db && isFirebaseConfigured) {
    const botRef = ref(db, `game/players/${botId}`);
    await set(botRef, {
      id: botId,
      name: botName,
      isHost: false,
      isReady: true,
      score: 0,
      currentDelta: 0,
      connected: true,
      joinedAt: Date.now(),
    });
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    players: [
      ...localState.players,
      {
        id: botId,
        number: (localState.players.length + 1).toString().padStart(2, '0'),
        name: botName,
        isHost: false,
        isUser: false,
        isReady: true,
        score: 0,
        currentDelta: 0,
        joinedAt: Date.now(),
      },
    ],
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Remove player from lobby
 */
export async function removePlayerRealtime(playerId: string): Promise<void> {
  if (db && isFirebaseConfigured) {
    const playerRef = ref(db, `game/players/${playerId}`);
    await set(playerRef, null);
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const filtered = localState.players.filter((p) => p.id !== playerId);
  const renumbered = filtered.map((p, idx) => ({
    ...p,
    number: (idx + 1).toString().padStart(2, '0'),
  }));
  const updatedState: GlobalGameState = {
    ...localState,
    players: renumbered,
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Host starts the game: generates 5 dynamic rounds and moves status to keyword_reveal
 */
export async function startGameHostRealtime(players: Player[]): Promise<void> {
  const generatedRounds = generateGameRounds(players, 5);

  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    const updates: Record<string, any> = {
      status: 'keyword_reveal',
      currentRound: 0,
      currentRoundIndex: 0,
      rounds: generatedRounds,
      discussion: {
        phase: 'idle',
        discussionStartedAt: null,
        discussionDuration: 120000,
        discussionEndedAt: null,
      },
    };

    // Reset players answers and scores for new game
    players.forEach((p) => {
      updates[`players/${p.id}/score`] = 0;
      updates[`players/${p.id}/currentDelta`] = 0;
      updates[`players/${p.id}/answer`] = null;
      updates[`players/${p.id}/votedTargetId`] = null;
    });

    await update(gameRef, updates);
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    status: 'keyword_reveal',
    currentRoundIndex: 0,
    rounds: generatedRounds,
    discussion: {
      phase: 'idle',
      discussionStartedAt: null,
      discussionDuration: 120000,
      discussionEndedAt: null,
    },
    players: localState.players.map((p) => ({
      ...p,
      score: 0,
      currentDelta: 0,
      answer: undefined,
      votedTargetId: undefined,
    })),
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Submit answer for the active round
 */
export async function submitAnswerRealtime(
  playerId: string,
  answer: string
): Promise<void> {
  if (db && isFirebaseConfigured) {
    const answerRef = ref(db, `game/players/${playerId}/answer`);
    await set(answerRef, answer.trim());
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    players: localState.players.map((p) =>
      p.id === playerId ? { ...p, answer: answer.trim() } : p
    ),
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Host triggers start of 2-minute synchronized discussion
 */
export async function startDiscussionHostRealtime(): Promise<void> {
  const newDiscussion = {
    phase: 'discussion',
    discussionStartedAt: Date.now(),
    discussionDuration: 120000,
    discussionEndedAt: null,
  };

  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    await update(gameRef, {
      status: 'discussion',
      discussion: newDiscussion,
    });
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    status: 'discussion',
    discussion: newDiscussion as RoomDiscussionState,
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Host ends discussion early and moves all clients to Voting
 */
export async function endDiscussionHostRealtime(
  currentStartedAt: number | null
): Promise<void> {
  const newDiscussion = {
    phase: 'ended',
    discussionStartedAt: currentStartedAt,
    discussionDuration: 120000,
    discussionEndedAt: Date.now(),
  };

  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    await update(gameRef, {
      status: 'voting',
      discussion: newDiscussion,
    });
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    status: 'voting',
    discussion: newDiscussion as RoomDiscussionState,
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Cast vote for suspected Impostor
 */
export async function castVoteRealtime(
  voterPlayerId: string,
  targetPlayerId: string,
  allPlayers: Player[],
  currentRound: RoundData
): Promise<void> {
  const isTargetImpostor = targetPlayerId === currentRound.impostorPlayerId;

  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    const updates: Record<string, any> = {
      status: 'reveal_impostor',
      [`players/${voterPlayerId}/votedTargetId`]: targetPlayerId,
    };

    // Calculate score deltas for all players
    allPlayers.forEach((p) => {
      let delta = 0;
      if (p.id === currentRound.impostorPlayerId) {
        // Impostor gets +3 if target wasn't impostor
        delta = isTargetImpostor ? 0 : 3;
      } else {
        // Majority get +2 if voter voted correct impostor
        delta = isTargetImpostor ? 2 : 0;
      }
      updates[`players/${p.id}/score`] = (p.score || 0) + delta;
      updates[`players/${p.id}/currentDelta`] = delta;
    });

    await update(gameRef, updates);
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedPlayers = localState.players.map((p) => {
    let delta = 0;
    if (p.id === currentRound.impostorPlayerId) {
      delta = isTargetImpostor ? 0 : 3;
    } else {
      delta = isTargetImpostor ? 2 : 0;
    }
    return {
      ...p,
      votedTargetId: p.id === voterPlayerId ? targetPlayerId : p.votedTargetId,
      score: p.score + delta,
      currentDelta: delta,
    };
  });

  const updatedState: GlobalGameState = {
    ...localState,
    status: 'reveal_impostor',
    players: updatedPlayers,
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Next Round or Transition to Final Ranking and Gacha setup
 */
export async function advanceNextRoundOrRankingRealtime(
  currentRoundIndex: number,
  totalRounds: number,
  players: Player[],
  wonRewards: WonReward[] = []
): Promise<void> {
  if (currentRoundIndex < totalRounds - 1) {
    const nextIndex = currentRoundIndex + 1;

    if (db && isFirebaseConfigured) {
      const gameRef = ref(db, 'game');
      const updates: Record<string, any> = {
        status: 'keyword_reveal',
        currentRound: nextIndex,
        currentRoundIndex: nextIndex,
        discussion: {
          phase: 'idle',
          discussionStartedAt: null,
          discussionDuration: 120000,
          discussionEndedAt: null,
        },
      };

      // Clear previous round answers and votes
      players.forEach((p) => {
        updates[`players/${p.id}/answer`] = null;
        updates[`players/${p.id}/votedTargetId`] = null;
      });

      await update(gameRef, updates);
      return;
    }

    // Local fallback
    const localState = getStoredGameState();
    const updatedState: GlobalGameState = {
      ...localState,
      status: 'keyword_reveal',
      currentRoundIndex: nextIndex,
      discussion: {
        phase: 'idle',
        discussionStartedAt: null,
        discussionDuration: 120000,
        discussionEndedAt: null,
      },
      players: localState.players.map((p) => ({
        ...p,
        answer: undefined,
        votedTargetId: undefined,
      })),
    };
    saveLocalFallbackState(updatedState);
  } else {
    // Finish rounds -> calculate Gacha Queue & Spins
    const gachaInit = initializeGachaState(players);

    if (db && isFirebaseConfigured) {
      const gameRef = ref(db, 'game');
      const updates: Record<string, any> = {
        status: 'final_ranking',
        'gacha/phase': 'idle',
        'gacha/currentGachaPlayerId': gachaInit.firstPlayerId,
        'gacha/gachaQueue': gachaInit.gachaQueue,
        'gacha/playerSpins': gachaInit.playerSpins,
        'gacha/activeSpin': null,
        'gacha/currentResult': null,
        'gacha/wonRewards': wonRewards,
      };
      await update(gameRef, updates);
      return;
    }

    // Local fallback
    const localState = getStoredGameState();
    const updatedState: GlobalGameState = {
      ...localState,
      status: 'final_ranking',
      gacha: {
        phase: 'idle',
        currentGachaPlayerId: gachaInit.firstPlayerId,
        gachaQueue: gachaInit.gachaQueue,
        playerSpins: gachaInit.playerSpins,
        activeSpin: null,
        currentResult: null,
        wonRewards,
      },
    };
    saveLocalFallbackState(updatedState);
  }
}

/**
 * Trigger synchronized Gacha Spin action
 */
export async function triggerGachaSpinRealtime(
  spinEvent: GachaSpinEvent,
  currentSpins: number,
  existingRewards: WonReward[]
): Promise<void> {
  const newReward: WonReward = {
    item: spinEvent.item,
    timestamp: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    code: spinEvent.item.code,
    playerName: spinEvent.playerName,
    playerId: spinEvent.playerId,
    spinNumber: spinEvent.spinNumber,
  };

  const remainingSpins = Math.max(0, currentSpins - 1);
  const updatedRewards = [newReward, ...existingRewards];

  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    const updates: Record<string, any> = {
      [`gacha/playerSpins/${spinEvent.playerId}`]: remainingSpins,
      'gacha/phase': 'spinning',
      'gacha/activeSpin': spinEvent,
      'gacha/wonRewards': updatedRewards,
      'gacha/currentResult': {
        item: spinEvent.item,
        playerId: spinEvent.playerId,
        playerName: spinEvent.playerName,
        code: spinEvent.item.code || null,
        spinNumber: spinEvent.spinNumber,
      },
    };
    await update(gameRef, updates);
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedSpins = {
    ...localState.gacha.playerSpins,
    [spinEvent.playerId]: remainingSpins,
  };

  const updatedState: GlobalGameState = {
    ...localState,
    gacha: {
      ...localState.gacha,
      phase: 'spinning',
      activeSpin: spinEvent,
      playerSpins: updatedSpins,
      wonRewards: updatedRewards,
      currentResult: {
        item: spinEvent.item,
        playerId: spinEvent.playerId,
        playerName: spinEvent.playerName,
        code: spinEvent.item.code,
        spinNumber: spinEvent.spinNumber,
      },
    },
  };
  saveLocalFallbackState(updatedState);
}

/**
 * Advance turn to next non-host player in Gacha queue
 */
export async function advanceGachaTurnRealtime(
  gachaState: RoomGachaState
): Promise<void> {
  const queue = gachaState.gachaQueue || [];
  const currentIndex = queue.indexOf(gachaState.currentGachaPlayerId || '');
  const nextIndex = currentIndex + 1;

  if (nextIndex < queue.length) {
    const nextPlayerId = queue[nextIndex];
    if (db && isFirebaseConfigured) {
      const gameRef = ref(db, 'game');
      await update(gameRef, {
        'gacha/phase': 'idle',
        'gacha/currentGachaPlayerId': nextPlayerId,
        'gacha/activeSpin': null,
      });
      return;
    }

    // Local fallback
    const localState = getStoredGameState();
    const updatedState: GlobalGameState = {
      ...localState,
      gacha: {
        ...localState.gacha,
        phase: 'idle',
        currentGachaPlayerId: nextPlayerId,
        activeSpin: null,
      },
    };
    saveLocalFallbackState(updatedState);
  } else {
    // Finished all turns
    if (db && isFirebaseConfigured) {
      const gameRef = ref(db, 'game');
      await update(gameRef, {
        'gacha/phase': 'finished',
        'gacha/activeSpin': null,
      });
      return;
    }

    // Local fallback
    const localState = getStoredGameState();
    const updatedState: GlobalGameState = {
      ...localState,
      gacha: {
        ...localState.gacha,
        phase: 'finished',
        activeSpin: null,
      },
    };
    saveLocalFallbackState(updatedState);
  }
}

/**
 * Reset game to initial state (Host only)
 */
export async function resetGameRealtime(): Promise<void> {
  if (db && isFirebaseConfigured) {
    const gameRef = ref(db, 'game');
    const freshGame = {
      status: 'join',
      hostId: '',
      maxPlayers: 8,
      players: null, // Clear players
      currentRound: 0,
      currentRoundIndex: 0,
      rounds: generateGameRounds(INITIAL_PLAYERS, 5),
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
    await set(gameRef, freshGame);
    return;
  }

  // Local fallback
  const freshState: GlobalGameState = {
    status: 'join',
    hostId: '',
    maxPlayers: 8,
    rounds: generateGameRounds(INITIAL_PLAYERS, 5),
    players: [],
    currentRoundIndex: 0,
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
  saveLocalFallbackState(freshState);
}

/**
 * Set arbitrary stage in Firebase (Host navigation)
 */
export async function setGameStageRealtime(stage: GameStage): Promise<void> {
  if (db && isFirebaseConfigured) {
    const statusRef = ref(db, 'game/status');
    await set(statusRef, stage);
    return;
  }

  // Local fallback
  const localState = getStoredGameState();
  const updatedState: GlobalGameState = {
    ...localState,
    status: stage,
  };
  saveLocalFallbackState(updatedState);
}
