import React from 'react';
import { TRUST_TICKER_ITEMS } from '../data/sneakers';

export const TrustTicker: React.FC = () => {
  return (
    <div className="bg-black border-y border-[#262626] overflow-hidden py-3 select-none">
      <div className="flex w-max animate-marquee space-x-8 text-xs font-bold uppercase tracking-wider text-neutral-300">
        {[...TRUST_TICKER_ITEMS, ...TRUST_TICKER_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3 whitespace-nowrap">
            <span className="text-[#FFDD00] font-black">●</span>
            <span className="hover:text-[#FFDD00] transition-colors">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
