import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { RoundData, Player } from '../types';
import { sound } from '../utils/audio';
import { StampSeal29, TricolorBar } from './DecorativeElements';

interface AnswerInputScreenProps {
  round: RoundData;
  totalRounds: number;
  userPlayer: Player;
  playersCount?: number;
  onSubmitAnswer: (answer: string) => void;
  onProceedToReveal: () => void;
  existingAnswer?: string;
}

export const AnswerInputScreen: React.FC<AnswerInputScreenProps> = ({
  round,
  totalRounds,
  userPlayer,
  playersCount = 5,
  onSubmitAnswer,
  onProceedToReveal,
  existingAnswer,
}) => {
  const [answerText, setAnswerText] = useState(existingAnswer || '');
  const [isSubmitted, setIsSubmitted] = useState(Boolean(existingAnswer));
  const MAX_CHARS = 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isSubmitted) return;
    sound.playStamp();
    setIsSubmitted(true);
    onSubmitAnswer(answerText.trim());
  };

  return (
    <div id="answer-input-screen" className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Round Bar */}
      <div className="flex items-center justify-between border-b border-[#141414] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#C02026] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase border border-[#141414]">
            ROUND 0{round.roundNumber} / 0{totalRounds}
          </span>
          <span className="font-mono text-xs text-[#141414]/70 uppercase hidden sm:inline tracking-wider">
            GIAI ĐOẠN 02: GHI LỜI GỢI Ý
          </span>
        </div>
        <StampSeal29 />
      </div>

      {/* Main Bento Container */}
      <div className="bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414]">
        
        {/* Bento Top Header */}
        <div className="p-6 sm:p-10 text-center bg-[#F2ECE0]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-[#C02026] block mb-2">
            ẨN Ý & TRỰC GIÁC
          </span>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-[#141414] tracking-tight uppercase leading-tight"
          >
            TRẢ LỜI CÂU HỎI
          </motion.h2>

          {/* Question Box */}
          {round.question && (
            <div className="mt-4 p-4 bg-[#FAF6EE] border-2 border-[#141414] max-w-xl mx-auto shadow-sm">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C02026] block mb-1">
                ★ CÂU HỎI ROUND 0{round.roundNumber} ★
              </span>
              <p className="font-serif-vintage italic text-[#141414] font-bold text-base sm:text-lg">
                "{round.question}"
              </p>
            </div>
          )}

          <p className="font-serif-vintage italic text-[#141414]/75 text-xs sm:text-sm mt-3 max-w-lg mx-auto">
            Hãy viết một manh mối ngắn gọn tương ứng với từ khóa của bạn. Đủ để đồng đội hiểu nhưng không quá lộ liễu để kẻ giả mạo đoán ra!
          </p>
        </div>

        {/* Input Form Bento Section */}
        <div className="p-6 sm:p-10 bg-[#FAF6EE]">
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="bg-[#F2ECE0] border border-[#141414] p-4 focus-within:ring-1 focus-within:ring-[#C02026] transition-all">
              <textarea
                id="player-answer-input"
                rows={3}
                maxLength={MAX_CHARS}
                disabled={isSubmitted}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Nhập câu trả lời ngắn gọn (ví dụ: Thường mua vào buổi sáng...)"
                className="w-full bg-transparent font-sans text-base sm:text-lg text-[#141414] placeholder-[#141414]/40 focus:outline-none resize-none disabled:opacity-80 font-medium"
              />

              {/* Bottom Character Counter & Status */}
              <div className="flex items-center justify-between pt-2 border-t border-[#141414]/15 font-mono text-[11px] text-[#141414]/70">
                <span>
                  {isSubmitted ? (
                    <span className="text-[#C02026] font-bold flex items-center gap-1">
                      <Lock size={12} /> ĐÃ KHÓA CÂU TRẢ LỜI
                    </span>
                  ) : (
                    <span>Tối đa 50 ký tự</span>
                  )}
                </span>

                <span className={`font-bold ${answerText.length >= MAX_CHARS ? 'text-[#C02026]' : ''}`}>
                  {answerText.length} / {MAX_CHARS} ký tự
                </span>
              </div>
            </div>

            {/* Submission / Confirmation Button */}
            <div className="mt-6 text-center">
              {!isSubmitted ? (
                <button
                  id="submit-answer-button"
                  type="submit"
                  disabled={!answerText.trim()}
                  className="bg-[#C02026] text-white px-10 sm:px-12 py-3.5 sm:py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] hover:text-[#FAF6EE] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
                >
                  GỬI CÂU TRẢ LỜI →
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  {/* Bento Stamp "ĐÃ GỬI." */}
                  <div className="px-6 py-2 border border-[#C02026] text-[#C02026] font-display font-black text-xl uppercase tracking-widest bg-[#F2ECE0]">
                    ✓ ĐÃ GỬI THÀNH CÔNG
                  </div>

                  <p className="font-mono text-xs text-[#141414]/70">
                    Câu trả lời đã được ghi nhận vào hệ thống bản tin.
                  </p>

                  <button
                    id="proceed-to-reveal-button"
                    type="button"
                    onClick={() => {
                      sound.playStamp();
                      onProceedToReveal();
                    }}
                    className="mt-2 px-8 py-3.5 bg-[#141414] text-[#FAF6EE] font-mono text-xs font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#C02026] transition-colors cursor-pointer"
                  >
                    XEM TOÀN BỘ CÂU TRẢ LỜI →
                  </button>
                </motion.div>
              )}
            </div>
          </form>
        </div>

        {/* Bento Footer Status Bar */}
        <div className="p-4 sm:px-8 bg-[#5A5A40] text-[#F2ECE0] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F9D64B] animate-ping" />
            <span>{playersCount}/{playersCount} người chơi đã kết nối</span>
          </span>
          <span className="font-bold text-[#F9D64B]">● TRỰC TUYẾN</span>
        </div>

      </div>
    </div>
  );
};


