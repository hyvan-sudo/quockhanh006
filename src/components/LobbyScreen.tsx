import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Users, Crown, CheckCircle2, Clock, AlertTriangle, X, Check } from 'lucide-react';
import { Player } from '../types';
import { sound } from '../utils/audio';
import { StampSeal29, TricolorBar, VietnamStar } from './DecorativeElements';

interface LobbyScreenProps {
  players: Player[];
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot?: (id: string) => void;
  onToggleReady: () => void;
  onUpdateUserName: (name: string) => void;
  userName: string;
  isHost: boolean;
  currentUserPlayer?: Player;
  maxPlayers?: number;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  players,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onToggleReady,
  onUpdateUserName,
  userName,
  isHost,
  currentUserPlayer,
  maxPlayers = 8,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [showUnreadyModal, setShowUnreadyModal] = useState(false);

  const isUserReady = currentUserPlayer?.isReady ?? true;
  const unreadyPlayers = players.filter((p) => !p.isReady);
  const isAllReady = unreadyPlayers.length === 0;
  const canStart = players.length >= 2;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim().toUpperCase());
      setIsEditingName(false);
      sound.playStamp();
    }
  };

  const handleHostClickStart = () => {
    sound.playStamp();
    if (!canStart) return;

    if (isAllReady) {
      onStartGame();
    } else {
      setShowUnreadyModal(true);
    }
  };

  const handleConfirmStartAnyway = () => {
    sound.playStamp();
    setShowUnreadyModal(false);
    onStartGame();
  };

  return (
    <div id="lobby-screen" className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Bar with Tracking */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-[#141414]/70">
            SẢNH CHỜ TRỰC TIẾP
          </span>
          <span className="text-xs font-mono text-[#C02026] font-bold">
            ● NGƯỜI CHƠI — {players.length} / {maxPlayers}
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* Main Bento Modular Container */}
      <div className="bg-[#FAF6EE] border-2 border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header Banner */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#F2ECE0]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C02026] font-bold mb-1">
              SỰ KIỆN SUY LUẬN QUỐC KHÁNH 2/9
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#141414] tracking-tight uppercase">
              AI SẼ LÀ KẺ KHÁC BIỆT?
            </h2>
            <p className="font-serif-vintage italic text-sm sm:text-base text-[#141414]/75 mt-1">
              "Hãy sẵn sàng và giữ bí mật từ khóa của bạn. Nghi ngờ tất cả mọi người."
            </p>
          </div>

          {/* Room Status Widget */}
          <div className="w-full md:w-auto p-4 sm:p-5 border-2 border-[#141414] bg-[#FAF6EE] text-left shrink-0 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <VietnamStar size={12} color="#C02026" />
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#141414]/80 uppercase font-bold">
                TRẠNG THÁI PHÒNG
              </span>
            </div>
            <div className="font-mono font-black text-lg sm:text-2xl text-[#C02026]">
              {players.length >= maxPlayers ? `PHÒNG ĐÃ ĐẦY — ${players.length} / ${maxPlayers}` : `NGƯỜI CHƠI — ${players.length} / ${maxPlayers}`}
            </div>
            <div className="text-[11px] font-mono text-[#141414]/80 mt-1 flex items-center gap-1.5">
              {isHost ? (
                <span className="text-[#C02026] font-bold flex items-center gap-1">
                  <Crown size={12} /> BẠN LÀ CHỦ PHÒNG
                </span>
              ) : (
                <span className="text-[#141414]/70">● ĐANG ĐỢI CHỦ PHÒNG BẮT ĐẦU</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls Strip: Ready Button & Add Player */}
        <div className="p-4 sm:px-8 bg-[#5A5A40] text-[#F2ECE0] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Left: Ready count & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span className="font-bold tracking-wider">
                {players.filter((p) => p.isReady).length} / {players.length} ĐÃ SẴN SÀNG
              </span>
            </div>
            {players.length < 2 && (
              <span className="text-[#F9D64B] text-[10px] hidden sm:inline">
                (Cần tối thiểu 2 người để bắt đầu)
              </span>
            )}
          </div>

          {/* Right Action: User's Ready Toggle & Add Bot */}
          <div className="flex items-center gap-2">
            {/* User Ready Toggle Button */}
            <button
              id="lobby-ready-button"
              onClick={() => {
                sound.playTick(600);
                onToggleReady();
              }}
              className={`px-3.5 py-1.5 font-mono font-bold text-xs uppercase tracking-wider border border-[#141414] flex items-center gap-1.5 transition-all cursor-pointer ${
                isUserReady
                  ? 'bg-[#F9D64B] text-[#141414] hover:bg-[#FAF6EE]'
                  : 'bg-[#C02026] text-white hover:bg-[#141414]'
              }`}
            >
              {isUserReady ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>✓ BẠN ĐÃ SẴN SÀNG (HỦY)</span>
                </>
              ) : (
                <>
                  <Clock size={13} />
                  <span>BẤM ĐỂ SẴN SÀNG</span>
                </>
              )}
            </button>

            {/* Add Bot button if room is not full */}
            {players.length < maxPlayers && (
              <button
                id="add-bot-button"
                onClick={() => {
                  sound.playTick(750);
                  onAddBot();
                }}
                className="px-2.5 py-1.5 bg-[#FAF6EE] text-[#141414] font-bold text-[10px] uppercase tracking-wider border border-[#141414] flex items-center gap-1 hover:bg-[#F2ECE0] transition-colors cursor-pointer"
              >
                <UserPlus size={12} />
                <span className="hidden sm:inline">+ Thêm người ({maxPlayers - players.length} chỗ)</span>
                <span className="sm:hidden">+ Thêm</span>
              </button>
            )}
          </div>
        </div>

        {/* Responsive Player Cards Grid (2 to 8 players) */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence>
              {players.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className={`p-4 border-2 ${
                    p.isUser
                      ? 'border-[#C02026] bg-[#F2ECE0]'
                      : 'border-[#141414] bg-[#FAF6EE]'
                  } flex flex-col justify-between shadow-xs relative`}
                >
                  {/* Card Top: Number, Badges & Remove */}
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold text-[#141414]/60">
                      {p.number || `0${idx + 1}`}
                    </span>

                    <div className="flex items-center gap-1">
                      {p.isHost && (
                        <span className="px-2 py-0.5 bg-[#C02026] text-white text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <Crown size={10} />
                          CHỦ PHÒNG
                        </span>
                      )}
                      {p.isUser && !p.isHost && (
                        <span className="px-2 py-0.5 bg-[#5A5A40] text-[#F2ECE0] text-[9px] font-mono font-bold uppercase tracking-wider">
                          BẠN
                        </span>
                      )}
                      {!p.isUser && onRemoveBot && players.length > 2 && (
                        <button
                          onClick={() => onRemoveBot(p.id)}
                          title="Xóa người chơi này"
                          className="text-[#141414]/40 hover:text-[#C02026] p-0.5 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Center: Player Name */}
                  <div className="my-3 flex items-center justify-between">
                    <div className="font-display font-black text-xl sm:text-2xl text-[#141414] tracking-tight uppercase truncate">
                      {p.name}
                    </div>

                    {p.isUser && (
                      <button
                        onClick={() => setIsEditingName(!isEditingName)}
                        className="text-[10px] font-mono text-[#C02026] hover:underline font-bold cursor-pointer shrink-0 ml-1"
                      >
                        [Đổi tên]
                      </button>
                    )}
                  </div>

                  {/* Card Bottom: Ready Status Badge */}
                  <div className="pt-2 border-t border-[#141414]/15 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#141414]/60 uppercase">TRẠNG THÁI:</span>
                    {p.isReady ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-800 text-white font-bold uppercase text-[9px]">
                        <Check size={10} /> SẴN SÀNG
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#141414]/10 text-[#141414]/70 font-bold uppercase text-[9px]">
                        ● ĐANG CHỜ
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Edit User Name Form */}
          {isEditingName && (
            <form onSubmit={handleSaveName} className="mt-6 p-4 bg-[#F2ECE0] border-2 border-[#C02026] flex flex-wrap gap-3 items-center">
              <span className="font-mono text-xs text-[#141414] font-bold">Tên của bạn:</span>
              <input
                type="text"
                maxLength={15}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF6EE] border border-[#141414] font-mono text-sm uppercase focus:outline-none focus:ring-1 focus:ring-[#C02026]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C02026] text-white font-mono text-xs font-bold uppercase border border-[#141414] hover:bg-[#141414] transition-colors cursor-pointer"
              >
                LƯU TÊN
              </button>
            </form>
          )}
        </div>

        {/* Bottom Host Start Game CTA */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0] text-center flex flex-col items-center">
          {isHost ? (
            <div className="flex flex-col items-center">
              <button
                id="lobby-start-button"
                disabled={!canStart}
                onClick={handleHostClickStart}
                className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-sm sm:text-base font-bold uppercase tracking-[0.2em] border-2 border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md inline-flex items-center gap-3 cursor-pointer"
              >
                <span>BẮT ĐẦU TRÒ CHƠI →</span>
              </button>

              {!canStart && (
                <p className="text-xs font-mono text-[#C02026] font-bold mt-2">
                  ⚠ Cần ít nhất 2 người chơi trong phòng để bắt đầu
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-[#FAF6EE] border-2 border-[#141414] max-w-md w-full">
              <div className="flex items-center justify-center gap-2 font-mono text-xs text-[#C02026] font-bold uppercase mb-1">
                <Clock size={14} className="animate-spin" />
                <span>CHỜ CHỦ PHÒNG BẮT ĐẦU...</span>
              </div>
              <p className="font-serif-vintage italic text-xs text-[#141414]/70">
                Hãy nhấn nút "SẴN SÀNG" phía trên để chủ phòng biết bạn đã sẵn sàng nhập cuộc.
              </p>
            </div>
          )}

          <p className="mt-3 font-mono text-[11px] text-[#141414]/70 max-w-md">
            Mỗi trận gồm 5 Round suy luận kịch tính. Quán quân (Hạng Nhất) nhận 2 lượt quay Gacha 2/9, tất cả người chơi còn lại nhận 1 lượt quay!
          </p>

          <TricolorBar className="w-32 mt-4" />
        </div>

      </div>

      {/* Confirmation Modal when some players are unready */}
      <AnimatePresence>
        {showUnreadyModal && (
          <div className="fixed inset-0 bg-[#141414]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#FAF6EE] border-2 border-[#141414] shadow-2xl divide-y divide-[#141414] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 bg-[#F2ECE0] flex items-center gap-3">
                <AlertTriangle size={22} className="text-[#C02026] shrink-0" />
                <div>
                  <h3 className="font-display font-black text-lg text-[#141414] uppercase">
                    CÓ NGƯỜI CHƠI CHƯA SẴN SÀNG
                  </h3>
                  <p className="font-mono text-[10px] text-[#141414]/70 uppercase">
                    {unreadyPlayers.length} / {players.length} người đang ở trạng thái chờ
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 bg-[#FAF6EE] space-y-3">
                <p className="font-serif-vintage italic text-sm text-[#141414]">
                  Các người chơi sau đây chưa nhấn nút SẴN SÀNG:
                </p>

                <div className="p-3 bg-[#F2ECE0] border border-[#141414] space-y-1.5 max-h-40 overflow-y-auto font-mono text-xs">
                  {unreadyPlayers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="font-bold text-[#141414]">
                        {p.number} — {p.name}
                      </span>
                      <span className="text-[10px] text-[#C02026] font-bold">
                        ● ĐANG CHỜ
                      </span>
                    </div>
                  ))}
                </div>

                <p className="font-sans text-xs text-[#141414]/70">
                  Bạn có muốn tiếp tục bắt đầu trò chơi ngay bây giờ không?
                </p>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-[#F2ECE0] flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowUnreadyModal(false)}
                  className="px-4 py-2 bg-[#FAF6EE] text-[#141414] font-mono text-xs font-bold uppercase border border-[#141414] hover:bg-[#E6DECE] transition-colors cursor-pointer"
                >
                  QUAY LẠI
                </button>
                <button
                  onClick={handleConfirmStartAnyway}
                  className="px-5 py-2 bg-[#C02026] text-white font-mono text-xs font-bold uppercase border border-[#141414] hover:bg-[#141414] transition-colors shadow-sm cursor-pointer"
                >
                  VẪN BẮT ĐẦU →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

