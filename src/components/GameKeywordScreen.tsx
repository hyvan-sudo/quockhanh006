import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { RoundData, Player } from '../types';
import { sound } from '../utils/audio';
import { VietnamStar, StampSeal29, TricolorBar } from './DecorativeElements';

interface GameKeywordScreenProps {
  round: RoundData;
  totalRounds: number;
  userPlayer: Player;
  playersCount?: number;
  onProceedToAnswer: () => void;
}

export const GameKeywordScreen: React.FC<GameKeywordScreenProps> = ({
  round,
  totalRounds,
  userPlayer,
  playersCount = 5,
  onProceedToAnswer,
}) => {
  const [isRevealed, setIsRevealed] = useState(true);

  // Check if current user is the impostor for this round
  const isImpostor = round.impostorPlayerId === userPlayer.id;
  const userKeyword = isImpostor ? round.impostorWord : round.majorityWord;

  const handleToggleReveal = () => {
    sound.playTick(isRevealed ? 400 : 700);
    setIsRevealed(!isRevealed);
  };

  return (
    <div id="game-keyword-screen" className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Round Tracker Header */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase border border-[#141414]">
            ROUND 0{round.roundNumber} / 0{totalRounds}
          </span>
          <span className="font-mono text-xs text-[#141414]/70 uppercase hidden sm:inline tracking-wider">
            CHỦ ĐỀ: {round.topic}
          </span>
        </div>

        <StampSeal29 />
      </div>

      {/* Main Bento Card */}
      <div className="bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header */}
        <div className="p-6 sm:p-10 text-center bg-[#F2ECE0]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#C02026] block mb-2">
            MẬT LỆNH BẢO MẬT • GIAI ĐOẠN 01
          </span>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-[#141414] tracking-tight uppercase"
          >
            TỪ CỦA BẠN LÀ GÌ?
          </motion.h2>

          {round.question && (
            <div className="mt-3 p-2.5 bg-[#FAF6EE] border border-[#141414] max-w-lg mx-auto">
              <span className="text-[10px] font-mono font-bold uppercase text-[#C02026] block">
                CÂU HỎI CỦA ROUND NÀY:
              </span>
              <p className="font-serif-vintage italic text-[#141414] font-bold text-sm sm:text-base mt-0.5">
                "{round.question}"
              </p>
            </div>
          )}

          <p className="font-serif-vintage italic text-[#141414]/75 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Chỉ riêng bạn thấy từ khóa này. Hãy ghi nhớ để trả lời câu hỏi mà không lộ sơ hở!
          </p>
        </div>

        {/* Big Keyword Display Bento Cell */}
        <div className="p-8 sm:p-12 bg-[#FAF6EE] text-center">
          <div className="max-w-md mx-auto p-8 border border-[#141414] bg-[#F2ECE0] flex flex-col items-center justify-center min-h-[180px]">
            {/* Vietnam Gold Star */}
            <div className="mb-2">
              <VietnamStar size={36} color="#F9D64B" />
            </div>

            {/* Keyword or Hidden State */}
            {isRevealed ? (
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#141414]/60 mb-1">
                  TỪ KHÓA CỦA BẠN:
                </span>
                <div className="font-display font-black text-4xl sm:text-5xl text-[#C02026] tracking-wider uppercase select-all">
                  {userKeyword}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                <div className="font-mono text-2xl text-[#141414]/50 tracking-widest select-none">
                  ••••••••••••
                </div>
                <span className="font-mono text-xs text-[#141414]/60 mt-2">
                  (Đã ẩn để bảo mật mắt nhìn lén)
                </span>
              </div>
            )}

            {/* Eye Toggle Button */}
            <button
              id="toggle-secret-keyword-button"
              onClick={handleToggleReveal}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 border border-[#141414] bg-[#FAF6EE] text-xs font-mono font-bold text-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] transition-colors cursor-pointer"
            >
              {isRevealed ? (
                <>
                  <EyeOff size={12} />
                  <span>ẨN TỪ KHÓA</span>
                </>
              ) : (
                <>
                  <Eye size={12} />
                  <span>HIỆN TỪ KHÓA</span>
                </>
              )}
            </button>
          </div>

          {/* Role Notice Hint */}
          <div className="mt-6 p-3 bg-[#5A5A40]/10 border border-[#5A5A40]/30 max-w-md mx-auto text-xs font-mono text-[#141414]/80">
            💡 <span className="font-bold">Ghi nhớ:</span> Trong {playersCount} người chơi, có 1 người nhận được từ khóa khác biệt (Kẻ Khác Biệt). Hãy trả lời thật khéo léo để nhận diện đồng đội và bắt thóp kẻ nói dối!
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="p-6 bg-[#F2ECE0] text-center flex flex-col items-center">
          <button
            id="proceed-to-answer-button"
            onClick={() => {
              sound.playStamp();
              onProceedToAnswer();
            }}
            className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md cursor-pointer"
          >
            TIẾP TỤC ĐẾN LƯỢT TRẢ LỜI →
          </button>
          <TricolorBar className="w-24 mt-4" />
        </div>

      </div>
    </div>
  );
};


