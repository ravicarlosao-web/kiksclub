import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Sparkles, 
  Layers, 
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Brand, Sneaker } from '../../types';
import { AddEditBrandModal } from './AddEditBrandModal';
import { DeleteBrandModal } from './DeleteBrandModal';

interface BrandsManagementTabProps {
  brands: Brand[];
  products: Sneaker[];
  loading?: boolean;
  onAddBrand: (brandData: { id?: string; name: string; logoUrl?: string; description?: string }) => Promise<void>;
  onUpdateBrand: (brand: Brand) => Promise<void>;
  onDeleteBrand: (brandId: string, options?: { reassignTo?: string; force?: boolean }) => Promise<void>;
  onFilterBrandProducts: (brandName: string) => void;
  onRefresh?: () => void;
}

export const BrandsManagementTab: React.FC<BrandsManagementTabProps> = ({
  brands,
  products,
  loading = false,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
  onFilterBrandProducts,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const totalBrands = brands.length;
    const withLogo = brands.filter((b) => Boolean(b.logoUrl)).length;
    const totalProducts = products.length;
    const assignedProducts = products.filter((p) => Boolean(p.brandId || p.brand)).length;
    return { totalBrands, withLogo, totalProducts, assignedProducts };
  }, [brands, products]);

  // Contagem dinâmica de produtos por marca caso o backend não traga productCount
  const getProductCountForBrand = (brandId: string, brandName: string) => {
    return products.filter((p) => {
      if (p.brandId) return p.brandId.toLowerCase() === brandId.toLowerCase();
      if (p.brand) return p.brand.toLowerCase() === brandName.toLowerCase();
      return false;
    }).length;
  };

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const term = searchTerm.toLowerCase();
      return (
        b.name.toLowerCase().includes(term) ||
        b.id.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
      );
    });
  }, [brands, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats & Action */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#FFDD00] font-condensed tracking-wider">
              <Tag className="w-4 h-4" />
              <span>Gestão de Marcas & Fabricantes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-condensed mt-1">
              Catálogo de Marcas Oficiais
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Gere as marcas e fabricantes dos teus produtos, logótipos e associações. Os produtos associados ganham filtros e logótipos automáticos.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Recarregar marcas"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setBrandToEdit(null);
                setIsAddEditOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-[#FFDD00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#FFE838] transition-all font-condensed shadow-lg shadow-[#FFDD00]/15 flex items-center gap-2 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Nova Marca</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-neutral-800/80">
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-3">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total de Marcas</span>
            <span className="text-xl font-black text-white font-condensed">{stats.totalBrands}</span>
          </div>
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-3">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Com Logótipo</span>
            <span className="text-xl font-black text-[#FFDD00] font-condensed">{stats.withLogo}</span>
          </div>
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-3">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Produtos no Catálogo</span>
            <span className="text-xl font-black text-white font-condensed">{stats.totalProducts}</span>
          </div>
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-3">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Cobertura de Marca</span>
            <span className="text-xl font-black text-emerald-400 font-condensed">
              {stats.totalProducts > 0 ? Math.round((stats.assignedProducts / stats.totalProducts) * 100) : 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou identificador..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] transition-colors"
          />
        </div>
        <div className="text-xs text-neutral-400">
          A exibir <strong className="text-white">{filteredBrands.length}</strong> de <strong className="text-white">{brands.length}</strong> marcas
        </div>
      </div>

      {/* Brands Table / List */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-condensed text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-black">Marca / Logótipo</th>
                <th className="py-3.5 px-4 font-black">Identificador (Slug)</th>
                <th className="py-3.5 px-4 font-black">Descrição</th>
                <th className="py-3.5 px-4 font-black text-center">Produtos</th>
                <th className="py-3.5 px-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <Tag className="w-8 h-8 mx-auto mb-2 text-neutral-600 stroke-[1.5]" />
                    <p className="text-sm font-medium">Nenhuma marca encontrada com o termo "{searchTerm}"</p>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const productCount = brand.productCount ?? getProductCountForBrand(brand.id, brand.name);
                  return (
                    <tr key={brand.id} className="hover:bg-neutral-800/40 transition-colors group">
                      
                      {/* Brand Info & Logo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-1.5" />
                            ) : (
                              <span className="text-xs font-black text-[#FFDD00] font-condensed">
                                {brand.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block group-hover:text-[#FFDD00] transition-colors">
                              {brand.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {brand.logoUrl ? 'Logótipo associado' : 'Sem logótipo'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Slug ID */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300">
                          {brand.id}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-neutral-400 truncate text-[11px]">
                          {brand.description || <span className="text-neutral-600 italic">Sem descrição</span>}
                        </p>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onFilterBrandProducts(brand.name)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-condensed transition-all ${
                            productCount > 0
                              ? 'bg-neutral-800 text-[#FFDD00] hover:bg-[#FFDD00] hover:text-black hover:scale-105'
                              : 'bg-neutral-950 text-neutral-500'
                          }`}
                          title={`Ver produtos da marca ${brand.name}`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{productCount} {productCount === 1 ? 'produto' : 'produtos'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setBrandToEdit(brand);
                              setIsAddEditOpen(true);
                            }}
                            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                            title="Editar Marca"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBrandToDelete(brand)}
                            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-red-900/60 text-neutral-400 hover:text-red-300 transition-colors"
                            title="Eliminar Marca"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Brand Modal */}
      <AddEditBrandModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setBrandToEdit(null);
        }}
        brandToEdit={brandToEdit}
        onSave={async (brandData) => {
          if (brandToEdit) {
            await onUpdateBrand({
              ...brandToEdit,
              ...brandData,
              id: brandToEdit.id,
            });
          } else {
            await onAddBrand(brandData);
          }
        }}
      />

      {/* Delete Brand Modal */}
      <DeleteBrandModal
        isOpen={Boolean(brandToDelete)}
        onClose={() => setBrandToDelete(null)}
        brand={brandToDelete}
        allBrands={brands}
        onConfirmDelete={async (brandId, options) => {
          await onDeleteBrand(brandId, options);
          setBrandToDelete(null);
        }}
      />

    </div>
  );
};
