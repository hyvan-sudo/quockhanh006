import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Gift, Copy, Check, User } from 'lucide-react';
import { WonReward } from '../types';
import { sound } from '../utils/audio';

interface VoucherHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: WonReward[];
}

export const VoucherHistoryModal: React.FC<VoucherHistoryModalProps> = ({
  isOpen,
  onClose,
  rewards,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code?: string) => {
    if (!code) return;
    sound.playTick(900);
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#141414]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#FAF6EE] border-2 border-[#141414] divide-y divide-[#141414] shadow-2xl text-left"
      >
        {/* Header */}
        <div className="p-6 bg-[#F2ECE0] relative">
          <button
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 border border-[#141414] bg-[#FAF6EE] hover:bg-[#C02026] hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Gift size={14} className="text-[#C02026]" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#C02026]">
              TỦ QUÀ & LỜI CHÚC ĐÃ NHẬN
            </span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-[#141414] uppercase">
            BỘ SƯU TẬP QUỐC KHÁNH 2/9
          </h3>
        </div>

        {/* List of rewards */}
        <div className="p-6 bg-[#FAF6EE]">
          {rewards.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#141414]/30 p-6 bg-[#F2ECE0]">
              <div className="text-3xl mb-3">🎡</div>
              <p className="font-serif-vintage italic text-[#141414] text-base font-bold">
                Chưa có phần thưởng nào trong tủ quà.
              </p>
              <p className="font-mono text-xs text-[#141414]/70 mt-1">
                Hãy hoàn thành ván chơi hoặc vào thẳng mục Gacha để rinh voucher và lời chúc 2/9!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {rewards.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-2 ${
                    r.item.isPrize
                      ? 'border-[#C02026] bg-[#F2ECE0]'
                      : 'border-[#141414] bg-[#FAF6EE]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{r.item.isPrize ? '🎁' : '🇻🇳'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#141414]/60 font-bold">
                            {r.timestamp} • {r.item.isPrize ? 'VOUCHER' : 'LỜI CHÚC'}
                          </span>
                          {r.playerName && (
                            <span className="px-1.5 py-0.2 bg-[#141414] text-white font-mono text-[9px] font-bold uppercase flex items-center gap-1">
                              <User size={9} />
                              {r.playerName}
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-black text-base sm:text-lg text-[#141414] uppercase leading-tight mt-0.5">
                          {r.item.title}
                        </h4>
                      </div>
                    </div>

                    {r.code && (
                      <button
                        onClick={() => handleCopy(r.code)}
                        className="px-2.5 py-1 bg-[#C02026] text-white font-mono text-xs font-bold uppercase border border-[#141414] hover:bg-[#141414] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedCode === r.code ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedCode === r.code ? 'ĐÃ COPY' : r.code}</span>
                      </button>
                    )}
                  </div>

                  <p className="font-serif-vintage italic text-xs text-[#141414]/70 mt-2 border-t border-[#141414]/10 pt-1.5">
                    {r.item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom */}
        <div className="p-4 bg-[#F2ECE0] text-center">
          <button
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            className="px-6 py-2.5 bg-[#141414] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#C02026] transition-all cursor-pointer"
          >
            ĐÓNG TỦ QUÀ
          </button>
        </div>
      </motion.div>
    </div>
  );
};
