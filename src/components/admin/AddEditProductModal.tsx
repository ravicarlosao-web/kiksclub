import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Euro, 
  Package, 
  Layers,
  Shirt,
  Footprints,
  Sparkles,
  Watch,
  Headphones,
  Upload,
  Image as ImageIcon,
  Camera,
  RefreshCw,
  AlertCircle,
  Link as LinkIcon,
  Minus,
  Boxes,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { Sneaker, StoreCategory } from '../../types';
import { getDefaultSizeStock } from '../../utils/stockUtils';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Sneaker) => void;
  productToEdit?: Sneaker | null;
  availableCategories?: StoreCategory[];
}

const DEFAULT_BRANDS = [
  'NIKE',
  'JORDAN',
  'LOUIS VUITTON',
  'YEEZY',
  'BALENCIAGA',
  'ADIDAS',
  'DIOR',
  'PRADA',
  'GUCCI',
  'TRAPSTAR',
  'ESSENTIALS',
  'ERIC EMANUEL',
  'NEW ERA',
  'ROLEX',
  'AUDEMARS PIGUET',
  'PATEK PHILIPPE',
  'CARTIER',
  'APPLE',
  'BEATS',
  'SONY',
  'MARSHALL',
  'KICKS CLUB'
];

const SHOE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ONE_SIZE_OPTIONS = ['Tamanho Único', 'Ajustável', '40mm', '41mm', '50cm', '55cm'];

