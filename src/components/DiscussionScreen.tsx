import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, FastForward } from 'lucide-react';
import { Player, RoundData, RoomDiscussionState } from '../types';
import { sound } from '../utils/audio';
import { VietnamStar, StampSeal29, TricolorBar } from './DecorativeElements';
import { calculateRemainingDiscussionMs } from '../utils/roomSync';

interface DiscussionScreenProps {
  round: RoundData;
  totalRounds: number;
  players: Player[];
  userPlayer: Player;
  discussionState: RoomDiscussionState;
  onStartDiscussion: () => void;
  onEndDiscussion: () => void;
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({
  round,
  totalRounds,
  players,
  userPlayer,
  discussionState,
  onStartDiscussion,
  onEndDiscussion,
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    calculateRemainingDiscussionMs(discussionState)
  );
  const [isTimeUpOverlay, setIsTimeUpOverlay] = useState<boolean>(false);
  const lastTickedSecondRef = useRef<number>(-1);
  const hasEndedRef = useRef<boolean>(false);

  // Sync remaining time in real-time based on discussionStartedAt timestamp
  useEffect(() => {
    if (discussionState.phase !== 'discussion' || !discussionState.discussionStartedAt) {
      setRemainingMs(discussionState.discussionDuration);
      hasEndedRef.current = false;
      return;
    }

    const updateTimer = () => {
      const ms = calculateRemainingDiscussionMs(discussionState);
      setRemainingMs(ms);

      const currentSec = Math.ceil(ms / 1000);

      // Sound effects for ticks
      if (currentSec !== lastTickedSecondRef.current) {
        lastTickedSecondRef.current = currentSec;
        if (currentSec <= 10 && currentSec > 0) {
          sound.playTick(950, 0.04);
        } else if (currentSec === 30) {
          sound.playTick(600, 0.08);
        }
      }

      // When timer hits 0
      if (ms <= 0 && !hasEndedRef.current) {
        hasEndedRef.current = true;
        sound.playReveal();
        setIsTimeUpOverlay(true);

        // Show "HẾT GIỜ." for 1.4s then transition to Voting
        setTimeout(() => {
          onEndDiscussion();
        }, 1400);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [discussionState, onEndDiscussion]);

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isDiscussionActive = discussionState.phase === 'discussion';
  const progressRatio = isDiscussionActive
    ? Math.max(0, Math.min(1, remainingMs / discussionState.discussionDuration))
    : 1;

  // Pressure styling states
  const isUrgent = totalSeconds <= 10 && isDiscussionActive;
  const isPressure = totalSeconds <= 30 && totalSeconds > 10 && isDiscussionActive;

  return (
    <div id="discussion-screen" className="max-w-5xl mx-auto px-4 py-4 sm:py-8 relative">
      {/* Time's Up Dramatic Transition Overlay */}
      <AnimatePresence>
        {isTimeUpOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#FAF6EE]/95 flex flex-col items-center justify-center p-6 text-center border-8 border-[#C02026]"
          >
            <div className="inline-block px-4 py-1.5 bg-[#C02026] text-white font-mono text-xs font-bold uppercase tracking-[0.3em] mb-4 border border-[#141414]">
              THỜI KHẮC TRANH BIỆN KẾT THÚC
            </div>

            <h1 className="font-display font-black text-6xl sm:text-8xl text-[#C02026] uppercase tracking-tight mb-3">
              HẾT GIỜ.
            </h1>

            <p className="font-serif-vintage italic text-xl sm:text-2xl text-[#141414] font-bold max-w-md">
              Chuyển sang giai đoạn: Bỏ phiếu tìm Kẻ Khác Biệt...
            </p>

            <div className="mt-8 flex items-center gap-2">
              <span className="w-3 h-3 bg-[#C02026] rounded-full animate-ping" />
              <span className="font-mono text-xs text-[#141414]/70 tracking-widest uppercase">
                ĐANG MỞ HÒM PHIẾU
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Standard Navigation / Meta Bar */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase border border-[#141414]">
            ROUND 0{round.roundNumber} / 0{totalRounds}
          </span>
          <span className="font-mono text-xs text-[#141414]/70 uppercase hidden sm:inline tracking-wider">
            {isDiscussionActive ? 'GIAI ĐOẠN 04: ĐANG TRANH LUẬN' : 'GIAI ĐOẠN 03: ĐỐI CHIẾU MANH MỐI'}
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* STICKY REAL-TIME TIMER BAR (Always visible when scrolling) */}
      <div className="sticky top-0 z-30 mb-6 -mx-4 px-4 py-3 bg-[#FAF6EE]/95 backdrop-blur-md border-y border-[#141414] shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Label & Title */}
          <div className="flex items-center gap-3">
            {isDiscussionActive ? (
              <span className="flex items-center gap-2 px-2.5 py-1 bg-[#C02026] text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase border border-[#141414]">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ĐANG TRANH LUẬN
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-[#F2ECE0] text-[#141414] font-mono text-[11px] font-bold tracking-[0.2em] uppercase border border-[#141414]">
                CHỜ BẮT ĐẦU TRANH LUẬN
              </span>
            )}
            <span className="font-serif-vintage italic text-xs text-[#141414]/70 hidden md:inline">
              Đối chiếu 7 câu trả lời và tra hỏi người bị nghi ngờ
            </span>
          </div>

          {/* Center / Right Countdown Clock Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#141414]/60">
                THỜI GIAN:
              </span>
              <motion.div
                animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className={`font-display font-black text-3xl sm:text-4xl tracking-tight ${
                  isUrgent
                    ? 'text-[#C02026] animate-pulse'
                    : isPressure
                    ? 'text-[#C02026]'
                    : 'text-[#141414]'
                }`}
              >
                {formattedTime}
              </motion.div>
            </div>

            {/* Host End Early Button (Only shown during active discussion) */}
            {isDiscussionActive && (
              <button
                id="end-discussion-early-button"
                onClick={() => {
                  sound.playStamp();
                  onEndDiscussion();
                }}
                className="px-3 py-1.5 bg-[#141414] hover:bg-[#C02026] text-[#FAF6EE] font-mono text-[10px] font-bold uppercase tracking-[0.15em] border border-[#141414] transition-colors inline-flex items-center gap-1.5 shadow-sm"
                title="Chủ phòng có thể kết thúc thảo luận sớm để chuyển sang bỏ phiếu"
              >
                <span>KẾT THÚC TRANH LUẬN</span>
                <FastForward size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Minimal Progress Bar Underneath Sticky Header */}
        <div className="w-full bg-[#141414]/15 h-[3px] mt-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              isUrgent ? 'bg-[#C02026]' : isPressure ? 'bg-[#C02026]' : 'bg-[#141414]'
            }`}
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
      </div>

      {/* Main Bento Modular Container */}
      <div className="bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header Banner */}
        <div className="p-6 sm:p-8 text-center bg-[#F2ECE0]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#C02026] block mb-2">
            BẢN TIN MANH MỐI TOÀN BÀN CHƠI
          </span>

          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-[#141414] tracking-tight uppercase">
            AI ĐANG NÓI DỐI?
          </h2>

          {/* Question Box */}
          {round.question && (
            <div className="mt-3 p-3.5 bg-[#FAF6EE] border-2 border-[#141414] max-w-xl mx-auto shadow-sm">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C02026] block mb-0.5">
                ★ CÂU HỎI ROUND 0{round.roundNumber} ★
              </span>
              <p className="font-serif-vintage italic text-[#141414] font-bold text-base sm:text-lg">
                "{round.question}"
              </p>
            </div>
          )}

          <p className="font-serif-vintage italic text-[#141414]/80 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            {isDiscussionActive
              ? `Tất cả ${players.length} câu trả lời đang hiển thị bên dưới. Hãy đối chiếu, chất vấn và tìm ra điểm bất hợp lý!`
              : 'Đọc thật kỹ từng câu trả lời dưới đây trước khi Chủ phòng mở đồng hồ 2 phút tranh luận.'}
          </p>

          {/* Prominent CTA button BEFORE DISCUSSION STARTS */}
          {!isDiscussionActive && (
            <div className="mt-6">
              <button
                id="start-discussion-button"
                onClick={() => {
                  sound.playStamp();
                  onStartDiscussion();
                }}
                className="bg-[#C02026] text-white px-10 sm:px-14 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Play size={14} className="fill-current" />
                <span>BẮT ĐẦU TRANH LUẬN (02:00) →</span>
              </button>
              <p className="font-mono text-[11px] text-[#141414]/65 mt-2">
                Đồng hồ 2 phút sẽ bắt đầu chạy đồng bộ cho toàn bộ phòng khi bấm nút này.
              </p>
            </div>
          )}
        </div>

        {/* PLAYERS ANSWER CARDS GRID (Adapts dynamically to 2-8 players) */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {players.map((player, idx) => {
              const answer =
                player.answer || round.defaultAnswers[player.id] || 'Rất quen thuộc và gần gũi';

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className={`p-4 sm:p-5 border-2 ${
                    player.isUser
                      ? 'border-[#C02026] bg-[#F2ECE0] shadow-sm'
                      : 'border-[#141414] bg-[#FAF6EE]'
                  } flex flex-col justify-between`}
                >
                  {/* Card Header: Player Number & Name */}
                  <div className="flex items-center justify-between border-b border-[#141414]/15 pb-2 mb-3">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-xs font-bold text-[#C02026]">
                        {player.number || `0${idx + 1}`}
                      </span>
                      <span className="font-display font-black text-base uppercase text-[#141414] truncate">
                        {player.name}
                      </span>
                    </div>

                    {player.isUser ? (
                      <span className="px-1.5 py-0.5 bg-[#C02026] text-white font-mono text-[9px] uppercase font-bold shrink-0 ml-1">
                        BẠN
                      </span>
                    ) : player.isHost ? (
                      <span className="px-1.5 py-0.5 bg-[#141414] text-[#FAF6EE] font-mono text-[9px] uppercase font-bold shrink-0 ml-1">
                        CHỦ PHÒNG
                      </span>
                    ) : null}
                  </div>

                  {/* Player's Actual Answer Quote */}
                  <div className="min-h-[70px] flex items-center py-2">
                    <p className="font-serif-vintage text-base sm:text-lg font-bold text-[#141414] leading-snug italic">
                      "{answer}"
                    </p>
                  </div>

                  {/* Card Footer: Verification Stamp */}
                  <div className="mt-2 pt-2 border-t border-[#141414]/15 flex items-center justify-between font-mono text-[9px] text-[#141414]/60">
                    <span>MANH MỐI GHI NHẬN</span>
                    <VietnamStar size={10} color="#C02026" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner & Action Area */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0] text-center flex flex-col items-center">
          {isDiscussionActive ? (
            <div className="space-y-3">
              <div className="font-mono text-xs text-[#141414]/75 max-w-md mx-auto">
                ⚡ Hết 2 phút, hệ thống sẽ tự động chuyển tất cả người chơi sang màn hình bỏ phiếu bí mật.
              </div>

              {/* Host Quick Action Button */}
              <button
                id="end-discussion-bottom-button"
                onClick={() => {
                  sound.playStamp();
                  onEndDiscussion();
                }}
                className="bg-[#141414] hover:bg-[#C02026] text-[#FAF6EE] px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.15em] border border-[#141414] transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <span>CHỦ PHÒNG: KẾT THÚC TRANH LUẬN & BỎ PHIẾU NGAY</span>
                <FastForward size={14} />
              </button>
            </div>
          ) : (
            <div className="font-mono text-xs text-[#141414]/70">
              Nhấn nút <strong>BẮT ĐẦU TRANH LUẬN</strong> ở trên để bắt đầu tính giờ 2 phút.
            </div>
          )}

          <TricolorBar className="w-24 mt-4" />
        </div>

      </div>
    </div>
  );
};
