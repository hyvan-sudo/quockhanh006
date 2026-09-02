import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, User, Users } from 'lucide-react';
import { sound } from '../utils/audio';
import { VietnamStar, StampSeal29, TricolorBar } from './DecorativeElements';

interface JoinScreenProps {
  onJoinGame: (name: string) => void;
  playerCount: number;
  maxPlayers?: number;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({ onJoinGame, playerCount, maxPlayers = 8 }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const isFull = playerCount >= maxPlayers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) {
      setError(`Phòng đã đầy (${maxPlayers}/${maxPlayers} người). Không thể tham gia.`);
      return;
    }
    const cleanName = name.trim().toUpperCase();
    if (!cleanName) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }
    if (cleanName.length > 15) {
      setError('Tên tối đa 15 ký tự');
      return;
    }
    setError('');
    sound.playStamp();
    onJoinGame(cleanName);
  };


  return (
    <div id="join-screen" className="min-h-[82vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-[#FAF6EE] border-2 border-[#141414] shadow-2xl divide-y divide-[#141414] relative overflow-hidden"
      >
        {/* Top Decorative Header */}
        <div className="bg-[#C02026] text-[#FAF6EE] p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Subtle stripe background */}
          <div className="absolute inset-0 opacity-10 bento-stripes-red pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF6EE] text-[#141414] border border-[#141414] font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              <VietnamStar size={12} color="#C02026" />
              <span>SỰ KIỆN QUỐC KHÁNH 2/9</span>
              <VietnamStar size={12} color="#C02026" />
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl text-[#FAF6EE] tracking-tight uppercase leading-none mb-2">
              QUỐC KHÁNH 2/9
            </h1>

            <p className="font-serif-vintage italic text-sm sm:text-base text-[#FAF6EE]/90">
              Trò chơi suy luận & Vòng quay Gacha may mắn
            </p>
          </div>
        </div>

        {/* Mid Prompt Section */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0]">
          <div className="text-center mb-6">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#C02026] mb-1">
              CHỈ CẦN 1 BƯỚC ĐỂ BẮT ĐẦU
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#141414] uppercase">
              Nhập tên để tham gia
            </h2>
            <p className="font-sans text-xs text-[#141414]/70 mt-1">
              Tất cả người chơi sẽ cùng kết nối vào phòng game trực tiếp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="player-name-input"
                className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414] mb-2"
              >
                TÊN CỦA BẠN:
              </label>
              <div className="relative">
                <input
                  id="player-name-input"
                  type="text"
                  autoFocus
                  maxLength={15}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="VÍ DỤ: MINH TRIẾT"
                  className="w-full bg-[#FAF6EE] border-2 border-[#141414] px-4 py-3.5 pl-11 font-mono text-base font-bold uppercase tracking-wider text-[#141414] placeholder:text-[#141414]/30 focus:outline-none focus:border-[#C02026] focus:ring-1 focus:ring-[#C02026] transition-all"
                />
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#141414]/50 pointer-events-none"
                />
              </div>
              {error && (
                <p className="text-xs font-mono font-bold text-[#C02026] mt-1.5 flex items-center gap-1">
                  ⚠ {error}
                </p>
              )}
            </div>

            {isFull ? (
              <div className="p-4 bg-[#C02026]/10 border-2 border-[#C02026] text-center">
                <span className="font-mono font-black text-sm uppercase text-[#C02026] block">
                  PHÒNG ĐÃ ĐẦY — {maxPlayers} / {maxPlayers}
                </span>
                <span className="font-sans text-xs text-[#141414]/70 mt-1 block">
                  Phòng hiện đã đạt số lượng tối đa. Vui lòng chờ ván sau hoặc liên hệ chủ phòng.
                </span>
              </div>
            ) : (
              <button
                id="join-submit-button"
                type="submit"
                className="w-full bg-[#C02026] text-[#FAF6EE] py-4 px-6 font-mono text-sm sm:text-base font-bold uppercase tracking-[0.2em] border-2 border-[#141414] hover:bg-[#141414] active:translate-y-0.5 transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>THAM GIA →</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            )}
          </form>
        </div>

        {/* Bottom Status Info Strip */}
        <div className="p-4 sm:p-5 bg-[#FAF6EE] flex items-center justify-between font-mono text-xs text-[#141414]/75">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#C02026]" />
            <span>Phòng game: <strong>{playerCount}/{maxPlayers} người</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-[#C02026]' : 'bg-emerald-600'} animate-pulse`} />
            <span className="font-bold text-[#141414]">
              {isFull ? 'Phòng đã đủ người' : 'Sẵn sàng kết nối'}
            </span>
          </div>
        </div>

        {/* Tricolor Accent Bar */}
        <TricolorBar />
      </motion.div>
    </div>
  );
};
