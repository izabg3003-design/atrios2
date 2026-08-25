import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Construction
} from 'lucide-react';
import { Locale } from '../translations';
import { IntroBannerItem } from '../types';
import { getStoredIntroBanners, fetchIntroBannersFromSupabase, DEFAULT_INTRO_BANNERS } from '../services/storage';

interface FullscreenIntroBannerProps {
  onFinish: () => void;
  locale?: Locale;
}

export const FullscreenIntroBanner: React.FC<FullscreenIntroBannerProps> = ({ onFinish }) => {
  const [rawBanners, setRawBanners] = useState<IntroBannerItem[]>(() => {
    const stored = getStoredIntroBanners();
    const activeOnly = stored.filter(b => b.active !== false);
    return activeOnly.length > 0 ? activeOnly : DEFAULT_INTRO_BANNERS;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Sync with Supabase on mount
  useEffect(() => {
    fetchIntroBannersFromSupabase().then((fetched) => {
      if (fetched && Array.isArray(fetched)) {
        const activeOnly = fetched.filter(b => b.active !== false);
        if (activeOnly.length > 0) {
          setRawBanners(activeOnly);
        }
      }
    }).catch(() => {});

    const handleStorageChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        const activeOnly = e.detail.filter((b: IntroBannerItem) => b.active !== false);
        if (activeOnly.length > 0) {
          setRawBanners(activeOnly);
        }
      }
    };
    window.addEventListener('atrios_intro_banners_changed', handleStorageChange);
    return () => window.removeEventListener('atrios_intro_banners_changed', handleStorageChange);
  }, []);

  const totalSlides = rawBanners.length > 0 ? rawBanners.length : 1;
  const safeIndex = currentSlide >= totalSlides ? 0 : currentSlide;
  const slide = rawBanners[safeIndex] || DEFAULT_INTRO_BANNERS[0];
  const accentColor = slide?.accentColor || '#ff5722';

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (idx: number) => {
    setDirection(idx > safeIndex ? 1 : -1);
    setCurrentSlide(idx);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (safeIndex === totalSlides - 1) {
          onFinish();
        } else {
          nextSlide();
        }
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        onFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, totalSlides]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diffX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40; // pixels
    if (diffX > minSwipeDistance) {
      nextSlide();
    } else if (diffX < -minSwipeDistance) {
      prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Framer motion variants for smooth lateral transition
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Resolve banner image source with reliable fallback
  const getBannerImageSrc = (bannerItem: IntroBannerItem, index: number) => {
    if (bannerItem.imageUrl && bannerItem.imageUrl.trim().length > 0) {
      return bannerItem.imageUrl;
    }
    // Fallback to one of the 4 generated full-screen banners
    const fallbackBanners = [
      '/banners/banner_1.jpg',
      '/banners/banner_2.jpg',
      '/banners/banner_3.jpg',
      '/banners/banner_4.jpg'
    ];
    return fallbackBanners[index % fallbackBanners.length];
  };

  const currentImageSrc = getBannerImageSrc(slide, safeIndex);

  return (
    <div 
      ref={containerRef}
      id="fullscreen-intro-banner"
      className="fixed inset-0 z-[99999] bg-[#050811] text-white flex flex-col justify-start select-none overflow-hidden font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* TOP FLOATING HEADER BAR */}
      <header className="relative z-40 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-slate-950/90 backdrop-blur-md border-b border-white/10 shrink-0 w-full">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white flex items-center justify-center shadow-lg shrink-0 transition-colors"
            style={{ backgroundColor: accentColor, boxShadow: `0 8px 20px -4px ${accentColor}50` }}
          >
            <Construction className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                ÁTRIOS<span style={{ color: accentColor }}>BUILD</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                DESTAQUES
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              PLATAFORMA INTEGRADA DE CONSTRUÇÃO CIVIL
            </span>
          </div>
        </div>

        {/* Counter Badge & Close/Skip Button */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Slide Indicator Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-mono font-bold text-slate-300">
            <span className="font-black" style={{ color: accentColor }}>0{safeIndex + 1}</span>
            <span className="text-slate-600">/</span>
            <span>0{totalSlides}</span>
          </div>

          {/* SKIP BUTTON */}
          <button
            onClick={onFinish}
            id="btn-skip-intro-banner"
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-[#ff5722] text-white border border-white/15 hover:border-orange-500 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 group"
            title="Saltar apresentação e entrar"
          >
            <span>SALTAR</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* MAIN BANNER CONTAINER: APANHA 100% DE TODA A ÁREA DO ECRÃ ABAIXO DO CABEÇALHO */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center p-0 m-0">
        
        {/* Banner Images in Full Area */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={safeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_, info) => {
              setIsDragging(false);
              if (info.offset.x < -40) {
                nextSlide();
              } else if (info.offset.x > 40) {
                prevSlide();
              }
            }}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing bg-black"
          >
            {/* Pure Fullscreen Banner Image taking 100% of the screen */}
            <img
              src={currentImageSrc}
              alt={`Banner ${safeIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Left Arrow Navigation Button */}
        <button
          onClick={prevSlide}
          id="btn-intro-prev-slide"
          aria-label="Banner anterior"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-950/70 hover:bg-[#ff5722] text-white border border-white/20 hover:border-orange-500 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-90 group"
          title="Anterior (Seta Esquerda)"
        >
          <ChevronLeft size={30} className="group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>

        {/* Right Arrow Navigation Button */}
        <button
          onClick={nextSlide}
          id="btn-intro-next-slide"
          aria-label="Próximo banner"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-950/70 hover:bg-[#ff5722] text-white border border-white/20 hover:border-orange-500 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-90 group"
          title="Seguinte (Seta Direita)"
        >
          <ChevronRight size={30} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>

        {/* FLOATING BOTTOM CONTROLS (SEM OCUPAR ESPAÇO DO BANNER) */}
        <div className="absolute bottom-5 sm:bottom-8 left-0 right-0 z-30 flex items-center justify-center px-4 pointer-events-none">
          <div className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 shadow-2xl pointer-events-auto">
            
            {/* Dots / Pills Navigation for the 4 Banners */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {rawBanners.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Ir para banner ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    safeIndex === idx 
                      ? 'w-7 sm:w-10 h-2 sm:h-2.5 shadow-lg' 
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-600 hover:bg-slate-400'
                  }`}
                  style={{ 
                    backgroundColor: safeIndex === idx ? (s.accentColor || '#ff5722') : undefined,
                    boxShadow: safeIndex === idx ? `0 0 12px ${s.accentColor || '#ff5722'}` : undefined
                  }}
                  title={`Banner ${idx + 1}`}
                />
              ))}
            </div>

            {/* Direct Action Button */}
            <div>
              {safeIndex === totalSlides - 1 ? (
                <button
                  onClick={onFinish}
                  className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-full font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>COMEÇAR AGORA</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={nextSlide}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white/15 hover:bg-white/25 text-white rounded-full font-black text-xs uppercase tracking-wider border border-white/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>PRÓXIMO</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default FullscreenIntroBanner;
