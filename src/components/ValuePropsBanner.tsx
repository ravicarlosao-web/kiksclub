import React from 'react';
import { ShieldCheck, Truck, RotateCcw, MessageCircle, ExternalLink } from 'lucide-react';
import { PolicyTab } from './PoliciesModal';

interface ValuePropsBannerProps {
  onOpenPolicies?: (tab: PolicyTab) => void;
}

export const ValuePropsBanner: React.FC<ValuePropsBannerProps> = ({ onOpenPolicies }) => {
  return (
    <section className="bg-[#0E0E0E] border-t-2 border-[#FFDD00] border-b border-neutral-800 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Pillar 1: 100% Autênticos */}
          <button 
            type="button"
            onClick={() => onOpenPolicies?.('authenticity')}
            className="flex items-start gap-4 text-left group hover:opacity-90 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-[#FFDD00] group-hover:scale-105 group-hover:border-[#FFDD00]/50 transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
                  100% AUTÊNTICOS
                </h4>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Inspeção individual física por especialistas KICKS CLUB
              </p>
            </div>
          </button>

          {/* Pillar 2: Envio CTT Expresso */}
          <button 
            type="button"
            onClick={() => onOpenPolicies?.('shipping')}
            className="flex items-start gap-4 text-left group hover:opacity-90 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-[#FFDD00] group-hover:scale-105 group-hover:border-[#FFDD00]/50 transition-all">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
                  ENVIO SEGURO 7-15 DIAS ÚTEIS
                </h4>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Expedição com rastreio e proteção reforçada Double-Box
              </p>
            </div>
          </button>

          {/* Pillar 3: Trocas Fáceis de Tamanho */}
          <button 
            type="button"
            onClick={() => onOpenPolicies?.('sizes')}
            className="flex items-start gap-4 text-left group hover:opacity-90 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-[#FFDD00] group-hover:scale-105 group-hover:border-[#FFDD00]/50 transition-all">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
                  TROCAS DE TAMANHO
                </h4>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Até 14 dias para troca rápida de número ou devolução
              </p>
            </div>
          </button>

          {/* Pillar 4: Apoio WhatsApp */}
          <a 
            href="https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20um%20artigo."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 text-left group hover:opacity-90 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-[#FFDD00] group-hover:scale-105 group-hover:border-[#FFDD00]/50 transition-all">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-[#FFDD00] transition-colors">
                  APOIO WHATSAPP
                </h4>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Atendimento direto em português (+351 934 755 363)
              </p>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
};
