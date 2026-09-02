import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { sound } from '../utils/audio';
import { VietnamStar } from './DecorativeElements';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#141414]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#FAF6EE] border border-[#141414] divide-y divide-[#141414] shadow-2xl text-left"
      >
        {/* Header */}
        <div className="p-6 bg-[#F2ECE0] relative">
          <button
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1 border border-[#141414] bg-[#FAF6EE] hover:bg-[#C02026] hover:text-white transition-colors"
          >
            <X size={15} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <VietnamStar size={12} color="#C02026" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#C02026]">
              BẢN HƯỚNG DẪN THỂ LỆ & QUY TẮC
            </span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-[#141414] uppercase">
            QUỐC KHÁNH 2/9: KẺ KHÁC BIỆT
          </h3>
        </div>

        {/* Content Bento Cells */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE] space-y-4 text-[#141414]">
          {/* Section 1 */}
          <div className="p-4 bg-[#F2ECE0] border border-[#141414]">
            <h4 className="font-display font-black text-sm sm:text-base uppercase text-[#C02026] mb-1">
              01. MỤC TIÊU TRÒ CHƠI
            </h4>
            <p className="font-serif-vintage italic text-xs sm:text-sm text-[#141414]/85 leading-relaxed">
              Trong 7 người chơi, 6 người sẽ nhận cùng một từ khóa về Quốc khánh 2/9 (Phe Thường), và 1 người nhận từ khóa tương cận nhưng khác biệt (Kẻ Khác Biệt / Impostor).
            </p>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-[#F2ECE0] border border-[#141414]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C02026] block mb-1">02. NHẬP GỢI Ý</span>
              <p className="font-serif-vintage italic text-xs text-[#141414]/80 leading-relaxed">
                Mỗi người viết 1 câu gợi ý tối đa 50 ký tự về từ khóa mà không nói thẳng từ ra.
              </p>
            </div>

            <div className="p-4 bg-[#F2ECE0] border border-[#141414]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C02026] block mb-1">03. TRANH LUẬN & VOTE</span>
              <p className="font-serif-vintage italic text-xs text-[#141414]/80 leading-relaxed">
                Tất cả câu trả lời được công bố. Mọi người có 60 giây suy luận rồi bỏ phiếu bí mật vạch mặt kẻ giả mạo.
              </p>
            </div>
          </div>

          {/* Section 3: Point Rules */}
          <div className="p-4 bg-[#F2ECE0] border border-[#C02026]">
            <h4 className="font-display font-black text-sm sm:text-base uppercase text-[#C02026] mb-1">
              04. CƠ CẤU TÍNH ĐIỂM & GACHA 2/9
            </h4>
            <ul className="list-disc list-inside text-xs space-y-1 text-[#141414]/85 font-mono">
              <li>Phe Thường vote đúng Impostor: +2 điểm mỗi người.</li>
              <li>Impostor không bị phát hiện hoặc đánh lừa thành công: +3 điểm.</li>
              <li>Sau 5 round, người cao điểm nhất sẽ nhận thêm lượt quay Gacha 2/9!</li>
            </ul>
          </div>
        </div>

        {/* Modal Bottom CTA */}
        <div className="p-4 bg-[#F2ECE0] text-center">
          <button
            onClick={() => {
              sound.playStamp();
              onClose();
            }}
            className="px-8 py-3 bg-[#C02026] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] border border-[#141414] hover:bg-[#141414] transition-all"
          >
            ĐÃ HIỂU LUẬT CHƠI →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

