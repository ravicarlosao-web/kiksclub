import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, MessageCircle, Mail, Phone, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { FAQS } from '../data/sneakers';

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 text-black shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-[#FFDD00] flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase font-condensed">
              Central de Ajuda & Suporte
            </h3>
            <p className="text-xs text-neutral-500">
              Tudo o que precisas saber sobre encomendas, autenticidade e entregas.
            </p>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <a
            href="https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Gostaria%20de%20ajuda%20com%20uma%20encomenda."
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-[#FFDD00] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-800 block">WhatsApp Oficial</span>
              <span className="text-sm font-black text-amber-950">+244 952 948 694</span>
            </div>
          </a>

          <a
            href="mailto:kicksclub9@gmail.com"
            className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 hover:bg-neutral-200/80 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-neutral-600 block">Apoio por Email</span>
              <span className="text-sm font-black text-neutral-900">kicksclub9@gmail.com</span>
            </div>
          </a>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
            Perguntas Frequentes
          </h4>

          {FAQS.map((faq, idx) => {
            const isOpenAccordion = openIndex === idx;
            return (
              <div 
                key={idx} 
                className="border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50/50"
              >
                <button
                  onClick={() => setOpenIndex(isOpenAccordion ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-neutral-900 hover:text-[#B45309] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                    isOpenAccordion ? 'rotate-180 text-[#B45309]' : ''
                  }`} />
                </button>

                {isOpenAccordion && (
                  <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Guarantees Box */}
        <div className="mt-8 p-4 rounded-2xl bg-[#0E0E0E] text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FFDD00]" />
            <span>Satisfação ou Reembolso Garantido</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FFDD00] text-black font-bold uppercase text-xs rounded-xl hover:bg-[#FFE838]"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
