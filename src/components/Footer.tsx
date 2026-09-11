import React from 'react';
import { 
  Home, 
  Star, 
  Tag, 
  Zap, 
  ShoppingBag, 
  Truck, 
  HelpCircle, 
  ShieldCheck, 
  Cookie, 
  FileText, 
  RotateCcw, 
  MessageCircle, 
  Mail, 
  Clock, 
  Lock, 
  ChevronDown,
  Layers
} from 'lucide-react';
import { StoreCategory } from '../types';
import { PolicyTab } from './PoliciesModal';

interface FooterProps {
  categories?: StoreCategory[];
  onOpenHelp: () => void;
  onOpenTracking: () => void;
  onOpenCart: () => void;
  onSelectCategory: (category: string) => void;
  onOpenAdmin?: () => void;
  onOpenPolicies?: (tab: PolicyTab) => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  onOpenHelp,
  onOpenTracking,
  onOpenCart,
  onSelectCategory,
  onOpenAdmin,
  onOpenPolicies,
  onOpenPrivacy,
}) => {
  return (
    <footer className="bg-[#0D0D0D] text-neutral-300 pt-16 pb-12 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-neutral-800/80">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            {/* Logo Badge */}
            <div className="inline-block p-3 rounded-xl bg-black border border-neutral-800">
              <div className="flex items-baseline">
                <span className="text-xl font-black italic tracking-tighter text-white font-condensed">
                  KICKS <span className="text-white">CLUB</span>
                </span>
                <span className="text-[#FFDD00] font-black text-sm ml-0.5">.PT</span>
              </div>
              <div className="text-[8px] uppercase tracking-[0.25em] text-neutral-400 font-medium -mt-1">
                PREMIUM STREETWEAR CLUB
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              O teu clube de streetwear de excelência. Calçado, roupa, acessórios, relógios e eletrónicos com envio expresso seguro para todo Portugal.
            </p>
          </div>

          {/* Column 2: Navegação & Departamentos */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              DEPARTAMENTOS
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                >
                  <Home className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Página Inicial</span>
                </button>
              </li>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        onSelectCategory(cat.id);
                        const el = document.getElementById(`section-${cat.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                    >
                      <span className="text-[#FFDD00] text-xs">◆</span>
                      <span>{cat.name}</span>
                    </button>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => onSelectCategory('tenis')}
                      className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                    >
                      <Tag className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Ténis & Sneakers</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectCategory('roupa')}
                      className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Roupa & Streetwear</span>
                    </button>
                  </li>
                </>
              )}
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2 text-[#FFDD00]"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Rastrear Encomenda</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Confiança & Legal */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              CONFIANÇA & POLÍTICAS
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onOpenPolicies ? onOpenPolicies('sizes') : onOpenHelp()}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#FFDD00]" />
                  <span className="font-bold text-white">Trocas de Tamanho (14D)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies ? onOpenPolicies('shipping') : onOpenHelp()}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                >
                  <Truck className="w-3.5 h-3.5 text-[#FFDD00]" />
                  <span>Prazos CTT Expresso</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies ? onOpenPolicies('returns') : onOpenHelp()}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Devoluções & Reembolso</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies ? onOpenPolicies('authenticity') : onOpenHelp()}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFDD00]" />
                  <span>100% Autenticidade Garantida</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenHelp}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Perguntas Frequentes (FAQ)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => (onOpenPrivacy ? onOpenPrivacy() : onOpenHelp())}
                  className="hover:text-[#FFDD00] transition-colors flex items-center gap-2 text-white font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FFDD00]" />
                  <span>Política de Privacidade (RGPD)</span>
                </button>
              </li>
              {onOpenAdmin && (
                <li>
                  <button
                    onClick={onOpenAdmin}
                    className="hover:text-[#FFDD00] transition-colors flex items-center gap-2 text-neutral-400 font-semibold"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#FFDD00]" />
                    <span>Portal de Administração</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Fale Connosco */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              FALE CONNOSCO
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm">
              <li>
                <a
                  href="https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 hover:text-[#FFDD00] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-yellow-950/40 border border-yellow-800/50 flex items-center justify-center text-[#FFDD00] group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">WHATSAPP</span>
                    <span className="text-white font-bold group-hover:text-[#FFDD00]">+244 952 948 694</span>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href="mailto:kicksclub9@gmail.com"
                  className="group flex items-start gap-3 hover:text-[#FFDD00] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">EMAIL</span>
                    <span className="text-white font-bold group-hover:text-[#FFDD00]">kicksclub9@gmail.com</span>
                  </div>
                </a>
              </li>

              <li>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">HORÁRIO</span>
                    <span className="text-white font-bold">Seg - Sex: 09h - 18h</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          
          <div>
            © 2026 <strong className="text-white">KicksClub.pt</strong> . Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Lock className="w-3.5 h-3.5 text-[#FFDD00]" />
              <span>Check-out 100% Seguro</span>
            </div>

            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md text-white font-semibold">
              <span className="text-[10px] text-neutral-400">MOEDA:</span>
              <span>EUR (€)</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 ml-0.5" />
            </div>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <span className="font-extrabold text-[11px] text-white tracking-widest">VISA</span>
            <div className="flex -space-x-1">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
            </div>
            <span className="text-[10px] font-bold text-neutral-400">Maestro</span>
            <span className="font-black text-xs text-white">MB</span>
            <div className="flex items-center gap-0.5 font-black text-xs text-white">
              <span className="px-1 py-0.2 bg-red-600 rounded text-[9px] text-white">MB</span>
              <span>WAY</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};
