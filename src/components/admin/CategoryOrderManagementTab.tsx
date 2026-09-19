import React, { useState, useEffect } from 'react';
import {
  ArrowUpDown,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  RotateCcw,
  Footprints,
  Shirt,
  Watch,
  Headphones,
  Glasses,
  Briefcase,
  Gem,
  Package,
  ShoppingBag,
  Info
} from 'lucide-react';
import { StoreCategory, Sneaker } from '../../types';

interface CategoryOrderManagementTabProps {
  categories: StoreCategory[];
  products: Sneaker[];
  onReorderCategories: (orderedIds: string[]) => Promise<void>;
  onNavigateHome?: () => void;
}

// Helpers para pré-visualizar títulos da secção na Homepage
const getCategorySectionInfo = (catId: string, defaultName: string) => {
  switch (catId.toLowerCase()) {
    case 'tenis':
      return { tag: 'CALÇADO EXCLUSIVO', title: 'TÉNIS & SNEAKERS HYPE' };
    case 'roupa':
      return { tag: 'STREETWEAR DROP', title: 'ROUPA & STREETWEAR URBAN' };
    case 'acessorios':
      return { tag: 'ACESSÓRIOS & LUXO', title: 'MALAS, BONÉS & JÓIAS EXCLUSIVAS' };
    case 'relogios':
      return { tag: 'ALTA RELOJOARIA', title: 'CRONÓGRAFOS & RELÓGIOS DE LUXO' };
    case 'eletronicos':
      return { tag: 'TECH GEAR & ÁUDIO', title: 'ELETRÓNICOS & SOM PREMIUM' };
    default:
      return { tag: 'DEPARTAMENTO OFICIAL', title: `${defaultName.toUpperCase()} DROP` };
  }
};

