/**
 * Utilitário de SEO Dinâmico para KicksClub.pt
 * Atualiza meta tags essenciais, Open Graph, Twitter cards, canonical link
 * e regras de indexação (robots) de acordo com a rota ativa.
 */

export interface SEOMetaConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://kicksclub.pt';

export const ROUTE_SEO_MAP: Record<string, SEOMetaConfig> = {
  home: {
    title: 'KicksClub.pt | Sneakers Exclusivos & Streetwear Club Portugal',
    description: 'KicksClub.pt - O teu clube exclusivo de sneakers e streetwear em Portugal. Lançamentos e edições limitadas Nike, Yeezy, Jordan, Louis Vuitton e Balenciaga com 100% autenticidade e portes grátis acima de 60€.',
    canonicalUrl: `${BASE_URL}/`,
    ogTitle: 'KicksClub.pt | Sneakers Exclusivos & Streetwear em Portugal',
    ogDescription: 'Move-te com estilo. Destaca-te sempre. Sneakers exclusivos com 100% de autenticidade, envio expresso rastreado em Portugal e pagamento seguro via MB WAY.',
    noindex: false,
  },
  tracking: {
    title: 'Rastreio de Encomendas Express | KicksClub.pt',
    description: 'Acompanha o estado e a localização da tua encomenda KicksClub em tempo real com envio expresso rastreado em Portugal continental e ilhas.',
    canonicalUrl: `${BASE_URL}/tracking`,
    ogTitle: 'Rastreio de Encomendas | KicksClub.pt',
    ogDescription: 'Insere o código da tua encomenda e consulta o estado da expedição e entrega em Portugal.',
    noindex: false,
  },
  policies: {
    title: 'Políticas de Envio, Devoluções & Tamanhos | KicksClub.pt',
    description: 'Informações sobre prazos de entrega em Portugal, portes grátis acima de 60€, direito de devolução de 14 dias e guia completo de tamanhos de sneakers.',
    canonicalUrl: `${BASE_URL}/politicas`,
    ogTitle: 'Políticas e Garantias | KicksClub.pt',
    ogDescription: 'Consulta os termos de entrega rápida, segurança de pagamento e políticas de devolução do KicksClub Portugal.',
    noindex: false,
  },
  help: {
    title: 'Centro de Ajuda, FAQ & Suporte | KicksClub.pt',
    description: 'Tira todas as dúvidas sobre compras, autenticidade, pagamentos MB WAY, envios e apoio ao cliente via WhatsApp no KicksClub.pt.',
    canonicalUrl: `${BASE_URL}/ajuda`,
    ogTitle: 'Ajuda & FAQ | KicksClub.pt',
    ogDescription: 'Respostas rápidas às perguntas frequentes e suporte direto pelo WhatsApp.',
    noindex: false,
  },
  privacy: {
    title: 'Política de Privacidade & Proteção de Dados (RGPD) | KicksClub.pt',
    description: 'Conhece como tratamos e protegemos os teus dados pessoais em conformidade com o RGPD e as leis de privacidade em Portugal e na União Europeia.',
    canonicalUrl: `${BASE_URL}/politica-privacidade`,
    ogTitle: 'Política de Privacidade | KicksClub.pt',
    ogDescription: 'Compromisso de transparência e proteção integral dos dados de navegação e compras.',
    noindex: false,
  },
  'admin-login': {
    title: 'Acesso Administrativo | KicksClub.pt',
    description: 'Painel reservado de administração do KicksClub.pt.',
    canonicalUrl: `${BASE_URL}/admin`,
    noindex: true,
  },
  'admin-dashboard': {
    title: 'Painel de Gestão | KicksClub.pt Admin',
    description: 'Gestão de catálogo, stocks, encomendas e clientes.',
    canonicalUrl: `${BASE_URL}/admin`,
    noindex: true,
  },
};

/**
 * Aplica as definições de SEO no DOM (document.head)
 */
export function updateDocumentSEO(page: string, customConfig?: Partial<SEOMetaConfig>): void {
  if (typeof document === 'undefined') return;

  const config = {
    ...(ROUTE_SEO_MAP[page] || ROUTE_SEO_MAP.home),
    ...customConfig,
  };

  // 1. Título da página
  document.title = config.title;

  // 2. Meta description
  updateMetaTag('name', 'description', config.description);

  // 3. Robots (noindex para páginas de administração)
  const robotsContent = config.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  updateMetaTag('name', 'robots', robotsContent);
  updateMetaTag('name', 'googlebot', robotsContent);

  // 4. Canonical Link
  let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.rel = 'canonical';
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.href = config.canonicalUrl;

  // 5. Open Graph Tags
  updateMetaTag('property', 'og:title', config.ogTitle || config.title);
  updateMetaTag('property', 'og:description', config.ogDescription || config.description);
  updateMetaTag('property', 'og:url', config.canonicalUrl);

  // 6. Twitter Card Tags
  updateMetaTag('name', 'twitter:title', config.ogTitle || config.title);
  updateMetaTag('name', 'twitter:description', config.ogDescription || config.description);
}

function updateMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string): void {
  let metaEl = document.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`);
  if (!metaEl) {
    metaEl = document.createElement('meta');
    metaEl.setAttribute(attributeName, attributeValue);
    document.head.appendChild(metaEl);
  }
  metaEl.content = content;
}
