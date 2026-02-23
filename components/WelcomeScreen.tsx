import React, { useMemo } from 'react';
import { Company } from '../types';
import { Locale, translations } from '../translations';
import { Construction } from 'lucide-react';

interface WelcomeScreenProps {
  company: Company;
  locale: Locale;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ company, locale }) => {
  const t = translations[locale];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t.greetingMorning;
    if (hour >= 12 && hour < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  }, [t]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900 overflow-hidden animate-in fade-in duration-700">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      
      <div className="relative text-center space-y-8 lg:space-y-12 animate-in zoom-in-95 duration-1000 px-6">
        {/* Logo Container */}
        <div className="flex justify-center">
          <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white p-3 lg:p-4 rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/10 ring-4 lg:ring-8 ring-white/5">
            {company.logo ? (
              <img src={company.logo} className="w-full h-full object-contain" alt="Company Logo" />
            ) : (
              <Construction className="text-amber-500 w-12 h-12 lg:w-16 lg:h-16" size={64} />
            )}
          </div>
        </div>

        {/* Text Container */}
        <div className="space-y-3 lg:space-y-4">
          <p className="text-amber-500 text-base lg:text-xl font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] animate-pulse">
            {greeting}
          </p>
          <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter italic break-words max-w-xs lg:max-w-none mx-auto">
            {company.name}
          </h2>
          <div className="h-1 w-20 lg:w-24 bg-white/20 mx-auto rounded-full mt-6 lg:mt-8 overflow-hidden">
            <div className="h-full bg-amber-500 animate-[loading-bar_3.5s_ease-in-out]" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
};

export default WelcomeScreen;