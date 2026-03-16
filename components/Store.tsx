import React, { useState, useRef } from 'react';
import { ShoppingBag, Check, MessageSquare, Info, Star, Package, Shield, Truck, Plus, Minus, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translation } from '../translations';
import { saveStoreOrder, generateShortId } from '../services/storage';
import { StoreOrder } from '../types';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  description: string;
}

interface StoreProps {
  t: Translation;
  locale: string;
  companyId: string;
}

export const Store: React.FC<StoreProps> = ({ t, locale, companyId }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const products: Product[] = [
    {
      id: 'mugs',
      name: t.customMugs,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800',
      category: 'Branding',
      description: 'Canecas de cerâmica de alta qualidade com o logo da sua empresa.'
    },
    {
      id: 'tshirts',
      name: t.customTshirts,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
      category: 'Apparel',
      description: 'T-shirts 100% algodão personalizadas para a sua equipa.'
    },
    {
      id: 'vests',
      name: t.customVests,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800',
      category: 'Safety',
      description: 'Coletes refletores de alta visibilidade com personalização.'
    },
    {
      id: 'sweatshirts',
      name: t.sweatshirts,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
      category: 'Apparel',
      description: 'Sweatshirts quentes e confortáveis para trabalho no exterior.'
    },
    {
      id: 'helmets',
      name: t.safetyHelmets,
      image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&q=80&w=800',
      category: 'Safety',
      description: 'Capacetes de proteção certificados com o seu logo.'
    },
    {
      id: 'workwear',
      name: t.customWorkwear,
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
      category: 'Branding',
      description: 'Itens de obra personalizados para reforçar a sua marca.'
    },
    {
      id: 'glasses',
      name: t.safetyGlasses,
      image: 'https://images.unsplash.com/photo-1582550943397-391f021d427d?auto=format&fit=crop&q=80&w=800',
      category: 'Safety',
      description: 'Óculos de proteção resistentes e ergonómicos.'
    },
    {
      id: 'stickers',
      name: t.customStickers,
      image: 'https://images.unsplash.com/photo-1572375927902-e6090dbb90ad?auto=format&fit=crop&q=80&w=800',
      category: 'Branding',
      description: 'Adesivos vinílicos resistentes para ferramentas e veículos.'
    },
    {
      id: 'tape',
      name: t.tape,
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
      category: 'Tools',
      description: 'Fita métrica e fitas adesivas de alta resistência.'
    },
    {
      id: 'trowel',
      name: t.trowel,
      image: 'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?auto=format&fit=crop&q=80&w=800',
      category: 'Tools',
      description: 'Colher de pedreiro profissional em aço inoxidável.'
    },
    {
      id: 'gloves',
      name: t.safetyGloves,
      image: 'https://images.unsplash.com/photo-1597423498219-04418210827d?auto=format&fit=crop&q=80&w=800',
      category: 'Safety',
      description: 'Luvas de proteção resistentes para trabalhos pesados.'
    }
  ];

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

    try {
      await saveStoreOrder(newOrder);
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
      alert("Erro ao enviar pedido. Verifique sua conexão.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-amber-500">
            <ShoppingBag size={24} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">{t.store}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase">
            {t.storeTitle}
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            {t.storeSub}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
              </div>
            ))}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            +500 empresas já pediram
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic">{product.name}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">4.9</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
                {product.description}
              </p>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Package size={14} />
                  <span>Stock OK</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        {[
          { icon: Shield, title: 'Qualidade Garantida', desc: 'Materiais testados e aprovados para uso profissional.' },
          { icon: Truck, title: 'Entrega Rápida', desc: 'Enviamos para todo o país em tempo recorde.' },
          { icon: MessageSquare, title: 'Suporte Dedicado', desc: 'Dúvidas sobre personalização? Fale connosco.' }
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
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Pedido Enviado!</h3>
                    <p className="text-slate-500 font-medium">Entraremos em contacto em breve com o orçamento para <strong>{selectedProduct.name}</strong>.</p>
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="space-y-8 text-center py-12">
                  <div className="w-24 h-24 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-amber-500/20">
                    <ShoppingBag size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Processando...</h3>
                    <p className="text-slate-500 font-medium">Estamos a preparar o seu pedido de orçamento.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{selectedProduct.name}</h3>
                      <p className="text-slate-500 text-sm font-medium">{selectedProduct.category}</p>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações / Descrição</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Tamanho XL, cor azul, detalhes específicos..."
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
  );
};
