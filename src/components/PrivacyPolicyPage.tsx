import React from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Eye, 
  Database, 
  Clock, 
  CreditCard, 
  Mail, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  Trash2, 
  FileSpreadsheet, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
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
              Conforme RGPD (UE 2016/679)
            </span>
          </div>
        </div>

        {/* Header Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-[#FFDD00] text-xs font-black uppercase tracking-widest font-condensed">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacidade & Proteção de Dados Pessoais</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase font-condensed tracking-tight text-white">
            POLÍTICA DE PRIVACIDADE <span className="text-[#FFDD00]">KICKSCLUB.PT</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-3xl">
            A proteção da tua privacidade e dos teus dados pessoais é uma prioridade absoluta para o <strong>KicksClub.pt</strong>.
            Este documento explica de forma clara e transparente como recolhemos, tratamos, protegemos e armazenamos os teus dados,
            em estrito cumprimento do Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento UE 2016/679) e da legislação portuguesa aplicável.
          </p>
          <p className="text-xs text-neutral-500">
            Última atualização: Março de 2026 • Versão 2.1
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-black border border-neutral-800 flex items-center justify-center text-[#FFDD00]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase font-condensed">Check-out 100% Blindado</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Os dados de pagamento são encriptados e processados diretamente pela Stripe. Nunca guardamos dados do teu cartão.
            </p>
          </div>

          <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-black border border-neutral-800 flex items-center justify-center text-[#FFDD00]">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase font-condensed">Minimização de Dados</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Apenas recolhemos o estritamente necessário para expedir os teus sneakers e emitir a faturação.
            </p>
          </div>

          <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-black border border-neutral-800 flex items-center justify-center text-[#FFDD00]">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase font-condensed">Controlo Total RGPD</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Podes aceder, retificar ou solicitar o apagamento dos teus dados pessoais a qualquer momento por e-mail.
            </p>
          </div>
        </div>

        {/* Section 1: Responsável pelo Tratamento */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              1
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Responsável pelo Tratamento dos Dados
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            O responsável pelo tratamento dos dados pessoais recolhidos através do website <strong>kicksclub.pt</strong> é a equipa KicksClub,
            com sede de distribuição em Lisboa, Portugal. Para qualquer questão relacionada com a proteção dos teus dados pessoais,
            podes contactar o nosso Encarregado de Privacidade através do e-mail dedicado:{' '}
            <a href="mailto:privacidade@kicksclub.pt" className="text-[#FFDD00] font-bold underline hover:text-[#FFE838]">
              privacidade@kicksclub.pt
            </a>{' '}
            ou pelo e-mail geral{' '}
            <a href="mailto:geral@kicksclub.pt" className="text-[#FFDD00] font-bold underline hover:text-[#FFE838]">
              geral@kicksclub.pt
            </a>.
          </p>
        </div>

        {/* Section 2: Que dados recolhemos */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              2
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Que Dados Pessoais Recolhemos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Recolhemos apenas as informações necessárias para processar as tuas encomendas, prestar apoio ao cliente e garantir uma experiência de navegação segura:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0 mt-0.5" />
              <span><strong>Identificação e Contacto:</strong> Nome completo, endereço de correio eletrónico (e-mail) e número de telefone/telemóvel.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0 mt-0.5" />
              <span><strong>Dados de Entrega:</strong> Morada física (rua, número, andar), código postal e cidade de destino em Portugal ou União Europeia.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0 mt-0.5" />
              <span><strong>Histórico de Encomendas:</strong> Artigos adquiridos, tamanhos selecionados, montantes pagos, método de pagamento escolhido e códigos de rastreio CTT Expresso.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FFDD00] flex-shrink-0 mt-0.5" />
              <span><strong>Dados Técnicos & Segurança:</strong> Endereço IP (encriptado/anonimizado nos registos), tipo de navegador e dados de cookies de sessão técnica estritamente necessários.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Finalidades do Tratamento */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              3
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Para Que Finalidades Usamos os Teus Dados
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-300">
            <div className="p-3.5 bg-black/40 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold">Execução do Contrato de Compra e Venda</strong>
              <p className="text-neutral-400 text-xs">Processar pagamentos, separar os artigos em armazém e expedir a encomenda para a tua morada via transportadora expressa.</p>
            </div>
            <div className="p-3.5 bg-black/40 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold">Comunicação e Rastreio da Encomenda</strong>
              <p className="text-neutral-400 text-xs">Enviar atualizações do estado da encomenda, código CTT Expresso e suporte direto via WhatsApp ou e-mail.</p>
            </div>
            <div className="p-3.5 bg-black/40 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold">Cumprimento de Obrigações Legais e Fiscais</strong>
              <p className="text-neutral-400 text-xs">Emissão de documentos contabilísticos de acordo com as normas da Autoridade Tributária portuguesa.</p>
            </div>
            <div className="p-3.5 bg-black/40 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold">Prevenção de Fraude e Segurança</strong>
              <p className="text-neutral-400 text-xs">Proteção contra transações fraudulentas e monitorização de integridade do sistema com limites rigorosos de acessos.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Pagamentos Stripe */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              4
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Processamento de Pagamentos e Parceria Stripe
            </h2>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 flex-shrink-0 mt-1">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <p>
                Os pagamentos online por Cartão de Crédito/Débito, MB WAY e Referência Multibanco são operados pela instituição financeira internacional{' '}
                <strong>Stripe Payments Europe, Ltd.</strong> (com certificação PCI-DSS Nível 1, o padrão mais elevado da indústria bancária).
              </p>
              <p>
                <strong>O KicksClub.pt não tem acesso, não recolhe e não armazena o número do teu cartão, código CVV ou dados bancários sensíveis.</strong>{' '}
                Estes dados são transmitidos através de ligação direta e encriptada aos servidores da Stripe.
              </p>
              <p className="pt-1">
                Para consultar os termos de privacidade específicos da Stripe, visita a{' '}
                <a 
                  href="https://stripe.com/pt/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#FFDD00] font-bold underline hover:text-[#FFE838]"
                >
                  <span>Política de Privacidade da Stripe</span>
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Destinatários dos Dados */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              5
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Quem Tem Acesso aos Teus Dados
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            <strong>Nunca vendemos, alugamos ou comercializamos os teus dados a terceiros.</strong> Os dados apenas são partilhados com subcontratantes estritamente necessários para a operação do serviço:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-[#FFDD00] font-bold">•</span>
              <span><strong>Transportadoras (ex: CTT Expresso / DPD):</strong> Nome, morada e telefone para entrega da encomenda e notificações por SMS/tracking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFDD00] font-bold">•</span>
              <span><strong>Passarela de Pagamento (Stripe):</strong> Dados de transação para validação e liquidação financeira segura.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFDD00] font-bold">•</span>
              <span><strong>Infraestrutura e Alojamento (Vercel & Turso Cloud):</strong> Servidores seguros na União Europeia com encriptação em repouso e em trânsito.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFDD00] font-bold">•</span>
              <span><strong>Autoridades Públicas:</strong> Apenas se exigido por lei judicial ou obrigação fiscal formal.</span>
            </li>
          </ul>
        </div>

        {/* Section 6: Prazos de Conservação */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              6
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Prazo de Conservação dos Dados
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Conservamos os teus dados apenas durante o período estritamente necessário para as finalidades para as quais foram recolhidos:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-[#FFDD00] font-bold">•</span>
              <span><strong>Dados de Encomenda & Faturação:</strong> Conservados durante o prazo legal de 10 anos exigido pelo Código Comercial português para efeitos fiscais e contabilísticos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFDD00] font-bold">•</span>
              <span><strong>Apoio ao Cliente e Mensagens:</strong> Conservados até 12 meses após a resolução do pedido de suporte.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFDD00] font-bold">•</span>
              <span><strong>Após pedido de Direito ao Esquecimento:</strong> Todos os identificadores pessoais diretos (nome, email, telefone, morada) são imediatamente anonimizados de forma irreversível.</span>
            </li>
          </ul>
        </div>

        {/* Section 7: Direitos do Titular (RGPD) */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              7
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Os Teus Direitos ao Abrigo do RGPD
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Como titular dos dados, o Regulamento Geral sobre a Proteção de Dados confere-te os seguintes direitos fundamentais:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FFDD00]" />
                Direito de Acesso
              </strong>
              <span className="text-neutral-400">Podes solicitar confirmação e uma cópia de todos os dados pessoais que mantemos sobre ti.</span>
            </div>

            <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FFDD00]" />
                Direito de Retificação
              </strong>
              <span className="text-neutral-400">Podes solicitar a correção imediata de dados incompletos ou incorretos (ex: morada ou telefone).</span>
            </div>

            <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Direito ao Apagamento ("Esquecimento")
              </strong>
              <span className="text-neutral-400">Podes requerer a eliminação ou anonimização total dos teus dados pessoais das nossas bases de dados.</span>
            </div>

            <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl space-y-1">
              <strong className="text-white block font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFDD00]" />
                Direito à Portabilidade
              </strong>
              <span className="text-neutral-400">Podes receber os teus dados num formato estruturado, de uso corrente e de leitura automática (ex: JSON ou CSV).</span>
            </div>
          </div>

          {/* Contact Box to exercise rights */}
          <div className="p-4 bg-yellow-950/20 border border-yellow-800/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFDD00] font-condensed">
                Como Exercer os Teus Direitos
              </span>
              <p className="text-xs text-neutral-300">
                Basta enviar um e-mail com a indicação do teu nome e número de encomenda para:
              </p>
              <a 
                href="mailto:privacidade@kicksclub.pt?subject=Pedido%20RGPD%20-%20Exercicio%20de%20Direitos" 
                className="text-sm font-bold text-[#FFDD00] hover:underline block"
              >
                privacidade@kicksclub.pt
              </a>
            </div>

            <a
              href="mailto:privacidade@kicksclub.pt?subject=Pedido%20RGPD%20-%20Exercicio%20de%20Direitos"
              className="px-4 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black uppercase text-xs rounded-xl font-condensed transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              <span>Contactar DPO</span>
            </a>
          </div>

          <p className="text-[11px] text-neutral-500">
            Tens igualmente o direito de apresentar uma reclamação junto da autoridade de controlo competente em Portugal: a <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong> através de <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="underline text-neutral-400 hover:text-white">www.cnpd.pt</a>.
          </p>
        </div>

        {/* Section 8: Cookies */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFDD00] text-black font-black flex items-center justify-center text-sm">
              8
            </div>
            <h2 className="text-lg font-black uppercase font-condensed tracking-wide">
              Política de Cookies e Armazenamento Local
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Utilizamos apenas cookies e armazenamento local essenciais para o funcionamento correto do carrinho de compras,
            sessão de utilizador e segurança do site. Não utilizamos cookies invasivos de rastreio de terceiros nem partilhamos dados com corretores de publicidade.
          </p>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-4 text-center">
          <button
            onClick={onNavigateHome}
            className="px-8 py-3.5 bg-[#FFDD00] text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#FFE838] transition-all font-condensed shadow-md shadow-[#FFDD00]/20 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Regressar às Compras no KicksClub.pt</span>
          </button>
        </div>

      </div>
    </div>
  );
};
