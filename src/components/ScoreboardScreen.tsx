import React from 'react';
import { motion } from 'motion/react';
import { Player, RoundData } from '../types';
import { sound } from '../utils/audio';
import { StampSeal29, TricolorBar } from './DecorativeElements';

interface ScoreboardScreenProps {
  round: RoundData;
  totalRounds: number;
  players: Player[];
  onNextRound: () => void;
  onGoToFinalRanking: () => void;
}

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({
  round,
  totalRounds,
  players,
  onNextRound,
  onGoToFinalRanking,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isLastRound = round.roundNumber >= totalRounds;

  return (
    <div id="scoreboard-screen" className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase border border-[#141414]">
            ROUND 0{round.roundNumber} / 0{totalRounds}
          </span>
          <span className="font-mono text-xs text-[#141414]/70 uppercase hidden sm:inline tracking-wider">
            BẢNG ĐIỂM TỔNG SẮP
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* Main Bento Container */}
      <div className="bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header */}
        <div className="p-6 sm:p-10 text-center bg-[#F2ECE0]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#C02026] block mb-2">
            ẤN BẢN XẾP HẠNG THỜI SỰ
          </span>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-3xl sm:text-5xl text-[#141414] tracking-tight uppercase"
          >
            BẢNG ĐIỂM ROUND 0{round.roundNumber}
          </motion.h2>

          <p className="font-serif-vintage italic text-sm sm:text-base text-[#141414]/75 mt-1">
            Phe Thường bắt trúng Impostor: +2 điểm. Impostor ẩn nấp thành công: +3 điểm.
          </p>
        </div>

        {/* Bento Ranking Rows List */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE]">
          <div className="space-y-2.5 max-w-2xl mx-auto">
            {sortedPlayers.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`p-4 border flex items-center justify-between ${
                  player.isUser
                    ? 'border-[#C02026] bg-[#F2ECE0]'
                    : 'border-[#141414] bg-[#FAF6EE]'
                }`}
              >
                {/* Left: Rank & Player info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-mono font-black text-sm sm:text-base text-[#C02026] w-6">
                    0{idx + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg sm:text-xl text-[#141414] uppercase">
                      {player.name}
                    </span>

                    {player.isUser && (
                      <span className="px-1.5 py-0.5 bg-[#C02026] text-white text-[9px] font-mono font-bold uppercase">
                        BẠN
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Round Delta & Total Points */}
                <div className="flex items-center gap-3 sm:gap-5 font-mono">
                  {/* Round Delta badge */}
                  <div
                    className={`px-2 py-0.5 text-[10px] font-bold border ${
                      player.currentDelta > 0
                        ? 'bg-[#F9D64B] text-[#141414] border-[#141414]'
                        : 'bg-[#141414]/5 text-[#141414]/60 border-[#141414]/20'
                    }`}
                  >
                    +{player.currentDelta} PTS
                  </div>

                  {/* Total Score */}
                  <div className="text-right">
                    <span className="font-black text-xl sm:text-2xl text-[#141414]">{player.score}</span>
                    <span className="text-[10px] text-[#141414]/60 ml-1">ĐIỂM</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Button: Next Round or Final Ranking */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0] text-center flex flex-col items-center">
          {!isLastRound ? (
            <button
              id="next-round-button"
              onClick={() => {
                sound.playStamp();
                onNextRound();
              }}
              className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md"
            >
              BẮT ĐẦU ROUND 0{round.roundNumber + 1} →
            </button>
          ) : (
            <button
              id="go-to-final-ranking-button"
              onClick={() => {
                sound.playFanfare();
                onGoToFinalRanking();
              }}
              className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md"
            >
              XEM KẾT QUẢ CHUNG CUỘC 5 ROUND 🏆 →
            </button>
          )}

          <TricolorBar className="w-24 mt-4" />
        </div>

      </div>
    </div>
  );
};

