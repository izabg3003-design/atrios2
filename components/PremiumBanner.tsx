
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Locale, translations } from '../translations';

interface PremiumBannerProps {
  onUpgrade: () => void;
  // Added locale to props to fix TypeScript error in App.tsx
  locale: Locale;
}

const PremiumBanner: React.FC<PremiumBannerProps> = ({ onUpgrade, locale }) => {
  // Use translations based on locale
  const t = translations[locale];
  
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl lg:rounded-3xl p-5 lg:p-8 text-white shadow-lg mb-6 lg:mb-8 flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
      <div className="flex items-center gap-4 lg:gap-6 relative z-10">
        <div className="bg-white/20 p-3 lg:p-4 rounded-xl lg:rounded-2xl shrink-0">
          <Sparkles className="text-white w-6 h-6 lg:w-8 lg:h-8" size={24} />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tight italic">{t.premiumBannerTitle}</h3>
          <p className="text-white/80 text-xs lg:text-base font-medium">{t.premiumBannerDesc}</p>
        </div>
      </div>
      <button 
        onClick={onUpgrade}
        className="bg-white text-orange-600 px-6 lg:px-8 py-2.5 lg:py-4 rounded-xl lg:rounded-2xl font-black text-xs lg:text-base uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl active:scale-95 relative z-10 w-full md:w-auto"
      >
        {t.upgradeToPremium}
      </button>
    </div>
  );
};

export default PremiumBanner;
