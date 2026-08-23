import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Construction, 
  FileText, 
  HardHat, 
  Smartphone, 
  Users, 
  Sparkles, 
  CreditCard, 
  BarChart3, 
  Send, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Image as ImageIcon
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
  const [isDragging, setIsDragging] = useState(false);
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

  const totalSlides = rawBanners.length;
  const safeIndex = currentSlide >= totalSlides ? 0 : currentSlide;
  const slide = rawBanners[safeIndex] || DEFAULT_INTRO_BANNERS[0];
  const accentColor = slide.accentColor || '#ff5722';

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
        nextSlide();
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
    const minSwipeDistance = 45; // pixels
    if (diffX > minSwipeDistance) {
      // Swiped left -> next
      nextSlide();
    } else if (diffX < -minSwipeDistance) {
      // Swiped right -> prev
      prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Framer motion variants for smooth lateral transition
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 30 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Helper icon selector based on tag/title
  const getBannerIcon = (tagStr: string = '', titleStr: string = '') => {
    const text = (tagStr + ' ' + titleStr).toLowerCase();
    if (text.includes('orçamento') || text.includes('proposta')) return FileText;
    if (text.includes('cliente') || text.includes('oportunidade') || text.includes('negócio')) return Users;
    if (text.includes('obra') || text.includes('construção') || text.includes('gestão')) return HardHat;
    if (text.includes('finança') || text.includes('pagamento') || text.includes('lucro')) return CreditCard;
    if (text.includes('mobile') || text.includes('cloud') || text.includes('app')) return Smartphone;
    return Sparkles;
  };

  const IconComponent = getBannerIcon(slide.tag, slide.title);

  return (
    <div 
      ref={containerRef}
      id="fullscreen-intro-banner"
      className="fixed inset-0 z-[99999] bg-[#070c18] text-white flex flex-col justify-between select-none overflow-hidden font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience / Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* TOP BAR: Brand Logo, Slide Counter & SKIP Button */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-lg shrink-0 transition-colors"
            style={{ backgroundColor: accentColor, boxShadow: `0 10px 25px -5px ${accentColor}40` }}
          >
            <Construction className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                ÁTRIOS<span style={{ color: accentColor }}>BUILD</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                APRESENTAÇÃO
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              TOUR DE FUNCIONALIDADES
            </span>
          </div>
        </div>

        {/* Slide Counter & Skip Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Slide Indicator Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono font-bold text-slate-300">
            <span className="font-black" style={{ color: accentColor }}>0{safeIndex + 1}</span>
            <span className="text-slate-600">/</span>
            <span>0{totalSlides}</span>
          </div>

          {/* SKIP BUTTON */}
          <button
            onClick={onFinish}
            id="btn-skip-intro-banner"
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-[#ff5722] text-white hover:text-white border border-white/15 hover:border-orange-500 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 group"
            title="Saltar apresentação e ir para a página inicial"
          >
            <span>SALTAR</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* MAIN CAROUSEL AREA */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-14 py-4 sm:py-8 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Left Arrow Navigation Button (Desktop & Mobile) */}
        <button
          onClick={prevSlide}
          id="btn-intro-prev-slide"
          aria-label="Banner anterior"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/80 hover:bg-[#ff5722] text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-90 group"
          title="Anterior (Seta Esquerda)"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>

        {/* Right Arrow Navigation Button (Desktop & Mobile) */}
        <button
          onClick={nextSlide}
          id="btn-intro-next-slide"
          aria-label="Próximo banner"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/80 hover:bg-[#ff5722] text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-90 group"
          title="Seguinte (Seta Direita)"
        >
          <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>

        {/* Animated Slide Content */}
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-12">
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
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center cursor-grab active:cursor-grabbing"
            >
              
              {/* Left Column: Text & Bullets */}
              <div className="lg:col-span-6 text-left space-y-4 sm:space-y-5">
                
                {/* Category Tag Pill */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${slide.tagColor || 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                    <Sparkles size={13} />
                    <span>{slide.tag}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-bold hidden sm:inline">
                    • Deslize para navegar
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-white leading-[1.15]">
                  {slide.title}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                  {slide.description || slide.subtitle}
                </p>

                {/* Key Benefits List */}
                {slide.highlights && slide.highlights.length > 0 && (
                  <ul className="space-y-2.5 pt-1">
                    {slide.highlights.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-200">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                        >
                          <CheckCircle2 size={14} strokeWidth={3} />
                        </div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Quick Action inside slide */}
                <div className="pt-3 flex items-center gap-3">
                  {safeIndex === totalSlides - 1 ? (
                    <button
                      onClick={onFinish}
                      className="px-6 py-3.5 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      style={{ backgroundColor: accentColor, boxShadow: `0 10px 25px -5px ${accentColor}50` }}
                    >
                      <span>EXPLORAR PLATAFORMA</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={nextSlide}
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border border-white/15 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>VER PRÓXIMA FUNÇÃO</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>

              </div>

              {/* Right Column: Custom Uploaded Image OR Visual Mockup Card */}
              <div className="lg:col-span-6">
                {slide.imageUrl ? (
                  /* Custom Uploaded Image Display */
                  <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group">
                    
                    {/* Decorative glow */}
                    <div 
                      className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
                      style={{ backgroundColor: accentColor }}
                    />

                    <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-slate-900">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    </div>

                    {/* Bottom overlay badge */}
                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md border-t border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                        >
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            {slide.mockupBadge || slide.tag}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-white leading-tight truncate max-w-[260px]">
                            {slide.mockupHeadline || slide.title}
                          </h4>
                        </div>
                      </div>

                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Disponível
                      </span>
                    </div>

                  </div>
                ) : (
                  /* Standard Interactive Mockup Card */
                  <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-left overflow-hidden">
                    
                    {/* Decorative corner glow */}
                    <div 
                      className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none"
                      style={{ backgroundColor: accentColor }}
                    />

                    {/* Header of Mockup */}
                    <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                          style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            {slide.mockupBadge || 'DESTAQUE EXCLUSIVO'}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                            {slide.mockupHeadline || slide.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid in Mockup */}
                    <div className="space-y-2.5">
                      {(slide.mockupDetails && slide.mockupDetails.length > 0 ? slide.mockupDetails : [
                        { label: 'Status', value: '100% Funcional e Ativo', color: 'text-emerald-400' },
                        { label: 'Plataforma', value: 'Web & Mobile PWA' },
                        { label: 'Acesso', value: 'Instantâneo em Nuvem', color: 'text-orange-400' }
                      ]).map((item, dIdx) => (
                        <div 
                          key={dIdx} 
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-400">
                            {item.label}
                          </span>
                          <span className={`text-xs sm:text-sm font-black ${item.color || 'text-white'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Mockup footer interactive bar */}
                    <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Módulo 100% Funcional
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        Átrios Build Core v3.0
                      </span>
                    </div>

                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* BOTTOM CONTROL BAR: Dots Pagination, Navigation & Action CTA */}
      <footer className="relative z-20 px-4 sm:px-8 py-4 sm:py-6 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Mobile Swipe Instructions */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="hidden sm:inline">Use as setas ou deslize no ecrã para navegar</span>
            <span className="sm:hidden">👈 Arraste para o lado ou use as setas 👉</span>
          </div>

          {/* Dots / Pills Indicator */}
          <div className="flex items-center gap-2">
            {rawBanners.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Ir para banner ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  safeIndex === idx 
                    ? 'w-8 sm:w-10 h-2.5 shadow-md' 
                    : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
                style={{ 
                  backgroundColor: safeIndex === idx ? (s.accentColor || '#ff5722') : undefined,
                  boxShadow: safeIndex === idx ? `0 4px 14px 0 ${s.accentColor || '#ff5722'}80` : undefined
                }}
                title={`Banner ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          {/* Bottom Direct CTA: Ir para a Landing Page */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onFinish}
              className="px-5 py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>IR PARA A LANDING PAGE</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default FullscreenIntroBanner;
