import { StoreCategory } from '../types';

export const INITIAL_CATEGORIES: StoreCategory[] = [
  {
    id: 'tenis',
    name: 'Ténis & Calçado',
    slug: 'tenis',
    description: 'Sneakers exclusivos, loafers de luxo, calçado casual e edições limitadas das melhores marcas mundiais.',
    icon: 'Footprints',
    subcategories: ['Sneakers', 'Loafers', 'Chinelos & Slides', 'Botas Urbanas'],
    bannerImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=80',
    bannerTag: 'CALÇADO EXCLUSIVO',
    featured: true,
    isActive: true
  },
  {
    id: 'roupa',
    name: 'Roupa & Streetwear',
    slug: 'roupa',
    description: 'Casacos corta-vento, blusões puffer, calções streetwear, hoodies de alta gramagem e t-shirts exclusivas.',
    icon: 'Shirt',
    subcategories: ['Casacos & Blusões', 'Calções & Shorts', 'Hoodies & Sweats', 'T-Shirts', 'Calças Cargo'],
    bannerImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80',
    bannerTag: 'STREETWEAR DROP',
    featured: true,
    isActive: true
  },
  {
    id: 'acessorios',
    name: 'Acessórios & Jóias',
    slug: 'acessorios',
    description: 'Colares Cuban link e correntes, bonés fitted, malas de viagem, carteiras de luxo e cintos de designer.',
    icon: 'Sparkles',
    subcategories: ['Colares & Correntes', 'Bonés & Gorros', 'Malas & Mochilas', 'Carteiras', 'Cintos'],
    bannerImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&auto=format&fit=crop&q=80',
    bannerTag: 'ACESSÓRIOS & LUXO',
    featured: true,
    isActive: true
  },
  {
    id: 'relogios',
    name: 'Relógios de Luxo',
    slug: 'relogios',
    description: 'Cronógrafos de precisão, maquinismos automáticos, relógios desportivos em aço inoxidável e peças icónicas.',
    icon: 'Watch',
    subcategories: ['Relógios de Luxo', 'Cronógrafos', 'Automáticos', 'Caixa em Aço', 'Edições Especiais'],
    bannerImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80',
    bannerTag: 'ALTA RELOJOARIA',
    featured: true,
    isActive: true
  },
  {
    id: 'eletronicos',
    name: 'Eletrónicos & Som',
    slug: 'eletronicos',
    description: 'Auscultadores premium com cancelamento de ruído, fones auriculares bluetooth, colunas portáteis e tech gear.',
    icon: 'Headphones',
    subcategories: ['Fones & Auscultadores', 'Auriculares Sem Fios', 'Colunas de Som', 'Acessórios Tech'],
    bannerImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    bannerTag: 'TECH & AUDIO GEAR',
    featured: true,
    isActive: true
  }
];
