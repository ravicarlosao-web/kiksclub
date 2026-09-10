import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustTicker } from './components/TrustTicker';
import { CollectionSection } from './components/CollectionSection';
import { BrandStyleExplorer } from './components/BrandStyleExplorer';
import { ValuePropsBanner } from './components/ValuePropsBanner';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { HelpFaqModal } from './components/HelpFaqModal';
import { WishlistModal } from './components/WishlistModal';
import { WhatsAppFloatingWidget } from './components/WhatsAppFloatingWidget';
import { TrackingPage } from './components/TrackingPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { PoliciesModal, PolicyTab } from './components/PoliciesModal';
import { ToastContainer } from './components/ToastNotification';
import { Sneaker, CartItem, AdminUser, StoreCategory, ToastMessage } from './types';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { useOrders } from './hooks/useOrders';
import { Search, Sparkles, X, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { ProductCard } from './components/ProductCard';

const getCategorySectionInfo = (catId: string, defaultName: string) => {
  switch (catId.toLowerCase()) {
    case 'tenis':
      return { tag: 'CALÇADO EXCLUSIVO', prefix: 'TÉNIS &', highlight: 'SNEAKERS HYPE' };
    case 'roupa':
      return { tag: 'STREETWEAR DROP', prefix: 'ROUPA &', highlight: 'STREETWEAR URBAN' };
    case 'acessorios':
      return { tag: 'ACESSÓRIOS & LUXO', prefix: 'MALAS, BONÉS &', highlight: 'JÓIAS EXCLUSIVAS' };
    case 'relogios':
      return { tag: 'ALTA RELOJOARIA', prefix: 'CRONÓGRAFOS &', highlight: 'RELÓGIOS DE LUXO' };
    case 'eletronicos':
      return { tag: 'TECH GEAR & ÁUDIO', prefix: 'ELETRÓNICOS &', highlight: 'SOM PREMIUM' };
    default:
      return { tag: 'DEPARTAMENTO OFICIAL', prefix: defaultName.toUpperCase(), highlight: 'DROP' };
  }
};

export default function App() {
  // ── API Hooks (dados do servidor) ──────────────────────────────
  const {
    products,
    loading: loadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    decrementStock,
  } = useProducts();

  const {
    categories,
    loading: loadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const {
    orders,
    fetchOrders,
    createOrder,
    fetchOrderByCode,
    updateOrderStatus,
    updateOrderTracking,
    deleteOrder,
  } = useOrders();

  // ── Admin Auth (JWT no localStorage) ──────────────────────────
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('kicksclub_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Estado Client-Side (localStorage) ─────────────────────────
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kicksclub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('kicksclub_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // ── UI State ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [searchSort, setSearchSort] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<'home' | 'tracking' | 'admin-login' | 'admin-dashboard'>('home');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [trackingInitialCode, setTrackingInitialCode] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyTab>('sizes');
  const [quickViewProduct, setQuickViewProduct] = useState<Sneaker | null>(null);
  const [directSneakerForDrawer, setDirectSneakerForDrawer] = useState<Sneaker | null>(null);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ── Persistência localStorage (estado client-side) ─────────────
  useEffect(() => {
    try { localStorage.setItem('kicksclub_cart', JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('kicksclub_wishlist', JSON.stringify(Array.from(wishlistIds))); } catch { /* ignore */ }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      if (adminUser) {
        localStorage.setItem('kicksclub_admin', JSON.stringify(adminUser));
      } else {
        localStorage.removeItem('kicksclub_admin');
        localStorage.removeItem('kicksclub_jwt');
      }
    } catch { /* ignore */ }
  }, [adminUser]);

  // ── Toast helpers ──────────────────────────────────────────────
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenPolicies = (tab: PolicyTab = 'sizes') => {
    setActivePolicyTab(tab);
    setIsPoliciesOpen(true);
  };

  // ── Admin Auth Handlers ────────────────────────────────────────
  const handleAdminLogin = (user: AdminUser, token: string) => {
    localStorage.setItem('kicksclub_jwt', token);
    setAdminUser(user);
    setCurrentPage('admin-dashboard');
    // Carregar encomendas quando admin faz login
    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (adminUser) {
      setCurrentPage('admin-dashboard');
      fetchOrders();
    } else {
      setCurrentPage('admin-login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Category Management (Admin) ────────────────────────────────
  const handleAddCategory = async (newCategory: StoreCategory) => {
    await createCategory(newCategory);
  };

  const handleUpdateCategory = async (updatedCategory: StoreCategory) => {
    await updateCategory(updatedCategory);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId);
  };

  // ── Product Management (Admin) ─────────────────────────────────
  const handleAddProduct = async (newProduct: Sneaker) => {
    await createProduct(newProduct);
  };

  const handleUpdateProduct = async (updatedProduct: Sneaker) => {
    await updateProduct(updatedProduct);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  // ── Order Management (Admin) ───────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, status: import('./types').OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  const handleUpdateOrderTracking = async (orderId: string, trackingCode: string) => {
    await updateOrderTracking(orderId, trackingCode);
  };

  const handleDeleteOrder = async (orderId: string) => {
    await deleteOrder(orderId);
  };

  const handleOrderCreated = (newOrder: import('./types').Order) => {
    // Stock decrementado no servidor; actualização optimista local
    decrementStock(newOrder.items.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
    })));
  };

  // ── Cart operations ────────────────────────────────────────────
  const handleAddToCart = (product: Sneaker, size: number | string, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && String(item.size) === String(size)
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, size, quantity }];
    });

    addToast({
      type: 'cart',
      title: 'Adicionado ao Carrinho',
      message: `Tamanho ${size} • Pronta Entrega`,
      product: { name: product.name, brand: product.brand, image: product.image, size, price: product.price },
      actionLabel: 'Ver Carrinho',
      onAction: () => { setDirectSneakerForDrawer(null); setIsCartOpen(true); },
    });
  };

  const handleUpdateCartItemSize = (productId: string, oldSize: number | string, newSize: number | string) => {
    if (String(oldSize) === String(newSize)) return;
    setCart((prev) => {
      const targetItem = prev.find((item) => item.product.id === productId && String(item.size) === String(oldSize));
      if (!targetItem) return prev;
      const existingNewSizeIndex = prev.findIndex((item) => item.product.id === productId && String(item.size) === String(newSize));
      if (existingNewSizeIndex > -1) {
        return prev
          .filter((item) => !(item.product.id === productId && String(item.size) === String(oldSize)))
          .map((item) => {
            if (item.product.id === productId && String(item.size) === String(newSize)) {
              return { ...item, quantity: item.quantity + targetItem.quantity };
            }
            return item;
          });
      } else {
        return prev.map((item) => {
          if (item.product.id === productId && String(item.size) === String(oldSize)) {
            return { ...item, size: newSize };
          }
          return item;
        });
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, size: number | string, quantity: number) => {
    if (quantity <= 0) { handleRemoveCartItem(productId, size); return; }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && String(item.size) === String(size) ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string, size: number | string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && String(item.size) === String(size))));
  };

  const handleClearCart = () => setCart([]);

  const handleOpenSneakerInDrawer = (product: Sneaker) => {
    setDirectSneakerForDrawer(product);
    setIsCartOpen(true);
  };

  const handleDirectCheckout = (product: Sneaker, size: number | string) => {
    handleAddToCart(product, size, 1);
    setQuickViewProduct(null);
    setDirectSneakerForDrawer(null);
    setIsCartOpen(true);
  };

  // ── Wishlist operations ────────────────────────────────────────
  const handleToggleWishlist = (product: Sneaker) => {
    setWishlistIds((prev) => {
      const updated = new Set(prev);
      const isRemoving = updated.has(product.id);
      if (isRemoving) {
        updated.delete(product.id);
        addToast({ type: 'wishlist-remove', title: 'Removido dos Favoritos', message: product.name });
      } else {
        updated.add(product.id);
        addToast({
          type: 'wishlist-add',
          title: 'Guardado nos Favoritos',
          message: `${product.brand} • ${product.name}`,
          product: { name: product.name, brand: product.brand, image: product.image, price: product.price },
          actionLabel: 'Ver Favoritos',
          onAction: () => setIsWishlistOpen(true),
        });
      }
      return updated;
    });
  };

  // ── Computed Values ────────────────────────────────────────────
  const hypeMultiProducts = useMemo(() => products.filter((s) => s.featured || s.category === 'hype'), [products]);

  const searchResults = useMemo(() => {
    if (!searchTerm && selectedBrandFilter === 'ALL') return null;
    const filtered = products.filter((sneaker) => {
      const matchesSearch = !searchTerm ||
        sneaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sneaker.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sneaker.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrandFilter === 'ALL' || sneaker.brand === selectedBrandFilter;
      return matchesSearch && matchesBrand;
    });
    if (searchSort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (searchSort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, searchTerm, selectedBrandFilter, searchSort]);

  const wishlistProducts = useMemo(() => products.filter((s) => wishlistIds.has(s.id)), [products, wishlistIds]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleBrandSelect = (brandKey: string) => {
    setSelectedBrandFilter(brandKey);
    if (brandKey !== 'ALL') {
      const resultsSection = document.getElementById('search-results-anchor');
      if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenTrackingWithCode = (code: string) => {
    setTrackingInitialCode(code);
    setCurrentPage('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToTracking = () => { setCurrentPage('tracking'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleNavigateToHome = () => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ── Loading Screen ─────────────────────────────────────────────
  const isInitialLoading = loadingProducts || loadingCategories;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FFDD00] flex items-center justify-center animate-pulse">
          <span className="text-black font-black text-2xl">K</span>
        </div>
        <Loader2 className="w-6 h-6 text-[#FFDD00] animate-spin" />
        <p className="text-neutral-400 text-sm font-medium tracking-widest uppercase">A carregar loja...</p>
      </div>
    );
  }

  // ── Admin Dashboard ────────────────────────────────────────────
  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboardPage
        adminUser={adminUser || { name: 'Administrador', email: 'admin@kicksclub.pt', role: 'admin', lastLogin: '' }}
        products={products}
        orders={orders}
        categories={categories}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetCategories={() => {}}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderTracking={handleUpdateOrderTracking}
        onDeleteOrder={handleDeleteOrder}
        onResetCatalog={() => {}}
        onResetOrders={() => {}}
        onLogout={handleAdminLogout}
        onNavigateHome={handleNavigateToHome}
      />
    );
  }

  // ── Main App ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">

      {/* 1. Header */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.size}
        currentPage={currentPage}
        categories={categories}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTracking={handleNavigateToTracking}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenPolicies={handleOpenPolicies}
        onSearch={(term) => { setSearchTerm(term); if (currentPage !== 'home') setCurrentPage('home'); }}
        onSelectCategory={(cat) => { setSelectedCategory(cat); if (currentPage !== 'home') setCurrentPage('home'); }}
        searchTerm={searchTerm}
      />

      <main className="flex-1">
        {currentPage === 'admin-login' ? (
          <AdminLoginPage
            onLoginSuccess={handleAdminLogin}
            onNavigateHome={handleNavigateToHome}
          />
        ) : currentPage === 'tracking' ? (
          <TrackingPage
            initialCode={trackingInitialCode}
            onNavigateHome={handleNavigateToHome}
            fetchOrderByCode={fetchOrderByCode}
          />
        ) : (
          <>
            {/* 2. Search / Active Filter Overlay */}
            {searchResults !== null ? (
              <section id="search-results-anchor" className="bg-[#FAFAFA] text-black py-12 px-4 sm:px-6 lg:px-8 border-b border-neutral-200">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#B45309]">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filtro de Pesquisa Ativo</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black uppercase font-condensed mt-1">
                        {searchTerm ? `Resultados para "${searchTerm}"` : `Coleção ${selectedBrandFilter}`}
                        <span className="text-neutral-400 font-normal text-xl ml-3">
                          ({searchResults.length} {searchResults.length === 1 ? 'sneaker encontrado' : 'sneakers encontrados'})
                        </span>
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-xl px-3 py-2 shadow-xs">
                        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                        <label htmlFor="search-sort-dropdown" className="text-xs font-bold uppercase tracking-wider text-neutral-600 font-condensed">
                          Ordenar:
                        </label>
                        <select
                          id="search-sort-dropdown"
                          value={searchSort}
                          onChange={(e) => setSearchSort(e.target.value as 'default' | 'price-asc' | 'price-desc')}
                          className="text-xs font-bold text-neutral-900 bg-transparent focus:outline-none cursor-pointer pr-1"
                        >
                          <option value="default">Relevância / Destaques</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>

                      <button
                        id="clear-search-filters-btn"
                        onClick={() => { setSearchTerm(''); setSelectedBrandFilter('ALL'); setSearchSort('default'); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-200 hover:bg-black hover:text-white rounded-xl text-xs font-bold uppercase transition-colors self-start sm:self-auto"
                      >
                        <X className="w-4 h-4" />
                        <span>Limpar Filtros</span>
                      </button>
                    </div>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="text-center py-16 px-4 space-y-5 animate-in fade-in duration-300 max-w-xl mx-auto">
                      <div className="relative inline-block mx-auto">
                        <div className="w-20 h-20 rounded-3xl bg-neutral-200/80 border border-neutral-300 flex items-center justify-center text-neutral-600 shadow-inner">
                          <Search className="w-9 h-9 stroke-[2]" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-black text-[#FFDD00] flex items-center justify-center border-2 border-white shadow-sm font-black text-xs">!</div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309] font-condensed">RESULTADOS DE PESQUISA</span>
                        <h3 className="text-2xl sm:text-3xl font-black uppercase font-condensed tracking-tight text-neutral-950">NENHUM DROP ENCONTRADO</h3>
                        <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
                          Não encontrámos nenhum artigo correspondente. Experimenta clicar numa das nossas coleções e marcas mais populares:
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 pt-1">
                        {['Nike', 'Jordan', 'Yeezy', 'Travis Scott', 'New Balance', 'Louis Vuitton'].map((brandTag) => (
                          <button
                            key={brandTag}
                            onClick={() => { setSearchTerm(brandTag); setSelectedBrandFilter('ALL'); }}
                            className="px-3 py-1.5 rounded-xl bg-white border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-xs font-bold text-neutral-800 transition-all shadow-2xs"
                          >
                            {brandTag}
                          </button>
                        ))}
                      </div>
                      <div className="pt-3">
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedBrandFilter('ALL'); setSearchSort('default'); }}
                          className="px-8 py-3.5 bg-[#FFDD00] text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-[#FFE838] transition-all font-condensed shadow-md shadow-[#FFDD00]/25 inline-flex items-center gap-2 hover:scale-[1.02]"
                        >
                          <Sparkles className="w-4 h-4 stroke-[2.5]" />
                          <span>Explorar Lançamentos</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-4.5">
                      {searchResults.map((sneaker) => (
                        <ProductCard
                          key={sneaker.id}
                          product={sneaker}
                          isWishlisted={wishlistIds.has(sneaker.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onQuickView={(p) => handleOpenSneakerInDrawer(p)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {/* 3. Hero Section */}
            <Hero
              onExploreClick={() => {
                const section = document.getElementById('section-tenis') || document.getElementById('departments-nav');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 4. Trust Ticker Marquee */}
            <TrustTicker />

            {/* 5. Secções por Categoria */}
            {categories
              .filter((cat) => cat.isActive !== false)
              .map((cat) => {
                const catProducts = products.filter((p) => {
                  if (p.department) return p.department.toLowerCase() === cat.id.toLowerCase();
                  return cat.id.toLowerCase() === 'tenis';
                });
                const meta = getCategorySectionInfo(cat.id, cat.name);
                return (
                  <CollectionSection
                    key={cat.id}
                    id={cat.id}
                    tag={meta.tag}
                    titlePrefix={meta.prefix}
                    titleHighlight={meta.highlight}
                    products={catProducts}
                    wishlistIds={wishlistIds}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={(p) => handleOpenSneakerInDrawer(p)}
                    onViewAll={() => {
                      setSelectedCategory(cat.id);
                      const el = document.getElementById(`section-${cat.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                );
              })}

            {/* 7. Brand Style Explorer */}
            <BrandStyleExplorer
              activeBrand={selectedBrandFilter}
              onSelectBrand={handleBrandSelect}
              activeCategory={selectedCategory}
              onSelectCategory={(catKey) => {
                setSelectedCategory(catKey);
                if (catKey === 'ALL') {
                  setSelectedBrandFilter('ALL');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  const el = document.getElementById(`section-${catKey}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

            {/* 8. Hype Multi-Category Drops */}
            <CollectionSection
              id="hype"
              tag="DROPS LIMITADOS"
              titlePrefix="MODELOS EXCLUSIVOS"
              titleHighlight="HYPE MULTI-CATEGORIA"
              products={hypeMultiProducts}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(p) => handleOpenSneakerInDrawer(p)}
              onViewAll={() => {
                const el = document.getElementById('section-hype');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 9. Value Props Banner */}
            <ValuePropsBanner onOpenPolicies={handleOpenPolicies} />
          </>
        )}
      </main>

      {/* 10. Footer */}
      <Footer
        categories={categories}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenTracking={handleNavigateToTracking}
        onOpenAdmin={handleOpenAdmin}
        onOpenPolicies={handleOpenPolicies}
        onOpenCart={() => { setDirectSneakerForDrawer(null); setIsCartOpen(true); }}
        onSelectCategory={(cat) => {
          if (currentPage !== 'home') setCurrentPage('home');
          setSelectedCategory(cat);
          if (cat === 'all') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setTimeout(() => {
              const el = document.getElementById(`section-${cat}`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }
        }}
      />

      {/* Interactive Overlays */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlistIds.has(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onDirectCheckout={handleDirectCheckout}
        onOpenPolicies={handleOpenPolicies}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => { setIsCartOpen(false); setDirectSneakerForDrawer(null); }}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onUpdateSize={handleUpdateCartItemSize}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOpenTrackingWithCode={handleOpenTrackingWithCode}
        onOrderCreated={handleOrderCreated}
        directSneaker={directSneakerForDrawer}
        onAddDirectSneaker={(p, size) => handleAddToCart(p, size, 1)}
        onOpenPolicies={handleOpenPolicies}
      />

      <HelpFaqModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveWishlist={handleToggleWishlist}
        onQuickView={(p) => handleOpenSneakerInDrawer(p)}
      />

      <PoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
        initialTab={activePolicyTab}
      />

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      <WhatsAppFloatingWidget />
    </div>
  );
}
