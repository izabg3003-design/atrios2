import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Check, MessageSquare, Info, Star, Package, Shield, Truck, Plus, Minus, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translation } from '../translations';
import { saveStoreOrder, generateShortId, getProducts } from '../services/storage';
import { StoreOrder, Product } from '../types';

interface StoreProps {
  t: Translation;
  locale: string;
  companyId: string;
  companyName?: string;
  companyEmail?: string;
  orders: StoreOrder[];
}

export const Store: React.FC<StoreProps> = ({ t, locale, companyId, companyName, companyEmail, orders }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    console.log("Store: Iniciando carregamento de produtos...");
    const data = await getProducts();
    console.log("Store: Produtos recebidos de getProducts():", data);
    // Temporariamente removendo o filtro de active para garantir que apareça
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
    
    // Escutar mudanças no localStorage (útil se o MasterPanel estiver em outra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'atrios_products') {
        console.log("Store: Detectada mudança no localStorage, recarregando...");
        loadProducts();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRequestQuote = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(10); // Reset to default
    setUploadedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmQuoteRequest = async () => {
    if (!selectedProduct) return;
    
    setIsProcessing(true);
    
    const newOrder: StoreOrder = {
      id: generateShortId(),
      companyId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      notes: notes || undefined,
      uploadedImage: uploadedImage || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    console.log("Store: Enviando novo pedido:", newOrder);

    try {
      const success = await saveStoreOrder(newOrder);
      console.log("Store: Resultado do saveStoreOrder:", success);
      if (!success) {
        throw new Error("Falha na sincronização cloud");
      }
      setIsProcessing(false);
      setShowSuccess(true);
      setNotes('');
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedProduct(null);
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      setIsProcessing(false);
      alert("Erro ao enviar pedido para o servidor. Verifique sua conexão ou se as tabelas do banco de dados foram criadas.");
    }
  };

  const isTestUser = 
    companyId === 'innova' || 
    companyId?.toLowerCase().includes('innova') || 
    companyName?.toLowerCase().includes('innova') ||
    companyEmail?.toLowerCase().includes('innova') ||
    companyEmail === 'izarelleBraga@gmail.com' ||
    companyEmail === 'c@c.com';

  return (
    <div className="relative min-h-[600px]">
      {/* Overlay EM BREVE - Oculto para o usuário de teste innova */}
      {!isTestUser && (
        <div className="absolute inset-0 z-50 flex items-start justify-center p-6 pt-20 md:pt-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            className="bg-white/90 backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] text-center space-y-6 max-w-lg w-full"
          >
            <div className="w-24 h-24 bg-amber-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 rotate-3">
              <ShoppingBag size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                {t.comingSoon}<br/>
                <span className="text-amber-500">{t.store}!</span>
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                {t.comingSoonDesc}
              </p>
            </div>
            <div className="pt-4">
              <div className="h-1 w-12 bg-slate-200 mx-auto rounded-full" />
            </div>
          </motion.div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ${!isTestUser ? 'blur-2xl pointer-events-none select-none opacity-50' : ''}`}>
      
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-amber-500">
              <ShoppingBag size={24} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">{t.store}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
                {t.storeTitle}
                <button 
                  onClick={loadProducts}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                  title="Atualizar Loja"
                >
                  <Package size={24} />
                </button>
              </h1>
              
              <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-full border border-slate-100 shrink-0 self-start md:self-center">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t.companiesRequested}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-slate-500 font-medium max-w-3xl leading-relaxed">
          {t.storeSub}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{t.noProductsAvailable}</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
            {t.noProductsDesc}
          </p>
          <button 
            onClick={loadProducts}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center gap-3"
          >
            <Package size={20} />
            {t.tryAgain}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col"
            >
            <div className="relative aspect-square overflow-hidden bg-slate-50">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                  {product.category}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                <button 
                  onClick={() => handleRequestQuote(product)}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                >
                  {t.requestQuote}
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{product.category}</span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic">{product.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">4.9</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Package size={14} />
                  <span>{t.stockOk}</span>
                </div>
                <button 
                  onClick={() => handleRequestQuote(product)}
                  className="text-slate-900 hover:text-amber-500 transition-colors"
                >
                  <Info size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <div className="bg-slate-900 text-white rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/20 to-transparent pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-6">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
            {t.storeMissionTitle}
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {t.storeMissionDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        {[
          { icon: Shield, title: t.guaranteedQuality, desc: t.guaranteedQualityDesc },
          { icon: Truck, title: t.fastDelivery, desc: t.fastDeliveryDesc },
          { icon: MessageSquare, title: t.dedicatedSupport, desc: t.dedicatedSupportDesc }
        ].map((feature, i) => (
          <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
              <feature.icon size={32} />
            </div>
            <h4 className="text-lg font-black uppercase italic tracking-tight">{feature.title}</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>

              {showSuccess ? (
                <div className="space-y-6 text-center py-12">
                  <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                    <Check size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.orderSent}</h3>
                    <p className="text-slate-500 font-medium">{t.orderSentDesc} <strong>{selectedProduct.name}</strong>.</p>
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="space-y-8 text-center py-12">
                  <div className="w-24 h-24 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-amber-500/20">
                    <ShoppingBag size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.processing}</h3>
                    <p className="text-slate-500 font-medium">{t.processingDesc}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-tight">{selectedProduct.name}</h3>
                      <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-3">{selectedProduct.category}</p>
                      {selectedProduct.description && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
                            {selectedProduct.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.quantity}</label>
                      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm hover:bg-slate-900 hover:text-white transition-all"
                        >
                          <Minus size={20} />
                        </button>
                        <input 
                          type="number" 
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 bg-transparent text-center font-black text-xl outline-none"
                        />
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm hover:bg-slate-900 hover:text-white transition-all"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.uploadLogo}</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-16 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 cursor-pointer overflow-hidden relative ${uploadedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-amber-500 hover:bg-amber-50'}`}
                      >
                        {uploadedImage ? (
                          <>
                            <img src={uploadedImage} alt="Logo" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                            <Check size={20} className="text-emerald-600" />
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Logo OK</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Upload</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.observationsDescription}</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.observationsDescriptionPlaceholder}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-amber-500 transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  <button 
                    onClick={confirmQuoteRequest}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-500 transition-all shadow-2xl shadow-slate-900/20"
                  >
                    {t.requestQuote}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};
