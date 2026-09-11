import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  Ruler, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  HelpCircle, 
  Package, 
  ArrowLeft,
  Check,
  CreditCard,
  Mail,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export type PolicyTab = 'sizes' | 'returns' | 'shipping' | 'authenticity' | 'payments';

interface PoliciesPageProps {
  initialTab?: PolicyTab;
  onNavigateHome: () => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ 
  initialTab = 'sizes', 
  onNavigateHome 
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Políticas Oficiais & Garantia Kicks Club
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] text-xs font-black uppercase tracking-widest font-condensed">
            <ShieldCheck className="w-4 h-4" />
            <span>Compromisso com o Cliente & Transparência Total</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase font-condensed tracking-tight text-white">
            POLÍTICAS DE ENVIO, <span className="text-[#FFDD00]">TROCAS & GARANTIA</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-3xl">
            No <strong>Kicks Club</strong> trabalhamos com padrões de excelência internacional. Todas as nossas encomendas são acompanhadas de seguro de transporte, rastreio em tempo real e garantia de 14 a 30 dias para trocas de tamanho e devoluções.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('sizes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-condensed transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sizes'
                ? 'bg-[#FFDD00] text-black shadow-md shadow-[#FFDD00]/10'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Trocas de Tamanho</span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-condensed transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'returns'
                ? 'bg-[#FFDD00] text-black shadow-md shadow-[#FFDD00]/10'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Devoluções & Reembolso</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-condensed transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'shipping'
                ? 'bg-[#FFDD00] text-black shadow-md shadow-[#FFDD00]/10'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Envios (7-15 Dias)</span>
          </button>

          <button
            onClick={() => setActiveTab('authenticity')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-condensed transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'authenticity'
                ? 'bg-[#FFDD00] text-black shadow-md shadow-[#FFDD00]/10'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>100% Autenticidade</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-condensed transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-[#FFDD00] text-black shadow-md shadow-[#FFDD00]/10'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagamentos Seguros</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-[#141414] border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-8">
          
          {/* TAB 1: TROCAS DE TAMANHO */}
          {activeTab === 'sizes' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Highlight Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900 to-[#181818] border border-neutral-800 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
                  <Ruler className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black uppercase text-white font-condensed tracking-wide">
                    O TAMANHO NÃO FICOU PERFEITO? TROCAMOS SEM COMPLICAÇÃO!
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Sabemos que a forma entre modelos Nike, Air Jordan, Yeezy, Bape ou New Balance pode oscilar. Por isso, oferecemos um processo de troca de número simples e rápido em Portugal.
                  </p>
                </div>
              </div>

              {/* 3 Step Exchange Process */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 font-condensed">
                  COMO FUNCIONA O PROCESSO DE TROCA:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#FFDD00] text-black font-black text-sm flex items-center justify-center font-mono">
                      1
                    </span>
                    <h5 className="text-sm font-bold uppercase text-white font-condensed">
                      1. Solicita até 14 Dias
                    </h5>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Tens 14 dias após a entrega para solicitar a troca via WhatsApp ou e-mail indicando o número desejado e o teu código de encomenda.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2.5">
                    <span className="w-8 h-8 rounded-xl bg-neutral-800 text-white font-black text-sm flex items-center justify-center font-mono">
                      2
                    </span>
                    <h5 className="text-sm font-bold uppercase text-white font-condensed">
                      2. Mantém o Artigo Impecável
                    </h5>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      O calçado e roupa devem estar sem marcas de uso exterior, com solas limpas, etiquetas originais intactas e caixa protetora.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#FFDD00] text-black font-black text-sm flex items-center justify-center font-mono">
                      3
                    </span>
                    <h5 className="text-sm font-bold uppercase text-white font-condensed">
                      3. Envio & Novo Par
                    </h5>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Assim que o par chega ao armazém para verificação técnica, expedimos imediatamente o novo tamanho com código de rastreio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sizing Guide */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
                <span className="text-xs font-black uppercase text-[#FFDD00] tracking-wider block font-condensed">
                  GUIA DE SIZING & RECOMENDAÇÕES POR MARCA
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
                  <div className="p-3 bg-black/40 rounded-xl border border-neutral-800">
                    <strong className="text-white block mb-1">Nike & Air Jordan</strong>
                    <p className="text-neutral-400">Verdadeiro ao tamanho habitual (True to Size). Pés mais largos podem optar por meio número acima.</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-neutral-800">
                    <strong className="text-white block mb-1">Yeezy (350 V2 / Foam)</strong>
                    <p className="text-neutral-400">Recomendamos meio número (0.5) acima do habitual devido à forma justa no peito do pé.</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-neutral-800">
                    <strong className="text-white block mb-1">New Balance (550, 9060)</strong>
                    <p className="text-neutral-400">Verdadeiro ao tamanho padrão europeu (EUR) com corte confortável e anatómico.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DEVOLUÇÕES & REEMBOLSO */}
          {activeTab === 'returns' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black uppercase text-white font-condensed tracking-wide">
                    DIREITO DE LIVRE RESOLUÇÃO (14 DIAS) & REEMBOLSO INTEGRAL
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Compre com total tranquilidade. Se por algum motivo mudar de ideias, tem o direito legal de devolver o seu artigo até 14 dias seguidos após a receção da encomenda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h5 className="text-sm font-black uppercase font-condensed">Condições para Aceitação</h5>
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Produto sem marcas de uso exterior nem desgaste nas solas ou tecidos.</li>
                    <li>Caixa original do fabricante intacta, sem fitas adesivas coladas diretamente na embalagem de marca.</li>
                    <li>Todos os acessórios, atacadores adicionais e etiquetas de garantia incluídos.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-[#FFDD00]">
                    <Clock className="w-5 h-5" />
                    <h5 className="text-sm font-black uppercase font-condensed">Método e Prazos de Reembolso</h5>
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside leading-relaxed">
                    <li>O reembolso é processado no prazo máximo de <strong>2 a 5 dias úteis</strong> após receção e inspeção.</li>
                    <li>Pagamentos por <strong>MB WAY</strong> são estornados de imediato para o mesmo número de telemóvel.</li>
                    <li>Pagamentos por Cartão de Crédito são creditados na fatura do cartão original.</li>
                  </ul>
                </div>
              </div>

              {/* Callout */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <strong className="text-white block mb-0.5 font-bold">Deseja iniciar uma devolução agora?</strong>
                  <span>A nossa equipa disponibiliza a morada e guia de envio em menos de 10 minutos.</span>
                </div>
                <a
                  href="https://wa.me/244952948694?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20uma%20devolu%C3%A7%C3%A3o%20da%20minha%20encomenda."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#FFDD00] text-black font-black uppercase text-xs rounded-xl font-condensed whitespace-nowrap hover:bg-[#FFE838] transition-colors flex-shrink-0 shadow-sm"
                >
                  Contactar Suporte
                </a>
              </div>

            </div>
          )}

          {/* TAB 3: ENVIOS E PRAZOS */}
          {activeTab === 'shipping' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black uppercase text-white font-condensed tracking-wide">
                    LOGÍSTICA SEGURA • RASTREIO INTEGRADO EM TEMPO REAL
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Todas as encomendas são expedidas com seguro total de transporte contra perda ou extravio, proteção Double-Box reforçada e código de acompanhamento passo a passo.
                  </p>
                </div>
              </div>

              {/* Delivery Timeline Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#FFDD00] tracking-wider font-condensed">
                      PORTUGAL CONTINENTAL
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-[11px] font-bold">
                      7 a 15 Dias Úteis
                    </span>
                  </div>
                  <h4 className="text-base font-black uppercase text-white font-condensed">
                    Entrega Direta na Morada
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Entregas seguras de segunda a sexta-feira. Notificação por SMS e e-mail no dia da entrega com o intervalo horário estimado.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#FFDD00] tracking-wider font-condensed">
                      ILHAS (AÇORES & MADEIRA)
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-[11px] font-bold">
                      7 a 15 Dias Úteis
                    </span>
                  </div>
                  <h4 className="text-base font-black uppercase text-white font-condensed">
                    Transporte Aéreo Expresso
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Expedição marítima/aérea com rastreio ativo e cobertura completa de seguro em todas as ilhas dos arquipélagos.
                  </p>
                </div>
              </div>

              {/* Double Box Packaging Guarantee */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-sm font-black uppercase text-white font-condensed">
                    Proteção Reforçada Double-Box
                  </h5>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    A caixa original do sneaker viaja sempre protegida dentro de uma caixa de papelão kraft reforçada, garantindo que o seu par e respetiva embalagem chegam em estado de colecionador.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: 100% AUTENTICIDADE */}
          {activeTab === 'authenticity' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black uppercase text-white font-condensed tracking-wide">
                    GARANTIA DE AUTENTICIDADE & QUALIDADE PREMIUM
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    No <strong>Kicks Club</strong> cada artigo é inspecionado por peritos experientes em calçado e streetwear antes de ser empacotado para expedição.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <h5 className="text-sm font-black uppercase text-white font-condensed">
                    Materiais & Costuras
                  </h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Verificação milimétrica de pele, camurça, costuras duplas, peso do calçado e solas vulcanizadas.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <h5 className="text-sm font-black uppercase text-white font-condensed">
                    Etiquetas & Códigos
                  </h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Cruzamento do código SKU, códigos de barras da caixa e etiquetas internas de lote de fabrico.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <h5 className="text-sm font-black uppercase text-white font-condensed">
                    Acessórios Completos
                  </h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Inclusão de todos os atacadores suplementares, papéis de embrulho oficiais e caixas originais de fábrica.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: MÉTODOS DE PAGAMENTO SEGUROS */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-700 text-[#FFDD00] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black uppercase text-white font-condensed tracking-wide">
                    PAGAMENTOS 100% SEGUROS & CRIPTOGRAFADOS
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Processamos os pagamentos através das entidades mais conceituadas de Portugal e da Europa. Todos os dados são transmitidos com encriptação SSL/TLS de 256 bits.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2">
                  <span className="text-xs font-black uppercase text-[#FFDD00] block font-condensed">
                    MÉTODO #1
                  </span>
                  <h4 className="text-base font-black text-white font-condensed">MB WAY</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    O método mais rápido em Portugal. Confirmação instantânea através de notificação na app do teu telemóvel.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2">
                  <span className="text-xs font-black uppercase text-[#FFDD00] block font-condensed">
                    MÉTODO #2
                  </span>
                  <h4 className="text-base font-black text-white font-condensed">Cartão de Crédito / Débito</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Visa, Mastercard, American Express com autenticação 3D Secure integrada via Stripe.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-2">
                  <span className="text-xs font-black uppercase text-[#FFDD00] block font-condensed">
                    MÉTODO #3
                  </span>
                  <h4 className="text-base font-black text-white font-condensed">Referência Multibanco</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Pagamento simples em qualquer caixa Multibanco ou através do homebanking com Entidade e Referência.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Direct Support Card */}
        <div className="p-6 bg-gradient-to-r from-neutral-950 via-[#121212] to-neutral-950 border border-neutral-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-black uppercase text-white font-condensed">
              Tens alguma dúvida específica que não encontraste aqui?
            </h4>
            <p className="text-xs text-neutral-400">
              A nossa equipa de apoio ao cliente está disponível para te ajudar de forma personalizada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/244952948694?text=Ol%C3%A1%20Kicks%20Club!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20as%20pol%C3%ADticas."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all font-condensed"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Falar no WhatsApp (+244 952 948 694)</span>
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
