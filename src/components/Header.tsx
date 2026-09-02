import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Gift, RefreshCw, ChevronDown } from 'lucide-react';
import { GameStage } from '../types';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentStage: GameStage;
  onNavigate: (stage: GameStage) => void;
  onOpenRules: () => void;
  onOpenVouchers: () => void;
  voucherCount: number;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onNavigate,
  onOpenRules,
  onOpenVouchers,
  voucherCount,
  onResetGame,
}) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [showStageMenu, setShowStageMenu] = useState(false);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playTick(600);
  };

  const stagesList: { id: GameStage; label: string }[] = [
    { id: 'join', label: '01 Nhập Tên Tham Gia' },
    { id: 'lobby', label: '02 Sảnh Chờ (Lobby)' },
    { id: 'keyword_reveal', label: '03 Xem Từ Khóa' },
    { id: 'answer_input', label: '04 Nhập Câu Trả Lời' },
    { id: 'reveal_answers', label: '05 Danh Sách Câu Trả Lời' },
    { id: 'discussion', label: '06 Tranh Luận (Countdown 02:00)' },
    { id: 'voting', label: '07 Bỏ Phiếu Kẻ Khác Biệt' },
    { id: 'reveal_impostor', label: '08 Vạch Trần Kẻ Giả Mạo' },
    { id: 'scoreboard', label: '09 Bảng Điểm Round' },
    { id: 'final_ranking', label: '10 Chung Cuộc & Phần Thưởng' },
    { id: 'gacha', label: '11 Vòng Quay Gacha 2/9' },
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full bg-[#F2ECE0]/95 backdrop-blur-md border-b-2 border-[#141414] h-14 sm:h-16 flex items-center justify-between px-4 sm:px-8 md:px-10"
    >
      {/* Left: 02 / 09 / 2026 Date Stamp */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          id="nav-brand-button"
          onClick={() => {
            sound.playTick();
            onNavigate('join');
          }}
          className="text-xs sm:text-sm tracking-[0.2em] font-mono font-bold text-[#141414] hover:text-[#C02026] transition-colors cursor-pointer"
        >
          02 / 09 / 2026
        </button>

        {/* Stage quick jump menu */}
        <div className="relative hidden lg:block">
          <button
            id="stage-jump-button"
            onClick={() => setShowStageMenu(!showStageMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 border border-[#141414] text-[#141414] font-mono text-[10px] uppercase tracking-wider bg-[#FAF6EE] hover:bg-[#141414] hover:text-[#F2ECE0] transition-colors cursor-pointer"
          >
            <span>Màn: {stagesList.find((s) => s.id === currentStage)?.label.split(' ')[0]}</span>
            <ChevronDown size={10} className={`transition-transform ${showStageMenu ? 'rotate-180' : ''}`} />
          </button>

          {showStageMenu && (
            <div className="absolute left-0 mt-1 w-64 bg-[#FAF6EE] border-2 border-[#141414] shadow-2xl py-1 z-50 divide-y divide-[#141414]/15">
              <div className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#C02026] font-bold bg-[#E6DECE]">
                Phân đoạn sự kiện 2/9:
              </div>
              {stagesList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playTick();
                    onNavigate(item.id);
                    setShowStageMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 font-mono text-xs hover:bg-[#C02026] hover:text-[#FAF6EE] transition-colors flex items-center justify-between cursor-pointer ${
                    currentStage === item.id ? 'bg-[#C02026]/10 font-bold text-[#C02026]' : 'text-[#141414]'
                  }`}
                >
                  <span>{item.label}</span>
                  {currentStage === item.id && <span>●</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: GACHA QUỐC KHÁNH */}
      <div className="text-center">
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-sans font-black text-[#141414]">
          GACHA QUỐC KHÁNH 2/9
        </div>
      </div>

      {/* Right: Controls & VN Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Rules button */}
        <button
          id="open-rules-button"
          onClick={() => {
            sound.playTick(500);
            onOpenRules();
          }}
          title="Luật chơi & Thể lệ"
          className="px-2.5 py-1 border border-[#141414] bg-[#FAF6EE] hover:bg-[#141414] hover:text-[#FAF6EE] text-[#141414] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <BookOpen size={12} />
          <span className="hidden sm:inline">LUẬT CHƠI</span>
        </button>

        {/* Voucher Wallet / Rewards counter */}
        <button
          id="open-vouchers-button"
          onClick={() => {
            sound.playTick(500);
            onOpenVouchers();
          }}
          title="Tủ quà & Voucher"
          className="px-2.5 py-1 border border-[#C02026] bg-[#C02026]/10 hover:bg-[#C02026] hover:text-white text-[#C02026] text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Gift size={12} />
          <span className="hidden sm:inline">TỦ QUÀ</span>
          {voucherCount > 0 && (
            <span className="w-4 h-4 bg-[#C02026] text-white text-[9px] flex items-center justify-center font-mono font-bold">
              {voucherCount}
            </span>
          )}
        </button>

        {/* Sound Mute Button */}
        <button
          id="toggle-sound-button"
          onClick={handleToggleSound}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="p-1.5 border border-[#141414] bg-[#FAF6EE] text-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX size={13} className="text-[#C02026]" /> : <Volume2 size={13} />}
        </button>

        {/* Red VN Square */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#141414]/30">
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[#C02026] border border-[#141414] flex items-center justify-center text-white text-[10px] font-mono font-black select-none">
            VN
          </div>
        </div>
      </div>
    </header>
  );
};
