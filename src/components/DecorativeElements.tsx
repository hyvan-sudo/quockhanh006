import React from 'react';

export const VietnamStar: React.FC<{ className?: string; size?: number; color?: string }> = ({
  className = '',
  size = 24,
  color = '#F9D64B',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
};

export const StampSeal29: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 border border-[#141414] text-[#141414] font-mono text-[10px] uppercase tracking-[0.2em] font-bold bg-[#F9D64B] ${className}`}
    >
      <VietnamStar size={10} color="#C02026" />
      <span>02 / 09 / 2026</span>
    </div>
  );
};

export const TricolorBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      <div className="h-1 flex-1 bg-[#141414]" />
      <div className="h-1 flex-1 bg-[#C02026]" />
      <div className="h-1 flex-1 bg-[#F9D64B]" />
    </div>
  );
};

export const VintagePostmark: React.FC<{ date?: string; location?: string; className?: string }> = ({
  date = '02 / 09 / 2026',
  location = 'HÀ NỘI — BA ĐÌNH',
  className = '',
}) => {
  return (
    <div
      className={`relative w-24 h-24 border border-[#141414] bg-[#FAF6EE] flex flex-col items-center justify-center text-center p-2 select-none ${className}`}
    >
      <div className="text-[8px] font-mono tracking-widest text-[#141414] font-bold">
        {location}
      </div>
      <div className="w-full border-b border-[#141414]/30 my-1" />
      <VietnamStar size={12} color="#C02026" />
      <div className="text-[9px] font-mono font-bold text-[#141414] mt-0.5">{date}</div>
      <div className="w-full border-t border-[#141414]/30 my-1" />
      <div className="text-[8px] font-mono tracking-[0.2em] text-[#C02026] font-bold">VIỆT NAM</div>
    </div>
  );
};

export const WoodblockCorner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`text-[#141414] opacity-40 ${className}`}
    >
      <path d="M2 22V2H22" />
    </svg>
  );
};

export const RetroFireworks: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-20 h-20 text-[#F9D64B] ${className}`}
    >
      <circle cx="50" cy="50" r="2.5" fill="currentColor" />
      <line x1="50" y1="20" x2="50" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="65" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="65" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="29" x2="39" y2="39" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="61" y1="61" x2="71" y2="71" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="71" y1="29" x2="61" y2="39" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="39" y1="61" x2="29" y2="71" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="50" cy="12" r="1.5" fill="#C02026" />
      <circle cx="88" cy="50" r="1.5" fill="#C02026" />
      <circle cx="50" cy="88" r="1.5" fill="#C02026" />
      <circle cx="12" cy="50" r="1.5" fill="#C02026" />
    </svg>
  );
};

