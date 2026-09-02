import React from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';
import { TricolorBar } from './DecorativeElements';

interface LandingHeroProps {
  onStartGame: () => void;
  onGoToGachaDirect: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartGame, onGoToGachaDirect }) => {
  return (
    <div id="landing-hero" className="w-full flex-1 flex flex-col justify-between border-b border-[#141414] relative select-none">
      {/* Main 12-Column Bento Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 divide-y lg:divide-y-0 lg:divide-x divide-[#141414]">
        
        {/* Left Bento Box (4 cols): Editorial Title & Room Info */}
        <div className="lg:col-span-4 p-8 sm:p-10 flex flex-col justify-between bg-[#F2ECE0]">
          <div>
            <div className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase mb-4 text-[#141414]/70">
              Chương trình đặc biệt
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-7xl sm:text-8xl leading-[0.85] font-black italic tracking-tighter mb-6 text-[#141414]"
            >
              QUỐC<br />KHÁNH
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans text-sm leading-relaxed max-w-[240px] text-[#141414]/80"
            >
              Một trò chơi nhỏ.<br />
              Một chút nghi ngờ.<br />
              Một vòng quay may mắn.
            </motion.p>
          </div>

          <div className="space-y-6 mt-8 sm:mt-12">
            <div className="flex items-end gap-2">
              <div className="text-6xl sm:text-7xl font-black text-[#C02026] leading-none font-display">
                2/9
              </div>
              <div className="text-xs font-sans font-bold uppercase tracking-widest pb-1 text-[#141414]">
                Độc lập & Tự do
              </div>
            </div>

            <div className="border-t border-[#141414] pt-4">
              <div className="text-[10px] font-mono uppercase mb-2 text-[#141414]/70">
                Trạng thái phòng chơi
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#5A5A40] animate-ping" />
                <span className="text-sm font-sans font-medium italic text-[#141414]">
                  6 / 7 Người đã sẵn sàng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Bento Box (5 cols): Crimson Spotlight with Gold Wheel Centerpiece */}
        <div className="lg:col-span-5 bg-[#C02026] relative flex flex-col items-center justify-center p-8 sm:p-10 overflow-hidden min-h-[440px] lg:min-h-[560px]">
          {/* Subtle Diagonal Stripe Texture Overlay */}
          <div className="absolute inset-0 opacity-10 bento-stripes-red pointer-events-none" />

          {/* Wheel Graphic Circular Centerpiece */}
          <div className="relative w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] border border-[#F9D64B] rounded-full flex items-center justify-center my-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-[260px] sm:w-[340px] h-[260px] sm:h-[340px] rounded-full border-[10px] sm:border-[12px] border-[#F9D64B] bg-[#F2ECE0] relative flex items-center justify-center shadow-2xl"
            >
              {/* Quadrant dividing crosshair */}
              <div className="absolute inset-0 flex flex-wrap pointer-events-none">
                <div className="w-1/2 h-1/2 border-r border-b border-[#141414] opacity-20" />
                <div className="w-1/2 h-1/2 border-b border-[#141414] opacity-20" />
                <div className="w-1/2 h-1/2 border-r border-[#141414] opacity-20" />
              </div>

              {/* Center star & label */}
              <div className="text-center z-10">
                <div className="text-[50px] sm:text-[64px] font-black text-[#C02026] leading-none mb-1 mt-[-6px]">
                  ★
                </div>
                <div className="text-[10px] sm:text-xs font-sans font-black tracking-[0.5em] uppercase text-[#141414]">
                  Quay đi
                </div>
              </div>

              {/* Pointer Triangle */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3.5 w-4 h-8 bg-[#F9D64B]"
                style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
              />
            </motion.div>

            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-sans font-bold text-[#F9D64B] tracking-[0.3em] uppercase whitespace-nowrap">
              Vòng quay may mắn
            </div>
          </div>

          {/* Action CTAs inside Crimson Bento */}
          <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="landing-cta-start"
              onClick={() => {
                sound.playStamp();
                onStartGame();
              }}
              className="bg-[#F9D64B] text-[#141414] px-8 sm:px-10 py-3.5 text-xs font-sans font-black tracking-[0.3em] uppercase border border-[#141414] hover:bg-[#F2ECE0] active:translate-y-0.5 transition-all shadow-md"
            >
              Tham gia trò chơi →
            </button>

            <button
              id="landing-cta-gacha-direct"
              onClick={() => {
                sound.playTick(650);
                onGoToGachaDirect();
              }}
              className="bg-[#F2ECE0] text-[#141414] px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-wider border border-[#141414] hover:bg-[#F9D64B] transition-colors"
            >
              Vòng Quay Gacha 🎡
            </button>
          </div>
        </div>

        {/* Right Bento Box (3 cols): Player Roster & Current Achievement */}
        <div className="lg:col-span-3 flex flex-col divide-y divide-[#141414] bg-[#FAF6EE]">
          
          {/* Upper Bento Card: Player Roster in Olive (#5A5A40) */}
          <div className="p-6 sm:p-8 bg-[#5A5A40] text-[#F2ECE0] flex-1">
            <div className="text-[10px] font-mono uppercase mb-4 opacity-70 tracking-widest">
              Danh sách người chơi (7/7)
            </div>
            
            <div className="space-y-2.5 font-sans text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F2ECE0]/20">
                <span className="font-bold">01. Bạn (Tôi)</span>
                <span className="text-[10px] font-mono bg-[#F9D64B] text-[#141414] px-1.5 py-0.5 font-bold">CHỦ PHÒNG</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F2ECE0]/20">
                <span>02. Minh Triết</span>
                <span className="text-[10px] font-mono opacity-80">SẴN SÀNG</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F2ECE0]/20">
                <span>03. Bảo Trâm</span>
                <span className="text-[10px] font-mono opacity-80">SẴN SÀNG</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F2ECE0]/20">
                <span>04. Tuấn Hùng</span>
                <span className="text-[10px] font-mono opacity-80">SẴN SÀNG</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F2ECE0]/20">
                <span>05. Phương Linh</span>
                <span className="text-[10px] font-mono opacity-80">SẴN SÀNG</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F2ECE0]/20">
                <span>06. Hoàng Nam</span>
                <span className="text-[10px] font-mono opacity-80">SẴN SÀNG</span>
              </div>
              <div className="flex items-center justify-between">
                <span>07. Thùy Chi</span>
                <span className="text-[10px] font-mono opacity-80">SẴN SÀNG</span>
              </div>
            </div>
          </div>

          {/* Lower Bento Card: Current Role & Tricolor Bar */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-end bg-[#FAF6EE]">
            <div className="text-[10px] font-mono uppercase mb-2 text-[#141414]/70 tracking-widest">
              Thành tích hiện tại
            </div>
            
            <div className="text-3xl font-black italic font-display text-[#141414] tracking-tight">
              Kẻ Khác Biệt
            </div>

            <p className="text-xs font-serif-vintage italic text-[#141414]/70 mt-1 mb-4">
              5 Round suy luận từ khóa Quốc khánh 2/9.
            </p>

            {/* Bento Tricolor Indicator Bar */}
            <TricolorBar className="mt-2" />
          </div>

        </div>

      </div>

      {/* Bento Grid Bottom Road Strip */}
      <div className="h-10 border-t border-[#141414] bg-[#FAF6EE] flex items-center px-4 sm:px-10 justify-between text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#141414]/80">
        <div>Hệ thống Gacha Quốc Khánh © 2026</div>
        <div className="flex items-center gap-4 sm:gap-8">
          <span className="hidden sm:inline">Phát hành bởi: Lifestyle VN</span>
          <span className="font-bold text-[#C02026]">Phiên bản 2.9.1</span>
        </div>
      </div>
    </div>
  );
};

