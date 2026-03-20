import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Shirt, 
  Shield, 
  HardHat, 
  Glasses, 
  StickyNote, 
  Scissors, 
  Hammer, 
  Upload, 
  Check, 
  X, 
  Plus, 
  Minus,
  ShoppingBag
} from 'lucide-react';
import { Translation } from '../translations';
import { CustomOrderItem, CustomOrderRequest } from '../types';
import { generateShortId, saveCustomOrderRequest } from '../services/storage';

interface CustomOrdersProps {
  t: Translation;
  companyId: string;
}

export const CustomOrders: React.FC<CustomOrdersProps> = ({ t, companyId }) => {
  const [selectedItem, setSelectedItem] = useState<CustomOrderItem | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customItems: CustomOrderItem[] = [
    { id: 'mug', name: t.item_mug, icon: 'Coffee' },
    { id: 'tshirt', name: t.item_tshirt, icon: 'Shirt' },
    { id: 'vest', name: t.item_vest, icon: 'Shield' },
    { id: 'sweatshirt', name: t.item_sweatshirt, icon: 'Shirt' },
    { id: 'helmet', name: t.item_helmet, icon: 'HardHat' },
    { id: 'construction', name: t.item_construction, icon: 'Hammer' },
    { id: 'glasses', name: t.item_glasses, icon: 'Glasses' },
    { id: 'stickers', name: t.item_stickers, icon: 'StickyNote' },
    { id: 'tape', name: t.item_tape, icon: 'Scissors' },
    { id: 'trowel', name: t.item_trowel, icon: 'Hammer' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee size={32} />;
      case 'Shirt': return <Shirt size={32} />;
      case 'Shield': return <Shield size={32} />;
      case 'HardHat': return <HardHat size={32} />;
      case 'Glasses': return <Glasses size={32} />;
      case 'StickyNote': return <StickyNote size={32} />;
      case 'Scissors': return <Scissors size={32} />;
      case 'Hammer': return <Hammer size={32} />;
      default: return <ShoppingBag size={32} />;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem é muito grande. Limite de 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;
    
    setIsProcessing(true);
    
    const request: CustomOrderRequest = {
      id: generateShortId(),
      companyId,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity,
      description,
      imageUrl: uploadedImage || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const success = await saveCustomOrderRequest(request);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedItem(null);
          setQuantity(10);
          setDescription('');
          setUploadedImage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting custom order:", error);
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-amber-500">
          <ShoppingBag size={24} />
          <span className="text-xs font-black uppercase tracking-[0.3em]">{t.customOrders}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase">
          {t.customOrderTitle}
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl">
          Personalize os seus itens com a sua marca. Escolha o produto, carregue a sua imagem e solicite um orçamento personalizado.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {customItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedItem(item)}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-4 ${
              selectedItem?.id === item.id 
                ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-lg shadow-amber-500/10' 
                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              selectedItem?.id === item.id ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400'
            }`}>
              {getIcon(item.icon)}
            </div>
            <span className="text-xs font-black uppercase tracking-tight leading-tight">
              {item.name}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8 relative overflow-hidden"
          >
            {showSuccess ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                  <Check size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.quoteRequestSuccess}</h3>
                  <p className="text-slate-500 font-medium">O seu pedido para {selectedItem.name} foi enviado com sucesso.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      {getIcon(selectedItem.icon)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                        {selectedItem.name}
                      </h3>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                        {t.itemToPersonalize}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                        {t.quantityToQuote}
                      </label>
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                        {t.briefDescription}
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Cor preta, logo no peito esquerdo, tamanhos variados..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-amber-500 transition-all min-h-[120px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      {t.personalizationImage}
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`aspect-square rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden relative ${
                        uploadedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-amber-500 hover:bg-amber-50'
                      }`}
                    >
                      {uploadedImage ? (
                        <>
                          <img src={uploadedImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-white p-4 rounded-2xl shadow-xl">
                              <Check size={32} className="text-emerald-500" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                            <Upload size={40} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-900 uppercase italic">Clique para carregar</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PNG, JPG até 5MB</p>
                          </div>
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

                <div className="pt-8 border-t border-slate-50">
                  <button
                    disabled={isProcessing}
                    onClick={handleSubmit}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-amber-500 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ShoppingBag size={20} />
                    )}
                    {t.sendQuoteRequest}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
