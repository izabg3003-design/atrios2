
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
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-full">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">{t.premiumBannerTitle}</h3>
          <p className="text-white/80">{t.premiumBannerDesc}</p>
        </div>
      </div>
      <button 
        onClick={onUpgrade}
        className="bg-white text-orange-600 px-6 py-2.5 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-sm"
      >
        {t.upgradeToPremium}
      </button>
    </div>
  );
};

export default PremiumBanner;