const PRESET_IMAGES = [
  {
    label: 'Nike Dunk Panda (Ténis)',
    dept: 'tenis',
    url: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Prada Loafers (Calçado)',
    dept: 'tenis',
    url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Casaco Corta-vento (Roupa)',
    dept: 'roupa',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hoodie Streetwear (Roupa)',
    dept: 'roupa',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Calções Mesh (Roupa)',
    dept: 'roupa',
    url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Colar Cuban Link (Acessórios)',
    dept: 'acessorios',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Boné Fitted (Acessórios)',
    dept: 'acessorios',
    url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Relógio Luxo Aço (Relógios)',
    dept: 'relogios',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'AirPods Max (Eletrónicos)',
    dept: 'eletronicos',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Auscultadores Beats (Eletrónicos)',
    dept: 'eletronicos',
    url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  }
];

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  availableCategories = []
}) => {
  const isEditing = Boolean(productToEdit);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('NIKE');
  const [customBrand, setCustomBrand] = useState('');
  const [department, setDepartment] = useState<string>('tenis');
  const [subcategory, setSubcategory] = useState('');
  const [category, setCategory] = useState<string>('hype');
  const [price, setPrice] = useState<number>(119.90);
  const [originalPrice, setOriginalPrice] = useState<number>(180.00);
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'url'>('upload');
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [imageErrorMessage, setImageErrorMessage] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSizes, setSelectedSizes] = useState<(number | string)[]>([38, 39, 40, 41, 42, 43, 44, 45]);
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState<string[]>([
    'Qualidade Premium com acabamentos rigorosos',
    'Embalagem e apresentação de luxo',
    'Inclui certificado e etiquetas de verificação',
  ]);
  const [newDetailText, setNewDetailText] = useState('');

  // Find subcategories for selected department
  const activeCategoryObj = availableCategories.find(c => c.id === department || c.slug === department);

  // Compression & file processing helper for crisp, instant images
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Por favor seleciona um ficheiro de imagem válido (JPG, PNG, WEBP, etc).'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          reject(new Error('Não foi possível ler o ficheiro selecionado.'));
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const MAX_DIMENSION = 1200;
            let { width, height } = img;

            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
              if (width > height) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              } else {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(result);
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.86);
            resolve(optimized);
          } catch {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => reject(new Error('Erro ao ler o ficheiro de imagem.'));
      reader.readAsDataURL(file);
    });
  };

  // Upload de imagem diretamente para o Cloudinary via API backend
  const uploadToCloudinary = async (base64Data: string, folder = 'kicksclub/products'): Promise<string> => {
    if (!base64Data || base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return base64Data;
    }

    try {
      const token = localStorage.getItem('kicksclub_admin_token') || sessionStorage.getItem('kicksclub_admin_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: JSON.stringify({ image: base64Data, folder }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('[Cloudinary Upload Warning]', errorData);
        return base64Data; // fallback
      }

      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
      return base64Data;
    } catch (err) {
      console.warn('[Cloudinary Upload Error]', err);
      return base64Data;
    }
  };

  const handleMainFileSelected = async (file: File) => {
    try {
      setIsProcessingImage(true);
      setImageErrorMessage('');
      setUploadStatusText('A otimizar foto...');
      const base64 = await processImageFile(file);

      setUploadStatusText('A enviar imagem para o Cloudinary...');
      const cloudUrl = await uploadToCloudinary(base64);

      setImage(cloudUrl);
      setGallery((prev) => [cloudUrl, ...prev.filter(g => g !== cloudUrl && g !== base64)]);
    } catch (err: any) {
      setImageErrorMessage(err.message || 'Erro ao carregar a imagem.');
    } finally {
      setIsProcessingImage(false);
      setUploadStatusText('');
    }
  };

  const handleGalleryFilesSelected = async (files: FileList | File[]) => {
    try {
      setIsProcessingImage(true);
      setImageErrorMessage('');
      const newImages: string[] = [];
      const fileList = Array.from(files);

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type.startsWith('image/')) {
          setUploadStatusText(`A processar foto ${i + 1} de ${fileList.length}...`);
          const base64 = await processImageFile(file);
          setUploadStatusText(`A enviar foto ${i + 1} para o Cloudinary...`);
          const cloudUrl = await uploadToCloudinary(base64);
          newImages.push(cloudUrl);
        }
      }
      if (newImages.length > 0) {
        if (!image) {
          setImage(newImages[0]);
        }
        setGallery((prev) => [...prev, ...newImages]);
      }
    } catch (err: any) {
      setImageErrorMessage(err.message || 'Erro ao adicionar fotos.');
    } finally {
      setIsProcessingImage(false);
      setUploadStatusText('');
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const updatedGallery = gallery.filter((_, idx) => idx !== indexToRemove);
    setGallery(updatedGallery);
    if (gallery[indexToRemove] === image) {
      setImage(updatedGallery[0] || '');
    }
  };

  const handleSetAsMainImage = (selectedImg: string) => {
    setImage(selectedImg);
    setGallery((prev) => [selectedImg, ...prev.filter(g => g !== selectedImg)]);
  };

  // Populate or reset form
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBrand(productToEdit.brand);
      setDepartment(productToEdit.department || 'tenis');
      setSubcategory(productToEdit.subcategory || '');
      setCategory(productToEdit.category || 'hype');
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setImage(productToEdit.image || '');
      setGallery(productToEdit.gallery || (productToEdit.image ? [productToEdit.image] : []));
      const currentSizes = productToEdit.sizes || [39, 40, 41, 42, 43];
      setSelectedSizes(currentSizes);
      const initialStock: Record<string, number> = {};
      currentSizes.forEach((s) => {
        if (productToEdit.sizeStock && String(s) in productToEdit.sizeStock) {
          initialStock[String(s)] = productToEdit.sizeStock[String(s)];
        } else {
          initialStock[String(s)] = getDefaultSizeStock(productToEdit.id, s);
        }
      });
      setSizeStock(initialStock);
      setInStock(productToEdit.inStock ?? true);
      setFeatured(productToEdit.featured ?? false);
      setTag(productToEdit.tag || '');
      setDescription(productToEdit.description || '');
      setDetails(productToEdit.details || ['Qualidade Premium', 'Embalagem original incluída']);
      setImageSourceTab(productToEdit.image && productToEdit.image.startsWith('http') ? 'url' : 'upload');
      setImageErrorMessage('');
    } else {
      setName('');
      setBrand('NIKE');
      setCustomBrand('');
      setDepartment('tenis');
      setSubcategory('Sneakers');
      setCategory('hype');
      setPrice(119.90);
      setOriginalPrice(180.00);
      setImage('');
      setGallery([]);
      const defaultSizes = [38, 39, 40, 41, 42, 43, 44, 45];
      setSelectedSizes(defaultSizes);
      const initialStock: Record<string, number> = {};
      defaultSizes.forEach((s) => {
        initialStock[String(s)] = 2; // Por padrão 2 pares por tamanho
      });
      setSizeStock(initialStock);
      setInStock(true);
      setFeatured(false);
      setTag('NOVO DROP');
      setDescription('Artigo com design exclusivo, materiais de topo e acabamentos impecáveis.');
      setDetails([
        'Acabamentos de excelência e materiais premium',
        'Etiquetas de verificação e autenticidade',
        'Caixa completa com embalagem protegida para envio CTT Expresso'
      ]);
      setImageSourceTab('upload');
      setImageErrorMessage('');
    }
  }, [productToEdit, isOpen]);

  // When department changes, update suggested sizes if needed
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const catObj = availableCategories.find(c => c.id === newDept || c.slug === newDept);
    if (catObj && catObj.subcategories.length > 0) {
      setSubcategory(catObj.subcategories[0]);
    }

    if (!productToEdit) {
      if (newDept === 'roupa') {
        setSelectedSizes(['S', 'M', 'L', 'XL']);
      } else if (newDept === 'tenis') {
        setSelectedSizes([39, 40, 41, 42, 43, 44]);
      } else {
        setSelectedSizes(['Tamanho Único']);
      }
    }
  };

  const handleToggleSize = (size: number | string) => {
    const key = String(size);
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== size));
      }
    } else {
      setSelectedSizes([...selectedSizes, size]);
      if (sizeStock[key] === undefined) {
        setSizeStock((prev) => ({ ...prev, [key]: 2 }));
      }
    }
  };

  const handleSizeStockChange = (size: number | string, qty: number) => {
    const safeQty = Math.max(0, Math.floor(qty));
    setSizeStock((prev) => ({
      ...prev,
      [String(size)]: safeQty,
    }));
  };

  const handleSetAllStock = (qty: number) => {
    const safeQty = Math.max(0, Math.floor(qty));
    const updated: Record<string, number> = {};
    selectedSizes.forEach((s) => {
      updated[String(s)] = safeQty;
    });
    setSizeStock(updated);
  };

  const handleAddDetail = () => {
    if (newDetailText.trim()) {
      setDetails([...details, newDetailText.trim()]);
      setNewDetailText('');
    }
  };

  const handleRemoveDetail = (idx: number) => {
    setDetails(details.filter((_, i) => i !== idx));
  };

  const discountPercentage = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!image.trim()) {
      setImageErrorMessage('Por favor adiciona uma foto para o artigo (carrega um ficheiro de imagem real do teu dispositivo).');
      setImageSourceTab('upload');
      return;
    }

    setIsProcessingImage(true);
    setUploadStatusText('A validar imagens no Cloudinary...');

    try {
      let finalMainImage = image.trim();
      if (finalMainImage.startsWith('data:')) {
        finalMainImage = await uploadToCloudinary(finalMainImage);
      }

      const cleanGallery: string[] = [];
      for (const g of gallery) {
        if (!g || !g.trim()) continue;
        if (g.startsWith('data:')) {
          const uploaded = await uploadToCloudinary(g);
          cleanGallery.push(uploaded);
        } else {
          cleanGallery.push(g);
        }
      }

      const finalBrand = brand === 'OTHER' ? (customBrand.trim().toUpperCase() || 'KICKS CLUB') : brand;
      const generatedId = productToEdit?.id || `kc-${department}-${finalBrand.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`;

      const finalGalleryList = [
        finalMainImage,
        ...cleanGallery.filter((g) => g && g.trim().length > 0 && g !== finalMainImage)
      ];

      // Compute active stock across selected sizes
      const totalUnits = selectedSizes.reduce((sum, s) => sum + (sizeStock[String(s)] || 0), 0);
      const hasAnyStock = totalUnits > 0 && inStock;

      const cleanSizeStock: Record<string, number> = {};
      selectedSizes.forEach((s) => {
        cleanSizeStock[String(s)] = sizeStock[String(s)] !== undefined ? sizeStock[String(s)] : 2;
      });

      const savedProduct: Sneaker = {
        id: generatedId,
        name: name.trim().toUpperCase(),
        brand: finalBrand,
        category,
        department,
        subcategory: subcategory.trim() || undefined,
        sizeType: department === 'roupa' ? 'clothing' : department === 'tenis' ? 'shoes' : 'one_size',
        price: Number(price),
        originalPrice: Number(originalPrice),
        discountPercentage,
        image: finalMainImage,
        gallery: finalGalleryList,
        sizes: selectedSizes,
        sizeStock: cleanSizeStock,
        inStock: hasAnyStock,
        featured,
        tag: tag.trim() || undefined,
        description: description.trim() || 'Artigo com qualidade verificada e detalhes minuciosos.',
        details: details.filter((d) => d.trim().length > 0),
      };

      onSave(savedProduct);
      onClose();
    } catch (err: any) {
      setImageErrorMessage(err.message || 'Erro ao preparar produto para gravação.');
    } finally {
      setIsProcessingImage(false);
      setUploadStatusText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#141414] border border-neutral-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFDD00]/15 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white font-condensed tracking-wide">
                {isEditing ? 'EDITAR ARTIGO / PRODUTO' : 'REGISTAR NOVO ARTIGO NA LOJA'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isEditing ? 'Atualiza detalhes, departamento e tamanhos do catálogo' : 'Adiciona ténis, roupa, acessórios, relógios ou eletrónicos'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* SECTOR 1: DEPARTAMENTO / CATEGORIA DA LOJA */}
          <div className="p-4 bg-black/50 border border-neutral-800 rounded-2xl">
            <label className="block text-xs font-black uppercase tracking-wider text-[#FFDD00] mb-2 font-condensed flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>1. Departamento / Categoria do Produto *</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {availableCategories.map((cat) => {
                const isSelected = department === cat.id || department === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleDepartmentChange(cat.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#FFDD00] text-black border-[#FFDD00] font-black shadow-md'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {cat.id === 'tenis' && <Footprints className="w-4 h-4" />}
                    {cat.id === 'roupa' && <Shirt className="w-4 h-4" />}
                    {cat.id === 'acessorios' && <Sparkles className="w-4 h-4" />}
                    {cat.id === 'relogios' && <Watch className="w-4 h-4" />}
                    {cat.id === 'eletronicos' && <Headphones className="w-4 h-4" />}
                    {!['tenis','roupa','acessorios','relogios','eletronicos'].includes(cat.id) && <Package className="w-4 h-4" />}
                    
                    <span className="text-[11px] font-condensed uppercase tracking-tight text-center leading-tight">
                      {cat.name.split('&')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subcategory suggestions */}
            {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Subcategoria Rápida:</span>
                {activeCategoryObj.subcategories.map((sub, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSubcategory(sub)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      subcategory === sub
                        ? 'bg-white text-black font-bold'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTOR 2: IDENTIFICAÇÃO DO PRODUTO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
                Nome do Artigo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: CASACO CORTA-VENTO TRAPSTAR REFLECTIVE"
                required
                className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
                Marca / Designer *
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2.5 bg-black border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#FFDD00]"
              >
                {DEFAULT_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="OTHER">+ Outra Marca Personalizada...</option>
              </select>

              {brand === 'OTHER' && (
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Digita a marca..."
                  className="mt-2 w-full px-3 py-1.5 bg-black border border-neutral-700 rounded-lg text-xs text-white"
                />
              )}
            </div>
          </div>

          {/* Subcategoria & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
                Tipo / Subcategoria Específica
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Ex: Casacos, Colares, Fones, Loafers, Bonés..."
                className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#FFDD00]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
                Etiqueta / Badge Promocional
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                placeholder="Ex: NOVO DROP, EXCLUSIVO, BEST SELLER..."
                className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
              />
            </div>
          </div>

          {/* SECTOR 3: PREÇOS & DESCONTO */}
          <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2 font-condensed">
              <Euro className="w-4 h-4 text-[#FFDD00]" />
              <span>Valores & Preço de Venda em Portugal</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Preço com Desconto (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-[#FFDD00] font-black focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Preço Original de Tabela (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-neutral-400 line-through focus:outline-none focus:border-[#FFDD00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Desconto Calculado
                </label>
                <div className="px-3.5 py-2 bg-black border border-neutral-800 rounded-xl text-sm font-black text-green-400 flex items-center justify-between">
                  <span>{discountPercentage}% OFF</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Automático</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTOR 4: IMAGEM REAL & UPLOAD */}
          <div className="bg-neutral-900/60 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#FFDD00] font-condensed flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>4. Imagem do Artigo (Carregar Foto Real) *</span>
                </label>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Adiciona fotos reais do teu dispositivo (computador, câmara ou galeria do telemóvel)
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setImageSourceTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    imageSourceTab === 'upload'
                      ? 'bg-[#FFDD00] text-black shadow-xs font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ficheiro / Foto Real</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceTab('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    imageSourceTab === 'url'
                      ? 'bg-[#FFDD00] text-black shadow-xs font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link URL</span>
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {imageErrorMessage && (
              <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{imageErrorMessage}</span>
              </div>
            )}

            {/* TAB 1: UPLOAD REAL IMAGE (PRIMARY & DEFAULT) */}
            {imageSourceTab === 'upload' && (
              <div className="space-y-4">
                {/* Main Image Dropzone or Active Preview */}
                {!image ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingMain(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingMain(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingMain(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleMainFileSelected(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => mainFileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDraggingMain 
                        ? 'border-[#FFDD00] bg-[#FFDD00]/10 scale-[1.01]' 
                        : 'border-neutral-700 hover:border-[#FFDD00] bg-black/40 hover:bg-neutral-900/40'
                    }`}
                  >
                    <input
                      ref={mainFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleMainFileSelected(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-14 h-14 rounded-2xl bg-[#FFDD00]/15 border border-[#FFDD00]/30 flex items-center justify-center text-[#FFDD00] group-hover:scale-110 transition-transform">
                        {isProcessingImage ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-[#FFDD00]" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-black text-white font-condensed uppercase tracking-wide">
                          {isProcessingImage ? (uploadStatusText || 'A Processar Imagem...') : 'Clica para escolher foto ou arrasta para aqui'}
                        </p>
                        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                          Carrega fotos tiradas com a câmara, transferências ou galeria (alojamento seguro no Cloudinary).
                        </p>
                      </div>

                      <button
                        type="button"
                        className="px-4 py-2 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black text-xs uppercase tracking-wider rounded-xl font-condensed flex items-center gap-2 shadow-xs transition-all pointer-events-none"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Selecionar Foto do Dispositivo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Active Main Image Display */
                  <div className="bg-black/60 border border-neutral-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                    {/* Image Preview Box */}
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-neutral-950 border border-neutral-700 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                      <img 
                        src={image} 
                        alt="Pré-visualização do produto" 
                        className="w-full h-full object-contain filter drop-shadow-md rounded-xl"
                      />
                      <div className="absolute top-2 left-2 bg-[#FFDD00] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-condensed shadow-xs">
                        Principal
                      </div>
                    </div>

                    {/* Image Info and Controls */}
                    <div className="flex-1 text-center sm:text-left space-y-2.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-950/60 border border-green-800/80 px-2.5 py-1 rounded-full">
                            <Check className="w-3.5 h-3.5" />
                            Foto Pronta para Publicar
                          </span>
                          {image.includes('cloudinary.com') && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2.5 py-1 rounded-full">
                              <Cloud className="w-3.5 h-3.5" />
                              Alojada no Cloudinary
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm font-black text-white uppercase font-condensed mt-1">
                          Imagem Principal do Artigo
                        </h5>
                        <p className="text-xs text-neutral-400">
                          Esta imagem será o destaque na montra da loja, na busca e no carrinho de compras.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => mainFileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border border-neutral-700"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Substituir Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveGalleryImage(gallery.indexOf(image));
                            setImage('');
                          }}
                          className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-800/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover</span>
                        </button>

                        <input
                          ref={mainFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleMainFileSelected(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ADDITIONAL GALLERY PHOTOS SECTION */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <span className="text-xs font-black uppercase text-neutral-300 font-condensed flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#FFDD00]" />
                        <span>Galeria de Fotos Adicionais (Outros Ângulos & Detalhes)</span>
                      </span>
                      <span className="text-[11px] text-neutral-400 block">
                        Adiciona fotos de lado, sola, costas ou embalagem
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FFDD00]" />
                      <span>+ Adicionar Foto</span>
                    </button>
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleGalleryFilesSelected(e.target.files);
                        }
                      }}
                    />
                  </div>

                  {/* Additional photos thumbnails or dropzone */}
                  {gallery.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {gallery.map((imgUrl, idx) => {
                        const isMain = imgUrl === image;
                        return (
                          <div 
                            key={idx} 
                            className={`relative aspect-square rounded-xl bg-black border p-1 group overflow-hidden ${
                              isMain ? 'border-[#FFDD00] ring-2 ring-[#FFDD00]/30' : 'border-neutral-800'
                            }`}
                          >
                            <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-contain rounded-lg" />
                            {isMain && (
                              <div className="absolute top-1 left-1 bg-[#FFDD00] text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs">
                                Principal
                              </div>
                            )}

                            {/* Hover overlay with action */}
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsMainImage(imgUrl)}
                                  className="px-1.5 py-0.5 bg-[#FFDD00] text-black text-[9px] font-black rounded uppercase w-full text-center"
                                >
                                  Principal
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="p-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-[10px]"
                                title="Eliminar foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add more button tile */}
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="aspect-square rounded-xl border border-dashed border-neutral-700 hover:border-[#FFDD00] bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-5 h-5 text-[#FFDD00] mb-1" />
                        <span className="text-[10px] font-bold uppercase font-condensed">Mais Foto</span>
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-3 text-center cursor-pointer bg-neutral-950/40 text-neutral-400 hover:text-neutral-200 text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-[#FFDD00]" />
                      <span>Clica aqui para adicionar mais fotos do artigo para a galeria</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: URL / PRESETS ALTERNATIVE */}
            {imageSourceTab === 'url' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Link URL da Imagem (Ex: Unsplash, Cloudinary, etc.)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => {
                        setImage(e.target.value);
                        if (e.target.value && !gallery.includes(e.target.value)) {
                          setGallery((prev) => [e.target.value, ...prev]);
                        }
                      }}
                      placeholder="https://exemplo.com/foto-do-produto.jpg"
                      className="flex-1 px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00]"
                    />
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick presets shortcut */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2 font-condensed">
                    Ou Escolhe uma das Fotos Rápidas da Loja:
                  </span>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImage(preset.url);
                          if (!gallery.includes(preset.url)) {
                            setGallery((prev) => [preset.url, ...prev.filter(g => g !== preset.url)]);
                          }
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                          image === preset.url ? 'border-[#FFDD00] ring-2 ring-[#FFDD00]/30' : 'border-neutral-800 opacity-60 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        {image === preset.url && (
                          <div className="absolute inset-0 bg-[#FFDD00]/20 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* SECTOR 5: TAMANHOS ADAPTÁVEIS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300 font-condensed">
                Tamanhos / Variações Disponíveis *
              </label>
              <div className="flex items-center gap-2">
                {department === 'tenis' && (
                  <button
                    type="button"
                    onClick={() => setSelectedSizes(SHOE_SIZES)}
                    className="text-[11px] text-[#FFDD00] hover:underline font-bold"
                  >
                    Todos (36-46)
                  </button>
                )}
                {department === 'roupa' && (
                  <button
                    type="button"
                    onClick={() => setSelectedSizes(CLOTHING_SIZES)}
                    className="text-[11px] text-[#FFDD00] hover:underline font-bold"
                  >
                    Todos (XS-XXL)
                  </button>
                )}
              </div>
            </div>

            {/* Quick choices according to department */}
            <div className="flex flex-wrap gap-2">
              {department === 'tenis' && SHOE_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleToggleSize(size)}
                    className={`w-11 h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#FFDD00] text-black shadow-md font-black scale-105'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}

              {department === 'roupa' && CLOTHING_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleToggleSize(size)}
                    className={`px-3.5 h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#FFDD00] text-black shadow-md font-black scale-105'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}

              {!['tenis', 'roupa'].includes(department) && ONE_SIZE_OPTIONS.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleToggleSize(size)}
                    className={`px-3.5 h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#FFDD00] text-black shadow-md font-black scale-105'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* CONTROLO REAL DE STOCK POR TAMANHO */}
            {selectedSizes.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#FFDD00]" />
                    <span className="text-xs font-black uppercase text-white tracking-wide font-condensed">
                      Quantidades em Stock por Tamanho
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-neutral-400">
                      Total: <strong className="text-[#FFDD00]">{selectedSizes.reduce((sum, s) => sum + (sizeStock[String(s)] || 0), 0)} un.</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetAllStock(2)}
                        className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold transition-colors"
                      >
                        Todos 2 un.
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetAllStock(5)}
                        className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold transition-colors"
                      >
                        Todos 5 un.
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetAllStock(0)}
                        className="px-2 py-0.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 text-[10px] font-bold transition-colors"
                      >
                        Zerar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid of stock cards per size */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedSizes.map((size) => {
                    const key = String(size);
                    const qty = sizeStock[key] !== undefined ? sizeStock[key] : 2;
                    const isSoldOut = qty === 0;

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isSoldOut
                            ? 'bg-neutral-900/40 border-red-900/40'
                            : 'bg-neutral-900/90 border-neutral-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-white font-condensed">
                            Tam. {size}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              isSoldOut
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isSoldOut ? 'Esgotado' : `${qty} un.`}
                          </span>
                        </div>

                        {/* Counter stepper */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSizeStockChange(size, qty - 1)}
                            disabled={qty <= 0}
                            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-neutral-800 text-white flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
                            className="w-full text-center py-1 bg-black/60 border border-neutral-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#FFDD00]"
                          />

                          <button
                            type="button"
                            onClick={() => handleSizeStockChange(size, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="mt-1.5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSizeStockChange(size, isSoldOut ? 2 : 0)}
                            className="text-[10px] text-neutral-400 hover:text-[#FFDD00] transition-colors"
                          >
                            {isSoldOut ? 'Repor 2 un.' : 'Marcar esgotado'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SECTOR 6: ESTADO & DESTAQUE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <label className="flex items-center gap-3 p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-2xl cursor-pointer hover:border-neutral-700 transition-colors">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-[#FFDD00] focus:ring-[#FFDD00]"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white block font-condensed">
                  Em Estoque para Envio
                </span>
                <span className="text-[11px] text-neutral-400">
                  Permite compras imediatamente na loja
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-2xl cursor-pointer hover:border-neutral-700 transition-colors">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-[#FFDD00] focus:ring-[#FFDD00]"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white block font-condensed">
                  Destaque na Página Principal
                </span>
                <span className="text-[11px] text-neutral-400">
                  Aparece nas secções em evidência
                </span>
              </div>
            </label>
          </div>

          {/* SECTOR 7: DESCRIÇÃO & ESPECIFICAÇÕES */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
              Descrição do Artigo
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreve o artigo, corte, tecidos ou tecnologia..."
              className="w-full px-3.5 py-2 bg-black border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFDD00] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5 font-condensed">
              Especificações & Detalhes (Lista de Pontos)
            </label>
            <div className="space-y-2 mb-2">
              {details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[#FFDD00] font-bold text-xs">•</span>
                  <span className="text-xs text-neutral-200 flex-1 bg-neutral-900/70 px-3 py-1.5 rounded-lg border border-neutral-800">
                    {detail}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(idx)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDetailText}
                onChange={(e) => setNewDetailText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDetail();
                  }
                }}
                placeholder="Adicionar especificação (ex: '100% Algodão pesado', 'Bisel cerâmico')..."
                className="flex-1 px-3.5 py-2 bg-black border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFDD00]"
              />
              <button
                type="button"
                onClick={handleAddDetail}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
              >
                + Adicionar
              </button>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-neutral-800 flex items-center justify-end gap-3 bg-black/40 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#FFDD00] hover:bg-[#FFE838] text-black font-black uppercase text-xs rounded-xl flex items-center gap-2 transition-all font-condensed shadow-md shadow-[#FFDD00]/10"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isEditing ? 'Guardar Alterações' : 'Publicar no Catálogo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
