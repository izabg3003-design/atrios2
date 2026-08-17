import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Construction, 
  ArrowRight, 
  Check, 
  X, 
  Play, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  CreditCard, 
  Smartphone, 
  Globe, 
  Coins, 
  Star, 
  Zap, 
  Paintbrush, 
  Wrench, 
  Hammer, 
  Home, 
  Plus, 
  Download, 
  CheckCircle2, 
  Facebook, 
  Twitter, 
  Mail,
  Youtube,
  Film,
  Menu,
  LogIn
} from 'lucide-react';
import { Translation, Locale } from '../translations';
import { CurrencyCode, CURRENCIES, HeroVideoConfig, ActionVideoConfig } from '../types';
import { landingTranslations } from './landingTranslations';
import { getStoredHeroVideoConfig, getStoredActionVideoConfig, extractYouTubeId } from '../services/storage';

// Direct asset imports to guarantee bundling across all deployment platforms and subdomains
import imgContractors from '../src/assets/images/icon_contractors_3d_1786791815873.jpg';
import imgMasons from '../src/assets/images/icon_masons_3d_1786791826121.jpg';
import imgPainters from '../src/assets/images/icon_painters_3d_1786791837702.jpg';
import imgElectricians from '../src/assets/images/icon_electricians_3d_1786791848583.jpg';
import imgPlumbers from '../src/assets/images/icon_plumbers_3d_1786791859722.jpg';
import imgRemodelers from '../src/assets/images/icon_remodelers_3d_1786791870778.jpg';
import imgDevicesMockup from '../src/assets/images/atrios_devices_mockup_1786792141168.jpg';

