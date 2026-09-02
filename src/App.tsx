/**
 * GACHA QUỐC KHÁNH 2/9
 * Retro Vietnamese Editorial Web Game & Lucky Gacha Experience
 * Single Room Direct Join Architecture
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameStage, Player, RoundData, WonReward, RoomDiscussionState, GlobalGameState, GachaSpinEvent } from './types';
import { INITIAL_PLAYERS, ROUNDS_DATA, generateGameRounds, initializeGachaState, GACHA_ITEMS } from './data/gameData';
import { sound } from './utils/audio';
import {
  getStoredGameState,
  saveGameState,
  subscribeToGameState,
} from './utils/roomSync';

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

const USER_SESSION_NAME_KEY = 'gacha_user_session_name_29';

export default function App() {
  const [gameState, setGameState] = useState<GlobalGameState>(() => getStoredGameState());
  const [currentStage, setCurrentStage] = useState<GameStage>('join');
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(USER_SESSION_NAME_KEY) || '';
    }
    return '';
  });
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [playerSpins, setPlayerSpins] = useState<Record<string, number>>({});
  const [wonRewards, setWonRewards] = useState<WonReward[]>(() => gameState.gacha.wonRewards || []);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);

  // Subscribe to real-time game updates across tabs/players
  useEffect(() => {
    const unsubscribe = subscribeToGameState((newState) => {
      setGameState(newState);
      if (newState.gacha?.wonRewards) {
        setWonRewards(newState.gacha.wonRewards);
      }
      if (newState.gacha?.playerSpins) {
        setPlayerSpins(newState.gacha.playerSpins);
      }
      // If remote room status changed to a game phase and local player is in room
      if (newState.status && newState.status !== 'join' && newState.status !== 'lobby') {
        setCurrentStage(newState.status);
      }
    });
    return () => unsubscribe();
  }, []);

  // If user already entered name previously, start in lobby
  useEffect(() => {
    if (userName && currentStage === 'join') {
      // Check if user exists in current players
      const exists = gameState.players.some((p) => p.name === userName);
      if (!exists && gameState.players.length < (gameState.maxPlayers || 8)) {
        handleJoinGame(userName);
      } else if (exists) {
        handleStageChange('lobby');
      }
    }
  }, []);

  const activeRounds = gameState.rounds && gameState.rounds.length > 0 ? gameState.rounds : ROUNDS_DATA;
  const currentRound: RoundData = activeRounds[gameState.currentRoundIndex] || activeRounds[0];
  const totalRoundsCount = activeRounds.length;

  // Identify user player & impostor
  const userPlayer: Player =
    gameState.players.find((p) => p.isUser || p.name === userName) ||
    gameState.players[0] || {
      id: 'p1',
      number: '01',
      name: userName || 'BẠN',
      isHost: true,
      isUser: true,
      isReady: true,
      score: 0,
      currentDelta: 0,
    };

  const impostorPlayer =
    gameState.players.find((p) => p.id === currentRound.impostorPlayerId) || gameState.players[0];

  // Stage transition helper
  const handleStageChange = (stage: GameStage) => {
    setCurrentStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Join game with player name
  const handleJoinGame = (inputName: string) => {
    const formatted = inputName.trim().toUpperCase();
    setUserName(formatted);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_SESSION_NAME_KEY, formatted);
    }

    setGameState((prev) => {
      let existingPlayers = [...prev.players];
      const maxSlots = prev.maxPlayers || 8;
      const isFirst = existingPlayers.length === 0;

      // Check if player name already in list
      const existingIdx = existingPlayers.findIndex(
        (p) => p.name.toUpperCase() === formatted
      );

      if (existingIdx >= 0) {
        existingPlayers = existingPlayers.map((p, idx) =>
          idx === existingIdx ? { ...p, isUser: true } : { ...p, isUser: false }
        );
      } else if (existingPlayers.length < maxSlots) {
        const nextNum = (existingPlayers.length + 1).toString().padStart(2, '0');
        const newPlayer: Player = {
          id: `p${existingPlayers.length + 1}`,
          number: nextNum,
          name: formatted,
          isHost: isFirst || existingPlayers.length === 0,
          isUser: true,
          isReady: true,
          score: 0,
          currentDelta: 0,
        };
        // Ensure others have isUser: false
        existingPlayers = existingPlayers.map((p) => ({ ...p, isUser: false }));
        existingPlayers.push(newPlayer);
      } else {
        // Replace slot 1 with user
        existingPlayers[0] = { ...existingPlayers[0], name: formatted, isUser: true };
      }

      // Ensure at least one host exists
      if (!existingPlayers.some((p) => p.isHost)) {
        existingPlayers[0].isHost = true;
      }

      const updatedState: GlobalGameState = {
        ...prev,
        status: 'lobby',
        players: existingPlayers,
        hostId: existingPlayers.find((p) => p.isHost)?.id || existingPlayers[0].id,
      };

      saveGameState(updatedState);
      return updatedState;
    });

    handleStageChange('lobby');
  };

  // User updates their name in lobby
  const handleUpdateUserName = (newName: string) => {
    const formatted = newName.trim().toUpperCase();
    setUserName(formatted);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_SESSION_NAME_KEY, formatted);
    }
    setGameState((prev) => {
      const updated = {
        ...prev,
        players: prev.players.map((p) => (p.isUser ? { ...p, name: formatted } : p)),
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Toggle Ready state for user
  const handleToggleReady = () => {
    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) => {
        if (p.id === userPlayer.id || p.isUser) {
          return { ...p, isReady: !p.isReady };
        }
        return p;
      });

      const updated: GlobalGameState = {
        ...prev,
        players: updatedPlayers,
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Add bot player for testing / completing up to 8 players
  const handleAddBot = () => {
    const maxSlots = gameState.maxPlayers || 8;
    if (gameState.players.length >= maxSlots) return;
    const botNames = ['THẮNG', 'QUANG', 'TRANG', 'HƯƠNG', 'BẢO', 'KHÁNH', 'DŨNG', 'ÁNH'];
    const nextNum = (gameState.players.length + 1).toString().padStart(2, '0');
    const newBot: Player = {
      id: `p${gameState.players.length + 1}_${Date.now()}`,
      number: nextNum,
      name: botNames[gameState.players.length % botNames.length],
      isHost: false,
      isUser: false,
      isReady: true,
      score: 0,
      currentDelta: 0,
    };

    setGameState((prev) => {
      const updated = {
        ...prev,
        players: [...prev.players, newBot],
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Remove a bot/player from lobby
  const handleRemoveBot = (id: string) => {
    if (gameState.players.length <= 2) return;
    setGameState((prev) => {
      const filtered = prev.players.filter((p) => p.id !== id);
      // Renumber
      const renumbered = filtered.map((p, idx) => ({
        ...p,
        number: (idx + 1).toString().padStart(2, '0'),
      }));
      const updated = {
        ...prev,
        players: renumbered,
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Host starts the game: Generate 5 dynamic rounds from keyword pairs
  const handleStartGame = () => {
    const generatedRounds = generateGameRounds(gameState.players, 5);
    setGameState((prev) => {
      const updated: GlobalGameState = {
        ...prev,
        rounds: generatedRounds,
        currentRoundIndex: 0,
        status: 'keyword_reveal',
        discussion: {
          phase: 'idle',
          discussionStartedAt: null,
          discussionDuration: 120000,
          discussionEndedAt: null,
        },
        players: prev.players.map((p) => ({
          ...p,
          answer: undefined,
          votedTargetId: undefined,
          score: 0,
          currentDelta: 0,
        })),
      };
      saveGameState(updated);
      return updated;
    });

    handleStageChange('keyword_reveal');
  };

  // Answer submission
  const handleSubmitAnswer = (answer: string) => {
    setUserAnswer(answer);
    setGameState((prev) => {
      const updated = {
        ...prev,
        players: prev.players.map((p) => (p.isUser || p.id === userPlayer.id ? { ...p, answer } : p)),
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Start discussion (Host triggers 2-min countdown)
  const handleStartDiscussion = () => {
    const newDiscussionState: RoomDiscussionState = {
      phase: 'discussion',
      discussionStartedAt: Date.now(),
      discussionDuration: 120000,
      discussionEndedAt: null,
    };

    setGameState((prev) => {
      const updated = {
        ...prev,
        discussion: newDiscussionState,
        status: 'discussion' as GameStage,
      };
      saveGameState(updated);
      return updated;
    });
  };

  // End discussion and move to voting
  const handleEndDiscussion = () => {
    const newDiscussionState: RoomDiscussionState = {
      phase: 'ended',
      discussionStartedAt: gameState.discussion.discussionStartedAt,
      discussionDuration: 120000,
      discussionEndedAt: Date.now(),
    };

    setGameState((prev) => {
      const updated = {
        ...prev,
        discussion: newDiscussionState,
        status: 'voting' as GameStage,
      };
      saveGameState(updated);
      return updated;
    });

    handleStageChange('voting');
  };

  // Cast vote for suspected impostor
  const handleCastVote = (targetPlayerId: string) => {
    const isTargetImpostor = targetPlayerId === currentRound.impostorPlayerId;

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) => {
        let delta = 0;
        if (p.id === currentRound.impostorPlayerId) {
          delta = isTargetImpostor ? 0 : 3;
        } else {
          delta = isTargetImpostor ? 2 : 0;
        }
        return {
          ...p,
          score: p.score + delta,
          currentDelta: delta,
        };
      });

      const updated = {
        ...prev,
        players: updatedPlayers,
        status: 'reveal_impostor' as GameStage,
      };
      saveGameState(updated);
      return updated;
    });

    handleStageChange('reveal_impostor');
  };

  // Next round transition
  const handleNextRound = () => {
    const totalRounds = activeRounds.length;
    if (gameState.currentRoundIndex < totalRounds - 1) {
      const nextIndex = gameState.currentRoundIndex + 1;
      setUserAnswer('');

      setGameState((prev) => {
        const updated = {
          ...prev,
          currentRoundIndex: nextIndex,
          discussion: {
            phase: 'idle' as const,
            discussionStartedAt: null,
            discussionDuration: 120000,
            discussionEndedAt: null,
          },
          players: prev.players.map((p) => ({
            ...p,
            answer: undefined,
            votedTargetId: undefined,
          })),
          status: 'keyword_reveal' as GameStage,
        };
        saveGameState(updated);
        return updated;
      });

      handleStageChange('keyword_reveal');
    } else {
      // Calculate Gacha turns and spins: Host is EXCLUDED from gacha, highest non-host gets 2 spins, others get 1 spin
      const gachaInit = initializeGachaState(gameState.players);
      setPlayerSpins(gachaInit.playerSpins);

      setGameState((prev) => {
        const updated: GlobalGameState = {
          ...prev,
          gacha: {
            phase: 'idle',
            currentGachaPlayerId: gachaInit.firstPlayerId,
            gachaQueue: gachaInit.gachaQueue,
            playerSpins: gachaInit.playerSpins,
            activeSpin: null,
            currentResult: null,
            wonRewards: prev.gacha?.wonRewards || [],
          },
          status: 'final_ranking' as GameStage,
        };
        saveGameState(updated);
        return updated;
      });

      handleStageChange('final_ranking');
    }
  };

  // Trigger spin by active player (synchronizes across all connected clients)
  const handleTriggerGachaSpin = (spinEvent: GachaSpinEvent) => {
    const newReward: WonReward = {
      item: spinEvent.item,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      code: spinEvent.item.code,
      playerName: spinEvent.playerName,
    };

    setGameState((prev) => {
      const currentSpins = prev.gacha.playerSpins[spinEvent.playerId] ?? 1;
      const newSpins = Math.max(0, currentSpins - 1);
      const updatedSpins = {
        ...prev.gacha.playerSpins,
        [spinEvent.playerId]: newSpins,
      };

      const updatedRewards = [newReward, ...(prev.gacha.wonRewards || [])];
      setWonRewards(updatedRewards);
      setPlayerSpins(updatedSpins);

      const updated: GlobalGameState = {
        ...prev,
        gacha: {
          ...prev.gacha,
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

      saveGameState(updated);
      return updated;
    });
  };

  // Advance turn to next non-host player in queue
  const handleAdvanceGachaTurn = () => {
    setGameState((prev) => {
      const queue = prev.gacha.gachaQueue || [];
      const currentIndex = queue.indexOf(prev.gacha.currentGachaPlayerId || '');
      const nextIndex = currentIndex + 1;

      if (nextIndex < queue.length) {
        const nextPlayerId = queue[nextIndex];
        const updated: GlobalGameState = {
          ...prev,
          gacha: {
            ...prev.gacha,
            phase: 'idle',
            currentGachaPlayerId: nextPlayerId,
            activeSpin: null,
          },
        };
        saveGameState(updated);
        return updated;
      } else {
        // Finished all turns
        const updated: GlobalGameState = {
          ...prev,
          gacha: {
            ...prev.gacha,
            phase: 'finished',
            activeSpin: null,
          },
        };
        saveGameState(updated);
        return updated;
      }
    });
  };

  // Trigger spin on behalf of a player (by Host if player is inactive/testing)
  const handleTriggerSpinOnBehalf = (playerId: string) => {
    const targetPlayer = gameState.players.find((p) => p.id === playerId);
    if (!targetPlayer) return;

    const remainingSpins = gameState.gacha.playerSpins[playerId] ?? 1;
    if (remainingSpins <= 0) return;

    const NUM_SEGMENTS = 10;
    const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
    const randomIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    const targetItem = GACHA_ITEMS[randomIndex];
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetSegmentCenter = 360 - (randomIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
    const currentAngle = gameState.gacha.activeSpin?.targetAngle || 0;
    const finalAngle = currentAngle + extraRounds * 360 + (targetSegmentCenter - (currentAngle % 360));

    const spinEvent: GachaSpinEvent = {
      spinId: `spin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      playerId: targetPlayer.id,
      playerName: targetPlayer.name,
      itemIndex: randomIndex,
      targetAngle: finalAngle,
      item: targetItem,
      spinStartedAt: Date.now(),
      spinDurationMs: 4200,
      spinNumber: remainingSpins,
    };

    handleTriggerGachaSpin(spinEvent);
  };

  // Record reward won from gacha
  const handleRecordReward = (reward: WonReward) => {
    const updated = [reward, ...wonRewards];
    setWonRewards(updated);

    setGameState((prev) => {
      const newState: GlobalGameState = {
        ...prev,
        gacha: {
          ...prev.gacha,
          wonRewards: updated,
        },
      };
      saveGameState(newState);
      return newState;
    });
  };

  // Reset complete game to fresh state
  const handleResetGame = () => {
    const freshState: GlobalGameState = {
      status: 'join',
      hostId: 'p1',
      maxPlayers: 8,
      rounds: generateGameRounds(INITIAL_PLAYERS, 5),
      players: INITIAL_PLAYERS,
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
    setGameState(freshState);
    saveGameState(freshState);
    setWonRewards([]);
    setUserAnswer('');
    setCurrentStage('join');
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#141414] relative paper-texture-subtle flex flex-col justify-between selection:bg-[#C02026] selection:text-white">
      {/* Editorial Sticky Header */}
      <Header
        currentStage={currentStage}
        onNavigate={handleStageChange}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenVouchers={() => setIsVouchersOpen(true)}
        voucherCount={wonRewards.length}
        onResetGame={handleResetGame}
      />

      {/* Main Screen Transition Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {currentStage === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <JoinScreen
                playerCount={gameState.players.length}
                maxPlayers={gameState.maxPlayers || 8}
                onJoinGame={handleJoinGame}
              />
            </motion.div>
          )}

          {currentStage === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <LobbyScreen
                players={gameState.players}
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

          {currentStage === 'keyword_reveal' && (
            <motion.div
              key="keyword_reveal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <GameKeywordScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                userPlayer={userPlayer}
                playersCount={gameState.players.length}
                onProceedToAnswer={() => handleStageChange('answer_input')}
              />
            </motion.div>
          )}

          {currentStage === 'answer_input' && (
            <motion.div
              key="answer_input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AnswerInputScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                userPlayer={userPlayer}
                playersCount={gameState.players.length}
                existingAnswer={userAnswer}
                onSubmitAnswer={handleSubmitAnswer}
                onProceedToReveal={() => handleStageChange('discussion')}
              />
            </motion.div>
          )}

          {(currentStage === 'reveal_answers' || currentStage === 'discussion') && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <DiscussionScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                players={gameState.players}
                userPlayer={userPlayer}
                discussionState={gameState.discussion}
                onStartDiscussion={handleStartDiscussion}
                onEndDiscussion={handleEndDiscussion}
              />
            </motion.div>
          )}

          {currentStage === 'voting' && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <VotingScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                players={gameState.players}
                userPlayer={userPlayer}
                onCastVote={handleCastVote}
              />
            </motion.div>
          )}

          {currentStage === 'reveal_impostor' && (
            <motion.div
              key="reveal_impostor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RevealImpostorScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                players={gameState.players}
                impostorPlayer={impostorPlayer}
                onProceedToScoreboard={() => handleStageChange('scoreboard')}
              />
            </motion.div>
          )}

          {currentStage === 'scoreboard' && (
            <motion.div
              key="scoreboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ScoreboardScreen
                round={currentRound}
                totalRounds={totalRoundsCount}
                players={gameState.players}
                onNextRound={handleNextRound}
                onGoToFinalRanking={() => handleStageChange('final_ranking')}
              />
            </motion.div>
          )}

          {currentStage === 'final_ranking' && (
            <motion.div
              key="final_ranking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <FinalRankingScreen
                players={gameState.players}
                onGoToGacha={() => handleStageChange('gacha')}
              />
            </motion.div>
          )}

          {currentStage === 'gacha' && (
            <motion.div
              key="gacha"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <GachaWheelScreen
                players={gameState.players}
                userPlayer={userPlayer}
                gachaState={gameState.gacha}
                onTriggerSpin={handleTriggerGachaSpin}
                onAdvanceTurn={handleAdvanceGachaTurn}
                onFinishMyTurn={handleAdvanceGachaTurn}
                onTriggerSpinOnBehalf={handleTriggerSpinOnBehalf}
                onRecordReward={handleRecordReward}
                onGoBackToLanding={() => handleStageChange('join')}
                onOpenHistory={() => setIsVouchersOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t-2 border-[#141414] py-4 px-4 text-center font-mono text-[11px] text-[#141414]/75 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-[#C02026]">
          <span>★ 02.09.1945 — 02.09.2026</span>
          <span className="text-[#141414]/30 font-normal">|</span>
          <span className="text-[#141414]">KỶ NIỆM 81 NĂM QUỐC KHÁNH VIỆT NAM</span>
        </div>
        <div>
          TRÒ CHƠI TƯƠNG TÁC PHONG CÁCH BÁO CHÍ RETRO & GACHA MAY MẮN
        </div>
      </footer>

      {/* Auxiliary Modals */}
      <RulesGuideModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <VoucherHistoryModal
        isOpen={isVouchersOpen}
        onClose={() => setIsVouchersOpen(false)}
        rewards={wonRewards}
      />
    </div>
  );
}

