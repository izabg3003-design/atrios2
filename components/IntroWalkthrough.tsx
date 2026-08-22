import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  X,
  Check,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { AtriosLogo } from './AtriosLogo';
import { IntroBanner } from '../types';
import { getStoredIntroBanners, fetchIntroBannersFromCloud } from '../services/storage';

interface IntroWalkthroughProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const IntroWalkthrough: React.FC<IntroWalkthroughProps> = ({ onComplete, onSkip }) => {
  const [banners, setBanners] = useState<IntroBanner[]>(() => {
    const list = getStoredIntroBanners();
    const activeList = list.filter(b => b.active);
    return activeList.length > 0 ? activeList : list;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<any>(null);

  const minSwipeDistance = 45;

  // Atualizar banners em caso de evento externo e sincronizar da nuvem
  useEffect(() => {
    // Busca inicial em nuvem (Supabase)
    fetchIntroBannersFromCloud().then((cloudList) => {
      if (Array.isArray(cloudList) && cloudList.length > 0) {
        const active = cloudList.filter(b => b.active);
        setBanners(active.length > 0 ? active : cloudList);
      }
    });

    const handleBannersUpdate = () => {
      const list = getStoredIntroBanners();
      const activeList = list.filter(b => b.active);
      setBanners(activeList.length > 0 ? activeList : list);
    };

    window.addEventListener('atrios_intro_banners_changed', handleBannersUpdate);
    return () => {
      window.removeEventListener('atrios_intro_banners_changed', handleBannersUpdate);
    };
  }, []);

  const totalBanners = banners.length;
  const currentBanner = banners[currentIndex] || banners[0];
  const isFirstBanner = currentIndex === 0;
  const isLastBanner = currentIndex === totalBanners - 1;

  const nextBanner = useCallback(() => {
    if (isLastBanner) {
      onComplete();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, totalBanners - 1));
    }
  }, [isLastBanner, onComplete, totalBanners]);

  const prevBanner = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Navegação por teclado (Seta Direita / Esquerda / Barra de Espaço)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextBanner();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevBanner();
      } else if (e.key === 'Escape') {
        if (onSkip) onSkip();
        else onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextBanner, prevBanner, onSkip, onComplete]);

  // Touch Swipe Handlers para Telemóvel
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextBanner();
    } else if (isRightSwipe) {
      prevBanner();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col justify-between select-none overflow-hidden font-sans"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Graphic Ambient Glow & Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-[20%] right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header: Logo, Indicators, Skip Button */}
      <header className="relative z-20 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <AtriosLogo size={32} />
          <div className="hidden sm:block">
            <span className="text-base font-black tracking-tight text-white uppercase block leading-none">
              ÁTRIOS BUILD
            </span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mt-0.5">
              Apresentação da Plataforma
            </span>
          </div>
        </div>

        {/* Story Progress Indicators (Clickable) */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[200px] sm:max-w-md w-full px-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden bg-white/20 transition-all cursor-pointer hover:bg-white/30"
              title={`Ir para Banner ${idx + 1}`}
              aria-label={`Banner ${idx + 1}`}
            >
              <div 
                className={`h-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'bg-amber-400 w-full shadow-[0_0_10px_#f59e0b]' 
                    : idx < currentIndex 
                      ? 'bg-white/80 w-full' 
                      : 'w-0'
                }`} 
              />
            </button>
          ))}
        </div>

        {/* Skip / Close Button */}
        <button
          type="button"
          onClick={onSkip || onComplete}
          className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          title="Pular Apresentação"
        >
          <span>Pular</span>
          <X size={14} />
        </button>
      </header>

      {/* Main Content Area with Large Hero Banner Image & Overlay Description */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10 max-w-6xl mx-auto w-full">
        
        {/* Left Arrow Button for Desktop */}
        <button
          type="button"
          onClick={prevBanner}
          disabled={isFirstBanner}
          className={`hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white items-center justify-center shadow-2xl transition-all z-30 cursor-pointer active:scale-90 ${
            isFirstBanner ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
          title="Banner Anterior"
          aria-label="Banner Anterior"
        >
          <ChevronLeft size={24} className="stroke-[2.5]" />
        </button>

        {/* Right Arrow Button for Desktop */}
        <button
          type="button"
          onClick={nextBanner}
          className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white items-center justify-center shadow-2xl transition-all z-30 cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 active:scale-90"
          title={isLastBanner ? "Aceder à Plataforma" : "Próximo Banner"}
          aria-label="Próximo Banner"
        >
          {isLastBanner ? (
            <Check size={22} className="stroke-[3] text-amber-400" />
          ) : (
            <ChevronRight size={24} className="stroke-[2.5]" />
          )}
        </button>

        {/* Active Banner Visual Presentation Card */}
        <div 
          key={currentBanner.id || currentIndex}
          className="w-full h-full max-h-[75vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl shadow-black/80 relative animate-in fade-in zoom-in-95 duration-300"
        >
          {/* Main Full-Size Image Container */}
          <div className="relative w-full h-full min-h-[300px] flex-1 overflow-hidden bg-slate-950">
            <img 
              src={currentBanner.imageUrl} 
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Gradient Overlays for High-Contrast Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent pointer-events-none hidden sm:block" />

            {/* Top Badge Overlay */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
                Banner {currentIndex + 1} de {totalBanners}
              </span>
              {currentBanner.badge && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
                  {currentBanner.badge}
                </span>
              )}
            </div>

            {/* Bottom Content / Titles Box */}
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 lg:p-10 z-10 space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight max-w-4xl drop-shadow-md">
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p className="text-xs sm:text-base text-slate-200 font-medium leading-relaxed max-w-3xl drop-shadow-sm">
                  {currentBanner.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Footer with Swipe Tip & CTA */}
      <footer className="relative z-20 px-4 sm:px-8 py-3.5 sm:py-4 border-t border-white/10 bg-slate-950/90 backdrop-blur-md w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Mobile Gestures / Keyboard Hint */}
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className="sm:hidden flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
              <span>👉 Arraste para o lado para trocar de banner</span>
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400">
              Dica: Use as setas do teclado (← / →) ou barra de espaço para avançar
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 justify-end">
            {!isFirstBanner && (
              <button
                type="button"
                onClick={prevBanner}
                className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={nextBanner}
              className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
                isLastBanner
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-amber-500/25 hover:from-amber-300 hover:to-amber-500'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500'
              }`}
            >
              <span>
                {isLastBanner 
                  ? (currentBanner.ctaText || 'Acessar ÁTRIOS BUILD') 
                  : (currentBanner.ctaText || 'Próximo Banner')}
              </span>
              {isLastBanner ? (
                <ArrowRight size={16} className="stroke-[3]" />
              ) : (
                <ChevronRight size={16} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
