import React from 'react';
import { Truck, Zap, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] text-white pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-14 border-b border-[#222222]">
      
      {/* Background Graphic: Electric Yellow Lightning Bolt */}
      <div className="absolute inset-0 pointer-events-none opacity-30 lg:opacity-60 overflow-hidden">
        <svg 
          viewBox="0 0 1200 800" 
          className="absolute right-[-5%] top-[-10%] w-[110%] h-[120%] object-contain"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized geometric lightning bolts */}
          <polygon 
            points="750,0 920,0 720,400 950,400 580,850 720,460 520,460" 
            fill="url(#lightningGrad)" 
            opacity="0.85"
          />
          <defs>
            <linearGradient id="lightningGrad" x1="50%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#FFDD00" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#FACC15" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#CA8A04" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Glow */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#FFDD00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl space-y-4 sm:space-y-5 text-left">
          
          {/* Free Shipping Badge */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-700 bg-neutral-900/90 text-xs font-semibold text-neutral-200 shadow-xs">
              <Truck className="w-3.5 h-3.5 text-[#FFDD00]" />
              <span>
                <strong className="text-[#FFDD00] font-bold">ENVIO GRÁTIS</strong> EM COMPRAS ACIMA DE 60€
              </span>
            </div>
          </div>

          {/* Main Punchy Headlines - Proportional & Modern Size */}
          <div className="space-y-0.5">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tight leading-[0.96] font-condensed text-white">
              MOVE-TE COM ESTILO.
            </h1>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tight leading-[0.96] font-condensed text-[#FFDD00]">
              DESTACA-TE SEMPRE.
            </h2>
          </div>

          {/* Subtext */}
          <p className="text-neutral-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Os sneakers, vestuário, relógios e acessórios que marcam presença e elevam o teu look a{' '}
            <span className="text-[#FFDD00] font-semibold underline decoration-[#FFDD00]/60 underline-offset-4">
              outro nível
            </span>.
          </p>

          {/* 3 Pillars / Trust highlights - Compact & Refined */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 w-full max-w-xl">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#FFDD00]">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="font-bold text-white uppercase block">TENDÊNCIAS</span>
                <span className="text-neutral-400 text-[11px]">que marcam o teu estilo</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#FFDD00]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="font-bold text-white uppercase block">COMPRA SEGURA</span>
                <span className="text-neutral-400 text-[11px]">100% garantida & protegida</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-[#FFDD00]">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="font-bold text-white uppercase block">+1800 CLIENTES</span>
                <span className="text-neutral-400 text-[11px]">compras satisfeitas</span>
              </div>
            </div>
          </div>

          {/* CTA and Circular Badge Area */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-1">
            {/* Yellow Action Button */}
            <button
              onClick={onExploreClick}
              className="px-7 py-3 bg-[#FFDD00] hover:bg-[#FFE533] text-black font-black text-base uppercase tracking-wider rounded-xl flex items-center gap-2.5 shadow-md shadow-[#FFDD00]/20 transition-all hover:scale-105 active:scale-95 group font-condensed cursor-pointer"
            >
              <span>EXPLORAR COLEÇÃO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Yellow Circular Badge */}
            <div className="relative w-20 h-20 rounded-full border-2 border-[#FFDD00] border-dashed flex items-center justify-center p-1.5 text-center bg-black/60 backdrop-blur-xs group hover:scale-105 transition-transform">
              <div className="flex flex-col items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-[#FFDD00] mb-0.5 fill-[#FFDD00]" />
                <span className="text-[9px] font-black uppercase text-white leading-tight">
                  NÃO É SÓ MODA.
                </span>
                <span className="text-[9px] font-black uppercase text-[#FFDD00] leading-tight">
                  É ATITUDE.
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods Bar */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-3.5 px-4 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 text-xs">
              <div className="flex items-center gap-1 font-black text-white tracking-wider">
                <span className="px-1.5 py-0.5 bg-red-600 rounded text-[9px] font-bold text-white">MB</span>
                <span className="text-xs">WAY</span>
              </div>
              <span className="text-neutral-600">|</span>
              <span className="font-extrabold tracking-widest text-xs text-white">VISA</span>
              <span className="text-neutral-600">|</span>
              <div className="flex -space-x-1">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-90"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 opacity-90"></div>
              </div>
              <span className="text-neutral-600">|</span>
              <span className="font-bold text-white text-xs">Klarna.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
