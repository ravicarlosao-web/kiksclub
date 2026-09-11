import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  ChevronDown, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  RotateCcw, 
  Check, 
  Package, 
  Clock,
  Sparkles
} from 'lucide-react';
import { FAQS } from '../data/sneakers';

interface HelpFaqPageProps {
  onNavigateHome: () => void;
  onOpenTracking?: () => void;
}

export const HelpFaqPage: React.FC<HelpFaqPageProps> = ({ 
  onNavigateHome,
  onOpenTracking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedTopic, setSelectedTopic] = useState<'all' | 'shipping' | 'payments' | 'authenticity' | 'returns'>('all');

  const topicKeywords: Record<string, string[]> = {
    shipping: ['envio', 'prazo', 'ctt', 'dias', 'entrega', 'transportadora', 'rastreio'],
    payments: ['pagamento', 'mb way', 'cartão', 'multibanco', 'moeda', 'fatura'],
    authenticity: ['autêntico', 'original', 'inspeção', 'qualidade', 'caixa', 'etiquetas'],
    returns: ['troca', 'tamanho', 'devolução', 'reembolso', 'devolver', '14 dias'],
  };

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchSearch = !searchTerm.trim() || 
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (selectedTopic === 'all') return true;

      const keywords = topicKeywords[selectedTopic] || [];
      const content = (faq.q + ' ' + faq.a).toLowerCase();
      return keywords.some(k => content.includes(k));
    });
  }, [searchTerm, selectedTopic]);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#FFDD00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Loja</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFDD00] animate-pulse" />
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Central de Ajuda & Apoio ao Cliente
            </span>
          </div>
        </div>

        {/* Header Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] text-xs font-black uppercase tracking-widest font-condensed">
            <HelpCircle className="w-4 h-4" />
            <span>Suporte & Perguntas Frequentes</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase font-condensed tracking-tight text-white">
            COMO PODEMOS <span className="text-[#FFDD00]">AJUDAR HOJE?</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-3xl">
            Encontra respostas imediatas sobre prazos de entrega (7-15 dias úteis), métodos de pagamento, garantia de autenticidade ou entra em contacto direto com a nossa equipa.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Gostaria%20de%20ajuda%20com%20uma%20encomenda."
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 hover:border-[#25D366]/50 transition-all group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-[#25D366] tracking-wider block">
                Atendimento Rápido
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">WhatsApp Oficial</h4>
              <p className="text-xs text-neutral-400 mt-0.5">+244 952 948 694</p>
              <span className="text-[10px] text-neutral-500 block mt-1">Resposta média: &lt; 5 min</span>
            </div>
          </a>

          <a
            href="mailto:kicksclub9@gmail.com"
            className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 hover:border-[#FFDD00]/50 transition-all group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFDD00]/10 text-[#FFDD00] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-[#FFDD00] tracking-wider block">
                Suporte Formal
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">Apoio por E-mail</h4>
              <p className="text-xs text-neutral-400 mt-0.5 truncate">kicksclub9@gmail.com</p>
              <span className="text-[10px] text-neutral-500 block mt-1">Resposta no próprio dia</span>
            </div>
          </a>

          {onOpenTracking ? (
            <button
              onClick={onOpenTracking}
              className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 hover:border-amber-500/50 transition-all group flex items-start gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">
                  Acompanhamento
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">Rastrear Encomenda</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Insere o código CTT</p>
                <span className="text-[10px] text-neutral-500 block mt-1">Estado em tempo real</span>
              </div>
            </button>
          ) : (
            <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">
                  Horário
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">Atendimento</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Segunda a Sábado</p>
                <span className="text-[10px] text-neutral-500 block mt-1">09h às 20h</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por dúvidas (ex: envios, prazos, MB WAY, trocas, tamanhos)..."
            className="w-full pl-12 pr-4 py-3.5 bg-[#141414] border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3 text-xs text-neutral-400 hover:text-white bg-neutral-800 px-2 py-1 rounded-md"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedTopic === 'all'
                ? 'bg-[#FFDD00] text-black font-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Todas as Perguntas ({FAQS.length})
          </button>

          <button
            onClick={() => setSelectedTopic('shipping')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedTopic === 'shipping'
                ? 'bg-[#FFDD00] text-black font-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Envios & Prazos (7-15 dias)</span>
          </button>

          <button
            onClick={() => setSelectedTopic('payments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedTopic === 'payments'
                ? 'bg-[#FFDD00] text-black font-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pagamentos</span>
          </button>

          <button
            onClick={() => setSelectedTopic('authenticity')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedTopic === 'authenticity'
                ? 'bg-[#FFDD00] text-black font-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Autenticidade</span>
          </button>

          <button
            onClick={() => setSelectedTopic('returns')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedTopic === 'returns'
                ? 'bg-[#FFDD00] text-black font-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Trocas de Tamanho</span>
          </button>
        </div>

        {/* FAQs Accordion List */}
        <div className="bg-[#141414] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-base font-black uppercase text-white font-condensed tracking-wide">
              Perguntas Frequentes dos Nossos Membros
            </h3>
            <span className="text-xs text-neutral-400 font-bold">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm font-bold text-neutral-300">Não encontrámos nenhuma resposta para "{searchTerm}"</p>
              <p className="text-xs text-neutral-500">
                Podes contactar diretamente a nossa equipa através do WhatsApp para tirares qualquer dúvida em minutos.
              </p>
              <a
                href={`https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Gostaria%20de%20saber%20sobre:%20${encodeURIComponent(searchTerm)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white font-bold text-xs uppercase rounded-xl font-condensed"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Perguntar no WhatsApp</span>
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-colors overflow-hidden ${
                      isOpen 
                        ? 'border-[#FFDD00]/50 bg-black/60 shadow-md' 
                        : 'border-neutral-800/80 bg-black/30 hover:border-neutral-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                    >
                      <span className="text-sm sm:text-base font-bold text-white font-condensed">
                        {faq.q}
                      </span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${
                        isOpen ? 'rotate-180 bg-[#FFDD00] text-black' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-neutral-800/60 text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2 animate-in fade-in duration-200">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Direct Contact Footer Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-neutral-950 via-[#121212] to-neutral-950 border border-neutral-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-black uppercase text-white font-condensed">
              Ainda precisas de assistência personalizada?
            </h4>
            <p className="text-xs text-neutral-400">
              Estamos disponíveis todos os dias para esclarecer todas as tuas questões.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Preciso%20de%20ajuda%20com%20uma%20d%C3%BAvida."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all font-condensed"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp: +244 952 948 694</span>
            </a>

            <a
              href="mailto:kicksclub9@gmail.com"
              className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors font-condensed"
            >
              <Mail className="w-4 h-4" />
              <span>Email: kicksclub9@gmail.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
