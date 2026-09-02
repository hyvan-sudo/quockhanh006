import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Gift, Copy, Check, Sparkles, ArrowLeft, Hourglass, User } from 'lucide-react';
import { Player, GachaItem, RoomGachaState, WonReward, GachaSpinEvent } from '../types';
import { GACHA_ITEMS } from '../data/gameData';
import { sound } from '../utils/audio';
import { VietnamStar, TricolorBar, StampSeal29 } from './DecorativeElements';

interface PlayerGachaScreenProps {
  players: Player[];
  userPlayer: Player;
  gachaState: RoomGachaState;
  onPlayerTriggerSpin: (spinEvent: GachaSpinEvent) => void;
  onFinishMyTurn: () => void;
  onGoBackToLanding: () => void;
  onOpenHistory: () => void;
}

export const PlayerGachaScreen: React.FC<PlayerGachaScreenProps> = ({
  players,
  userPlayer,
  gachaState,
  onPlayerTriggerSpin,
  onFinishMyTurn,
  onGoBackToLanding,
  onOpenHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [localPrize, setLocalPrize] = useState<GachaItem | null>(null);

  const NUM_SEGMENTS = 10;
  const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

  const isHost = Boolean(userPlayer.isHost);
  const nonHostPlayers = players.filter((p) => !p.isHost).sort((a, b) => b.score - a.score);
  const currentTurnPlayerId = gachaState.currentGachaPlayerId || (nonHostPlayers[0]?.id ?? null);
  const activePlayer = players.find((p) => p.id === currentTurnPlayerId) || nonHostPlayers[0];

  const isMyTurn = !isHost && Boolean(currentTurnPlayerId) && currentTurnPlayerId === userPlayer.id;

  const myRemainingSpins = gachaState.playerSpins[userPlayer.id] !== undefined
    ? (gachaState.playerSpins[userPlayer.id] ?? 0)
    : (isHost ? 0 : (nonHostPlayers[0]?.id === userPlayer.id ? 2 : 1));

  const activePlayerSpins = activePlayer
    ? (gachaState.playerSpins[activePlayer.id] ?? (activePlayer.id === nonHostPlayers[0]?.id ? 2 : 1))
    : 0;

  const shouldShowSpinButton = !isHost && isMyTurn && myRemainingSpins > 0;

  // Draw canvas wheel
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

    // 10 Segments
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

  // Listen to synchronized spin broadcast
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
      setLocalPrize(spin.item);

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

      // If it is my spin, open local celebratory modal
      if (spin.playerId === userPlayer.id) {
        setShowLocalModal(true);
      }
    }, remaining);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [gachaState.activeSpin?.spinId]);

  // When active player triggers spin
  const handleTriggerSpin = () => {
    if (isSpinning || !isMyTurn || myRemainingSpins <= 0) return;

    sound.playStamp();
    setShowLocalModal(false);

    // Pick random index 0..9
    const randomIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    const targetItem = GACHA_ITEMS[randomIndex];

    // Compute target angle so pointer lands exactly on that segment
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetSegmentCenter = 360 - (randomIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
    const finalAngle = wheelRotation + extraRounds * 360 + (targetSegmentCenter - (wheelRotation % 360));

    const spinEvent: GachaSpinEvent = {
      spinId: `spin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      playerId: userPlayer.id,
      playerName: userPlayer.name,
      itemIndex: randomIndex,
      targetAngle: finalAngle,
      item: targetItem,
      spinStartedAt: Date.now(),
      spinDurationMs: 4200,
      spinNumber: myRemainingSpins,
    };

    onPlayerTriggerSpin(spinEvent);
  };

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
    <div id="player-gacha-screen" className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#141414] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playTick(400);
              onGoBackToLanding();
            }}
            className="flex items-center gap-1 font-mono text-xs text-[#141414]/70 hover:text-[#C02026] uppercase font-bold cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">VỀ TRANG CHỦ</span>
          </button>
          <span className="text-[#141414]/30 font-mono hidden sm:inline">|</span>
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C02026] font-bold">
            GACHA QUỐC KHÁNH 2/9
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-[#F2ECE0] border border-[#141414] font-mono text-xs font-bold text-[#141414]">
            BẠN: <strong>{userPlayer.name}</strong>
          </div>

          <button
            id="open-history-button"
            onClick={() => {
              sound.playTick(500);
              onOpenHistory();
            }}
            className="px-3 py-1 bg-[#FAF6EE] border border-[#141414] text-xs font-mono font-bold text-[#141414] hover:bg-[#F2ECE0] flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Gift size={13} className="text-[#C02026]" />
            <span>TỦ QUÀ ({gachaState.wonRewards.length})</span>
          </button>
        </div>
      </div>

      {/* Development Debug Information Panel */}
      <div
        id="gacha-debug-panel"
        className="mb-4 p-3 bg-[#141414] text-[#FAF6EE] border-2 border-[#141414] font-mono text-xs text-left space-y-1 shadow-md"
      >
        <div className="flex items-center justify-between border-b border-[#FAF6EE]/20 pb-1 font-bold text-[10px] text-[#F9D64B] uppercase tracking-wider">
          <span>GACHA REALTIME DEBUG</span>
          <span className={shouldShowSpinButton ? 'text-[#38D668]' : 'text-[#F9D64B]'}>
            {shouldShowSpinButton ? '🟢 NÚT QUAY: HIỂN THỊ [ QUAY → ]' : '⚪ NÚT QUAY: ẨN (CHỜ LƯỢT / QUAN SÁT)'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] pt-1">
          <div>Current player: <span className="text-[#F9D64B] font-bold">{userPlayer.id}</span> ({userPlayer.name})</div>
          <div>Current gacha player: <span className="text-[#F9D64B] font-bold">{currentTurnPlayerId || 'null'}</span> ({activePlayer?.name || 'N/A'})</div>
          <div>isHost: <span className={isHost ? 'text-[#C02026] font-bold' : 'text-[#38D668] font-bold'}>{String(isHost)}</span></div>
          <div>spinsRemaining: <span className="text-[#F9D64B] font-bold">{myRemainingSpins}</span></div>
        </div>
      </div>

      {/* Main Bento Wheel Container */}
      <div className="bg-[#FAF6EE] border-2 border-[#141414] divide-y-2 divide-[#141414] text-center shadow-xl">
        
        {/* Bento Top Header: Dynamic Turn Status */}
        <div className={`p-6 sm:p-8 ${isMyTurn ? 'bg-[#F2ECE0]' : 'bg-[#EAE4D6]'}`}>
          
          {isAllFinished ? (
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C02026] block mb-1">
                KẾT THÚC ĐỢT QUAY
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-[#141414] uppercase">
                GACHA ĐÃ HOÀN TẤT
              </h2>
              <p className="font-serif-vintage italic text-xs sm:text-sm text-[#141414]/70 mt-2">
                Hãy mở "Tủ Quà" để kiểm tra toàn bộ quà và voucher đã nhận!
              </p>
            </div>
          ) : isMyTurn ? (
            /* MY TURN VIEW */
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C02026] text-white font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-2 border border-[#141414]">
                <Sparkles size={11} color="#F9D64B" />
                <span>ĐẾN LƯỢT BẠN</span>
                <Sparkles size={11} color="#F9D64B" />
              </div>

              <motion.h2
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-display font-black text-4xl sm:text-6xl text-[#141414] tracking-tight uppercase leading-none"
              >
                QUAY ĐI.
              </motion.h2>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FAF6EE] border-2 border-[#141414] font-mono text-xs sm:text-sm font-bold mt-3 shadow-sm">
                <span>CÒN LẠI:</span>
                <span className="px-2 py-0.5 bg-[#C02026] text-white font-mono font-black text-sm">
                  {myRemainingSpins} LƯỢT QUAY
                </span>
              </div>
            </div>
          ) : (
            /* WAITING FOR OTHERS VIEW */
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] text-[#FAF6EE] font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-2 border border-[#141414]">
                <Hourglass size={11} className="animate-spin text-[#F9D64B]" />
                <span>GACHA ĐANG DIỄN RA</span>
              </div>

              <motion.h2
                key={activePlayer?.id || 'other'}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-black text-3xl sm:text-5xl text-[#C02026] tracking-tight uppercase leading-tight"
              >
                ĐANG ĐẾN LƯỢT {activePlayer?.name || 'THÀNH VIÊN KHÁC'}...
              </motion.h2>

              <p className="font-serif-vintage italic text-xs sm:text-sm text-[#141414]/75 mt-2">
                Vui lòng theo dõi màn hình. Nút <strong>QUAY</strong> sẽ xuất hiện khi đến lượt của bạn (Bạn còn {myRemainingSpins} lượt).
              </p>
            </div>
          )}

        </div>

        {/* Wheel Display Area */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE] flex flex-col items-center justify-center">
          <div className="relative my-2 flex flex-col items-center justify-center">
            {/* Top Pointer Ticker */}
            <div className="relative z-30 -mb-4 flex flex-col items-center">
              <div className="w-8 h-8 bg-[#C02026] border-2 border-[#141414] flex items-center justify-center shadow-md">
                <VietnamStar size={14} color="#F9D64B" />
              </div>
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#C02026]" />
            </div>

            {/* Rotating Canvas Wheel */}
            <div className="relative p-1.5 rounded-full border-2 border-[#141414] bg-[#141414] shadow-xl">
              <div
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.95, 0.25, 1)' : 'none',
                }}
                className="relative w-[270px] h-[270px] sm:w-[380px] sm:h-[380px] md:w-[420px] md:h-[420px] rounded-full overflow-hidden"
              >
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              </div>

              {/* Central Vietnam Star Icon Over Wheel */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#C02026] border-2 border-[#141414] flex items-center justify-center pointer-events-none shadow-md">
                <VietnamStar size={26} color="#F9D64B" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interaction Area */}
        <div className="p-6 sm:p-8 bg-[#F2ECE0] flex flex-col items-center">
          {shouldShowSpinButton ? (
            <div className="w-full max-w-sm space-y-3">
              <button
                id="player-spin-button"
                disabled={isSpinning || myRemainingSpins <= 0}
                onClick={handleTriggerSpin}
                className="w-full bg-[#C02026] text-white py-4 sm:py-5 font-mono text-sm sm:text-base font-bold uppercase tracking-[0.2em] border-2 border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isSpinning
                    ? 'ĐANG QUAY MAY MẮN...'
                    : myRemainingSpins === 1 && gachaState.wonRewards.some((r) => r.playerId === userPlayer.id)
                    ? 'QUAY LẦN NỮA (CÒN 1 LƯỢT) →'
                    : 'QUAY →'}
                </span>
              </button>
            </div>
          ) : isMyTurn && myRemainingSpins === 0 && !isSpinning ? (
            <div className="w-full max-w-sm space-y-3 text-center">
              <div className="p-3 bg-[#FAF6EE] border border-[#141414] font-mono text-xs font-bold text-[#141414]">
                BẠN ĐÃ DÙNG HẾT LƯỢT QUAY!
              </div>
              <button
                id="finish-turn-button"
                onClick={onFinishMyTurn}
                className="w-full bg-[#141414] text-[#FAF6EE] py-3.5 font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#141414] hover:bg-[#C02026] transition-colors cursor-pointer"
              >
                HOÀN TẤT LƯỢT → CHUYỂN NGƯỜI TIẾP THEO
              </button>
            </div>
          ) : (
            <div className="font-mono text-xs text-[#141414]/70 flex items-center gap-2">
              <User size={13} className="text-[#C02026]" />
              <span>
                {activePlayer ? `Đang đến lượt ${activePlayer.name} (còn ${activePlayerSpins} lượt)...` : 'Đang chờ lượt quay...'}
              </span>
            </div>
          )}

          <TricolorBar className="w-24 mt-4" />
        </div>

      </div>

      {/* Result Prize Modal for Active Player */}
      <AnimatePresence>
        {showLocalModal && localPrize && (
          <div className="fixed inset-0 bg-[#141414]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#FAF6EE] border-2 border-[#141414] divide-y-2 divide-[#141414] text-center overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 bg-[#F2ECE0]">
                <div className="inline-block px-3 py-0.5 bg-[#C02026] text-white font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-2 border border-[#141414]">
                  KẾT QUẢ CỦA BẠN
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#141414] uppercase">
                  {localPrize.isPrize ? 'CHÚC MỪNG!' : 'LỜI CHÚC ĐẠI LỄ'}
                </h3>
              </div>

              {/* Reward Content */}
              <div className="p-6 bg-[#FAF6EE]">
                {localPrize.isPrize ? (
                  <div>
                    <div className="text-3xl mb-2">🎁</div>
                    <span className="px-2 py-0.5 bg-[#C02026] text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                      {localPrize.badge || 'PHẦN THƯỞNG'}
                    </span>
                    <h4 className="font-display font-black text-2xl text-[#C02026] uppercase mt-2">
                      {localPrize.title}
                    </h4>
                    <p className="font-serif-vintage italic text-xs text-[#141414]/70 mt-2">
                      {localPrize.description}
                    </p>

                    {/* Voucher Code Box */}
                    {localPrize.code && (
                      <div className="mt-4 pt-4 border-t border-dashed border-[#141414]/20">
                        <span className="font-mono text-[10px] uppercase text-[#141414]/60 block mb-1 font-bold">
                          MÃ VOUCHER ĐẶC BIỆT:
                        </span>
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono font-black text-lg text-[#141414] tracking-widest bg-[#F2ECE0] px-3 py-1 border border-[#141414] select-all">
                            {localPrize.code}
                          </span>
                          <button
                            id="copy-voucher-code-button"
                            onClick={() => handleCopyCode(localPrize.code)}
                            className="px-3 py-1.5 bg-[#C02026] text-white font-mono text-xs font-bold uppercase border border-[#141414] hover:bg-[#141414] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCode === localPrize.code ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedCode === localPrize.code ? 'ĐÃ COPY' : 'COPY MÃ'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">🇻🇳</div>
                    <p className="font-serif-vintage font-bold italic text-base sm:text-lg text-[#141414] leading-relaxed">
                      "{localPrize.title}"
                    </p>
                    <p className="font-serif-vintage italic text-xs text-[#141414]/70 mt-2">
                      {localPrize.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="p-4 bg-[#F2ECE0] flex items-center justify-center gap-3">
                {myRemainingSpins > 0 ? (
                  <button
                    id="spin-again-modal-button"
                    onClick={() => {
                      setShowLocalModal(false);
                      setTimeout(handleTriggerSpin, 300);
                    }}
                    className="px-6 py-2.5 bg-[#C02026] text-white font-mono text-xs font-bold uppercase border-2 border-[#141414] hover:bg-[#141414] transition-all cursor-pointer shadow-sm"
                  >
                    QUAY LẦN NỮA → (CÒN {myRemainingSpins})
                  </button>
                ) : (
                  <button
                    id="close-finish-modal-button"
                    onClick={() => {
                      setShowLocalModal(false);
                      onFinishMyTurn();
                    }}
                    className="px-6 py-2.5 bg-[#141414] text-white font-mono text-xs font-bold uppercase border-2 border-[#141414] hover:bg-[#C02026] transition-all cursor-pointer shadow-sm"
                  >
                    HOÀN TẤT & CHUYỂN LƯỢT →
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
