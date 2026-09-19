import React, { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, X, ArrowUpDown, Search, PackageOpen } from 'lucide-react';
import { Sneaker, StoreCategory } from '../types';
import { ProductCard } from './ProductCard';

interface CategoryPageProps {
  category: StoreCategory;
  products: Sneaker[];
  allCategoryProducts: Sneaker[];
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Sneaker) => void;
  onQuickView: (product: Sneaker) => void;
  onNavigateBack: () => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  products,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onNavigateBack,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Brands available in this category
  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
    return brands;
  }, [products]);

  // Filtered + sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    // Brand filter
    if (selectedBrand !== 'ALL') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Stock filter
    if (stockFilter === 'in-stock') {
      result = result.filter((p) => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, searchTerm, selectedBrand, stockFilter, sortBy]);

  const activeFiltersCount = [
    selectedBrand !== 'ALL',
    stockFilter !== 'all',
    searchTerm.trim() !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedBrand('ALL');
    setStockFilter('all');
    setSearchTerm('');
    setSortBy('default');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">

      {/* ── Hero Banner da Categoria ── */}
      <div className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-6">
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-[#FFDD00] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KicksClub</span>
            </button>
            <span className="text-neutral-700">/</span>
            <span className="text-[#FFDD00]">{category.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              {/* Tag badge */}
              <span className="inline-block bg-[#FFDD00] text-black px-3 py-1 rounded text-[10px] font-black uppercase tracking-[0.2em] mb-3 shadow-xs">
                {category.bannerTag || 'COLEÇÃO OFICIAL'}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tight font-condensed leading-none">
                {category.name.toUpperCase()}
              </h1>
              {category.description && (
                <p className="text-neutral-400 text-sm mt-3 max-w-xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="text-3xl font-black text-white font-condensed">{products.length}</div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Produtos</div>
              </div>
              <div className="w-px h-10 bg-neutral-700" />
              <button
                onClick={onNavigateBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-700 hover:border-[#FFDD00] hover:text-[#FFDD00] text-neutral-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            </div>
          </div>

          {/* Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-neutral-800">
              {category.subcategories.map((sub) => (
                <span
                  key={sub}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold uppercase tracking-wider rounded-full cursor-default transition-colors"
                >
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Toolbar: Pesquisa + Filtros + Ordenação ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder={`Pesquisar em ${category.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-100 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFDD00] focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort */}
              <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs font-bold text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="default">Destaques</option>
                  <option value="price-asc">Preço: + Baixo</option>
                  <option value="price-desc">Preço: + Alto</option>
                  <option value="name-asc">Nome A-Z</option>
                </select>
              </div>

              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-black text-white border-black'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#FFDD00] text-black w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}

              {/* Results count */}
              <span className="text-xs font-bold text-neutral-500 ml-auto hidden sm:block">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-4 items-end">

              {/* Brand filter */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  Marca
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedBrand('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedBrand === 'ALL'
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Todas
                  </button>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand === selectedBrand ? 'ALL' : brand)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedBrand === brand
                          ? 'bg-[#FFDD00] text-black border border-black'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock filter */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  Disponibilidade
                </label>
                <div className="flex gap-1.5">
                  {(['all', 'in-stock'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStockFilter(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        stockFilter === opt
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {opt === 'all' ? 'Todos' : 'Em Stock'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Mobile results count */}
        <div className="flex items-center justify-between mb-5 sm:hidden">
          <span className="text-xs font-bold text-neutral-500">
            {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-neutral-200 flex items-center justify-center">
              <PackageOpen className="w-9 h-9 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase font-condensed text-neutral-800 mb-1">
                Nenhum produto encontrado
              </h3>
              <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                Tenta ajustar os filtros ou pesquisa para ver mais resultados.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[#FFDD00] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-[#FFE838] transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredProducts.map((sneaker) => (
              <ProductCard
                key={sneaker.id}
                product={sneaker}
                isWishlisted={wishlistIds.has(sneaker.id)}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
