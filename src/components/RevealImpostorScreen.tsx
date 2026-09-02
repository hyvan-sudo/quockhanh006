import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import { Player, RoundData } from '../types';
import { sound } from '../utils/audio';
import { VietnamStar, StampSeal29, TricolorBar } from './DecorativeElements';

interface RevealImpostorScreenProps {
  round: RoundData;
  totalRounds: number;
  players: Player[];
  impostorPlayer: Player;
  onProceedToScoreboard: () => void;
}

export const RevealImpostorScreen: React.FC<RevealImpostorScreenProps> = ({
  round,
  totalRounds,
  players,
  impostorPlayer,
  onProceedToScoreboard,
}) => {
  const [phase, setPhase] = useState<'suspense' | 'revealed'>('suspense');

  useEffect(() => {
    sound.playSuspenseDrums();
    const timer = setTimeout(() => {
      sound.playReveal();
      setPhase('revealed');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="reveal-impostor-screen" className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase border border-[#141414]">
            ROUND 0{round.roundNumber} / 0{totalRounds}
          </span>
          <span className="font-mono text-xs text-[#141414]/70 uppercase hidden sm:inline tracking-wider">
            GIAI ĐOẠN 06: CÔNG BỐ KẾT QUẢ
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* Main Bento Container */}
      <div className="bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414] min-h-[460px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          {phase === 'suspense' ? (
            /* Phase 1: Suspense Pause */
            <motion.div
              key="suspense"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="my-auto text-center p-12 sm:p-20"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C02026] font-bold block mb-3 animate-pulse">
                ĐANG TỔNG HỢP TOÀN BỘ PHIẾU BẦU...
              </span>

              <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-[#141414] tracking-tight uppercase">
                VÀ KẺ KHÁC BIỆT LÀ...
              </h2>

              <div className="mt-8 flex justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C02026] animate-ping" />
              </div>
            </motion.div>
          ) : (
            /* Phase 2: Bento Reveal Presentation */
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col flex-1 divide-y divide-[#141414]"
            >
              {/* Header Cell */}
              <div className="p-6 sm:p-10 text-center bg-[#F2ECE0]">
                <div className="inline-block px-3 py-1 bg-[#C02026] text-white font-mono text-[10px] font-bold uppercase tracking-[0.2em] border border-[#141414] mb-3">
                  ★ KẺ KHÁC BIỆT (IMPOSTOR) ★
                </div>

                <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl text-[#C02026] tracking-tight uppercase leading-none my-2">
                  {impostorPlayer.name}
                </div>

                <span className="font-mono text-xs text-[#141414]/70">
                  (NGƯỜI CHƠI SỐ {impostorPlayer.number})
                </span>
              </div>

              {/* Side-by-Side Word Comparison Bento Cells */}
              <div className="p-6 sm:p-10 bg-[#FAF6EE]">
                <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Majority Word Bento Card */}
                  <div className="p-5 bg-[#F2ECE0] border border-[#141414]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#141414]/70 uppercase font-bold border-b border-[#141414]/15 pb-1 mb-2">
                      <span>PHE THƯỜNG ({Math.max(1, (players?.length || 7) - 1)} NGƯỜI)</span>
                      <VietnamStar size={12} color="#C02026" />
                    </div>
                    <div className="font-display font-black text-2xl sm:text-3xl text-[#141414] uppercase tracking-wide">
                      {round.majorityWord}
                    </div>
                    <p className="font-serif-vintage italic text-xs text-[#141414]/70 mt-1">
                      Đã suy luận & bảo vệ từ khóa chính xác
                    </p>
                  </div>

                  {/* Impostor Word Bento Card */}
                  <div className="p-5 bg-[#F2ECE0] border border-[#C02026]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#C02026] uppercase font-bold border-b border-[#C02026]/20 pb-1 mb-2">
                      <span>KẺ KHÁC BIỆT (1 NGƯỜI)</span>
                      <ShieldAlert size={12} className="text-[#C02026]" />
                    </div>
                    <div className="font-display font-black text-2xl sm:text-3xl text-[#C02026] uppercase tracking-wide">
                      {round.impostorWord}
                    </div>
                    <p className="font-serif-vintage italic text-xs text-[#141414]/70 mt-1">
                      Nhận từ khóa bí mật tương cận
                    </p>
                  </div>
                </div>
              </div>

              {/* Action to Scoreboard */}
              <div className="p-6 sm:p-8 bg-[#F2ECE0] text-center flex flex-col items-center">
                <button
                  id="proceed-to-scoreboard-button"
                  onClick={() => {
                    sound.playStamp();
                    onProceedToScoreboard();
                  }}
                  className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md"
                >
                  XEM BẢNG ĐIỂM ROUND 0{round.roundNumber} →
                </button>
                <TricolorBar className="w-24 mt-4" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

