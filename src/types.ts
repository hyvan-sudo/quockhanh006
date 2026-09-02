export type GameStage =
  | 'join'
  | 'landing'
  | 'lobby'
  | 'keyword_reveal'
  | 'answer_input'
  | 'reveal_answers'
  | 'discussion'
  | 'voting'
  | 'reveal_impostor'
  | 'scoreboard'
  | 'final_ranking'
  | 'gacha';

export interface RoomDiscussionState {
  phase: 'idle' | 'discussion' | 'ended';
  discussionStartedAt: number | null;
  discussionDuration: number;
  discussionEndedAt: number | null;
}

export interface Player {
  id: string;
  number: string;
  name: string;
  isHost?: boolean;
  isUser?: boolean;
  isReady?: boolean;
  score: number;
  currentDelta: number;
  answer?: string;
  votedTargetId?: string;
  isImpostor?: boolean;
  avatarColor?: string;
  spins?: number;
  joinedAt?: number;
}

export interface KeywordPairData {
  pairId: number;
  majorityWord: string;
  impostorWord: string;
  topic: string;
  questions: string[];
  sampleAnswersMajority: string[];
  sampleAnswersImpostor: string[];
}

export interface RoundData {
  roundNumber: number;
  pairId: number;
  majorityWord: string;
  impostorWord: string;
  topic: string;
  question: string;
  defaultAnswers: Record<string, string>; // player id -> sample answer
  impostorPlayerId: string;
}

export interface GachaItem {
  id: number;
  title: string;
  subtitle?: string;
  isPrize: boolean;
  code?: string;
  badge?: string;
  description: string;
  color: string;
  textColor: string;
}

export interface WonReward {
  id?: string;
  playerId?: string;
  playerName?: string;
  timestamp: string;
  item: GachaItem;
  code?: string;
  spinNumber?: number;
}

export interface GachaSpinEvent {
  spinId: string;
  playerId: string;
  playerName: string;
  itemIndex: number; // 0..9
  targetAngle: number;
  item: GachaItem;
  spinStartedAt: number;
  spinDurationMs: number;
  spinNumber: number;
}

export interface RoomGachaState {
  phase: 'idle' | 'spinning' | 'revealed' | 'finished';
  currentGachaPlayerId: string | null;
  gachaQueue: string[]; // List of non-host player IDs sorted by ranking
  playerSpins: Record<string, number>; // playerId -> remaining spins
  activeSpin: GachaSpinEvent | null;
  currentResult: {
    item: GachaItem;
    playerId: string;
    playerName: string;
    code?: string;
    spinNumber: number;
  } | null;
  wonRewards: WonReward[];
}

export interface GlobalGameState {
  status: GameStage;
  hostId: string;
  maxPlayers: number;
  players: Player[];
  currentRoundIndex: number;
  rounds: RoundData[];
  discussion: RoomDiscussionState;
  gacha: RoomGachaState;
  kickedPlayers?: Record<string, boolean>;
}

