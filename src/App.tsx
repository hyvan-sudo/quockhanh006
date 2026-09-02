/**
 * GACHA QUỐC KHÁNH 2/9
 * Retro Vietnamese Editorial Web Game & Lucky Gacha Experience
 * Realtime Multiplayer powered by Firebase Realtime Database
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GameStage,
  Player,
  RoundData,
  WonReward,
  GlobalGameState,
  GachaSpinEvent,
} from './types';
import { ROUNDS_DATA, GACHA_ITEMS } from './data/gameData';
import {
  getOrCreateLocalPlayerId,
  getStoredLocalPlayerName,
  subscribeToGame,
  joinGameRealtime,
  togglePlayerReadyRealtime,
  updatePlayerNameRealtime,
  addBotPlayerRealtime,
  removePlayerRealtime,
  startGameHostRealtime,
  submitAnswerRealtime,
  startDiscussionHostRealtime,
  endDiscussionHostRealtime,
  castVoteRealtime,
  advanceNextRoundOrRankingRealtime,
  triggerGachaSpinRealtime,
  advanceGachaTurnRealtime,
  initializeGachaSessionRealtime,
  resetGameRealtime,
  setGameStageRealtime,
} from './services/firebaseGameService';
import { isFirebaseConfigured } from './lib/firebase';

import { Header } from './components/Header';
import { JoinScreen } from './components/JoinScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { GameKeywordScreen } from './components/GameKeywordScreen';
import { AnswerInputScreen } from './components/AnswerInputScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { VotingScreen } from './components/VotingScreen';
import { RevealImpostorScreen } from './components/RevealImpostorScreen';
import { ScoreboardScreen } from './components/ScoreboardScreen';
import { FinalRankingScreen } from './components/FinalRankingScreen';
import { GachaWheelScreen } from './components/GachaWheelScreen';
import { RulesGuideModal } from './components/RulesGuideModal';
import { VoucherHistoryModal } from './components/VoucherHistoryModal';

export default function App() {
  const [localPlayerId] = useState<string>(() => getOrCreateLocalPlayerId());
  const [userName, setUserName] = useState<string>(() => getStoredLocalPlayerName());
  const [gameState, setGameState] = useState<GlobalGameState>({
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
  });

  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);

  // Subscribe to Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = subscribeToGame((newState) => {
      setGameState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Compute player lists with isUser tag for local client
  const enrichedPlayers: Player[] = gameState.players.map((p) => ({
    ...p,
    isUser: p.id === localPlayerId || (Boolean(userName) && p.name.toUpperCase() === userName.toUpperCase()),
  }));

  const localUserPlayer: Player | undefined = enrichedPlayers.find((p) => p.isUser);

  // Determine userPlayer fallback object
  const userPlayer: Player = localUserPlayer || {
    id: localPlayerId,
    number: '01',
    name: userName || 'BẠN',
    isHost: gameState.hostId === localPlayerId || enrichedPlayers.length === 0,
    isUser: true,
    isReady: true,
    score: 0,
    currentDelta: 0,
  };

  const isUserInGame = Boolean(localUserPlayer);
  const activeStage: GameStage = !isUserInGame && gameState.status !== 'join' ? 'join' : (gameState.status || 'join');

  const activeRounds = gameState.rounds && gameState.rounds.length > 0 ? gameState.rounds : ROUNDS_DATA;
  const currentRoundIndex = gameState.currentRoundIndex || 0;
  const currentRound: RoundData = activeRounds[currentRoundIndex] || activeRounds[0];
  const totalRoundsCount = activeRounds.length;

  const impostorPlayer =
    enrichedPlayers.find((p) => p.id === currentRound.impostorPlayerId) || enrichedPlayers[0] || userPlayer;

  // Join game with player name
  const handleJoinGame = async (inputName: string) => {
    const cleanName = inputName.trim().toUpperCase();
    setUserName(cleanName);
    await joinGameRealtime(cleanName);
  };

  // Toggle ready status for current user
  const handleToggleReady = async () => {
    const currentReady = userPlayer.isReady ?? true;
    await togglePlayerReadyRealtime(userPlayer.id, !currentReady);
  };

  // Update user name in lobby
  const handleUpdateUserName = async (newName: string) => {
    const cleanName = newName.trim().toUpperCase();
    setUserName(cleanName);
    await updatePlayerNameRealtime(userPlayer.id, cleanName);
  };

  // Host starts the game
  const handleStartGame = async () => {
    await startGameHostRealtime(enrichedPlayers);
  };

  // Add test bot player for testing / completing players
  const handleAddBot = async () => {
    await addBotPlayerRealtime(enrichedPlayers.length);
  };

  // Remove player from lobby
  const handleRemoveBot = async (id: string) => {
    await removePlayerRealtime(id);
  };

  // Player submits answer
  const handleSubmitAnswer = async (answer: string) => {
    setUserAnswer(answer);
    await submitAnswerRealtime(userPlayer.id, answer);
  };

  // Host triggers 2-min discussion
  const handleStartDiscussion = async () => {
    await startDiscussionHostRealtime();
  };

  // Host ends discussion early & moves to voting
  const handleEndDiscussion = async () => {
    await endDiscussionHostRealtime(gameState.discussion.discussionStartedAt);
  };

  // Cast vote
  const handleCastVote = async (targetPlayerId: string) => {
    await castVoteRealtime(userPlayer.id, targetPlayerId, enrichedPlayers, currentRound);
  };

  // Next Round or Final Ranking
  const handleNextRound = async () => {
    await advanceNextRoundOrRankingRealtime(
      currentRoundIndex,
      totalRoundsCount,
      enrichedPlayers,
      gameState.gacha?.wonRewards || []
    );
  };

  // Gacha spin action
  const handleTriggerGachaSpin = async (spinEvent: GachaSpinEvent) => {
    const currentSpins = gameState.gacha.playerSpins[spinEvent.playerId] ?? 1;
    await triggerGachaSpinRealtime(
      spinEvent,
      currentSpins,
      gameState.gacha.wonRewards || []
    );
  };

  // Advance Gacha turn
  const handleAdvanceGachaTurn = async () => {
    await advanceGachaTurnRealtime(gameState.gacha, enrichedPlayers);
  };

  // Host resets game
  const handleResetGame = async () => {
    setUserAnswer('');
    await resetGameRealtime();
  };

  // Direct stage navigation (for local testing/reviewing)
  const handleStageChange = async (stage: GameStage) => {
    if (userPlayer.isHost) {
      if (stage === 'gacha' || stage === 'final_ranking') {
        await initializeGachaSessionRealtime(enrichedPlayers, gameState.gacha?.wonRewards || []);
      }
      await setGameStageRealtime(stage);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#141414] relative paper-texture-subtle flex flex-col justify-between selection:bg-[#C02026] selection:text-white">
      <Header
        currentStage={activeStage}
        onNavigate={handleStageChange}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenVouchers={() => setIsVouchersOpen(true)}
        voucherCount={gameState.gacha?.wonRewards?.length || 0}
        onResetGame={handleResetGame}
      />

      {!isFirebaseConfigured && (
        <div className="bg-[#FAF6EE] border-b border-[#141414] py-1 px-3 text-center font-mono text-[10px] text-[#141414]/80 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Chế độ Realtime Broadcast cục bộ • Điền thông tin Firebase vào <code>.env</code> để kết nối Realtime Database toàn cầu.
          </span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {activeStage === 'join' && (
            <motion.div key="join" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <JoinScreen playerCount={enrichedPlayers.length} maxPlayers={gameState.maxPlayers || 8} onJoinGame={handleJoinGame} />
            </motion.div>
          )}

          {activeStage === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <LobbyScreen
                players={enrichedPlayers}
                userName={userName || userPlayer.name}
                isHost={userPlayer.isHost ?? false}
                currentUserPlayer={userPlayer}
                maxPlayers={gameState.maxPlayers || 8}
                onToggleReady={handleToggleReady}
                onUpdateUserName={handleUpdateUserName}
                onAddBot={handleAddBot}
                onRemoveBot={handleRemoveBot}
                onStartGame={handleStartGame}
              />
            </motion.div>
          )}

          {activeStage === 'keyword_reveal' && (
            <motion.div key="keyword_reveal" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <GameKeywordScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                userPlayer={userPlayer}
                playersCount={enrichedPlayers.length}
                onProceedToAnswer={() => setGameStageRealtime('answer_input')}
              />
            </motion.div>
          )}

          {activeStage === 'answer_input' && (
            <motion.div key="answer_input" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <AnswerInputScreen
                key={`answer-input-round-${currentRoundIndex}`}
                round={currentRound}
                totalRounds={totalRoundsCount}
                userPlayer={userPlayer}
                playersCount={enrichedPlayers.length}
                existingAnswer={userPlayer.answer}
                onSubmitAnswer={handleSubmitAnswer}
                onProceedToReveal={() => setGameStageRealtime('discussion')}
              />
            </motion.div>
          )}

          {(activeStage === 'reveal_answers' || activeStage === 'discussion') && (
            <motion.div key="discussion" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <DiscussionScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                players={enrichedPlayers}
                userPlayer={userPlayer}
                discussionState={gameState.discussion}
                onStartDiscussion={handleStartDiscussion}
                onEndDiscussion={handleEndDiscussion}
              />
            </motion.div>
          )}

          {activeStage === 'voting' && (
            <motion.div key="voting" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <VotingScreen round={currentRound} totalRounds={totalRoundsCount} players={enrichedPlayers} userPlayer={userPlayer} onCastVote={handleCastVote} />
            </motion.div>
          )}

          {activeStage === 'reveal_impostor' && (
            <motion.div key="reveal_impostor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <RevealImpostorScreen round={currentRound} totalRounds={totalRoundsCount} players={enrichedPlayers} impostorPlayer={impostorPlayer} onProceedToScoreboard={() => setGameStageRealtime('scoreboard')} />
            </motion.div>
          )}

          {activeStage === 'scoreboard' && (
            <motion.div key="scoreboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <ScoreboardScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                players={enrichedPlayers}
                onNextRound={handleNextRound}
                onGoToFinalRanking={() => advanceNextRoundOrRankingRealtime(totalRoundsCount - 1, totalRoundsCount, enrichedPlayers, gameState.gacha?.wonRewards || [])}
              />
            </motion.div>
          )}

          {activeStage === 'final_ranking' && (
            <motion.div key="final_ranking" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <FinalRankingScreen
                players={enrichedPlayers}
                onGoToGacha={() => initializeGachaSessionRealtime(enrichedPlayers, gameState.gacha?.wonRewards || [])}
              />
            </motion.div>
          )}

          {activeStage === 'gacha' && (
            <motion.div key="gacha" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }}>
              <GachaWheelScreen
                players={enrichedPlayers}
                userPlayer={userPlayer}
                gachaState={gameState.gacha}
                onTriggerSpin={handleTriggerGachaSpin}
                onAdvanceTurn={handleAdvanceGachaTurn}
                onFinishMyTurn={handleAdvanceGachaTurn}
                onTriggerSpinOnBehalf={(playerId) => {
                  const target = enrichedPlayers.find((p) => p.id === playerId);
                  if (target) {
                    const remaining = gameState.gacha.playerSpins[playerId] ?? 1;
                    if (remaining > 0) {
                      const randomIndex = Math.floor(Math.random() * 10);
                      const targetItem = (ROUNDS_DATA as any) && GACHA_ITEMS[randomIndex] ? GACHA_ITEMS[randomIndex] : GACHA_ITEMS[0];
                      const extraRounds = 5 + Math.floor(Math.random() * 3);
                      const SEGMENT_ANGLE = 36;
                      const targetSegmentCenter = 360 - (randomIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
                      const currentAngle = gameState.gacha.activeSpin?.targetAngle || 0;
                      const finalAngle = currentAngle + extraRounds * 360 + (targetSegmentCenter - (currentAngle % 360));

                      const spinEvent: GachaSpinEvent = {
                        spinId: `spin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                        playerId: target.id,
                        playerName: target.name,
                        itemIndex: randomIndex,
                        targetAngle: finalAngle,
                        item: targetItem,
                        spinStartedAt: Date.now(),
                        spinDurationMs: 4200,
                        spinNumber: remaining,
                      };
                      handleTriggerGachaSpin(spinEvent);
                    }
                  }
                }}
                onRecordReward={() => {}}
                onGoBackToLanding={() => setGameStageRealtime('join')}
                onOpenHistory={() => setIsVouchersOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t-2 border-[#141414] py-4 px-4 text-center font-mono text-[11px] text-[#141414]/75 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-[#C02026]">
          <span>★ 02.09.1945 — 02.09.2026</span>
          <span className="text-[#141414]/30 font-normal">|</span>
          <span className="text-[#141414]">KỶ NIỆM 81 NĂM QUỐC KHÁNH VIỆT NAM</span>
        </div>
        <div>TRÒ CHƠI TƯƠNG TÁC PHONG CÁCH BÁO CHÍ RETRO & GACHA MAY MẮN</div>
      </footer>

      <RulesGuideModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <VoucherHistoryModal isOpen={isVouchersOpen} onClose={() => setIsVouchersOpen(false)} rewards={gameState.gacha?.wonRewards || []} />
    </div>
  );
}