export const CategoryOrderManagementTab: React.FC<CategoryOrderManagementTabProps> = ({
  categories,
  products,
  onReorderCategories,
  onNavigateHome,
}) => {
  // Lista local ordenada
  const [items, setItems] = useState<StoreCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Inicializar itens ordenados conforme sortOrder
  useEffect(() => {
    if (categories && categories.length > 0) {
      const sorted = [...categories].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      setItems(sorted);
    }
  }, [categories]);

  // Verificar se há alterações não guardadas
  const initialOrderIds = categories.map((c) => c.id).join(',');
  const currentOrderIds = items.map((c) => c.id).join(',');
  const hasChanges = initialOrderIds !== currentOrderIds;

  // Icon Resolver
  const renderCategoryIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName?.toLowerCase()) {
      case 'footprints':
        return <Footprints className={className} />;
      case 'shirt':
        return <Shirt className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'watch':
        return <Watch className={className} />;
      case 'headphones':
        return <Headphones className={className} />;
      case 'glasses':
        return <Glasses className={className} />;
      case 'briefcase':
        return <Briefcase className={className} />;
      case 'gem':
        return <Gem className={className} />;
      default:
        return <Package className={className} />;
    }
  };

  const getProductCount = (catId: string, slug: string) => {
    return products.filter((p) => {
      if (p.department) {
        return (
          p.department.toLowerCase() === catId.toLowerCase() ||
          p.department.toLowerCase() === slug.toLowerCase()
        );
      }
      return catId === 'tenis' || slug === 'tenis';
    }).length;
  };

  // Reordenação por botões
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    setItems(newItems);
    setSaveStatus('idle');
  };

  const moveToTop = (index: number) => {
    moveItem(index, 0);
  };

  const moveToBottom = (index: number) => {
    moveItem(index, items.length - 1);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    moveItem(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Guardar nova ordem
  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      setErrorMessage(null);

      const orderedIds = items.map((item) => item.id);
      await onReorderCategories(orderedIds);

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('[handleSaveOrder]', err);
      setSaveStatus('error');
      setErrorMessage(err.message || 'Ocorreu um erro ao guardar a ordem das categorias.');
    } finally {
      setIsSaving(false);
    }
  };

  // Restaurar predefinição padrão KicksClub
  const handleResetToDefault = () => {
    const defaultIds = ['tenis', 'roupa', 'acessorios', 'relogios', 'eletronicos'];
    const sorted = [...items].sort((a, b) => {
      const idxA = defaultIds.indexOf(a.id);
      const idxB = defaultIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
    setItems(sorted);
    setSaveStatus('idle');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#FFDD00] font-condensed tracking-wider">
              <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
              <span>Controlo de Disposição da Homepage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-condensed tracking-tight mt-1">
              Ordem das Categorias na Página Inicial
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Define a ordem exata em que as secções de produtos aparecem aos clientes na página inicial (de cima para baixo).
              Arrasta os cartões ou usa as setas para colocar no topo a categoria que pretendes destacar.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleResetToDefault}
              className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              title="Restaurar ordem recomendada (Ténis no topo, etc.)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ordem Padrão</span>
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                title="Abrir página inicial para testar"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FFDD00]" />
                <span>Ver na Loja</span>
              </button>
            )}

            <button
              onClick={handleSaveOrder}
              disabled={isSaving || !hasChanges}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs flex items-center gap-2 transition-all font-condensed shadow-md ${
                hasChanges
                  ? 'bg-[#FFDD00] hover:bg-[#FFE838] text-black shadow-[#FFDD00]/20 hover:scale-[1.02] cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>A Guardar...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Guardar Nova Ordem</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {hasChanges && (
          <div className="mt-4 p-3.5 bg-[#FFDD00]/10 border border-[#FFDD00]/30 rounded-xl flex items-center justify-between gap-3 text-xs text-[#FFDD00]">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Alterações detetadas:</strong> Reordenaste as categorias. Clica no botão amarelo{' '}
                <strong>"Guardar Nova Ordem"</strong> para aplicar à página pública.
              </span>
            </div>
            <span className="hidden sm:inline-block font-mono text-[10px] uppercase font-bold bg-[#FFDD00]/20 px-2 py-0.5 rounded">
              Pendente
            </span>
          </div>
        )}

        {saveStatus === 'success' && (
          <div className="mt-4 p-3.5 bg-green-950/40 border border-green-500/40 rounded-xl flex items-center gap-2.5 text-xs text-green-400 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              <strong>Sucesso!</strong> A ordem das secções da homepage foi atualizada e guardada na base de dados.
            </span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mt-4 p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Erro:</strong> {errorMessage}
            </span>
          </div>
        )}
      </div>

      {/* Main Content: Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Reorderable List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-neutral-400 font-condensed tracking-wider">
              Posição na Loja ({items.length} Categorias)
            </span>
            <span className="text-[11px] text-neutral-500">
              Arrasta pelo ícone ⠿ ou clica nas setas
            </span>
          </div>

          {items.map((cat, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;
            const sectionInfo = getCategorySectionInfo(cat.id, cat.name);
            const count = getProductCount(cat.id, cat.slug);

            return (
              <div
                key={cat.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative bg-[#141414] border rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
                  isDragging
                    ? 'opacity-40 border-dashed border-[#FFDD00] scale-[0.99]'
                    : isOver
                    ? 'border-[#FFDD00] bg-[#1a1a1a] shadow-lg shadow-[#FFDD00]/10 -translate-y-0.5'
                    : isFirst
                    ? 'border-[#FFDD00]/40 hover:border-[#FFDD00]/80 shadow-xs'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Drag Handle & Rank Badge */}
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1.5 text-neutral-500 group-hover:text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Arrasta para reordenar"
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-condensed text-sm shadow-inner transition-colors ${
                        isFirst
                          ? 'bg-[#FFDD00] text-black font-black ring-2 ring-[#FFDD00]/30'
                          : index === 1
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                      title={`Posição #${index + 1}`}
                    >
                      {index + 1}º
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
                        isFirst
                          ? 'bg-black border-[#FFDD00]/40 text-[#FFDD00]'
                          : 'bg-black border-neutral-800 text-neutral-300 group-hover:text-[#FFDD00]'
                      }`}
                    >
                      {renderCategoryIcon(cat.icon, 'w-5 h-5')}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black uppercase text-white font-condensed tracking-wide">
                          {cat.name}
                        </h4>
                        {isFirst && (
                          <span className="px-2 py-0.5 bg-[#FFDD00] text-black text-[9px] font-black uppercase rounded-full font-condensed tracking-wide">
                            ★ 1º no Topo da Loja
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {cat.slug}
                        </span>
                      </div>

                      {/* Homepage Section Tag & Title preview */}
                      <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-neutral-400">
                        <span className="text-[#FFDD00] font-condensed font-bold">
                          Tag na Loja: {sectionInfo.tag}
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span className="font-semibold text-neutral-300 truncate max-w-[200px] sm:max-w-xs">
                          Título: {sectionInfo.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Products count & Move buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-medium px-2.5 py-1 bg-black/40 rounded-lg border border-neutral-800/80">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#FFDD00]" />
                      <span>{count} prod.</span>
                    </div>

                    {/* Move controls */}
                    <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
                      <button
                        onClick={() => moveToTop(index)}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFirst
                            ? 'text-neutral-700 cursor-not-allowed'
                            : 'text-neutral-400 hover:text-[#FFDD00] hover:bg-neutral-800'
                        }`}
                        title="Mover direto para o Topo (1º lugar)"
                      >
                        <ChevronsUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveItem(index, index - 1)}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFirst
                            ? 'text-neutral-700 cursor-not-allowed'
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                        }`}
                        title="Subir uma posição"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveItem(index, index + 1)}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLast
                            ? 'text-neutral-700 cursor-not-allowed'
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                        }`}
                        title="Descer uma posição"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveToBottom(index)}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLast
                            ? 'text-neutral-700 cursor-not-allowed'
                            : 'text-neutral-400 hover:text-[#FFDD00] hover:bg-neutral-800'
                        }`}
                        title="Mover para o Fim"
                      >
                        <ChevronsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Column: Live Homepage Flow Simulator */}
        <div className="space-y-4">
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 sticky top-24">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-white font-condensed tracking-wider mb-2">
              <Layers className="w-4 h-4 text-[#FFDD00]" />
              <span>Simulador Visual da Homepage</span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">
              Esta é a sequência exata de secções que o visitante verá ao deslizar a página inicial da loja:
            </p>

            {/* Visual Page Stack */}
            <div className="space-y-2 text-xs font-mono">
              {/* Header */}
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-between text-[10px]">
                <span>1. BARRA DE NAVEGAÇÃO</span>
                <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded">Topo Fixo</span>
              </div>

              {/* Hero Banner */}
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-between text-[10px]">
                <span>2. BANNER PRINCIPAL (HERO)</span>
                <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded">Destaque</span>
              </div>

              {/* Trust Ticker */}
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-between text-[10px]">
                <span>3. MARQUEE DE CONFIANÇA</span>
                <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded">Ticker</span>
              </div>

              {/* Dynamic Categories Sections */}
              <div className="my-2 border-t border-b border-[#FFDD00]/20 py-2.5 space-y-2">
                <span className="text-[10px] font-black uppercase font-condensed text-[#FFDD00] block tracking-wider">
                  Secções de Produtos (Ordenáveis):
                </span>

                {items.map((cat, idx) => {
                  const info = getCategorySectionInfo(cat.id, cat.name);
                  return (
                    <div
                      key={cat.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        idx === 0
                          ? 'bg-[#FFDD00]/10 border-[#FFDD00]/50 text-white'
                          : 'bg-black/60 border-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                            idx === 0
                              ? 'bg-[#FFDD00] text-black'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[11px] truncate">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-neutral-400 font-sans truncate max-w-[100px]">
                        {info.tag}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom sections */}
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-between text-[10px]">
                <span>EXPLORADOR DE MARCAS</span>
                <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded">Filtro</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-between text-[10px]">
                <span>HYPE DROPS LIMITADOS</span>
                <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded">Coleção</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-between text-[10px]">
                <span>RODAPÉ OFICIAL</span>
                <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded">Fim</span>
              </div>
            </div>

            {/* Quick Tip Box */}
            <div className="mt-5 p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 flex items-start gap-2.5 text-[11px] text-neutral-400">
              <Info className="w-4 h-4 text-[#FFDD00] shrink-0 mt-0.5" />
              <span>
                Ao colocares uma categoria em <strong>1º lugar</strong>, ela será a primeira grande vitrina que qualquer cliente vê ao entrar na loja online.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
