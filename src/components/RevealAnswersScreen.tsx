import React from 'react';
import { motion } from 'motion/react';
import { Player, RoundData } from '../types';
import { sound } from '../utils/audio';
import { VietnamStar, StampSeal29, TricolorBar } from './DecorativeElements';

interface RevealAnswersScreenProps {
  round: RoundData;
  totalRounds: number;
  players: Player[];
  onStartDiscussion: () => void;
}

export const RevealAnswersScreen: React.FC<RevealAnswersScreenProps> = ({
  round,
  totalRounds,
  players,
  onStartDiscussion,
}) => {
  return (
    <div id="reveal-answers-screen" className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase border border-[#141414]">
            ROUND 0{round.roundNumber} / 0{totalRounds}
          </span>
          <span className="font-mono text-xs text-[#141414]/70 uppercase hidden sm:inline tracking-wider">
            GIAI ĐOẠN 03: ĐỐI CHIẾU MANH MỐI
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* Main Bento Container */}
      <div className="bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header */}
        <div className="p-6 sm:p-10 text-center bg-[#F2ECE0]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#C02026] block mb-2">
            BẢN TIN MANH MỐI TOÀN BÀN CHƠI
          </span>

          <motion.h2
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-[#141414] tracking-tight uppercase"
          >
            AI ĐANG NÓI DỐI?
          </motion.h2>

          <p className="font-serif-vintage italic text-[#141414]/75 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Đọc thật kỹ từng câu trả lời dưới đây. Có một câu nói bắt nguồn từ một từ khóa hoàn toàn khác!
          </p>
        </div>

        {/* Bento Grid of 7 Answer Cards */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {players.map((player, idx) => {
              const answer = player.answer || round.defaultAnswers[player.id] || 'Đất nước tự hào';

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className={`p-4 sm:p-5 border ${
                    player.isUser
                      ? 'border-[#C02026] bg-[#F2ECE0]'
                      : 'border-[#141414] bg-[#FAF6EE]'
                  } flex flex-col justify-between`}
                >
                  {/* Card Top Label */}
                  <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C02026]">{player.number}</span>
                      <span className="font-display font-black text-sm uppercase text-[#141414]">{player.name}</span>
                    </div>
                    {player.isUser && (
                      <span className="px-1.5 py-0.5 bg-[#C02026] text-white font-mono text-[9px] uppercase font-bold">
                        BẠN
                      </span>
                    )}
                  </div>

                  {/* The Answer Quote */}
                  <div className="min-h-[64px] flex items-center py-2">
                    <p className="font-serif-vintage text-base sm:text-lg font-bold text-[#141414] leading-snug italic">
                      "{answer}"
                    </p>
                  </div>

                  {/* Bottom Meta */}
                  <div className="mt-2 pt-2 border-t border-[#141414]/15 flex items-center justify-between font-mono text-[9px] text-[#141414]/60">
                    <span>ĐÃ XÁC THỰC</span>
                    <VietnamStar size={10} color="#C02026" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Strip to Start Discussion */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0] text-center flex flex-col items-center">
          <button
            id="start-discussion-button"
            onClick={() => {
              sound.playStamp();
              onStartDiscussion();
            }}
            className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md"
          >
            BẮT ĐẦU TRANH BIỆN (60S) →
          </button>
          <TricolorBar className="w-24 mt-4" />
        </div>

      </div>
    </div>
  );
};

