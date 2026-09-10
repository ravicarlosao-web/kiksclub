import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Truck, 
  ShieldCheck, 
  Ruler, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Clock, 
  MessageCircle, 
  HelpCircle,
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';

export type PolicyTab = 'sizes' | 'returns' | 'shipping' | 'authenticity';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
  onOpenTracking?: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'sizes',
  onOpenTracking,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#121212] border border-neutral-800 rounded-3xl text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/80 bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFDD00] font-condensed">
                  KICKS CLUB TRUST
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase">
                  Garantia Oficial
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase font-condensed tracking-tight text-white">
                POLÍTICAS & COMPROMISSO DE CONFIANÇA
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-[#141414] overflow-x-auto custom-scrollbar px-6 pt-2">
          <button
            onClick={() => setActiveTab('sizes')}
            className={`pb-3.5 pt-2 px-3 text-xs font-black uppercase tracking-wider font-condensed transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sizes'
                ? 'border-[#FFDD00] text-[#FFDD00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Trocas de Tamanho</span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`pb-3.5 pt-2 px-3 text-xs font-black uppercase tracking-wider font-condensed transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'returns'
                ? 'border-[#FFDD00] text-[#FFDD00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Devoluções & Reembolso</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3.5 pt-2 px-3 text-xs font-black uppercase tracking-wider font-condensed transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'shipping'
                ? 'border-[#FFDD00] text-[#FFDD00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Envios CTT Expresso</span>
          </button>

          <button
            onClick={() => setActiveTab('authenticity')}
            className={`pb-3.5 pt-2 px-3 text-xs font-black uppercase tracking-wider font-condensed transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'authenticity'
                ? 'border-[#FFDD00] text-[#FFDD00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>100% Autenticidade</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* TAB 1: TROCAS DE TAMANHO */}
          {activeTab === 'sizes' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Highlight Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ruler className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase text-white font-condensed">
                    O TAMANHO NÃO FICOU PERFEITO? TROCAMOS SEM COMPLICAÇÃO!
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Sabemos que a forma entre modelos Nike, Air Jordan, Yeezy ou New Balance pode oscilar. Por isso, oferecemos um processo de troca de número simples e rápido em Portugal.
                  </p>
                </div>
              </div>

              {/* 3 Step Exchange Process */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                  COMO FUNCIONA A TROCA (PASSO A PASSO):
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#161616] border border-neutral-800 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFDD00] text-black font-black text-xs flex items-center justify-center font-mono">
                      1
                    </span>
                    <h5 className="text-xs font-bold uppercase text-white font-condensed">
                      Solicita em 14 Dias
                    </h5>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Tens 14 dias após a entrega para solicitar a troca via WhatsApp ou email indicando o número desejado.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#161616] border border-neutral-800 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 text-white font-black text-xs flex items-center justify-center font-mono">
                      2
                    </span>
                    <h5 className="text-xs font-bold uppercase text-white font-condensed">
                      Mantém a Caixa Intacta
                    </h5>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      O calçado deve estar sem marcas de uso no chão, com solas limpas, etiquetas intactas e caixa original.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#161616] border border-neutral-800 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFDD00] text-black font-black text-xs flex items-center justify-center font-mono">
                      3
                    </span>
                    <h5 className="text-xs font-bold uppercase text-white font-condensed">
                      Envio CTT Expresso
                    </h5>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Assim que o par chega ao armazém para verificação, expedimos o novo tamanho em 24h a 48h.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips on Sizing */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                <span className="text-[10px] font-black uppercase text-[#FFDD00] tracking-wider block font-condensed">
                  GUIA RÁPIDO DE SIZING POR MARCA
                </span>
                <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Nike & Jordan:</strong> Fiel ao tamanho habitual (True to Size). Se tiveres o pé largo, podes optar por meio número acima.</li>
                  <li><strong>Yeezy Boost 350 V2:</strong> Recomendamos encomendar meio número (0.5) acima do teu habitual devido ao ajuste firme no peito do pé.</li>
                  <li><strong>New Balance (série 550, 9060, 2002R):</strong> Verdadeiro ao tamanho habitual de Portugal.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 2: DEVOLUÇÕES & REEMBOLSO */}
          {activeTab === 'returns' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase text-white font-condensed">
                    DIREITO DE LIVRE RESOLUÇÃO (14 DIAS) & REEMBOLSO INTEGRAL
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Compre com total tranquilidade. Se por algum motivo mudar de ideias, tem o direito de devolver o seu artigo até 14 dias seguidos após a receção da encomenda.
                  </p>
                </div>
              </div>

              {/* Conditions & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#161616] border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <h5 className="text-xs font-black uppercase font-condensed">Condições para Devolução</h5>
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
                    <li>Produto sem qualquer sinal de uso no exterior.</li>
                    <li>Caixa original do fabricante sem rasgos ou fitas adesivas coladas diretamente.</li>
                    <li>Todos os acessórios incluídos (atacadores extra, tags, etc).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#161616] border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-[#FFDD00]">
                    <Clock className="w-4 h-4" />
                    <h5 className="text-xs font-black uppercase font-condensed">Prazos de Reembolso</h5>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    O reembolso é processado no prazo máximo de <strong>48 horas</strong> após a receção e inspeção do artigo no nosso centro de triagem.
                  </p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    O valor é creditado exatamente através do mesmo método utilizado: <strong>MB WAY</strong>, <strong>Cartão</strong> ou <strong>Transferência Bancária</strong>.
                  </p>
                </div>
              </div>

              {/* How to initiate return */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-center justify-between gap-4">
                <div>
                  <strong className="block text-white font-bold mb-0.5">Deseja iniciar uma devolução?</strong>
                  Fale com a nossa equipa de apoio ao cliente para receber as instruções e a morada de expedição do armazém.
                </div>
                <a
                  href="https://wa.me/351934755363?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20uma%20devolu%C3%A7%C3%A3o%20da%20minha%20encomenda."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#FFDD00] text-black font-black uppercase text-[11px] rounded-xl font-condensed whitespace-nowrap hover:bg-[#FFE838] transition-colors flex-shrink-0"
                >
                  Contactar Suporte
                </a>
              </div>

            </div>
          )}

          {/* TAB 3: ENVIOS CTT EXPRESSO */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase text-white font-condensed">
                    LOGÍSTICA NACIONAL CTT EXPRESSO • RASTREIO INTEGRADO EM TEMPO REAL
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Todas as encomendas são expedidas via <strong>CTT Expresso Nacional</strong> com código de rastreio individual e aviso por SMS para a sua comodidade.
                  </p>
                </div>
              </div>

              {/* Delivery Times Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#161616] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#FFDD00] tracking-wider font-condensed">
                      PORTUGAL CONTINENTAL
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold">
                      24h a 48h Úteis
                    </span>
                  </div>
                  <h4 className="text-base font-black uppercase text-white font-condensed">
                    Entrega Rápida à Porta
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Entregas de segunda a sexta-feira. Recebe uma mensagem dos CTT no dia da entrega com o intervalo horário previsto.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#161616] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#FFDD00] tracking-wider font-condensed">
                      ILHAS (AÇORES & MADEIRA)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                      3 a 5 Dias Úteis
                    </span>
                  </div>
                  <h4 className="text-base font-black uppercase text-white font-condensed">
                    CTT Expresso Aéreo
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Expedição direta via aérea para todas as ilhas dos arquipélagos da Madeira e dos Açores.
                  </p>
                </div>
              </div>

              {/* Packaging Quality: Double Box */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-neutral-800 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-neutral-800 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-black uppercase text-white font-condensed">
                    PROTEÇÃO REFORÇADA 'DOUBLE BOX'
                  </h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Nenhum sneaker sai do armazém sem uma caixa exterior reforçada de proteção ('double box'). Isto garante que a caixa original de coleção chega impecável, sem amassos nem etiquetas coladas.
                  </p>
                </div>
              </div>

              {onOpenTracking && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTracking();
                    }}
                    className="px-5 py-2.5 bg-[#FFDD00] text-black font-black uppercase text-xs rounded-xl hover:bg-[#FFE838] transition-colors font-condensed flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Aceder ao Portal de Rastreio CTT</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: 100% AUTENTICIDADE */}
          {activeTab === 'authenticity' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase text-white font-condensed">
                    GARANTIA DE AUTENTICIDADE 100% VERIFICADA
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    No KICKS CLUB temos tolerância ZERO para réplicas ou contrafações. Cada par de ténis e peça de vestuário é submetido a um rigoroso protocolo físico de autenticação por especialistas antes do envio.
                  </p>
                </div>
              </div>

              {/* Authentication Inspection Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 font-condensed">
                  CHECKLIST DE INSPEÇÃO FÍSICA NO ARMAZÉM:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#161616] border border-neutral-800 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase font-condensed">Costuras & Acabamentos</h5>
                      <p className="text-[10px] text-neutral-400">Verificação milimétrica dos padrões originais de costura.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161616] border border-neutral-800 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase font-condensed">Etiquetas UV & Códigos de Barras</h5>
                      <p className="text-[10px] text-neutral-400">Leitura de códigos e marcas de água sob luz ultravioleta.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161616] border border-neutral-800 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase font-condensed">Palmilhas & Entressolas</h5>
                      <p className="text-[10px] text-neutral-400">Inspeção da estrutura interna, cola e amortecimento.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161616] border border-neutral-800 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase font-condensed">Selo KICKS CLUB Certificado</h5>
                      <p className="text-[10px] text-neutral-400">Acompanha lacre de autenticidade numerado e intransferível.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifetime Guarantee Promise */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
                <Lock className="w-6 h-6 text-[#FFDD00] mx-auto" />
                <h4 className="text-sm font-black uppercase text-white font-condensed">
                  GARANTIA DE AUTENTICIDADE VITALÍCIA
                </h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Se em qualquer momento for comprovado que um artigo adquirido no KICKS CLUB não é 100% autêntico, reembolsamos <strong>200% do valor pago</strong>.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer with Support Action */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <HelpCircle className="w-4 h-4 text-[#FFDD00]" />
            <span>Ficou com alguma dúvida específica? Fale connosco no WhatsApp.</span>
          </div>

          <a
            href="https://wa.me/351934755363?text=Ol%C3%A1%20Kicks%20Club!%20Tenho%20uma%20d%C3%BAvida%20sobre%20as%20pol%C3%ADticas%20de%20trocas%20e%20envios."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black uppercase text-xs rounded-xl transition-colors font-condensed flex items-center justify-center gap-2 shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Suporte WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};
