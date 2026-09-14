import React, { useState, useEffect } from 'react';
import { Search, Truck, CheckCircle2, Clock, ArrowLeft, MessageCircle, ShieldCheck, Package, MapPin } from 'lucide-react';
import { Order } from '../types';

interface TrackingPageProps {
  initialCode?: string;
  onNavigateHome: () => void;
  fetchOrderByCode?: (code: string) => Promise<import('../types').Order | null>;
  orders?: import('../types').Order[]; // mantido por compatibilidade
}

export const TrackingPage: React.FC<TrackingPageProps> = ({
  initialCode = '',
  onNavigateHome,
  fetchOrderByCode,
  orders = [],
}) => {
  const [trackingInput, setTrackingInput] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [hasSearched, setHasSearched] = useState(Boolean(initialCode));
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Se tiver código inicial, buscar logo
  useEffect(() => {
    if (initialCode) {
      doSearch(initialCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const doSearch = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setActiveCode(trimmed);
    setHasSearched(true);
    setIsSearching(true);

    try {
      if (fetchOrderByCode) {
        const found = await fetchOrderByCode(trimmed);
        setMatchedOrder(found);
      } else {
        // Fallback local se não tiver API
        const found = orders.find(
          (o) => o.id.toUpperCase() === trimmed || o.trackingCode?.toUpperCase() === trimmed
        );
        setMatchedOrder(found || null);
      }
    } catch {
      setMatchedOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(trackingInput);
  };

  const orderStatus = matchedOrder?.status || 'Em Trânsito';

  const isDelivered = orderStatus === 'Entregue' || orderStatus === 'Concluído';
  const isShipped = orderStatus === 'Enviado CTT' || orderStatus === 'Em Trânsito' || isDelivered;
  const isProcessing = orderStatus === 'Em Processamento' || isShipped;
  const isPaid = orderStatus === 'Pago' || isProcessing;
  const isPending = orderStatus === 'Pendente';
  const isCancelled = orderStatus === 'Cancelado';

  const timeline = [
    {
      title: 'Encomenda Registada',
      desc: 'Pedido registado com sucesso no sistema e a aguardar liquidação/verificação.',
      time: matchedOrder ? new Date(matchedOrder.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'Ontem às 14:32',
      done: true,
      current: isPending,
    },
    {
      title: 'Pagamento Confirmado',
      desc: 'Pagamento confirmado via MB WAY / Multibanco / Cartão.',
      time: isPaid ? 'Confirmado' : isCancelled ? 'Cancelado' : 'A aguardar',
      done: isPaid,
      current: orderStatus === 'Pago',
    },
    {
      title: 'Inspeção de Autenticidade & Embalamento',
      desc: 'Sneakers verificados e aprovados pela equipa de qualidade em armazém.',
      time: isProcessing ? 'Concluído' : 'Pendente',
      done: isProcessing,
      current: orderStatus === 'Em Processamento',
    },
    {
      title: 'Enviado CTT Expresso (Hub Lisboa)',
      desc: matchedOrder?.trackingCode ? `Objeto expedido com o código de rastreio CTT: ${matchedOrder.trackingCode}` : 'Objeto expedido e em triagem logística para entrega nacional.',
      time: isShipped ? (orderStatus === 'Enviado CTT' ? 'Expedido hoje' : 'Em trânsito') : 'A aguardar envio',
      done: isShipped,
      current: orderStatus === 'Enviado CTT' || orderStatus === 'Em Trânsito',
    },
    {
      title: 'Entrega Concluída',
      desc: 'Receção na morada com comprovativo de entrega assinado.',
      time: isDelivered ? 'Entregue' : 'Previsão: 7 a 15 dias úteis',
      done: isDelivered,
      current: isDelivered,
    }
  ];

  return (
    <div className="min-h-[80vh] bg-white text-black py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Back Link */}
        <div className="mb-8">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-black transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#FFDD00]" />
            <span>Voltar à Loja Principal</span>
          </button>
        </div>

        {/* Hero Title Section matching Black & Yellow aesthetic */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#FFDD00] text-[11px] font-black uppercase tracking-widest rounded-full font-condensed">
            <Truck className="w-3.5 h-3.5" />
            <span>PORTAL CTT EXPRESSO</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase font-condensed tracking-tight text-neutral-950">
            PORTAL DE RASTREIO OFICIAL
          </h1>
          
          {/* Yellow Accent underline matching site primary theme */}
          <div className="w-16 h-1.5 bg-[#FFDD00] mx-auto rounded-full"></div>

          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto">
            Acompanhe a sua encomenda em tempo real com transparência total.
          </p>
        </div>

        {/* Central Search Input Box matching Black & Yellow */}
        <div className="max-w-2xl mx-auto mb-12">
          <form 
            onSubmit={handleSearch}
            className="bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-black shadow-lg shadow-black/5 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 w-full pl-3 sm:pl-4">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Introduza a Referência (ex: LZC9BD60B8) ou Código de Rastreio (ex: KC-98421PT)"
                className="w-full text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 font-medium focus:outline-none bg-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-black hover:bg-neutral-800 text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md font-condensed hover:scale-[1.02]"
            >
              <Search className="w-4 h-4 stroke-[3]" />
              <span>RASTREAR</span>
            </button>
          </form>
        </div>

        {/* State A: Not searched yet / Clean Empty Placeholder */}
        {!hasSearched && (
          <div className="py-12 sm:py-16 text-center space-y-4 max-w-md mx-auto animate-in fade-in duration-300">
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 border border-neutral-200">
              <Truck className="w-10 h-10 stroke-[1.5] text-neutral-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-800">
                Introduza a referência da sua encomenda ou código de rastreamento acima.
              </p>
              <p className="text-xs text-neutral-500">
                Encontrará a referência no e-mail de confirmação do pedido ou no WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* State B: Search results found - Detailed Real-time Tracking Panel */}
        {hasSearched && (
          <div className="bg-neutral-50 rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Status Header Box */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                  CÓDIGO DE ENVIO CTT EXPRESSO
                </span>
                <span className="text-2xl font-black font-condensed tracking-wider text-black block mt-0.5">
                  {matchedOrder?.trackingCode || activeCode || 'KC-98421PT'}
                </span>
                <span className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  orderStatus === 'Entregue'
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : orderStatus === 'Em Trânsito'
                    ? 'bg-yellow-50 text-black border-yellow-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${orderStatus === 'Entregue' ? 'bg-green-500' : 'bg-[#FFDD00] animate-pulse'} ring-2 ring-black/20`}></span>
                  {orderStatus} • CTT Expresso Portugal 24h
                </span>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                  {orderStatus === 'Entregue' ? 'ESTADO FINAL' : 'PREVISÃO DE ENTREGA'}
                </span>
                <span className="text-lg font-black text-black block">
                  {orderStatus === 'Entregue' ? 'Entregue com Sucesso' : 'Hoje até às 18:00'}
                </span>
                <span className="text-xs text-neutral-500">
                  {matchedOrder ? `Destino: ${matchedOrder.city}` : 'Entrega na morada registada'}
                </span>
              </div>
            </div>

            {/* If a real order was found in store, display purchased item snippet */}
            {matchedOrder && (
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                  CALÇADOS NESTA ENCOMENDA ({matchedOrder.items.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase text-neutral-600 block">{item.brand}</span>
                        <h4 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h4>
                        <span className="text-[11px] text-neutral-500">{item.color ? `Cor: ${item.color} • ` : ''}Tam EU: {item.size} • Qtd: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline View */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                Histórico de Atualizações de Envio
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 text-xs">
                    {/* Status Dot */}
                    <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                      item.done
                        ? item.current
                          ? 'bg-[#FFDD00] ring-4 ring-[#FFDD00]/30 text-black font-black'
                          : 'bg-black text-[#FFDD00]'
                        : 'bg-neutral-200 text-neutral-400'
                    }`}>
                      {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-neutral-200 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className={`font-black uppercase tracking-tight text-sm ${item.done ? 'text-black' : 'text-neutral-400'}`}>
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-semibold text-neutral-500">{item.time}</span>
                      </div>
                      <p className="text-neutral-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Callout */}
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center flex-shrink-0 border border-neutral-200">
                  <ShieldCheck className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-neutral-900">
                    Garantia de Entrega Segura
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Se precisares de alterar a morada ou reagendar, fala connosco no WhatsApp.
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Preciso%20de%20ajuda%20com%20o%20rastreio%20do%20pedido%20${activeCode}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-neutral-800 text-[#FFDD00] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Apoio via WhatsApp</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
