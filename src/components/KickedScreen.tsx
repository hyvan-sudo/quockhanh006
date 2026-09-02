import React from 'react';
import { motion } from 'motion/react';
import { UserX, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';
import { StampSeal29, TricolorBar, VietnamStar } from './DecorativeElements';

interface KickedScreenProps {
  onRejoin: () => void;
}

export const KickedScreen: React.FC<KickedScreenProps> = ({ onRejoin }) => {
  return (
    <div id="kicked-screen" className="max-w-xl mx-auto px-4 py-8 sm:py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-[#FAF6EE] border-2 border-[#141414] shadow-2xl divide-y-2 divide-[#141414] overflow-hidden"
      >
        {/* Top Header Banner */}
        <div className="p-6 bg-[#F2ECE0] flex items-center justify-between border-b border-[#141414]">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#C02026]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C02026] font-bold">
              THÔNG BÁO TỪ HỆ THỐNG
            </span>
          </div>
          <StampSeal29 />
        </div>

        {/* Main Content Area */}
        <div className="p-8 sm:p-12 space-y-6 bg-[#FAF6EE]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#C02026]/10 border-2 border-[#C02026] flex items-center justify-center text-[#C02026] shadow-sm">
            <UserX size={36} className="sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <VietnamStar size={12} color="#C02026" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#141414]/70 uppercase font-bold">
                TRẠNG THÁI PHÒNG CHƠI
              </span>
              <VietnamStar size={12} color="#C02026" />
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#C02026] tracking-tight uppercase leading-tight">
              BẠN ĐÃ BỊ CHỦ PHÒNG XÓA KHỎI PHÒNG
            </h2>

            <p className="font-serif-vintage italic text-sm sm:text-base text-[#141414]/80 max-w-md mx-auto pt-2">
              "Chủ phòng đã thực hiện thao tác xóa bạn khỏi danh sách người chơi trong sảnh chờ. Phiên chơi hiện tại đã chấm dứt đối với tài khoản này."
            </p>
          </div>

          <div className="p-4 bg-[#F2ECE0] border border-[#141414] text-xs font-mono text-[#141414]/80 text-left space-y-1">
            <div className="font-bold text-[#141414] uppercase flex items-center gap-1.5">
              <span>● GHI CHÚ QUY ĐỊNH:</span>
            </div>
            <p>• Dữ liệu phiên cũ của bạn đã được xóa hoàn toàn khỏi sảnh chờ.</p>
            <p>• Nếu bạn muốn tham gia lại, hãy nhấn nút bên dưới để tạo phiên người chơi mới và nhập tên đăng ký.</p>
          </div>

          {/* Action Button to Re-join */}
          <div className="pt-2">
            <button
              id="rejoin-after-kick-button"
              onClick={onRejoin}
              className="w-full bg-[#141414] text-[#FAF6EE] py-4 sm:py-5 font-mono text-sm sm:text-base font-bold uppercase tracking-[0.2em] border-2 border-[#141414] hover:bg-[#C02026] hover:text-white transition-all shadow-md inline-flex items-center justify-center gap-3 cursor-pointer active:translate-y-0.5"
            >
              <RefreshCw size={16} />
              <span>THAM GIA LẠI VỚI TÊN MỚI</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-[#F2ECE0] flex items-center justify-center">
          <TricolorBar className="w-32" />
        </div>
      </motion.div>
    </div>
  );
};
