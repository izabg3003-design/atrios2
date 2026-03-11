import React, { useState } from 'react';
import { Gift, Globe, Coffee, Upload, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Company, GiftRequest } from '../types';
import { translations, Locale } from '../translations';
import { saveGiftRequest } from '../services/storage';

interface GiftRequestFormProps {
  company: Company;
  locale: Locale;
}

export const GiftRequestForm: React.FC<GiftRequestFormProps> = ({ company, locale }) => {
  const t = translations[locale];
  const [websiteIdea, setWebsiteIdea] = useState('');
  const [mugIdea, setMugIdea] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit for reference images
        alert(t.imageTooLarge || 'Image too large (max 500KB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteIdea.trim() || !mugIdea.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: GiftRequest = {
        id: crypto.randomUUID(),
        companyId: company.id,
        companyName: company.name,
        websiteIdea,
        mugIdea,
        referenceImage,
        createdAt: new Date().toISOString()
      };

      await saveGiftRequest(request);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error saving gift request:', err);
      setError('Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] p-12 text-center shadow-2xl border border-emerald-100 space-y-8 max-w-2xl mx-auto"
      >
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.giftSuccess}</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            {locale.startsWith('pt') 
              ? 'A nossa equipa entrará em contacto em breve para dar seguimento ao seu projeto.' 
              : 'Our team will contact you soon to follow up on your project.'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-amber-500 rounded-3xl text-white shadow-xl shadow-amber-500/20 mb-4">
          <Gift size={32} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
          {t.giftTitle}
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          {t.giftDesc}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-slate-100 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Website Idea */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Globe size={20} /></div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.giftWebsiteIdea}</label>
            </div>
            <textarea
              required
              value={websiteIdea}
              onChange={e => setWebsiteIdea(e.target.value)}
              placeholder={t.giftWebsitePlaceholder}
              className="w-full h-48 px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm resize-none"
            />
          </div>

          {/* Mug Idea */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Coffee size={20} /></div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.giftMugIdea}</label>
            </div>
            <textarea
              required
              value={mugIdea}
              onChange={e => setMugIdea(e.target.value)}
              placeholder={t.giftMugPlaceholder}
              className="w-full h-48 px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm resize-none"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4 pt-6 border-t border-slate-50">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.giftUploadRef}</label>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <label className="relative cursor-pointer group w-full sm:w-auto">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl group-hover:bg-slate-100 group-hover:border-slate-300 transition-all">
                <Upload size={20} className="text-slate-400" />
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{t.selectFile || 'Select File'}</span>
              </div>
            </label>
            {referenceImage && (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-lg animate-in zoom-in duration-300">
                <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setReferenceImage(undefined)}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <AlertCircle size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={20} />
              <span className="uppercase tracking-widest">{t.giftSubmit}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
