import React from 'react';
import { motion } from 'motion/react';
import { Player } from '../types';
import { sound } from '../utils/audio';
import { VietnamStar, StampSeal29, TricolorBar } from './DecorativeElements';

interface FinalRankingScreenProps {
  players: Player[];
  onGoToGacha: () => void;
}

export const FinalRankingScreen: React.FC<FinalRankingScreenProps> = ({
  players,
  onGoToGacha,
}) => {
  // Separate hosts and non-host players
  const hostPlayer = players.find((p) => p.isHost);
  const nonHostPlayers = players.filter((p) => !p.isHost).sort((a, b) => b.score - a.score);
  
  // Champion among non-hosts gets 2 spins
  const gachaChampion = nonHostPlayers[0] || players[0];
  const allSortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div id="final-ranking-screen" className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <VietnamStar size={14} color="#C02026" />
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#141414]/70">
            CHUNG CUỘC ĐẠI HỘI QUỐC KHÁNH 2/9
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* Main Bento Container */}
      <div className="bg-[#FAF6EE] border-2 border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header */}
        <div className="p-6 sm:p-10 text-center bg-[#F2ECE0]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#C02026] block mb-2">
            VINH DANH QUÁN QUÂN GACHA
          </span>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-[#141414] tracking-tight uppercase"
          >
            KẾT QUẢ CHUNG CUỘC
          </motion.h2>

          <p className="font-serif-vintage italic text-[#141414]/70 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
            Chủ phòng (Host) làm màn hình quan sát và không tham gia quay. Người chơi có điểm cao nhất nhận 2 lượt quay!
          </p>
        </div>

        {/* Champion Golden Podium Bento Card (Top Non-Host) */}
        <div className="p-6 sm:p-10 bg-[#FAF6EE] text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto p-6 sm:p-8 bg-[#F2ECE0] border-2 border-[#C02026] flex flex-col items-center shadow-lg"
          >
            {/* Top Rank Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] border border-[#141414] mb-3">
              <VietnamStar size={12} color="#F9D64B" />
              <span>QUÁN QUÂN GACHA</span>
              <VietnamStar size={12} color="#F9D64B" />
            </div>

            <div className="font-mono font-black text-3xl text-[#C02026]">01</div>

            {/* Champion Name */}
            <div className="font-display font-black text-4xl sm:text-6xl text-[#141414] uppercase my-2 tracking-tight">
              {gachaChampion?.name || 'CHƯA CÓ'}
            </div>

            {/* Points Delta */}
            <div className="font-mono font-black text-xl sm:text-2xl text-[#C02026] mb-3">
              {gachaChampion?.score ?? 0} ĐIỂM
            </div>

            <div className="w-full border-t border-dashed border-[#141414]/20 my-2" />

            {/* Special Rewards Announcement */}
            <div className="space-y-1 font-serif-vintage italic text-[#141414] text-sm sm:text-base">
              <p className="font-bold">"Người chơi cao điểm nhất nhận phần thưởng đặc biệt:"</p>
              <div className="mt-2 inline-block px-4 py-1.5 bg-[#F9D64B] text-[#141414] border border-[#141414] font-mono text-sm font-black uppercase tracking-wider">
                🎁 2 LƯỢT QUAY GACHA
              </div>
            </div>
          </motion.div>
        </div>

        {/* Other Players Ranking Grid */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE]">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#141414]/70 font-bold mb-3">
              BẢNG TỔNG KẾT & PHÂN BỔ LƯỢT GACHA:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allSortedPlayers.map((p) => {
                const isHost = !!p.isHost;
                const isChampion = p.id === gachaChampion?.id && !isHost;
                const spinsCount = isHost ? 0 : isChampion ? 2 : 1;

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 border-2 ${
                      isChampion
                        ? 'border-[#C02026] bg-[#F2ECE0]'
                        : isHost
                        ? 'border-[#141414]/40 bg-[#EFE9DC]/60'
                        : 'border-[#141414] bg-[#FAF6EE]'
                    } flex items-center justify-between font-mono text-xs`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-[#141414]/60">
                        {isHost ? '★' : isChampion ? '🥇' : '•'}
                      </span>
                      <span className="font-display font-black text-sm uppercase text-[#141414] truncate">
                        {p.name}
                      </span>
                      {isHost ? (
                        <span className="px-1.5 py-0.5 bg-[#141414] text-[#FAF6EE] text-[8px] font-bold shrink-0">
                          HOST / QUAN SÁT
                        </span>
                      ) : p.isUser ? (
                        <span className="px-1.5 py-0.5 bg-[#C02026] text-white text-[8px] font-bold shrink-0">
                          BẠN
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-bold text-[#141414]">{p.score} Đ</span>
                      <span
                        className={`px-2 py-0.5 border border-[#141414] text-[10px] font-bold ${
                          isHost
                            ? 'bg-[#141414]/10 text-[#141414]/60'
                            : isChampion
                            ? 'bg-[#F9D64B] text-[#141414]'
                            : 'bg-[#E6DECE] text-[#141414]'
                        }`}
                      >
                        {isHost ? '0 lượt (Spectator)' : `${spinsCount} lượt quay`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA to Gacha Screen */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0] text-center flex flex-col items-center">
          <button
            id="proceed-to-gacha-button"
            onClick={() => {
              sound.playStamp();
              onGoToGacha();
            }}
            className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border-2 border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>BƯỚC VÀO VÒNG QUAY GACHA 2/9 🎡 →</span>
          </button>

          <TricolorBar className="w-24 mt-4" />
        </div>

      </div>
    </div>
  );
};
