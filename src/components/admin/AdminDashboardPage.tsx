import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertTriangle, 
  LogOut, 
  ExternalLink, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  MessageCircle,
  Tag,
  Store,
  RefreshCw,
  Check,
  X,
  Menu,
  ChevronRight,
  Layers,
  Ticket
} from 'lucide-react';
import { Sneaker, Order, OrderStatus, AdminUser, StoreCategory, Brand } from '../../types';
import { AddEditProductModal } from './AddEditProductModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { CategoryManagementTab } from './CategoryManagementTab';
import { AddEditCategoryModal } from './AddEditCategoryModal';
import { BrandsManagementTab } from './BrandsManagementTab';
import { CouponsManagementTab } from './CouponsManagementTab';
import { AdminChangePasswordSection } from './AdminChangePasswordSection';

interface AdminDashboardPageProps {
  adminUser: AdminUser;
  products: Sneaker[];
  orders: Order[];
  categories: StoreCategory[];
  brands?: Brand[];
  onAddProduct: (product: Sneaker) => void;
  onUpdateProduct: (product: Sneaker) => void;
  onDeleteProduct: (productId: string) => Promise<void>;
  onAddCategory: (category: StoreCategory) => void;
  onUpdateCategory: (category: StoreCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onResetCategories: () => void;
  onAddBrand?: (brand: Omit<Brand, 'id' | 'createdAt'>) => Promise<Brand | null>;
  onUpdateBrand?: (id: string, updates: Partial<Brand>) => Promise<Brand | null>;
  onDeleteBrand?: (id: string, options?: { reassignTo?: string; force?: boolean }) => Promise<boolean>;
  onRefreshBrands?: () => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrderTracking: (orderId: string, trackingCode: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onResetCatalog: () => void;
  onResetOrders: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onAnonymizeCustomer?: (orderId: string) => void;
}

type TabType = 'overview' | 'products' | 'categories' | 'brands' | 'coupons' | 'orders' | 'settings';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  adminUser,
  products,
  orders,
  categories,
  brands = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
  onRefreshBrands,
  onUpdateOrderStatus,
  onUpdateOrderTracking,
  onDeleteOrder,
  onResetCatalog,
  onResetOrders,
  onLogout,
  onNavigateHome,
  onAnonymizeCustomer,
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Product Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Sneaker | null>(null);

  // Product Delete state
  const [productToDelete, setProductToDelete] = useState<Sneaker | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [deleteProductError, setDeleteProductError] = useState<string | null>(null);

  // Category Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<StoreCategory | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Products filtering & search
  const [productSearch, setProductSearch] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('ALL');
  const [productDepartmentFilter, setProductDepartmentFilter] = useState('ALL');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');

  // Orders filtering & search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Overview KPIs
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Cancelado')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Pendente' || o.status === 'Em Processamento').length;
  }, [orders]);

  const inStockProductsCount = useMemo(() => {
    return products.filter((p) => p.inStock).length;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.tag && p.tag.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(productSearch.toLowerCase()));

      const matchesBrand = productBrandFilter === 'ALL' || p.brand === productBrandFilter;

      const matchesDepartment = productDepartmentFilter === 'ALL' ||
        (p.department && p.department.toLowerCase() === productDepartmentFilter.toLowerCase()) ||
        (!p.department && productDepartmentFilter.toLowerCase() === 'tenis');

      const matchesStock = 
        productStockFilter === 'all' ||
        (productStockFilter === 'inStock' && p.inStock) ||
        (productStockFilter === 'outOfStock' && !p.inStock);

      return matchesSearch && matchesBrand && matchesDepartment && matchesStock;
    });
  }, [products, productSearch, productBrandFilter, productDepartmentFilter, productStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.phone.includes(orderSearch) ||
        o.city.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.trackingCode.toLowerCase().includes(orderSearch.toLowerCase());

      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Open Product Modal
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Sneaker) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex flex-col md:flex-row">
      
      {/* Mobile Top Header Bar (< md) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#141414] border-b border-neutral-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black border border-neutral-800 flex items-center justify-center text-[#FFDD00] font-black text-xs">
            KC
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-base font-black italic tracking-tighter text-white font-condensed">
                KICKS <span className="text-[#FFDD00]">CLUB</span>
              </span>
              <span className="text-[#FFDD00] text-xs font-black">.PT</span>
            </div>
            <span className="text-[9px] font-black uppercase text-neutral-400 block -mt-0.5 font-condensed tracking-wider">
              PAINEL ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddProduct}
            className="p-2 bg-[#FFDD00] text-black rounded-xl hover:bg-[#FFE838] transition-colors"
            title="Adicionar Novo Produto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-neutral-700 transition-colors"
            aria-label="Abrir Menu Lateral"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5 text-[#FFDD00]" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* LATERAL SIDEBAR NAVIGATION */}
      <aside
        className={`
          fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30
          w-72 bg-[#121212] border-r border-neutral-800/90
          flex flex-col justify-between
          transition-transform duration-200 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          h-screen overflow-y-auto custom-scrollbar flex-shrink-0
        `}
      >
        {/* Top of Sidebar: Brand & Navigation */}
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 group text-left w-full"
              title="Ir para a Loja Principal"
            >
              <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 flex items-center justify-center text-[#FFDD00] font-black text-sm group-hover:border-[#FFDD00]/50 transition-colors shadow-inner">
                KC
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline">
                  <span className="text-xl font-black italic tracking-tighter text-white font-condensed">
                    KICKS <span className="text-[#FFDD00]">CLUB</span>
                  </span>
                  <span className="text-neutral-400 font-bold text-xs ml-0.5">.PT</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-[#FFDD00]/15 text-[#FFDD00] border border-[#FFDD00]/30 rounded font-condensed">
                    PAINEL ADMIN
                  </span>
                </div>
              </div>
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin User Profile Card in Sidebar */}
          <div className="p-3.5 mx-3.5 my-4 bg-black/60 border border-neutral-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFDD00] text-black flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate block">{adminUser.name || 'Administrador'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" title="Online" />
                </div>
                <p className="text-[10px] text-neutral-400 truncate">{adminUser.email}</p>
              </div>
            </div>
            
            <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
              <span className="text-neutral-500 font-medium">Estado da Loja:</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Ativa & Online
              </span>
            </div>
          </div>

          {/* Quick Action Button: Novo Produto */}
          <div className="px-3.5 mb-4">
            <button
              onClick={() => {
                handleOpenAddProduct();
                setIsMobileSidebarOpen(false);
              }}
              className="w-full py-2.5 px-3.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all font-condensed shadow-md hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Novo Produto</span>
            </button>
          </div>

          {/* Lateral Navigation Links */}
          <nav className="px-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-neutral-500">
              Menu de Gestão
            </div>

            {/* 1. Visão Geral */}
            <button
              onClick={() => {
                setCurrentTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'overview'
                  ? 'bg-[#FFDD00] text-black font-black shadow-md shadow-[#FFDD00]/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${currentTab === 'overview' ? 'text-black' : 'text-neutral-400'}`} />
                <span>Visão Geral</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${currentTab === 'overview' ? 'text-black/70' : 'text-neutral-600'}`} />
            </button>

            {/* 2. Gerir Artigos / Catálogo */}
            <button
              onClick={() => {
                setCurrentTab('products');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'products'
                  ? 'bg-[#FFDD00] text-black font-black shadow-md shadow-[#FFDD00]/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${currentTab === 'products' ? 'text-black' : 'text-neutral-400'}`} />
                <span>Gerir Produtos</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentTab === 'products'
                  ? 'bg-black text-[#FFDD00]'
                  : 'bg-neutral-800 text-neutral-300'
              }`}>
                {products.length}
              </span>
            </button>

            {/* 3. Gerir Categorias */}
            <button
              onClick={() => {
                setCurrentTab('categories');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'categories'
                  ? 'bg-[#FFDD00] text-black font-black shadow-md shadow-[#FFDD00]/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className={`w-4 h-4 ${currentTab === 'categories' ? 'text-black' : 'text-[#FFDD00]'}`} />
                <span>Gerir Categorias</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentTab === 'categories'
                  ? 'bg-black text-[#FFDD00]'
                  : 'bg-neutral-800 text-neutral-300'
              }`}>
                {categories.length}
              </span>
            </button>

            {/* 3.1 Gerir Marcas */}
            <button
              onClick={() => {
                setCurrentTab('brands');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'brands'
                  ? 'bg-[#FFDD00] text-black font-black shadow-md shadow-[#FFDD00]/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className={`w-4 h-4 ${currentTab === 'brands' ? 'text-black' : 'text-[#FFDD00]'}`} />
                <span>Gerir Marcas</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentTab === 'brands'
                  ? 'bg-black text-[#FFDD00]'
                  : 'bg-neutral-800 text-neutral-300'
              }`}>
                {brands.length}
              </span>
            </button>

            {/* 3.1 Gerir Cupões */}
            <button
              onClick={() => {
                setCurrentTab('coupons');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'coupons'
                  ? 'bg-[#FFDD00] text-black font-black shadow-md shadow-[#FFDD00]/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className={`w-4 h-4 ${currentTab === 'coupons' ? 'text-black' : 'text-[#FFDD00]'}`} />
                <span>Gerir Cupões</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${currentTab === 'coupons' ? 'text-black/70' : 'text-neutral-600'}`} />
            </button>

            {/* 4. Gerir Encomendas */}
            <button
              onClick={() => {
                setCurrentTab('orders');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'orders'
                  ? 'bg-[#FFDD00] text-black font-black shadow-md shadow-[#FFDD00]/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className={`w-4 h-4 ${currentTab === 'orders' ? 'text-black' : 'text-neutral-400'}`} />
                <span>Gerir Encomendas</span>
              </div>
              {pendingOrdersCount > 0 ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  currentTab === 'orders'
                    ? 'bg-black text-[#FFDD00]'
                    : 'bg-[#FFDD00] text-black'
                }`}>
                  {pendingOrdersCount} pendentes
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentTab === 'orders'
                    ? 'bg-black text-[#FFDD00]'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            {/* 4. Configurações da Loja */}
            <button
              onClick={() => {
                setCurrentTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'settings'
                  ? 'bg-[#FFDD00] text-black font-black shadow-md shadow-[#FFDD00]/10'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-black' : 'text-neutral-400'}`} />
                <span>Configurações</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${currentTab === 'settings' ? 'text-black/70' : 'text-neutral-600'}`} />
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="p-4 border-t border-neutral-800/80 space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 transition-colors"
          >
            <Store className="w-4 h-4 text-[#FFDD00]" />
            <span>Ver Loja Pública</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>

          <div className="pt-2 text-[10px] text-neutral-500 text-center font-mono">
            Kicks Club v2.4 • CTT Expresso PT
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER ON THE RIGHT */}
      <div className="flex-1 min-w-0 bg-[#0E0E0E] flex flex-col min-h-screen">
        
        {/* Main Content Sticky Header Bar */}
        <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white font-condensed">
              {currentTab === 'overview' && 'VISÃO GERAL DO NEGÓCIO'}
              {currentTab === 'products' && `CATÁLOGO DE PRODUTOS (${products.length})`}
              {currentTab === 'categories' && `GESTÃO DE CATEGORIAS DA LOJA (${categories.length})`}
              {currentTab === 'orders' && `GESTÃO DE ENCOMENDAS (${orders.length})`}
              {currentTab === 'settings' && 'CONFIGURAÇÕES DA PLATAFORMA'}
            </h1>
            
            {currentTab === 'orders' && pendingOrdersCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFDD00] text-black text-[10px] font-black rounded-full uppercase">
                {pendingOrdersCount} Pendentes
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/60 border border-neutral-800 rounded-full text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] font-bold">Loja Online 24h</span>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black text-xs font-black uppercase rounded-xl transition-all shadow-md font-condensed hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Adicionar Novo Produto</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 transition-colors"
              title="Ver Loja Pública"
            >
              <Store className="w-4 h-4 text-[#FFDD00]" />
            </button>
          </div>
        </header>

        {/* Dashboard Main Content Views */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
        
        {/* TAB 1: VISÃO GERAL */}
        {currentTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Faturação Total */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider">Faturação Total</span>
                  <div className="w-8 h-8 rounded-xl bg-black border border-neutral-800 text-[#FFDD00] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-condensed tracking-tight text-white">
                  {totalRevenue.toFixed(2)}€
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-green-400 font-bold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{orders.length} pedidos confirmados</span>
                </div>
              </div>

              {/* Card 2: Total de Encomendas */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider">Total Encomendas</span>
                  <div className="w-8 h-8 rounded-xl bg-black border border-neutral-800 text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-condensed tracking-tight text-white">
                  {orders.length}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pendingOrdersCount} a aguardar processamento</span>
                </div>
              </div>

              {/* Card 3: Produtos no Catálogo */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider">Total de Produtos</span>
                  <div className="w-8 h-8 rounded-xl bg-black border border-neutral-800 text-[#FFDD00] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-condensed tracking-tight text-white">
                  {products.length}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-bold mt-2">
                  <span>{inStockProductsCount} ativos em estoque</span>
                </div>
              </div>

              {/* Card 4: Taxa de Entrega CTT */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider">Envios CTT Expresso</span>
                  <div className="w-8 h-8 rounded-xl bg-black border border-neutral-800 text-green-400 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-condensed tracking-tight text-white">
                  100%
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-green-400 font-bold mt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Entregas Portugal Continental 24h</span>
                </div>
              </div>

            </div>

            {/* Quick Actions Bar */}
            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Ações Rápidas de Gestão
                </h3>
                <p className="text-xs text-neutral-400">
                  Adiciona novos pares ao catálogo ou gere o estado das encomendas recebidas
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleOpenAddProduct}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all font-condensed"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Adicionar Novo Sneaker</span>
                </button>
                <button
                  onClick={() => setCurrentTab('orders')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-[#FFDD00]" />
                  <span>Ver Todas as Encomendas ({orders.length})</span>
                </button>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-[#141414] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FFDD00]" />
                  <h3 className="text-base font-black uppercase text-white font-condensed tracking-tight">
                    ÚLTIMAS ENCOMENDAS REGISTADAS
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentTab('orders')}
                  className="text-xs text-[#FFDD00] hover:underline font-bold"
                >
                  Ver Tudo →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-[10px] font-black tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Cidade</th>
                      <th className="py-3 px-4">Itens</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-medium">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {order.id}
                        </td>
                        <td className="py-3.5 px-4 text-white font-bold">
                          {order.customerName}
                          <span className="block text-[10px] text-neutral-500 font-normal">{order.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400">
                          {order.city}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-white font-bold">{order.items.length} par(es)</span>
                          <span className="block text-[10px] text-neutral-500 truncate max-w-[140px]">
                            {order.items[0]?.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#FFDD00]">
                          {order.total.toFixed(2)}€
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            order.status === 'Entregue' || order.status === 'Concluído'
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : order.status === 'Pago'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : order.status === 'Enviado CTT'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : order.status === 'Em Trânsito'
                              ? 'bg-yellow-500/20 text-[#FFDD00] border-yellow-500/30'
                              : order.status === 'Em Processamento'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : order.status === 'Cancelado'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenOrder(order)}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-[#FFDD00] hover:text-black text-neutral-300 rounded-lg text-xs font-bold transition-colors"
                          >
                            Gerir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: GERIR PRODUTOS */}
        {currentTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] border border-neutral-800 rounded-2xl p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black uppercase text-white font-condensed tracking-tight">
                    CATÁLOGO DE PRODUTOS
                  </h2>
                  <span className="px-2.5 py-0.5 bg-neutral-800 text-[#FFDD00] rounded-full text-xs font-bold">
                    {filteredProducts.length} de {products.length}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Adiciona, edita preços, tamanhos disponíveis e remove produtos da loja online
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-5 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md font-condensed hover:scale-[1.02] self-start md:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ADICIONAR NOVO PRODUTO</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#141414] border border-neutral-800 rounded-2xl p-4">
              
              {/* Search input */}
              <div className="relative sm:col-span-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Pesquisar por modelo ou marca..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              {/* Department / Category filter */}
              <div>
                <select
                  value={productDepartmentFilter}
                  onChange={(e) => setProductDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                >
                  <option value="ALL">Todos os Departamentos</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand filter */}
              <div>
                <select
                  value={productBrandFilter}
                  onChange={(e) => setProductBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                >
                  <option value="ALL">Todas as Marcas</option>
                  <option value="LOUIS VUITTON">Louis Vuitton</option>
                  <option value="NIKE">Nike</option>
                  <option value="JORDAN">Air Jordan</option>
                  <option value="YEEZY">Yeezy</option>
                  <option value="BALENCIAGA">Balenciaga</option>
                  <option value="TRAPSTAR">Trapstar</option>
                  <option value="ROLEX">Rolex</option>
                  <option value="APPLE">Apple</option>
                  <option value="BEATS">Beats</option>
                  <option value="DIOR">Dior</option>
                  <option value="PRADA">Prada</option>
                </select>
              </div>

              {/* Stock filter */}
              <div>
                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFDD00]"
                >
                  <option value="all">Todos os Estoques</option>
                  <option value="inStock">Apenas Em Estoque</option>
                  <option value="outOfStock">Esgotados</option>
                </select>
              </div>

            </div>

            {/* Products Table */}
            <div className="bg-[#141414] border border-neutral-800 rounded-3xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] font-black tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-4">Marca & Categoria</th>
                      <th className="py-3 px-4">Preço (€)</th>
                      <th className="py-3 px-4">Tamanhos EU</th>
                      <th className="py-3 px-4">Estoque</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-medium">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-neutral-900/50 transition-colors">
                        
                        {/* Sneaker Thumbnail & Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-xl border border-neutral-800 bg-neutral-950 flex-shrink-0"
                            />
                            <div className="min-w-0 max-w-[240px]">
                              {product.tag && (
                                <span className="inline-block px-1.5 py-0.2 bg-[#FFDD00] text-black text-[9px] font-black uppercase rounded mb-0.5 font-condensed">
                                  {product.tag}
                                </span>
                              )}
                              <h4 className="font-bold text-white text-xs truncate">
                                {product.name}
                              </h4>
                              {product.featured && (
                                <span className="text-[10px] text-amber-400 font-bold block">
                                  ★ Destaque Home
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Brand & Category */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-[#FFDD00] block text-[11px]">
                            {product.brand}
                          </span>
                          <span className="text-neutral-400 text-[10px] uppercase">
                            {product.category}
                          </span>
                        </td>

                        {/* Pricing */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-white text-sm block">
                            {product.price.toFixed(2)}€
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-[10px] text-neutral-500 line-through block">
                              {product.originalPrice.toFixed(2)}€ ({product.discountPercentage}% OFF)
                            </span>
                          )}
                        </td>

                        {/* Sizes */}
                        <td className="py-3.5 px-4 max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {product.sizes?.slice(0, 6).map((sz) => (
                              <span key={sz} className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] font-mono text-neutral-300">
                                {sz}
                              </span>
                            ))}
                            {(product.sizes?.length || 0) > 6 && (
                              <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] font-mono text-[#FFDD00]">
                                +{(product.sizes?.length || 0) - 6}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProduct({
                                ...product,
                                inStock: !product.inStock,
                              });
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 ${
                              product.inStock
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span>{product.inStock ? 'Em Estoque' : 'Esgotado'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(product)}
                              className="p-2 rounded-lg bg-neutral-900 hover:bg-[#FFDD00] hover:text-black text-neutral-300 transition-colors"
                              title="Editar Produto"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteProductError(null);
                                setProductToDelete(product);
                              }}
                              className="p-2 rounded-lg bg-neutral-900 hover:bg-red-900 text-neutral-400 hover:text-red-200 transition-colors"
                              title="Remover Produto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <Package className="w-12 h-12 text-neutral-600 mx-auto" />
                  <p className="text-sm font-bold text-neutral-400">Nenhum produto encontrado para os filtros selecionados.</p>
                  <button
                    onClick={() => {
                      setProductSearch('');
                      setProductBrandFilter('ALL');
                      setProductStockFilter('all');
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: GERIR CATEGORIAS */}
        {currentTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <CategoryManagementTab
              categories={categories}
              products={products}
              onAddCategory={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              onEditCategory={(cat) => {
                setCategoryToEdit(cat);
                setIsCategoryModalOpen(true);
              }}
              onDeleteCategory={onDeleteCategory}
              onResetCategories={onResetCategories}
              onFilterCategoryProducts={(catId) => {
                setProductDepartmentFilter(catId);
                setCurrentTab('products');
              }}
            />
          </div>
        )}

        {/* TAB: GERIR MARCAS */}
        {currentTab === 'brands' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <BrandsManagementTab
              brands={brands}
              products={products}
              onAddBrand={onAddBrand ? async (brandData) => {
                return await onAddBrand(brandData);
              } : undefined}
              onUpdateBrand={onUpdateBrand ? async (id, updates) => {
                return await onUpdateBrand(id, updates);
              } : undefined}
              onDeleteBrand={onDeleteBrand ? async (id, options) => {
                return await onDeleteBrand(id, options);
              } : undefined}
              onFilterBrandProducts={(brandName) => {
                setProductBrandFilter(brandName);
                setCurrentTab('products');
              }}
            />
          </div>
        )}

        {/* TAB 2.5: GERIR CUPÕES */}
        {currentTab === 'coupons' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <CouponsManagementTab />
          </div>
        )}

        {/* TAB 3: GERIR ENCOMENDAS */}
        {currentTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] border border-neutral-800 rounded-2xl p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black uppercase text-white font-condensed tracking-tight">
                    GESTÃO DE ENCOMENDAS
                  </h2>
                  <span className="px-2.5 py-0.5 bg-neutral-800 text-[#FFDD00] rounded-full text-xs font-bold">
                    {filteredOrders.length} Encomendas
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Consulta endereços de entrega, altera estados, códigos CTT e contacta clientes no WhatsApp
                </p>
              </div>
            </div>

            {/* Filter pills & Search */}
            <div className="flex flex-col sm:flex-row gap-3 bg-[#141414] border border-neutral-800 rounded-2xl p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Pesquisar por Código (ex: KC-98421PT), Nome, Telemóvel ou Cidade..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              {/* Status Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                {['ALL', 'Pendente', 'Pago', 'Em Processamento', 'Enviado CTT', 'Em Trânsito', 'Entregue', 'Concluído', 'Cancelado'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      orderStatusFilter === st
                        ? 'bg-[#FFDD00] text-black font-black'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {st === 'ALL' ? 'Todas' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#141414] border border-neutral-800 rounded-3xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] font-black tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Pedido / CTT</th>
                      <th className="py-3 px-4">Cliente & Contacto</th>
                      <th className="py-3 px-4">Morada & Destino</th>
                      <th className="py-3 px-4">Itens</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Estado da Encomenda</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-medium">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-900/50 transition-colors">
                        
                        {/* Order Code & CTT */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-white text-xs block">
                            {order.id}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            CTT: {order.trackingCode}
                          </span>
                          <span className="text-[10px] text-neutral-500 block mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">
                            {order.customerName}
                          </span>
                          <span className="text-neutral-400 text-[11px] block">
                            {order.phone}
                          </span>
                          <span className="text-neutral-500 text-[10px] truncate max-w-[140px] block">
                            {order.email}
                          </span>
                        </td>

                        {/* Address */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <span className="text-neutral-200 block truncate font-medium">
                            {order.address}
                          </span>
                          <span className="text-neutral-400 text-[11px]">
                            {order.postalCode} • <strong>{order.city}</strong>
                          </span>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {order.items.slice(0, 2).map((it, idx) => (
                              <div key={idx} className="relative w-11 h-11 rounded-xl border border-neutral-800 bg-neutral-900/90 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                                <img
                                  src={it.image}
                                  alt={it.name}
                                  className="w-full h-full object-contain"
                                  title={`${it.name}${it.color ? ` (Cor: ${it.color})` : ''} - Tam EU: ${it.size}`}
                                />
                              </div>
                            ))}
                            <div className="min-w-0">
                              <span className="font-bold text-white block text-xs">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                              </span>
                              <div className="flex flex-wrap items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                                {order.items.map((i, iIdx) => (
                                  <span key={iIdx} className="inline-flex items-center gap-1">
                                    {i.color && (
                                      <span className="px-1 py-0.2 rounded bg-[#FFDD00]/15 text-[#FFDD00] font-bold">
                                        {i.color}
                                      </span>
                                    )}
                                    <span>EU {i.size}</span>
                                    {iIdx < order.items.length - 1 && <span className="text-neutral-600">·</span>}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Total & Payment */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-[#FFDD00] text-sm block">
                            {order.total.toFixed(2)}€
                          </span>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">
                            {order.paymentMethod === 'mbway' ? 'MB WAY' : order.paymentMethod === 'card' ? 'Cartão' : 'Multibanco'}
                          </span>
                        </td>

                        {/* Status with inline quick dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none ${
                              order.status === 'Entregue' || order.status === 'Concluído'
                                ? 'bg-green-950/80 text-green-300 border-green-700'
                                : order.status === 'Pago'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                                : order.status === 'Enviado CTT'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                                : order.status === 'Em Trânsito'
                                ? 'bg-yellow-950/80 text-[#FFDD00] border-yellow-700'
                                : order.status === 'Em Processamento'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                                : order.status === 'Cancelado'
                                ? 'bg-red-950/80 text-red-300 border-red-700'
                                : 'bg-amber-950/80 text-amber-300 border-amber-700'
                            }`}
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                            <option value="Em Processamento">Em Processamento</option>
                            <option value="Enviado CTT">Enviado CTT</option>
                            <option value="Em Trânsito">Em Trânsito</option>
                            <option value="Entregue">Entregue</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenOrder(order)}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-[#FFDD00] hover:text-black text-neutral-300 rounded-xl text-xs font-bold transition-colors"
                            >
                              Ver / Gerir
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Tens a certeza que desejas remover o pedido ${order.id}?`)) {
                                  onDeleteOrder(order.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                              title="Remover Encomenda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
                  <p className="text-sm font-bold text-neutral-400">Nenhuma encomenda encontrada com estes termos.</p>
                  <button
                    onClick={() => {
                      setOrderSearch('');
                      setOrderStatusFilter('ALL');
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold"
                  >
                    Limpar Pesquisa
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: CONFIGURAÇÕES DA LOJA */}
        {currentTab === 'settings' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
            
            <div className="bg-[#141414] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-condensed tracking-tight">
                  CONFIGURAÇÕES GERAIS DA KICKSCLUB.PT
                </h3>
                <p className="text-xs text-neutral-400">
                  Parâmetros de funcionamento da loja, métodos de envio e segurança da conta
                </p>
              </div>

              {/* Settings items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Contacto WhatsApp Oficial</span>
                  <p className="text-sm font-bold text-white">+244 952 948 694</p>
                  <p className="text-[11px] text-neutral-500">Utilizado nos botões de apoio e confirmação de encomendas</p>
                </div>

                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Prazo de Entrega Estimado</span>
                  <p className="text-sm font-bold text-white">7 a 15 dias úteis</p>
                  <p className="text-[11px] text-neutral-500">Envio seguro com rastreio em todas as encomendas</p>
                </div>

                <div 
                  onClick={() => setCurrentTab('coupons')}
                  className="p-4 bg-neutral-900/60 border border-neutral-800 hover:border-[#FFDD00]/50 rounded-2xl space-y-1 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Cupões de Desconto</span>
                    <span className="text-[10px] text-[#FFDD00] font-bold group-hover:underline">Gerir Cupões ➔</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Configura códigos promocionais para o checkout</p>
                  <p className="text-[11px] text-neutral-500">Ligado diretamente à base de dados Turso</p>
                </div>

                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Conta de Administrador</span>
                  <p className="text-sm font-bold text-white">{adminUser.email}</p>
                  <p className="text-[11px] text-neutral-500">Último acesso: {new Date(adminUser.lastLogin).toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

              </div>

              {/* Secção de Alteração de Palavra-passe Admin */}
              <AdminChangePasswordSection />

              {/* Maintenance & Reset actions */}
              <div className="pt-6 border-t border-neutral-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                  Manutenção do Catálogo & Dados
                </h4>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Deseja repor o catálogo original de calçados de fábrica?')) {
                        onResetCatalog();
                      }
                    }}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#FFDD00]" />
                    <span>Repor Catálogo Original de Fábrica</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Deseja repor os pedidos de demonstração?')) {
                        onResetOrders();
                      }
                    }}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Repor Encomendas de Demonstração</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
      </div>

      {/* Product Add / Edit Modal */}
      <AddEditProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={(product) => {
          if (productToEdit) {
            onUpdateProduct(product);
          } else {
            onAddProduct(product);
          }
        }}
        productToEdit={productToEdit}
        availableCategories={categories}
        availableBrands={brands}
        onCreateBrand={onAddBrand}
      />

      {/* Category Add / Edit Modal */}
      <AddEditCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={(cat) => {
          if (categoryToEdit) {
            onUpdateCategory(cat);
          } else {
            onAddCategory(cat);
          }
        }}
        categoryToEdit={categoryToEdit}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdateStatus={onUpdateOrderStatus}
        onUpdateTrackingCode={onUpdateOrderTracking}
        onDeleteOrder={onDeleteOrder}
        onAnonymizeCustomer={onAnonymizeCustomer}
      />

      {/* ── Delete Product Confirmation Modal ─────────────────────── */}
      {productToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-[#141414] border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-900/60 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Eliminar Produto</h2>
                <p className="text-xs text-neutral-500">Esta ação não pode ser revertida</p>
              </div>
              <button
                onClick={() => {
                  if (!isDeletingProduct) {
                    setProductToDelete(null);
                    setDeleteProductError(null);
                  }
                }}
                className="ml-auto p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-neutral-300">
                Tens a certeza que desejas eliminar permanentemente o produto:
              </p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                {productToDelete.image && (
                  <img
                    src={productToDelete.image}
                    alt={productToDelete.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{productToDelete.name}</p>
                  <p className="text-xs text-neutral-400">{productToDelete.brand} · ID: {productToDelete.id.slice(0, 14)}…</p>
                </div>
              </div>

              {deleteProductError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/50 border border-red-900/60">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{deleteProductError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteProductError(null);
                }}
                disabled={isDeletingProduct}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!productToDelete || isDeletingProduct) return;
                  setIsDeletingProduct(true);
                  setDeleteProductError(null);
                  try {
                    await onDeleteProduct(productToDelete.id);
                    setProductToDelete(null);
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Erro ao eliminar produto';
                    setDeleteProductError(msg);
                  } finally {
                    setIsDeletingProduct(false);
                  }
                }}
                disabled={isDeletingProduct}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {isDeletingProduct ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>A eliminar…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Produto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
