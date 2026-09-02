import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Player, RoundData } from '../types';
import { sound } from '../utils/audio';
import { StampSeal29, TricolorBar } from './DecorativeElements';

interface VotingScreenProps {
  round: RoundData;
  totalRounds: number;
  players: Player[];
  userPlayer: Player;
  onCastVote: (targetPlayerId: string) => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  round,
  totalRounds,
  players,
  userPlayer,
  onCastVote,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectPlayer = (id: string) => {
    if (id === userPlayer.id) return; // Cannot vote for oneself
    sound.playTick(750);
    setSelectedId(id);
  };

  const handleConfirmVote = () => {
    if (!selectedId) return;
    sound.playStamp();
    onCastVote(selectedId);
  };

  return (
    <div id="voting-screen" className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase border border-[#141414]">
            ROUND 0{round.roundNumber} / 0{totalRounds}
          </span>
          <span className="font-mono text-xs text-[#141414]/70 uppercase hidden sm:inline tracking-wider">
            GIAI ĐOẠN 05: BỎ PHIẾU BÍ MẬT
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* Main Bento Container */}
      <div className="bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header */}
        <div className="p-6 sm:p-10 text-center bg-[#F2ECE0]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#C02026] block mb-2">
            THỜI KHẮC PHÁN XÉT
          </span>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-3xl sm:text-5xl text-[#141414] tracking-tight uppercase"
          >
            AI LÀ KẺ KHÁC BIỆT?
          </motion.h2>

          {round.question && (
            <div className="mt-3 p-3 bg-[#FAF6EE] border-2 border-[#141414] max-w-xl mx-auto shadow-sm">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C02026] block mb-0.5">
                ★ CÂU HỎI ROUND 0{round.roundNumber} ★
              </span>
              <p className="font-serif-vintage italic text-[#141414] font-bold text-sm sm:text-base">
                "{round.question}"
              </p>
            </div>
          )}

          <p className="font-serif-vintage italic text-sm sm:text-base text-[#141414]/75 mt-3 max-w-md mx-auto">
            Chọn 1 người chơi bạn nghi ngờ nhất. Bạn không được tự bình chọn cho chính mình.
          </p>
        </div>

        {/* Player Bento Cards Grid (2 to 8 players) */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {players.map((p, idx) => {
              const isSelf = p.id === userPlayer.id;
              const isSelected = selectedId === p.id;
              const playerAnswer = p.answer || round.defaultAnswers[p.id] || 'Rất quen thuộc';

              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={isSelf}
                  onClick={() => handleSelectPlayer(p.id)}
                  className={`p-4 sm:p-5 text-left border-2 transition-all cursor-pointer ${
                    isSelf
                      ? 'border-[#141414]/20 bg-[#F2ECE0]/50 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'border-[#C02026] bg-[#F2ECE0] ring-1 ring-[#C02026] shadow-sm'
                      : 'border-[#141414] bg-[#FAF6EE] hover:border-[#C02026]'
                  }`}
                >
                  {/* Header Number and Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#141414]/60">
                      {p.number || `0${idx + 1}`}
                    </span>
                    {isSelf ? (
                      <span className="text-[9px] font-mono text-[#141414]/60 font-bold">(BẠN)</span>
                    ) : isSelected ? (
                      <div className="w-5 h-5 bg-[#C02026] text-white flex items-center justify-center font-bold">
                        <Check size={12} />
                      </div>
                    ) : null}
                  </div>

                  {/* Player Name */}
                  <div className="font-display font-black text-xl sm:text-2xl text-[#141414] my-2 tracking-tight truncate">
                    {p.name}
                  </div>

                  {/* Player's quote summary snippet */}
                  <div className="text-xs font-serif-vintage italic text-[#141414]/70 line-clamp-2 border-t border-[#141414]/15 pt-1.5 mt-1">
                    "{playerAnswer}"
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Vote CTA Strip */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0] text-center flex flex-col items-center">
          {selectedId ? (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <button
                id="confirm-vote-button"
                onClick={handleConfirmVote}
                className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>CHỐT BÌNH CHỌN ✓</span>
              </button>
              <p className="font-mono text-[11px] text-[#141414]/70 mt-2">
                Kết quả bình chọn của toàn bộ người chơi sẽ được công bố đồng thời.
              </p>
            </motion.div>
          ) : (
            <div className="font-mono text-xs text-[#141414]/60 py-2">
              Vui lòng nhấp chọn 1 người chơi ở trên để mở nút CHỐT BÌNH CHỌN
            </div>
          )}

          <TricolorBar className="w-24 mt-4" />
        </div>

      </div>
    </div>
  );
};

