import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ArrowRight, 
  Construction,
  Monitor
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
  const [windowWidth, setWindowWidth] = useState<number>(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Monitor Window Resize for reliable desktop/mobile switching (768px+)
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 768;

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

  // Resolve banner image source with reliable fallback and desktop/mobile responsiveness
  const getBannerImageSrc = (bannerItem: IntroBannerItem, index: number, isDesktopView: boolean = false) => {
    // Se for ecrã de desktop/computador e tiver imagem dedicada para computador configurada
    if (isDesktopView && bannerItem.desktopImageUrl && bannerItem.desktopImageUrl.trim().length > 0) {
      return bannerItem.desktopImageUrl;
    }
    
    // Imagem principal configurada (mobile / geral)
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

  const mobileImageSrc = getBannerImageSrc(slide, safeIndex, false);
  const desktopImageSrc = getBannerImageSrc(slide, safeIndex, true);
  const hasDedicatedDesktopImage = Boolean(slide.desktopImageUrl && slide.desktopImageUrl.trim().length > 0);

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

      {/* MAIN BANNER CONTAINER: ÁREA DO BANNER COM ESPAÇAMENTO DE SEGURANÇA E RESPONSIVIDADE */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center p-0 m-0">
        
        {/* Banner Images in Safe Area */}
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
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing bg-slate-950 pt-1 pb-20 sm:pb-24 px-2 sm:px-4 md:px-8"
          >
            {/* CONTAINER ADAPTATIVO: Mobile / Tablet / Desktop */}
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Se o ecrã for Desktop (>= 768px) e tiver imagem dedicada de computador */}
              {isDesktop && hasDedicatedDesktopImage ? (
                <div className="w-full h-full flex items-center justify-center max-w-[1500px] mx-auto px-2 md:px-6">
                  <img
                    src={desktopImageSrc}
                    alt={`Banner Desktop ${safeIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[82vh] object-contain object-center select-none pointer-events-none rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300"
                  />
                </div>
              ) : (
                /* Versão Mobile / Tablet ou Fallback */
                <div className="w-full h-full flex items-center justify-center max-w-5xl mx-auto">
                  <img
                    src={isDesktop && hasDedicatedDesktopImage ? desktopImageSrc : mobileImageSrc}
                    alt={`Banner ${safeIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-auto h-auto max-w-full max-h-full object-contain object-center select-none pointer-events-none rounded-xl sm:rounded-2xl shadow-2xl transition-transform duration-300"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* FLOATING BOTTOM CONTROLS (POSICIONADO COM FOLGA ABAIXO DO BANNER) */}
        <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 flex items-center justify-center px-4 pointer-events-none">
          <div className="flex items-center justify-between gap-3 sm:gap-6 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-950/90 backdrop-blur-lg border border-white/20 shadow-2xl pointer-events-auto">
            
            {/* Dots / Pills Navigation for the Banners */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {rawBanners.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Ir para banner ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    safeIndex === idx 
                      ? 'w-6 sm:w-8 h-2 sm:h-2.5 shadow-lg' 
                      : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-600 hover:bg-slate-400'
                  }`}
                  style={{ 
                    backgroundColor: safeIndex === idx ? (s.accentColor || '#ff5722') : undefined,
                    boxShadow: safeIndex === idx ? `0 0 10px ${s.accentColor || '#ff5722'}` : undefined
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
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-full font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>COMEÇAR AGORA</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={nextSlide}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-white/15 hover:bg-white/25 text-white rounded-full font-black text-xs uppercase tracking-wider border border-white/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>PRÓXIMO</span>
                  <ChevronRight size={13} />
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