interface LandingPageProps {
  t: Translation;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currencyCode: CurrencyCode;
  setCurrencyCode: (currency: CurrencyCode) => void;
  onStartFree: () => void;
  onLogin: () => void;
  onDownloadApp: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  t,
  locale,
  setLocale,
  currencyCode,
  setCurrencyCode,
  onStartFree,
  onLogin,
  onDownloadApp,
  onOpenLegal
}) => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HeroVideoConfig>(getStoredHeroVideoConfig);
  const [actionVideo, setActionVideo] = useState<ActionVideoConfig>(getStoredActionVideoConfig);
  const [demoModalMode, setDemoModalMode] = useState<'interactive' | 'video'>('interactive');

  // Get landing translations for the active locale (fallback to pt-PT)
  const lt = landingTranslations[locale] || landingTranslations['pt-PT'];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for Hero Video settings changes in real-time
  useEffect(() => {
    const updateHeroVideo = () => {
      setHeroVideo(getStoredHeroVideoConfig());
    };

    const handleCustomEvent = (e: any) => {
      if (e.detail) {
        setHeroVideo(e.detail);
      } else {
        updateHeroVideo();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'atrios_hero_video_config') {
        updateHeroVideo();
      }
    };

    window.addEventListener('atrios_hero_video_changed', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('atrios_hero_video_changed', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Listen for Action Video settings changes in real-time
  useEffect(() => {
    const updateActionVideo = () => {
      setActionVideo(getStoredActionVideoConfig());
    };

    const handleCustomEvent = (e: any) => {
      if (e.detail) {
        setActionVideo(e.detail);
      } else {
        updateActionVideo();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'atrios_action_video_config') {
        updateActionVideo();
      }
    };

    window.addEventListener('atrios_action_video_changed', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('atrios_action_video_changed', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Auto advance demo modal if open
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showDemoModal) {
      timer = setInterval(() => {
        setDemoStep(prev => (prev + 1) % 4);
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [showDemoModal]);

  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '€';
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const professions = [
    { 
      name: lt.whoFor.professions.contractors, 
      image: imgContractors || '/professions/contractors.jpg', 
      icon: Hammer, 
      color: 'bg-amber-100 text-amber-600 border-amber-200' 
    },
    { 
      name: lt.whoFor.professions.masons, 
      image: imgMasons || '/professions/masons.jpg', 
      icon: Construction, 
      color: 'bg-orange-100 text-orange-600 border-orange-200' 
    },
    { 
      name: lt.whoFor.professions.painters, 
      image: imgPainters || '/professions/painters.jpg', 
      icon: Paintbrush, 
      color: 'bg-blue-100 text-blue-600 border-blue-200' 
    },
    { 
      name: lt.whoFor.professions.electricians, 
      image: imgElectricians || '/professions/electricians.jpg', 
      icon: Zap, 
      color: 'bg-yellow-100 text-yellow-600 border-yellow-200' 
    },
    { 
      name: lt.whoFor.professions.plumbers, 
      image: imgPlumbers || '/professions/plumbers.jpg', 
      icon: Wrench, 
      color: 'bg-cyan-100 text-cyan-600 border-cyan-200' 
    },
    { 
      name: lt.whoFor.professions.remodelers, 
      image: imgRemodelers || '/professions/remodelers.jpg', 
      icon: Home, 
      color: 'bg-emerald-100 text-emerald-600 border-emerald-200' 
    },
    { 
      name: lt.whoFor.professions.more, 
      image: null, 
      icon: Plus, 
      color: 'bg-slate-100 text-slate-700 border-slate-200' 
    }
  ];

  const testimonials = lt.testimonialsSection.items;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* 1. TOP NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-1.5 sm:py-3' : 'bg-white/90 backdrop-blur-sm py-2 sm:py-5'}`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1 sm:gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-1 sm:gap-2.5 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-amber-500 p-1 sm:p-2 rounded-lg sm:rounded-xl text-white shadow-md shadow-amber-500/20 shrink-0">
                <Construction className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-2xl font-black tracking-tight italic text-slate-900 leading-none">
                  ÁTRIOS<span className="text-amber-500">BUILD</span>
                </span>
                <span className="hidden sm:block text-[8px] font-black uppercase tracking-widest text-slate-400">Software Pro</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-600">
              <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-amber-600 transition-colors">
                {lt.nav.features}
              </button>
              <button onClick={() => scrollToSection('como-funciona')} className="hover:text-amber-600 transition-colors">
                {lt.nav.howItWorks}
              </button>
              <button onClick={() => scrollToSection('para-quem-e')} className="hover:text-amber-600 transition-colors">
                {lt.nav.whoIsItFor}
              </button>
              <button onClick={() => scrollToSection('pdf-profissional')} className="hover:text-amber-600 transition-colors">
                {lt.nav.pdfEstimates}
              </button>
              <button onClick={() => scrollToSection('depoimentos')} className="hover:text-amber-600 transition-colors">
                {lt.nav.testimonials}
              </button>
            </nav>

            {/* Language & Currency Selectors + Auth Buttons */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 max-w-full">
              
              {/* Selectors Pill - On mobile only show language or compact dropdowns */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100/90 border border-slate-200/80 rounded-lg sm:rounded-xl px-1 sm:px-2 py-0.5 sm:py-1 shadow-inner">
                {/* Currency - hidden on very small mobile to give room, visible in tablet/desktop and in mobile dropdown drawer */}
                <div className="hidden xs:flex items-center gap-0.5">
                  <Coins size={10} className="text-amber-600 shrink-0" />
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
                    className="bg-transparent text-[8px] sm:text-xs font-black text-slate-800 outline-none cursor-pointer pr-0.5"
                    title={t.currencyLabel}
                  >
                    {Object.values(CURRENCIES).map(curr => (
                      <option key={curr.code} value={curr.code} className="text-slate-900 font-bold">
                        {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden xs:block w-[1px] h-3 bg-slate-300 mx-0.5 shrink-0" />

                {/* Language */}
                <div className="flex items-center gap-0.5">
                  <Globe size={10} className="text-amber-600 shrink-0" />
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="bg-transparent text-[8px] sm:text-xs font-black text-slate-800 outline-none cursor-pointer max-w-[42px] xs:max-w-none"
                    title="Idioma / Language"
                  >
                    <option value="pt-PT" className="text-slate-900 font-bold">🇵🇹 PT</option>
                    <option value="pt-BR" className="text-slate-900 font-bold">🇧🇷 BR</option>
                    <option value="en-US" className="text-slate-900 font-bold">🇺🇸 EN</option>
                    <option value="es-ES" className="text-slate-900 font-bold">🇪🇸 ES</option>
                    <option value="fr-FR" className="text-slate-900 font-bold">🇫🇷 FR</option>
                    <option value="it-IT" className="text-slate-900 font-bold">🇮🇹 IT</option>
                    <option value="ru-RU" className="text-slate-900 font-bold">🇷🇺 RU</option>
                    <option value="hi-IN" className="text-slate-900 font-bold">🇮🇳 HI</option>
                    <option value="bn-BD" className="text-slate-900 font-bold">🇧🇩 BN</option>
                  </select>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={onLogin}
                className="px-1 sm:px-3 py-1 sm:py-2 text-[9px] sm:text-xs font-black uppercase tracking-wider text-slate-700 hover:text-slate-950 transition-colors shrink-0"
              >
                {lt.nav.login || t.loginBtn}
              </button>

              {/* Start Free CTA */}
              <button
                onClick={onStartFree}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <span className="hidden sm:inline">{lt.nav.startFree}</span>
                <span className="sm:hidden">Grátis</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors shrink-0 ml-0.5"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/98 backdrop-blur-md border-b border-slate-200 px-4 py-4 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col gap-2.5 text-xs font-bold text-slate-700">
                <button
                  onClick={() => { scrollToSection('funcionalidades'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors font-black uppercase"
                >
                  {lt.nav.features}
                </button>
                <button
                  onClick={() => { scrollToSection('como-funciona'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors font-black uppercase"
                >
                  {lt.nav.howItWorks}
                </button>
                <button
                  onClick={() => { scrollToSection('para-quem-e'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors font-black uppercase"
                >
                  {lt.nav.whoIsItFor}
                </button>
                <button
                  onClick={() => { scrollToSection('pdf-profissional'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors font-black uppercase"
                >
                  {lt.nav.pdfEstimates}
                </button>
                <button
                  onClick={() => { scrollToSection('depoimentos'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors font-black uppercase"
                >
                  {lt.nav.testimonials}
                </button>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider text-center"
                  >
                    {lt.nav.login || t.loginBtn}
                  </button>
                  <button
                    onClick={() => { onStartFree(); setMobileMenuOpen(false); }}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-md text-center"
                  >
                    {lt.nav.startFree}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-6 text-left">
              
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {lt.hero.badge}
              </div>

              {/* H1 Main Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.08]">
                {lt.hero.titlePrefix}
                <span className="text-amber-500">{lt.hero.titleHighlight}</span>
              </h1>

              {/* Subtitle description */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-medium mb-8 leading-relaxed">
                {lt.hero.subtitle}
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
                <button
                  onClick={onStartFree}
                  className="px-6 sm:px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-3 text-center"
                >
                  <span>{lt.hero.ctaPrimary}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => setShowDemoModal(true)}
                  className="px-5 sm:px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play size={16} className="text-amber-500 fill-amber-500" />
                  <span>{lt.hero.ctaSecondary}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block">{lt.hero.badgeFree}</span>
                    <span className="text-slate-500">{lt.hero.badgeFreeSub}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Zap size={12} />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block">{lt.hero.badgeFast}</span>
                    <span className="text-slate-500">{lt.hero.badgeFastSub}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Smartphone size={12} />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-slate-900 block">{lt.hero.badgeAnywhere}</span>
                    <span className="text-slate-500">{lt.hero.badgeAnywhereSub}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Realistic Estimate Mockup Device OR Dynamic Video Player */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-xl">
                
                {/* Main Laptop Frame */}
                <div className="bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-2xl shadow-slate-900/30 border-4 border-slate-800 overflow-hidden">
                  
                  {/* Laptop Screen Bar */}
                  <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {heroVideo.type === 'youtube' && (heroVideo.youtubeId || extractYouTubeId(heroVideo.youtubeUrl || '')) 
                        ? `youtube.com • ${heroVideo.title || 'Vídeo Oficial'}`
                        : heroVideo.type === 'upload' && heroVideo.videoUrl
                          ? `video.atriosbuild.com • ${heroVideo.title || 'Vídeo Demonstrativo'}`
                          : 'app.atriosbuild.com'}
                    </span>
                    <div className="w-8" />
                  </div>

                  {/* YouTube Embed Player */}
                  {heroVideo.type === 'youtube' && (heroVideo.youtubeId || extractYouTubeId(heroVideo.youtubeUrl || '')) ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-white/10">
                      <iframe
                        className="w-full h-full border-0"
                        src={`https://www.youtube.com/embed/${heroVideo.youtubeId || extractYouTubeId(heroVideo.youtubeUrl || '')}?autoplay=${heroVideo.autoPlay ? 1 : 0}&mute=${heroVideo.muted ? 1 : 0}&loop=${heroVideo.loop ? 1 : 0}&playlist=${heroVideo.youtubeId || extractYouTubeId(heroVideo.youtubeUrl || '')}&controls=${heroVideo.showControls ? 1 : 0}&rel=0&modestbranding=1`}
                        title={heroVideo.title || "Demonstração Átrios Build"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : heroVideo.type === 'upload' && heroVideo.videoUrl ? (
                    /* Local Uploaded Video Player */
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-white/10">
                      <video
                        className="w-full h-full object-cover"
                        src={heroVideo.videoUrl}
                        autoPlay={heroVideo.autoPlay}
                        muted={heroVideo.muted}
                        loop={heroVideo.loop}
                        controls={heroVideo.showControls}
                        playsInline
                      />
                    </div>
                  ) : (
                    /* Default Inside Screen Content - Realistic Estimate Builder */
                    <div className="bg-white rounded-2xl p-4 sm:p-6 text-left shadow-inner">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black tracking-tight text-slate-900 uppercase">{lt.preview.estimateTitle}</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-black uppercase">{lt.preview.statusPending}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-700">{lt.preview.clientLabel}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{lt.preview.projectLabel}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{lt.preview.totalGeneral}</span>
                          <p className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">6.840,00 {currencySymbol}</p>
                        </div>
                      </div>

                      {/* Materials Table Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{lt.preview.materialsTitle}</span>
                          <span className="text-[10px] font-bold text-slate-600">{lt.preview.materialsCount}</span>
                        </div>
                        <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{lt.preview.material1}</span>
                            <span>810,00 {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-medium text-slate-600">
                            <span>{lt.preview.material2}</span>
                            <span>65,00 {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-medium text-slate-600">
                            <span>{lt.preview.material3}</span>
                            <span>41,00 {currencySymbol}</span>
                          </div>
                        </div>
                      </div>

                      {/* Labor Table Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{lt.preview.laborTitle}</span>
                          <span className="text-[10px] font-bold text-slate-600">{lt.preview.laborCount}</span>
                        </div>
                        <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{lt.preview.labor1}</span>
                            <span>1.000,00 {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-medium text-slate-600">
                            <span>{lt.preview.labor2}</span>
                            <span>360,00 {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-medium text-slate-600">
                            <span>{lt.preview.labor3}</span>
                            <span>300,00 {currencySymbol}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">{lt.preview.taxIncluded}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={onStartFree}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-800"
                          >
                            <FileText size={12} className="text-amber-400" />
                            <span>{lt.preview.generatePdf}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Floating Real PDF Card Overlay or Floating Video Badge */}
                {heroVideo.type === 'default' || (!heroVideo.youtubeId && !heroVideo.videoUrl) ? (
                  <div className="absolute -bottom-8 -right-4 sm:-right-8 bg-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-2 max-w-[200px] sm:max-w-[230px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-amber-500 p-1 rounded-md text-white">
                          <Construction size={12} />
                        </div>
                        <span className="text-[10px] font-black tracking-tight text-slate-900">{lt.preview.pdfCardTitle}</span>
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">{lt.preview.pdfCardReady}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                        <span>Total:</span>
                        <span className="text-slate-900 font-black">6.840,00 {currencySymbol}</span>
                      </div>
                      <p className="text-[8px] text-slate-400">{lt.preview.pdfCardSub}</p>
                    </div>
                    <button
                      onClick={onStartFree}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Download size={11} />
                      <span>{lt.preview.downloadPdf}</span>
                    </button>
                  </div>
                ) : (
                  <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                      {heroVideo.type === 'youtube' ? <Youtube size={20} /> : <Film size={20} />}
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-black uppercase text-amber-400 block tracking-wider">
                        {heroVideo.type === 'youtube' ? 'Vídeo no YouTube' : 'Vídeo Demonstrativo'}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold line-clamp-1">
                        {heroVideo.title || 'Átrios Build em Ação'}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SECTION "FEITO PARA QUEM VIVE DE OBRAS" */}
      <section id="para-quem-e" className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">
            {lt.whoFor.title}
          </h2>
          <p className="text-slate-600 font-medium text-sm sm:text-base max-w-2xl mx-auto mb-12">
            {lt.whoFor.subtitle}
          </p>

          {/* Cards of Professions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 items-stretch">
            {professions.map((prof, i) => {
              const Icon = prof.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between text-center group cursor-pointer"
                  onClick={onStartFree}
                >
                  <div className="w-full flex items-center justify-center pt-1 pb-2">
                    {prof.image && !failedImages[prof.name] ? (
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-amber-50/40 p-1 border border-slate-100/80 shadow-inner group-hover:shadow-md transition-all duration-300">
                        <img 
                          src={prof.image} 
                          alt={prof.name}
                          referrerPolicy="no-referrer"
                          onError={() => setFailedImages(prev => ({ ...prev, [prof.name]: true }))}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-108 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center border ${prof.color} group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-all duration-300 shadow-sm`}>
                        <Icon size={28} className="transition-transform group-hover:rotate-90 duration-300" />
                        <span className="text-[10px] font-black uppercase mt-1 tracking-wider opacity-80">
                          {prof.image ? prof.name.substring(0, 4) : 'Mais'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-tight group-hover:text-amber-600 transition-colors mt-1 pb-1">
                    {prof.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-4 sm:p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-slate-700 font-bold">
              {lt.whoFor.highlightBox}
            </p>
          </div>

        </div>
      </section>

      {/* 4. SECTION "ANTES / DEPOIS" (COMPARISON) */}
      <section id="funcionalidades" className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-0 items-stretch relative">
            
            {/* Bloco da Esquerda (Vermelho / Rosa Suave) */}
            <div className="lg:col-span-5 bg-[#fff2f2] rounded-3xl lg:rounded-l-3xl lg:rounded-r-none p-6 sm:p-8 lg:p-10 text-left flex flex-col justify-center border border-rose-100 lg:border-r-0 shadow-sm">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 sm:mb-8 tracking-tight">
                {lt.comparison.beforeTitle}
              </h3>
              <ul className="space-y-4 sm:space-y-5">
                {lt.comparison.beforeItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3.5 text-slate-900 font-bold text-sm sm:text-base">
                    <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#ef4444] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <X size={12} strokeWidth={3.5} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Círculo Central com Seta (Sobreposto na divisão entre os blocos) */}
            <div className="hidden lg:flex absolute left-[41.666667%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/30 items-center justify-center pointer-events-none">
              <ArrowRight size={22} strokeWidth={3} />
            </div>

            {/* Seta no Mobile entre os cards */}
            <div className="lg:hidden flex items-center justify-center py-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex items-center justify-center">
                <ArrowRight size={18} strokeWidth={3} className="rotate-90" />
              </div>
            </div>

            {/* Bloco da Direita (Verde Suave / Com o ÁtriosBuild é diferente) */}
            <div className="lg:col-span-7 bg-[#edf7ed] rounded-3xl lg:rounded-r-3xl lg:rounded-l-none p-6 sm:p-8 lg:p-10 text-left flex flex-col justify-center border border-emerald-100 lg:border-l-0 shadow-sm relative">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0f5132] mb-6 sm:mb-8 tracking-tight">
                {lt.comparison.afterTitle}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Lista de Benefícios (Esquerda) */}
                <div className="md:col-span-6 lg:col-span-7">
                  <ul className="space-y-4 sm:space-y-5">
                    {lt.comparison.afterItems.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3.5 text-slate-900 font-bold text-sm sm:text-base">
                        <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Check size={12} strokeWidth={3.5} />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mockup dos Dispositivos (Laptop + Telemóvel) */}
                <div className="md:col-span-6 lg:col-span-5 flex items-center justify-center">
                  <div className="w-full relative group">
                    <img 
                      src={imgDevicesMockup || "/mockups/atrios_devices_mockup.jpg"} 
                      alt="ÁtriosBuild no Computador e no Telemóvel"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SECTION "DO ORÇAMENTO AO PAGAMENTO, TUDO NUM SÓ LUGAR" (4 STEPS) */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">
            {lt.workflow.title}
          </h2>
          <p className="text-slate-600 font-medium text-sm sm:text-base max-w-2xl mx-auto mb-16">
            {lt.workflow.subtitle}
          </p>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-start text-left relative group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 font-black text-lg">
                <ClipboardList size={24} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{lt.workflow.step1Title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {lt.workflow.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-start text-left relative group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 font-black text-lg">
                <FileText size={24} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center">2</span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{lt.workflow.step2Title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {lt.workflow.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-start text-left relative group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 font-black text-lg">
                <Construction size={24} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center">3</span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{lt.workflow.step3Title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {lt.workflow.step3Desc}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-start text-left relative group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 font-black text-lg">
                <CreditCard size={24} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">4</span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{lt.workflow.step4Title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {lt.workflow.step4Desc}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. SECTION "VEJA EM AÇÃO EM 60 SEGUNDOS" */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Dynamic Video Player (YouTube / Upload) or Interactive Preview */}
            <div className="lg:col-span-7">
              {actionVideo.type === 'youtube' && (actionVideo.youtubeId || extractYouTubeId(actionVideo.youtubeUrl || '')) ? (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 aspect-[16/10] bg-slate-950">
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${actionVideo.youtubeId || extractYouTubeId(actionVideo.youtubeUrl || '')}?autoplay=${actionVideo.autoPlay ? 1 : 0}&mute=${actionVideo.muted ? 1 : 0}&loop=${actionVideo.loop ? 1 : 0}&playlist=${actionVideo.youtubeId || extractYouTubeId(actionVideo.youtubeUrl || '')}&controls=${actionVideo.showControls !== false ? 1 : 0}&rel=0&modestbranding=1`}
                    title={actionVideo.title || lt.videoSection.title || "Veja como funciona em 60 segundos"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : actionVideo.type === 'upload' && actionVideo.videoUrl ? (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 aspect-[16/10] bg-slate-950">
                  <video
                    className="w-full h-full object-cover"
                    src={actionVideo.videoUrl}
                    autoPlay={actionVideo.autoPlay}
                    muted={actionVideo.muted}
                    loop={actionVideo.loop}
                    controls={actionVideo.showControls !== false}
                    playsInline
                  />
                </div>
              ) : (
                <div 
                  onClick={() => setShowDemoModal(true)}
                  className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 group cursor-pointer bg-slate-900"
                >
                  {/* Simulated Video Preview Frame */}
                  <div className="aspect-[16/10] bg-slate-900 relative flex items-center justify-center p-6 text-left">
                    
                    {/* Subtle Screen Content in background */}
                    <div className="absolute inset-0 opacity-40 blur-[1px] group-hover:scale-105 transition-transform duration-700 p-6">
                      <div className="h-full w-full bg-white rounded-2xl p-6 text-slate-900 space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-black text-sm">{lt.preview.estimateTitle}</span>
                          <span className="font-black text-amber-600 text-sm">6.840,00 {currencySymbol}</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="h-4 bg-slate-100 rounded w-3/4" />
                          <div className="h-4 bg-slate-100 rounded w-1/2" />
                          <div className="h-4 bg-slate-100 rounded w-2/3" />
                        </div>
                      </div>
                    </div>

                    {/* Dark Overlay with Pulsing Play Button */}
                    <div className="absolute inset-0 bg-slate-950/50 flex flex-col items-center justify-center text-center p-6 z-10">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform active:scale-95">
                        <Play size={36} className="fill-slate-950 ml-1.5" />
                      </div>
                      <p className="text-white font-black text-base sm:text-lg mt-4 tracking-tight">
                        {lt.videoSection.overlayTitle}
                      </p>
                      <span className="text-slate-300 text-xs mt-1 font-medium">
                        {lt.videoSection.overlaySub}
                      </span>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Copy & CTA */}
            <div className="lg:col-span-5 text-left">
              <span className="text-amber-600 font-black text-xs uppercase tracking-[0.25em] block mb-3">
                {lt.videoSection.eyebrow}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                {lt.videoSection.title}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium mb-8 leading-relaxed">
                {lt.videoSection.desc}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="px-8 py-4.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 active:scale-95 flex items-center gap-3"
                >
                  <span>{lt.videoSection.ctaBtn}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. SECTION "APRESENTE-SE COMO UM PROFISSIONAL" (PDF EM DESTAQUE) */}
      <section id="pdf-profissional" className="py-20 sm:py-32 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: PDF Values & Bullets */}
            <div className="lg:col-span-6 text-left">
              <span className="text-amber-600 font-black text-xs uppercase tracking-[0.25em] block mb-3">
                {lt.pdfSection.eyebrow}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                {lt.pdfSection.titlePrefix}
                <span className="text-amber-500">{lt.pdfSection.titleHighlight}</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium mb-8 leading-relaxed">
                {lt.pdfSection.desc}
              </p>

              <div className="space-y-4 mb-8">
                {lt.pdfSection.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 mt-0.5 shadow-sm">
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">{bullet.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{bullet.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onStartFree}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 flex items-center gap-3"
              >
                <span>{lt.pdfSection.ctaBtn}</span>
                <ArrowRight size={16} className="text-amber-400" />
              </button>
            </div>

            {/* Right Column: Realistic Full-Sized Printable PDF Sheet Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-300/60 border border-slate-200 text-left relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
                
                {/* PDF Header with Company & Number */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md">
                      <Construction size={22} />
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 tracking-tight block">{lt.pdfSection.docHeader}</span>
                      <span className="text-[9px] font-bold text-slate-400">{lt.pdfSection.docTaxId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">{lt.pdfSection.docProposalNo}</span>
                    <span className="text-sm font-black text-slate-900">#2026-084</span>
                  </div>
                </div>

                {/* Client Info Grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-400 uppercase block text-[8px]">{lt.pdfSection.docClientTitle}</span>
                    <span className="font-black text-slate-800 text-xs">{lt.pdfSection.docClientName}</span>
                    <span className="text-slate-500 block">{lt.pdfSection.docClientAddress}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-400 uppercase block text-[8px]">{lt.pdfSection.docDateTitle}</span>
                    <span className="font-bold text-slate-800">15/08/2026</span>
                    <span className="text-amber-600 block font-bold">{lt.pdfSection.docValidity}</span>
                  </div>
                </div>

                {/* PDF Items Detailed Table */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 pb-1 border-b border-slate-200">
                    <span>{lt.pdfSection.docColDesc}</span>
                    <span>{lt.pdfSection.docColQty}</span>
                    <span className="text-right">{lt.pdfSection.docColTotal}</span>
                  </div>
                  
                  <div className="flex justify-between text-[11px] font-bold text-slate-800 py-1 border-b border-slate-100">
                    <div>
                      <span>{lt.pdfSection.docItem1Title}</span>
                      <span className="block text-[9px] text-slate-400 font-normal">{lt.pdfSection.docItem1Sub}</span>
                    </div>
                    <span className="text-slate-500">{lt.pdfSection.docItem1Unit}</span>
                    <span className="font-black">2.450,00 {currencySymbol}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold text-slate-800 py-1 border-b border-slate-100">
                    <div>
                      <span>{lt.pdfSection.docItem2Title}</span>
                      <span className="block text-[9px] text-slate-400 font-normal">{lt.pdfSection.docItem2Sub}</span>
                    </div>
                    <span className="text-slate-500">{lt.pdfSection.docItem2Unit}</span>
                    <span className="font-black">1.100,00 {currencySymbol}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold text-slate-800 py-1 border-b border-slate-100">
                    <div>
                      <span>{lt.pdfSection.docItem3Title}</span>
                      <span className="block text-[9px] text-slate-400 font-normal">{lt.pdfSection.docItem3Sub}</span>
                    </div>
                    <span className="text-slate-500">{lt.pdfSection.docItem3Unit}</span>
                    <span className="font-black">480,00 {currencySymbol}</span>
                  </div>
                </div>

                {/* PDF Totals */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1.5 mb-4">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>{lt.pdfSection.docSubtotal}</span>
                    <span>4.030,00 {currencySymbol}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>{lt.pdfSection.docTax}</span>
                    <span>926,90 {currencySymbol}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-amber-400 pt-1.5 border-t border-slate-800">
                    <span>{lt.pdfSection.docTotal}</span>
                    <span>4.956,90 {currencySymbol}</span>
                  </div>
                </div>

                {/* Signatures & Security Stamp */}
                <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold pt-2 border-t border-slate-100">
                  <span>{lt.pdfSection.docSignature}</span>
                  <span className="text-emerald-600 font-black flex items-center gap-1">
                    <CheckCircle2 size={10} /> {lt.pdfSection.docCertified}
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* 4 Feature Cards Below PDF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 sm:mt-24">
            
            {/* Card 1: Ordens de Serviço */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">
                  {lt.pdfSection.cards[0]?.title || 'Ordens de Serviço'}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {lt.pdfSection.cards[0]?.desc || 'Crie e acompanhe ordens de serviço para cada etapa da obra.'}
                </p>
              </div>
            </div>

            {/* Card 2: Relatórios Financeiros */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">
                  {lt.pdfSection.cards[1]?.title || 'Relatórios Financeiros'}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {lt.pdfSection.cards[1]?.desc || 'Saiba o que recebeu, o que falta e o lucro real de cada obra.'}
                </p>
              </div>
            </div>

            {/* Card 3: Controlo de Pagamentos */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">
                  {lt.pdfSection.cards[2]?.title || 'Controlo de Pagamentos'}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {lt.pdfSection.cards[2]?.desc || 'Registe pagamentos, recibos e mantenha tudo organizado.'}
                </p>
              </div>
            </div>

            {/* Card 4: Acesso em Qualquer Lugar */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">
                  {lt.pdfSection.cards[3]?.title || 'Acesso em Qualquer Lugar'}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {lt.pdfSection.cards[3]?.desc || 'Use no computador, tablet ou telemóvel. Os seus dados sempre consigo.'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. SECTION "O QUE OS PROFISSIONAIS ESTÃO A DIZER" (DEPOIMENTOS) */}
      <section id="depoimentos" className="py-20 sm:py-28 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-12">
            {lt.testimonialsSection.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testi, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  {/* 5 Stars */}
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={16} className="fill-amber-500" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed mb-6 italic">
                    {testi.text}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60">
                  <p className="text-xs sm:text-sm font-black text-slate-900">— {testi.author}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{testi.role}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
            {lt.finalCta.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-lg font-medium mb-10 max-w-2xl mx-auto">
            {lt.finalCta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span>{lt.finalCta.btn}</span>
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {lt.finalCta.badge}
          </p>

        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-12 bg-white border-t border-slate-100 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand Col */}
            <div className="col-span-2 space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500 p-2 rounded-xl text-white">
                  <Construction className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tight italic text-slate-900">
                  ÁTRIOS<span className="text-amber-500">BUILD</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm font-medium leading-relaxed">
                {lt.footer.desc}
              </p>
              <div className="flex items-center gap-3 pt-2 text-slate-400">
                <a href="https://www.facebook.com/atriossoftware" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-600 rounded-xl transition-colors">
                  <Facebook size={16} />
                </a>
                <a href="https://x.com/Atrios_Software" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-600 rounded-xl transition-colors">
                  <Twitter size={16} />
                </a>
                <a href="mailto:software.atrios@gmail.com" className="p-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-600 rounded-xl transition-colors">
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {/* Produto Col */}
            <div className="text-left space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{lt.footer.product}</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><button onClick={() => scrollToSection('funcionalidades')} className="hover:text-slate-900">{lt.footer.features}</button></li>
                <li><button onClick={() => scrollToSection('como-funciona')} className="hover:text-slate-900">{lt.footer.howItWorks}</button></li>
                <li><button onClick={() => scrollToSection('pdf-profissional')} className="hover:text-slate-900">{lt.footer.pdfEstimates}</button></li>
                <li><button onClick={onStartFree} className="hover:text-slate-900 font-bold text-amber-600">{lt.footer.createFreeAccount}</button></li>
              </ul>
            </div>

            {/* Empresa Col */}
            <div className="text-left space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{lt.footer.company}</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><span className="text-slate-600">Atrios Software</span></li>
                <li><a href="mailto:software.atrios@gmail.com" className="hover:text-slate-900">software.atrios@gmail.com</a></li>
                <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-slate-900">{lt.footer.privacy}</button></li>
                <li><button onClick={() => onOpenLegal('terms')} className="hover:text-slate-900">{lt.footer.terms}</button></li>
              </ul>
            </div>

            {/* Suporte Col */}
            <div className="text-left space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{lt.footer.support}</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><a href="mailto:software.atrios@gmail.com" className="hover:text-slate-900">{lt.footer.help}</a></li>
                <li><button onClick={() => setShowDemoModal(true)} className="hover:text-slate-900">{lt.footer.demo}</button></li>
                <li><button onClick={onDownloadApp} className="hover:text-slate-900 font-bold text-emerald-600">{lt.footer.installApp}</button></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
            <p>© {new Date().getFullYear()} ÁTRIOS BUILD. {lt.footer.rights}</p>
            <p>{lt.footer.createdBy} <span className="font-bold text-slate-600">Atrios Software</span></p>
          </div>
        </div>
      </footer>

      {/* 11. MODAL DE DEMONSTRAÇÃO INTERATIVA (60 SEGUNDOS) */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-left overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <Play size={16} className="fill-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      {lt.demoModal.title}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400">
                      {lt.demoModal.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode switch if video is configured */}
              {(((actionVideo.type === 'youtube' && (actionVideo.youtubeId || actionVideo.youtubeUrl)) || (actionVideo.type === 'upload' && actionVideo.videoUrl)) ||
                ((heroVideo.type === 'youtube' && (heroVideo.youtubeId || heroVideo.youtubeUrl)) || (heroVideo.type === 'upload' && heroVideo.videoUrl))) && (
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                  <button
                    onClick={() => setDemoModalMode('video')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${demoModalMode === 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <Play size={13} className="fill-current" /> Vídeo Demonstrativo
                  </button>
                  <button
                    onClick={() => setDemoModalMode('interactive')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${demoModalMode === 'interactive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <ClipboardList size={13} /> Passo a Passo Interativo
                  </button>
                </div>
              )}

              {demoModalMode === 'video' && (((actionVideo.type === 'youtube' && (actionVideo.youtubeId || actionVideo.youtubeUrl)) || (actionVideo.type === 'upload' && actionVideo.videoUrl)) ||
                ((heroVideo.type === 'youtube' && (heroVideo.youtubeId || heroVideo.youtubeUrl)) || (heroVideo.type === 'upload' && heroVideo.videoUrl))) ? (
                <div className="space-y-4 mb-6">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-200">
                    {/* Prefer actionVideo if configured, otherwise fallback to heroVideo */}
                    {actionVideo.type === 'youtube' && (actionVideo.youtubeId || actionVideo.youtubeUrl) ? (
                      <iframe
                        className="w-full h-full border-0"
                        src={`https://www.youtube.com/embed/${actionVideo.youtubeId || extractYouTubeId(actionVideo.youtubeUrl || '')}?autoplay=1&controls=1&rel=0`}
                        title={actionVideo.title || "Veja como funciona em 60 segundos"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : actionVideo.type === 'upload' && actionVideo.videoUrl ? (
                      <video
                        className="w-full h-full object-cover"
                        src={actionVideo.videoUrl}
                        autoPlay
                        controls
                        playsInline
                      />
                    ) : heroVideo.type === 'youtube' && (heroVideo.youtubeId || heroVideo.youtubeUrl) ? (
                      <iframe
                        className="w-full h-full border-0"
                        src={`https://www.youtube.com/embed/${heroVideo.youtubeId || extractYouTubeId(heroVideo.youtubeUrl || '')}?autoplay=1&controls=1&rel=0`}
                        title={heroVideo.title || "Demonstração Átrios Build"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        className="w-full h-full object-cover"
                        src={heroVideo.videoUrl}
                        autoPlay
                        controls
                        playsInline
                      />
                    )}
                  </div>
                  {(actionVideo.title || heroVideo.title) && (
                    <p className="text-xs font-bold text-slate-600 text-center">
                      {actionVideo.type !== 'default' ? actionVideo.title : heroVideo.title}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Step indicator tabs */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {[
                      { num: '1', label: lt.demoModal.step1Tab },
                      { num: '2', label: lt.demoModal.step2Tab },
                      { num: '3', label: lt.demoModal.step3Tab },
                      { num: '4', label: lt.demoModal.step4Tab }
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDemoStep(idx)}
                        className={`py-2 px-1 rounded-xl text-center transition-all ${demoStep === idx ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-100 text-slate-500 font-bold hover:bg-slate-200'}`}
                      >
                        <span className="text-xs block">{s.num}. {s.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Demo Content Step Display */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6 min-h-[220px] flex flex-col justify-center">
                    {demoStep === 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {lt.demoModal.step1Badge}
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <p className="text-xs font-bold text-slate-800">{lt.demoModal.step1Client} <span className="font-black text-amber-600">João Silva</span></p>
                          <p className="text-xs font-bold text-slate-800">{lt.demoModal.step1Location} <span className="font-medium text-slate-600">Lisboa</span></p>
                          <p className="text-xs font-bold text-slate-800">{lt.demoModal.step1Desc} <span className="font-medium text-slate-600">Remodelação Geral WC & Cozinha</span></p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{lt.demoModal.step1Footer}</p>
                      </motion.div>
                    )}

                    {demoStep === 1 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {lt.demoModal.step2Badge}
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                            <span>{lt.demoModal.step2Item1}</span>
                            <span className="font-black">700,00 {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                            <span>{lt.demoModal.step2Item2}</span>
                            <span className="font-black">120,00 {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{lt.demoModal.step2Item3}</span>
                            <span className="font-black">180,00 {currencySymbol}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{lt.demoModal.step2Footer}</p>
                      </motion.div>
                    )}

                    {demoStep === 2 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {lt.demoModal.step3Badge}
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                            <span>{lt.demoModal.step3Item1}</span>
                            <span className="font-black">750,00 {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{lt.demoModal.step3Item2}</span>
                            <span className="font-black">300,00 {currencySymbol}</span>
                          </div>
                        </div>
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-900 font-black text-xs flex justify-between">
                          <span>{lt.demoModal.step3Total}</span>
                          <span>2.521,50 {currencySymbol}</span>
                        </div>
                      </motion.div>
                    )}

                    {(demoStep === 3) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase">
                          <CheckCircle2 size={14} />
                          {lt.demoModal.step4Badge}
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-emerald-500 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                              <FileText size={20} />
                            </div>
                            <div>
                              <span className="text-xs font-black text-slate-900 block">{lt.demoModal.step4File}</span>
                              <span className="text-[10px] text-emerald-600 font-bold">{lt.demoModal.step4Sub}</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-slate-900">2.521,50 {currencySymbol}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{lt.demoModal.step4Footer}</p>
                      </motion.div>
                    )}
                  </div>
                </>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setDemoStep(prev => (prev - 1 + 4) % 4)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  {lt.demoModal.prev}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowDemoModal(false);
                      onStartFree();
                    }}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                  >
                    {lt.demoModal.cta}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default LandingPage;
