import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, MapPin, Package, AlertCircle } from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  initialCode = 'KC-98421PT',
}) => {
  const [code, setCode] = useState(initialCode);
  const [searched, setSearched] = useState(true);

  if (!isOpen) return null;

  const timeline = [
    {
      title: 'Encomenda Registada & Paga',
      desc: 'Pagamento confirmado com sucesso via MB WAY.',
      time: 'Ontem às 14:32',
      done: true,
      current: false,
    },
    {
      title: 'Inspeção de Autenticidade Concluída',
      desc: 'Sneakers verificados e aprovados pela equipa técnica KICKS CLUB.',
      time: 'Ontem às 18:15',
      done: true,
      current: false,
    },
    {
      title: 'Em Trânsito - CTT Expresso Hub Lisboa',
      desc: 'Objeto processado no centro operacional de distribuição.',
      time: 'Hoje às 08:40',
      done: true,
      current: true,
    },
    {
      title: 'Em Distribuição para a Morada',
      desc: 'Estafeta a caminho da tua residência.',
      time: 'Previsão: Hoje até às 18:00',
      done: false,
      current: false,
    },
    {
      title: 'Entrega Concluída',
      desc: 'Assinatura e receção da encomenda.',
      time: 'Pendente',
      done: false,
      current: false,
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 text-black shadow-2xl border border-neutral-200"
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
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase font-condensed">
              Rastrear Encomenda
            </h3>
            <p className="text-xs text-neutral-500">
              Acompanha o estado do teu envio em tempo real via CTT Expresso.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(true);
          }}
          className="flex gap-2 mb-6"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Insere o teu código (ex: KC-98421PT)"
            className="flex-1 bg-neutral-100 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#FFDD00]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-black text-[#FFDD00] rounded-xl text-xs font-bold uppercase hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pesquisar</span>
          </button>
        </form>

        {searched && (
          <div className="space-y-6">
            {/* Status Header Pill */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-600 block">ESTADO ATUAL</span>
                <span className="text-sm font-black text-black flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04] animate-ping" />
                  Em Trânsito (CTT Expresso)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-600 block">ENTREGA ESTIMADA</span>
                <span className="text-xs font-black text-[#B45309]">Hoje até às 18:00</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4 text-xs">
                  {/* Dot */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    item.done
                      ? item.current
                        ? 'bg-[#FFDD00] ring-4 ring-[#FFDD00]/40 text-black'
                        : 'bg-black text-white'
                      : 'bg-neutral-200 text-neutral-400'
                  }`}>
                    {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                  </div>

                  <div>
                    <h4 className={`font-black uppercase tracking-tight ${item.done ? 'text-black' : 'text-neutral-400'}`}>
                      {item.title}
                    </h4>
                    <p className="text-neutral-500 mt-0.5">{item.desc}</p>
                    <span className="text-[10px] font-semibold text-neutral-400 block mt-1">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Callout */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 flex items-center justify-between">
              <span>Precisas de alterar a morada de entrega?</span>
              <a
                href="https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Preciso%20de%20ajuda%20com%20o%20rastreio%20da%20encomenda."
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B45309] font-bold hover:underline"
              >
                Falar no WhatsApp
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
