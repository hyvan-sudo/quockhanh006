import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Crown, Gift, Sparkles, Check, Copy, ArrowLeft, Users, Play, SkipForward } from 'lucide-react';
import { Player, GachaItem, RoomGachaState, WonReward, GachaSpinEvent } from '../types';
import { GACHA_ITEMS } from '../data/gameData';
import { sound } from '../utils/audio';
import { VietnamStar, TricolorBar, StampSeal29 } from './DecorativeElements';

interface HostSpectatorScreenProps {
  players: Player[];
  userPlayer: Player;
  gachaState: RoomGachaState;
  onTriggerSpinOnBehalf?: (playerId: string) => void;
  onAdvanceTurn?: () => void;
  onRecordReward: (reward: WonReward) => void;
  onGoBackToLanding: () => void;
  onOpenHistory: () => void;
}

export const HostSpectatorScreen: React.FC<HostSpectatorScreenProps> = ({
  players,
  userPlayer,
  gachaState,
  onTriggerSpinOnBehalf,
  onAdvanceTurn,
  onRecordReward,
  onGoBackToLanding,
  onOpenHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const NUM_SEGMENTS = 10;
  const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

  // Non-host players sorted in queue
  const nonHostPlayers = players.filter((p) => !p.isHost);
  const activePlayer = players.find((p) => p.id === gachaState.currentGachaPlayerId) || nonHostPlayers[0];
  const activePlayerSpins = activePlayer ? (gachaState.playerSpins[activePlayer.id] ?? 0) : 0;

  // Draw Canvas Wheel once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 520;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    // Outer rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#141414';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#F2ECE0';
    ctx.fill();
    ctx.restore();

    // Draw 10 Segments
    GACHA_ITEMS.forEach((item, i) => {
      const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      // Border
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text inside segment
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + (SEGMENT_ANGLE / 2) * (Math.PI / 180));
      ctx.textAlign = 'right';
      ctx.fillStyle = item.textColor;

      if (item.isPrize) {
        ctx.font = 'bold 12px "Space Mono", monospace';
        ctx.fillText('★ ' + item.title.slice(0, 18), radius - 26, 4);
      } else {
        ctx.font = 'italic 11px "Spectral", Georgia, serif';
        ctx.fillText(item.title.slice(0, 22) + '...', radius - 26, 4);
      }

      ctx.restore();
      ctx.restore();
    });

    // Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 44, 0, 2 * Math.PI);
    ctx.fillStyle = '#C02026';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#141414';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 36, 0, 2 * Math.PI);
    ctx.fillStyle = '#F9D64B';
    ctx.fill();
    ctx.restore();
  }, []);

  // Listen for synchronized spin events from state
  useEffect(() => {
    if (!gachaState.activeSpin) return;

    const spin = gachaState.activeSpin;
    const now = Date.now();
    const elapsed = now - spin.spinStartedAt;
    const remaining = Math.max(0, spin.spinDurationMs - elapsed);

    setIsSpinning(true);
    setWheelRotation(spin.targetAngle);

    let tickCount = 0;
    const maxTicks = 24;
    const interval = setInterval(() => {
      tickCount++;
      sound.playTick(600 + Math.random() * 250, 0.02);
      if (tickCount >= maxTicks) clearInterval(interval);
    }, 140);

    const timer = setTimeout(() => {
      setIsSpinning(false);
      if (spin.item.isPrize) {
        sound.playFanfare();
        confetti({
          particleCount: 100,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#C02026', '#F9D64B', '#F2ECE0', '#141414'],
        });
      } else {
        sound.playReveal();
      }
    }, remaining);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [gachaState.activeSpin?.spinId]);

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    sound.playTick(900);
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isAllFinished = gachaState.phase === 'finished' || (
    nonHostPlayers.every((p) => (gachaState.playerSpins[p.id] ?? 0) === 0) &&
    !isSpinning &&
    gachaState.wonRewards.length > 0
  );

  return (
    <div id="host-spectator-screen" className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Bar / Masthead */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#141414] pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playTick(400);
              onGoBackToLanding();
            }}
            className="flex items-center gap-1.5 font-mono text-xs text-[#141414]/70 hover:text-[#C02026] uppercase font-bold cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>VỀ TRANG CHỦ</span>
          </button>
          <span className="text-[#141414]/30 font-mono">|</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#C02026] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              MÀN HÌNH QUAN SÁT (SPECTATOR)
            </span>
            <span className="text-[11px] font-mono text-[#141414]/80 font-bold hidden sm:inline">
              02 / 09 / 2026 • ĐẠI HỘI GACHA TOÀN DÂN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#F2ECE0] border border-[#141414] font-mono text-xs font-bold text-[#141414] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#168039] animate-pulse" />
            <span>HOST: <strong>{userPlayer.name}</strong></span>
          </div>

          <button
            id="open-history-button"
            onClick={() => {
              sound.playTick(500);
              onOpenHistory();
            }}
            className="px-3.5 py-1.5 bg-[#FAF6EE] border-2 border-[#141414] text-xs font-mono font-bold text-[#141414] hover:bg-[#F2ECE0] flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Gift size={13} className="text-[#C02026]" />
            <span>TỦ QUÀ ({gachaState.wonRewards.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Big Stage (Wheel + Announcer), Right is Live Results History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Big Stage (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Bento Main Stage */}
          <div className="bg-[#FAF6EE] border-2 border-[#141414] divide-y-2 divide-[#141414] text-center shadow-lg">
            
            {/* Bento Header: Announce Who is Spinning */}
            <div className="p-6 sm:p-8 bg-[#F2ECE0]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] text-[#FAF6EE] font-mono text-xs uppercase tracking-[0.2em] font-bold mb-3 border border-[#141414]">
                <VietnamStar size={12} color="#F9D64B" />
                <span>AI ĐANG QUAY?</span>
                <VietnamStar size={12} color="#F9D64B" />
              </div>

              {isAllFinished ? (
                <div>
                  <h2 className="font-display font-black text-4xl sm:text-5xl text-[#C02026] tracking-tight uppercase">
                    ĐÃ HOÀN TẤT GACHA!
                  </h2>
                  <p className="font-serif-vintage italic text-[#141414]/80 text-sm mt-2">
                    Tất cả thành viên đã hoàn thành lượt quay may mắn ngày 2/9.
                  </p>
                </div>
              ) : (
                <div>
                  <motion.h2
                    key={activePlayer?.id || 'idle'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-[#C02026] tracking-tight uppercase leading-none"
                  >
                    {activePlayer?.name || 'ĐỢI LƯỢT'}
                  </motion.h2>

                  <div className="font-mono text-sm sm:text-base font-bold text-[#141414] uppercase mt-2 flex items-center justify-center gap-2">
                    {isSpinning ? (
                      <span className="text-[#C02026] animate-pulse">● ĐANG QUAY VÒNG QUAY...</span>
                    ) : (
                      <span>ĐANG CÓ LƯỢT QUAY (CÒN {activePlayerSpins} LƯỢT)</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Central Synchronized Wheel Canvas */}
            <div className="p-6 sm:p-10 bg-[#FAF6EE] flex flex-col items-center justify-center">
              <div className="relative my-2 flex flex-col items-center justify-center">
                {/* Pointer Ticker */}
                <div className="relative z-30 -mb-4 flex flex-col items-center">
                  <div className="w-8 h-8 bg-[#C02026] border-2 border-[#141414] flex items-center justify-center shadow-md">
                    <VietnamStar size={14} color="#F9D64B" />
                  </div>
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#C02026]" />
                </div>

                {/* Rotating Wheel Container */}
                <div className="relative p-1.5 rounded-full border-2 border-[#141414] bg-[#141414] shadow-2xl">
                  <div
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.95, 0.25, 1)' : 'none',
                    }}
                    className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] rounded-full overflow-hidden"
                  >
                    <canvas ref={canvasRef} className="w-full h-full object-contain" />
                  </div>

                  {/* Central Vietnam Star Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#C02026] border-2 border-[#141414] flex items-center justify-center pointer-events-none shadow-md">
                    <VietnamStar size={28} color="#F9D64B" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Status / Host Override Strip */}
            <div className="p-4 sm:p-5 bg-[#F2ECE0] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#141414]/80">
                <Users size={14} className="text-[#C02026]" />
                <span>
                  Host quan sát • Player dùng thiết bị cá nhân để bấm <strong>QUAY</strong>
                </span>
              </div>

              {/* Host Testing Helpers */}
              {!isAllFinished && activePlayer && (
                <div className="flex items-center gap-2">
                  {onTriggerSpinOnBehalf && (
                    <button
                      id="host-spin-behalf-button"
                      disabled={isSpinning || activePlayerSpins <= 0}
                      onClick={() => onTriggerSpinOnBehalf(activePlayer.id)}
                      className="px-3 py-1.5 bg-[#FAF6EE] border border-[#141414] text-[11px] font-bold text-[#141414] hover:bg-[#C02026] hover:text-white disabled:opacity-40 transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="Chủ phòng quay hộ nếu người chơi bị rớt mạng"
                    >
                      <Play size={11} /> Quay hộ ({activePlayer.name})
                    </button>
                  )}

                  {onAdvanceTurn && activePlayerSpins === 0 && (
                    <button
                      id="host-advance-turn-button"
                      onClick={onAdvanceTurn}
                      className="px-3 py-1.5 bg-[#141414] text-[#FAF6EE] text-[11px] font-bold border border-[#141414] hover:bg-[#C02026] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <SkipForward size={11} /> Người tiếp theo
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Turn Queue Tracker */}
          <div className="p-4 bg-[#F2ECE0] border-2 border-[#141414]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#141414]/20 font-mono text-xs">
              <span className="font-bold uppercase text-[#141414] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#C02026]" /> THỨ TỰ LƯỢT QUAY:
              </span>
              <span className="text-[#141414]/60 text-[11px]">
                Host không tham gia • Quán quân 2 lượt • Thành viên 1 lượt
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {nonHostPlayers.map((p, idx) => {
                const spins = gachaState.playerSpins[p.id] ?? (idx === 0 ? 2 : 1);
                const isCurrent = p.id === activePlayer?.id && !isAllFinished;
                const isDone = spins === 0 && !isCurrent;

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 border-2 text-left transition-all ${
                      isCurrent
                        ? 'border-[#C02026] bg-[#C02026] text-white shadow-md'
                        : isDone
                        ? 'border-[#141414]/30 bg-[#E5DEC9]/40 opacity-70'
                        : 'border-[#141414] bg-[#FAF6EE] text-[#141414]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span>#{idx + 1}</span>
                      {idx === 0 && (
                        <Crown size={12} className={isCurrent ? 'text-[#F9D64B]' : 'text-[#C02026]'} />
                      )}
                    </div>
                    <div className="font-display font-black text-base uppercase truncate my-1">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-mono font-bold flex items-center justify-between pt-1 border-t border-current/20">
                      <span>{isDone ? 'ĐÃ QUAY' : isCurrent ? 'ĐANG QUAY' : 'CHỜ LƯỢT'}</span>
                      <span className={`px-1.5 py-0.2 rounded-xs ${
                        isCurrent ? 'bg-white text-[#C02026]' : 'bg-[#141414] text-white'
                      }`}>
                        {spins} lượt
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Real-time Live Result Banner & Full History (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Latest Won Result Banner */}
          <div className="bg-[#FAF6EE] border-2 border-[#141414] divide-y-2 divide-[#141414] shadow-md">
            <div className="p-4 bg-[#F2ECE0] flex items-center justify-between font-mono text-xs">
              <span className="font-bold uppercase text-[#C02026] flex items-center gap-1.5">
                <VietnamStar size={12} color="#C02026" /> KẾT QUẢ MỚI NHẤT
              </span>
              <StampSeal29 />
            </div>

            <div className="p-5 sm:p-6 bg-[#FAF6EE]">
              {gachaState.wonRewards.length > 0 ? (
                (() => {
                  const latest = gachaState.wonRewards[gachaState.wonRewards.length - 1];
                  return (
                    <motion.div
                      key={latest.timestamp + (latest.playerName || '')}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-3"
                    >
                      <div className="inline-block px-3 py-1 bg-[#141414] text-[#FAF6EE] font-mono text-xs uppercase font-bold tracking-wider">
                        {latest.playerName} VỪA QUAY ĐƯỢC:
                      </div>

                      <div className="p-4 bg-[#F2ECE0] border-2 border-[#141414]">
                        <div className="text-3xl mb-1">{latest.item.isPrize ? '🎁' : '🇻🇳'}</div>
                        {latest.item.isPrize && (
                          <span className="px-2 py-0.5 bg-[#C02026] text-white font-mono text-[9px] font-bold uppercase tracking-wider block w-fit mx-auto mb-1">
                            {latest.item.badge || 'PHẦN THƯỞNG'}
                          </span>
                        )}
                        <h3 className="font-display font-black text-xl sm:text-2xl text-[#C02026] uppercase">
                          {latest.item.title}
                        </h3>
                        <p className="font-serif-vintage italic text-xs text-[#141414]/75 mt-1">
                          {latest.item.description}
                        </p>

                        {latest.code && (
                          <div className="mt-3 pt-3 border-t border-dashed border-[#141414]/20 flex items-center justify-center gap-2">
                            <span className="font-mono font-bold text-xs bg-[#FAF6EE] px-2.5 py-1 border border-[#141414]">
                              CODE: <strong>{latest.code}</strong>
                            </span>
                            <button
                              onClick={() => handleCopyCode(latest.code)}
                              className="px-2 py-1 bg-[#C02026] text-white font-mono text-[10px] font-bold border border-[#141414] hover:bg-[#141414] cursor-pointer flex items-center gap-1"
                            >
                              {copiedCode === latest.code ? <Check size={10} /> : <Copy size={10} />}
                              <span>{copiedCode === latest.code ? 'ĐÃ LƯU' : 'COPY'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })()
              ) : (
                <div className="py-8 text-center text-[#141414]/60 font-serif-vintage italic text-sm">
                  Chưa có lượt quay nào được thực hiện. Đang đợi thành viên đầu tiên bấm quay...
                </div>
              )}
            </div>
          </div>

          {/* Full Real-time Gacha History Feed */}
          <div className="bg-[#FAF6EE] border-2 border-[#141414] divide-y-2 divide-[#141414] shadow-md">
            <div className="p-4 bg-[#F2ECE0] flex items-center justify-between font-mono text-xs">
              <span className="font-bold uppercase text-[#141414] flex items-center gap-1.5">
                <Gift size={14} className="text-[#C02026]" /> TOÀN BỘ LỊCH SỬ GACHA ({gachaState.wonRewards.length})
              </span>
              <span className="text-[10px] text-[#141414]/60">Tự động cập nhật realtime</span>
            </div>

            <div className="p-4 bg-[#FAF6EE] max-h-[420px] overflow-y-auto space-y-2.5 divide-y divide-[#141414]/10">
              {gachaState.wonRewards.length === 0 ? (
                <div className="text-center py-6 text-xs font-mono text-[#141414]/50">
                  Lịch sử quay sẽ xuất hiện tại đây theo thời gian thực...
                </div>
              ) : (
                [...gachaState.wonRewards].reverse().map((reward, i) => (
                  <div key={i} className="pt-2.5 first:pt-0 font-mono text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#141414]">
                        <span className="text-[#C02026]">●</span>
                        <span className="uppercase">{reward.playerName}</span>
                      </div>
                      <span className="text-[10px] text-[#141414]/50">{reward.timestamp}</span>
                    </div>

                    <div className="p-2 bg-[#F2ECE0] border border-[#141414]/30 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-[#141414] text-[11px] leading-tight">
                          {reward.item.isPrize ? '🎁 ' : '🇻🇳 '} {reward.item.title}
                        </div>
                        {reward.code && (
                          <div className="text-[9px] text-[#C02026] font-bold mt-0.5">
                            MÃ: {reward.code}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
