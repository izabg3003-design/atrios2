import React, { useState, useEffect, useRef } from 'react';
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
  Mail,
  Youtube,
  Film,
  Menu,
  Sparkles,
  ShieldCheck,
  Headphones,
  RefreshCw,
  TrendingUp,
  Users,
  Layers,
  Inbox,
  Send,
  Folder,
  Maximize2,
  HelpCircle,
  HardHat,
  ChevronRight,
  Shield,
  Lock
} from 'lucide-react';
import { Translation, Locale } from '../translations';
import { CurrencyCode, CURRENCIES, HeroVideoConfig, ActionVideoConfig } from '../types';
import { landingTranslations } from './landingTranslations';
import { LOCALE_OPTIONS, getLandingExtended } from './landingExtendedTranslations';
import { getStoredHeroVideoConfig, getStoredActionVideoConfig, extractYouTubeId, fetchCloudAppSettings } from '../services/storage';
import { ClientRequestModal } from './ClientRequestModal';

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
  onOpenClientPortal?: () => void;
  onOpenIntroBanners?: () => void;
  isIntroActive?: boolean;
}

const STEP_ICONS = [FileText, Users, FileText, Send, Users, HardHat, TrendingUp];
const FEATURE_ICONS = [
  FileText, Hammer, Users, Layers, CreditCard,
  BarChart3, Inbox, Send, Folder, Smartphone
];
const TRUST_BANNER_ICONS = [ShieldCheck, Headphones, RefreshCw, TrendingUp];

export const LandingPage: React.FC<LandingPageProps> = ({
  t,
  locale,
  setLocale,
  currencyCode,
  setCurrencyCode,
  onStartFree,
  onLogin,
  onDownloadApp,
  onOpenLegal,
  onOpenClientPortal,
  onOpenIntroBanners,
  isIntroActive = false
}) => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showClientRequestModal, setShowClientRequestModal] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HeroVideoConfig>(getStoredHeroVideoConfig);
  const [actionVideo, setActionVideo] = useState<ActionVideoConfig>(getStoredActionVideoConfig);
  const [demoModalMode, setDemoModalMode] = useState<'interactive' | 'video'>('video');
  const [activeHeroTab, setActiveHeroTab] = useState<'video' | 'live'>('video');
  const heroVideoElementRef = useRef<HTMLVideoElement>(null);

  // Load cloud settings on mount to ensure newest video from database is fetched
  useEffect(() => {
    fetchCloudAppSettings().then(() => {
      setHeroVideo(getStoredHeroVideoConfig());
      setActionVideo(getStoredActionVideoConfig());
    }).catch(err => console.warn('Cloud app settings fetch error:', err));
  }, []);

  // Compute active video from database/storage (prioritize Hero Video config, fallback to Action Video)
  const heroYouTubeId = heroVideo.youtubeId || extractYouTubeId(heroVideo.youtubeUrl || '');
  const heroVideoUrl = heroVideo.videoUrl;
  const actionYouTubeId = actionVideo.youtubeId || extractYouTubeId(actionVideo.youtubeUrl || '');
  const actionVideoUrl = actionVideo.videoUrl;

  const currentVideo = (() => {
    if (heroVideo.type === 'youtube' && heroYouTubeId) {
      return {
        type: 'youtube' as const,
        id: heroYouTubeId,
        url: heroVideo.youtubeUrl,
        title: heroVideo.title || 'Demonstração Átrios Build',
        autoPlay: heroVideo.autoPlay ?? true,
        muted: heroVideo.muted ?? true,
        showControls: heroVideo.showControls ?? true,
        loop: heroVideo.loop ?? true
      };
    }
    if (heroVideo.type === 'upload' && heroVideoUrl) {
      return {
        type: 'upload' as const,
        url: heroVideoUrl,
        title: heroVideo.title || 'Demonstração Átrios Build',
        autoPlay: heroVideo.autoPlay ?? true,
        muted: heroVideo.muted ?? true,
        showControls: heroVideo.showControls ?? true,
        loop: heroVideo.loop ?? true
      };
    }
    if (heroVideo.type === 'default') {
      return null;
    }
    if (heroYouTubeId) {
      return {
        type: 'youtube' as const,
        id: heroYouTubeId,
        url: heroVideo.youtubeUrl,
        title: heroVideo.title || 'Demonstração Átrios Build',
        autoPlay: heroVideo.autoPlay ?? true,
        muted: heroVideo.muted ?? true,
        showControls: heroVideo.showControls ?? true,
        loop: heroVideo.loop ?? true
      };
    }
    if (heroVideoUrl) {
      return {
        type: 'upload' as const,
        url: heroVideoUrl,
        title: heroVideo.title || 'Demonstração Átrios Build',
        autoPlay: heroVideo.autoPlay ?? true,
        muted: heroVideo.muted ?? true,
        showControls: heroVideo.showControls ?? true,
        loop: heroVideo.loop ?? true
      };
    }
    if (actionVideo.type === 'youtube' && actionYouTubeId) {
      return {
        type: 'youtube' as const,
        id: actionYouTubeId,
        url: actionVideo.youtubeUrl,
        title: actionVideo.title || 'Veja como funciona em 60 segundos',
        autoPlay: actionVideo.autoPlay ?? true,
        muted: actionVideo.muted ?? true,
        showControls: actionVideo.showControls ?? true,
        loop: actionVideo.loop ?? true
      };
    }
    if (actionVideo.type === 'upload' && actionVideoUrl) {
      return {
        type: 'upload' as const,
        url: actionVideoUrl,
        title: actionVideo.title || 'Veja como funciona em 60 segundos',
        autoPlay: actionVideo.autoPlay ?? true,
        muted: actionVideo.muted ?? true,
        showControls: actionVideo.showControls ?? true,
        loop: actionVideo.loop ?? true
      };
    }
    return null;
  })();

  // Play uploaded video when user reaches landing page (intro finished or inactive)
  useEffect(() => {
    if (!isIntroActive && heroVideoElementRef.current && currentVideo?.type === 'upload' && currentVideo.autoPlay) {
      heroVideoElementRef.current.play().catch(() => {
        // Fallback if browser requires user interaction for autoplay
      });
    } else if (isIntroActive && heroVideoElementRef.current) {
      heroVideoElementRef.current.pause();
    }
  }, [isIntroActive, currentVideo]);

  // Get full extended landing translations for the active locale (fallback to pt-PT)
  const ltx = getLandingExtended(locale);
  const lt = landingTranslations[locale] || landingTranslations['pt-PT'];

  const activeLocale = LOCALE_OPTIONS.find(o => o.value === locale) || LOCALE_OPTIONS[0];

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

  // Auto advance demo modal only in interactive mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showDemoModal && demoModalMode === 'interactive') {
      timer = setInterval(() => {
        setDemoStep(prev => (prev + 1) % 4);
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [showDemoModal, demoModalMode]);

  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '€';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 selection:bg-[#ff5722] selection:text-white font-sans antialiased">
      
      {/* 1. TOP NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-2 sm:py-3.5' : 'bg-white/95 backdrop-blur-sm py-2.5 sm:py-4 border-b border-slate-100/60'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1.5 sm:gap-4">
            
            {/* Brand Logo */}
            <div 
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0 min-w-0" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#ff5722] text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                <Construction className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-none truncate">
                  ÁTRIOS<span className="text-[#ff5722]">BUILD</span>
                </span>
                <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 truncate">
                  {ltx.softwareSubtitle}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-[13px] font-bold text-slate-700">
              <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-[#ff5722] transition-colors cursor-pointer">
                {ltx.nav.features}
              </button>
              <button onClick={() => scrollToSection('como-funciona')} className="hover:text-[#ff5722] transition-colors cursor-pointer">
                {ltx.nav.howItWorks}
              </button>
              <button onClick={() => scrollToSection('para-clientes')} className="hover:text-[#ff5722] transition-colors cursor-pointer">
                {ltx.nav.forClients}
              </button>
              <button onClick={() => scrollToSection('para-profissionais')} className="hover:text-[#ff5722] transition-colors cursor-pointer">
                {ltx.nav.forPros}
              </button>
            </nav>

            {/* Language Selector + Auth Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Language Pill with 9 Locales (Compact Flag + 2-letter Code) */}
              <div className="flex items-center bg-slate-100/90 border border-slate-200/80 rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 shadow-xs transition-all hover:border-orange-300 shrink-0">
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  className="bg-transparent text-[11px] sm:text-xs font-black text-slate-800 outline-none cursor-pointer tracking-wider"
                  title="Idioma / Language"
                >
                  {LOCALE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-slate-900 font-bold">
                      {opt.flag} {opt.shortLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Login Button */}
              <button
                onClick={onLogin}
                className="hidden sm:inline-flex px-2.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-800 hover:text-[#ff5722] transition-colors shrink-0 cursor-pointer"
              >
                {ltx.nav.login}
              </button>

              {/* Create Free Account CTA */}
              <button
                onClick={onStartFree}
                className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 active:scale-95 transition-all shrink-0 whitespace-nowrap cursor-pointer"
              >
                <span className="hidden sm:inline">{ltx.nav.startFree}</span>
                <span className="sm:hidden">{ltx.nav.register}</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
              className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 shadow-xl overflow-hidden w-full max-w-full"
            >
              <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-700">
                {/* Mobile Language Selector */}
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Globe size={14} className="text-slate-500" />
                    <span>Idioma / Language:</span>
                  </div>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    {LOCALE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-slate-900 font-bold">
                        {opt.flag} {opt.shortLabel} - {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => { scrollToSection('funcionalidades'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors cursor-pointer"
                >
                  {ltx.nav.features}
                </button>
                <button
                  onClick={() => { scrollToSection('como-funciona'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors cursor-pointer"
                >
                  {ltx.nav.howItWorks}
                </button>
                <button
                  onClick={() => { scrollToSection('para-clientes'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors cursor-pointer"
                >
                  {ltx.nav.forClients}
                </button>
                <button
                  onClick={() => { scrollToSection('para-profissionais'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors cursor-pointer"
                >
                  {ltx.nav.forPros}
                </button>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  {onOpenClientPortal && (
                    <button
                      onClick={() => { onOpenClientPortal(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-[#ff5722] border border-orange-200 rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText size={14} />
                      {ltx.nav.portalClient}
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider text-center cursor-pointer"
                    >
                      {ltx.nav.login}
                    </button>
                    <button
                      onClick={() => { onStartFree(); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md text-center cursor-pointer"
                    >
                      {ltx.nav.startFree}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 sm:pt-32 lg:pt-36 pb-12 sm:pb-20 overflow-hidden bg-white w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Presentation Banner Pill */}
          <div className="mb-6 sm:mb-8 text-left max-w-full overflow-hidden">
            <button
              onClick={() => {
                if (onOpenIntroBanners) {
                  onOpenIntroBanners();
                } else {
                  setShowDemoModal(true);
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/80 text-[#d9531e] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs group max-w-full text-left"
            >
              <Sparkles size={14} className="text-[#ff5722] shrink-0" />
              <span className="truncate">{ltx.hero.bannerPill}</span>
              <ChevronRight size={14} className="text-[#ff5722] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center w-full max-w-full">
            
            {/* Left Column: Headline, Subtitle, Large CTAs */}
            <div className="lg:col-span-6 text-left space-y-5 sm:space-y-6 min-w-0 w-full">
              
              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[52px] font-black tracking-tight text-slate-950 leading-[1.15] break-words">
                {ltx.hero.headline.line1}<br />
                {ltx.hero.headline.line2}<br />
                {ltx.hero.headline.line3}<br />
                <span className="text-[#ff5722]">{ltx.hero.headline.highlight}</span>
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-xl break-words">
                {ltx.hero.subtitle}
              </p>

              {/* Large Dual Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 sm:pt-2 max-w-xl w-full">
                
                {/* Orange Column: Client Request */}
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  <button
                    onClick={() => setShowClientRequestModal(true)}
                    className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-orange-500/25 active:scale-98 transition-all text-left group cursor-pointer min-w-0"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base font-black uppercase tracking-wide leading-tight truncate">
                        {ltx.hero.clientCard.title}
                      </div>
                      <div className="text-xs text-white/90 font-medium mt-0.5 truncate">
                        {ltx.hero.clientCard.sub}
                      </div>
                    </div>
                  </button>

                  {onOpenClientPortal && (
                    <button
                      onClick={onOpenClientPortal}
                      className="w-full py-2 px-3 bg-orange-50 hover:bg-orange-100/90 border border-orange-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs min-w-0 gap-1.5"
                      title="Portal do Cliente"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                        <Shield size={13} className="text-[#ff5722] shrink-0" />
                        <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-950 truncate">
                          {ltx.hero.clientCard.portalPrompt} <strong className="text-[#d9531e]">{ltx.hero.clientCard.portalLink}</strong>
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-[#ff5722] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  )}
                </div>

                {/* Dark Column: Pro Account */}
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  <button
                    onClick={onStartFree}
                    className="w-full bg-[#0b1329] hover:bg-[#15203f] text-white p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-lg active:scale-98 transition-all text-left group cursor-pointer border border-slate-800 min-w-0"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <HardHat className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base font-black uppercase tracking-wide leading-tight text-white truncate">
                        {ltx.hero.proCard.title}
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                        {ltx.hero.proCard.sub}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onLogin}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200/90 border border-slate-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs min-w-0 gap-1.5"
                    title="Login Profissional"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Users size={13} className="text-slate-600 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-950 truncate">
                        {ltx.hero.proCard.loginPrompt} <strong className="text-slate-900">{ltx.hero.proCard.loginLink}</strong>
                      </span>
                    </div>
                    <ChevronRight size={13} className="text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Live Hero Laptop Preview (Identical to Master Realtime Preview) */}
            <div className="lg:col-span-6 relative w-full max-w-full min-w-0">
              
              {/* Simulated Laptop Frame */}
              <div className="bg-slate-950 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border-2 border-slate-800 shadow-2xl text-white relative w-full max-w-full">
                
                {/* Browser Bar */}
                <div className="flex items-center justify-between pb-2.5 px-2 border-b border-slate-800 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] sm:text-xs font-mono text-slate-400">
                    <Lock size={11} className="text-emerald-400 shrink-0" />
                    <span>app.atriosbuild.com</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="hidden sm:inline">HD 60FPS</span>
                    </div>
                    <button
                      onClick={() => {
                        setDemoModalMode(currentVideo ? 'video' : 'interactive');
                        setShowDemoModal(true);
                      }}
                      title="Expandir Janela"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Inner Screen Content */}
                <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center w-full">
                  {currentVideo?.type === 'youtube' && currentVideo.id ? (
                    <iframe
                      className="w-full h-full border-0"
                      src={!isIntroActive ? `https://www.youtube.com/embed/${currentVideo.id}?autoplay=${currentVideo.autoPlay ? 1 : 0}&mute=${currentVideo.muted ? 1 : 0}&loop=${currentVideo.loop ? 1 : 0}&playlist=${currentVideo.id}&controls=${currentVideo.showControls ? 1 : 0}&rel=0&modestbranding=1` : undefined}
                      title={currentVideo.title || "Demonstração Átrios Build"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : currentVideo?.type === 'upload' && currentVideo.url ? (
                    <video
                      ref={heroVideoElementRef}
                      className="w-full h-full object-cover"
                      src={currentVideo.url}
                      autoPlay={!isIntroActive && currentVideo.autoPlay}
                      muted={currentVideo.muted}
                      loop={currentVideo.loop}
                      controls={currentVideo.showControls}
                      playsInline
                    />
                  ) : (
                    /* Default estimate builder preview mockup */
                    <div 
                      onClick={() => {
                        setDemoModalMode('interactive');
                        setShowDemoModal(true);
                      }}
                      className="w-full h-full bg-white p-3.5 sm:p-5 text-slate-900 flex flex-col justify-between text-left select-none cursor-pointer hover:bg-slate-50/95 transition-colors group"
                    >
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-[11px] sm:text-xs font-black uppercase text-slate-900">ORÇAMENTO #2026-084</span>
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[8px] sm:text-[9px] font-black rounded">PENDENTE</span>
                        </div>
                        <span className="text-[11px] sm:text-xs font-black text-amber-600">6.840,00 {currencySymbol}</span>
                      </div>

                      <div className="space-y-1.5 my-2">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between text-[10px] sm:text-[11px]">
                          <span className="font-bold text-slate-700">Materiais & Insumos</span>
                          <span className="font-mono font-bold text-slate-900">916,00 {currencySymbol}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between text-[10px] sm:text-[11px]">
                          <span className="font-bold text-slate-700">Mão de Obra Especializada</span>
                          <span className="font-mono font-bold text-slate-900">1.660,00 {currencySymbol}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[9px] sm:text-[10px] text-slate-400">
                        <span>IVA incluído (23%)</span>
                        <span className="px-2 py-0.5 bg-slate-900 group-hover:bg-[#ff5722] text-white rounded font-bold text-[9px] transition-colors flex items-center gap-1">
                          <FileText size={11} /> PDF Pronto
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Trust Bar Below Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-10 sm:pt-16 max-w-4xl text-left w-full">
            
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-900 block truncate">{ltx.hero.trust.secure}</span>
                <span className="text-[11px] text-slate-500 font-medium truncate block">{ltx.hero.trust.secureSub}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-900 block truncate">{ltx.hero.trust.verified}</span>
                <span className="text-[11px] text-slate-500 font-medium truncate block">{ltx.hero.trust.verifiedSub}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-900 block truncate">{ltx.hero.trust.everywhere}</span>
                <span className="text-[11px] text-slate-500 font-medium truncate block">{ltx.hero.trust.everywhereSub}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SECTION "COMO FUNCIONA PARA TODOS" (7 PASSOS) */}
      <section id="como-funciona" className="py-14 sm:py-28 bg-white border-t border-slate-100 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full max-w-full">
          
          <span className="text-[#ff5722] font-black text-xs uppercase tracking-[0.25em] block mb-2.5">
            {ltx.steps7.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 mb-8 sm:mb-14 break-words">
            {ltx.steps7.title}
          </h2>

          {/* 7 Workflow Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5 items-stretch text-left w-full max-w-full">
            {ltx.steps7.items.map((step, idx) => {
              const StepIcon = STEP_ICONS[idx] || FileText;
              return (
                <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {step.num}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center shrink-0">
                        <StepIcon size={16} />
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-1.5 break-words">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed break-words">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. SECTION "PARA CLIENTES" VS "PARA PROFISSIONAIS" */}
      <section className="py-14 sm:py-24 bg-slate-50/60 border-t border-slate-100 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch w-full max-w-full">
            
            {/* Left Card: PARA CLIENTES */}
            <div id="para-clientes" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-orange-100/90 shadow-sm flex flex-col justify-between text-left relative min-w-0 w-full">
              
              <div>
                {/* Tag */}
                <div className="inline-block px-3 py-1 rounded-lg bg-orange-100 text-[#d9531e] text-xs font-black uppercase tracking-wider mb-4">
                  {ltx.segments.clients.badge}
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-slate-950 mb-2 break-words">
                  {ltx.segments.clients.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-6 break-words">
                  {ltx.segments.clients.sub}
                </p>

                {/* Bullets */}
                <ul className="space-y-3 mb-6 sm:mb-8">
                  {ltx.segments.clients.bullets.map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 sm:gap-3 text-slate-800 font-bold text-xs sm:text-sm min-w-0">
                      <div className="w-5 h-5 rounded-full bg-[#ff5722] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className="break-words">{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Mini Preview Box */}
                <div className="bg-slate-50/80 rounded-2xl p-3 sm:p-4 border border-slate-200/80 mb-6 space-y-2 min-w-0 w-full">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 gap-1">
                    <span className="text-xs font-black text-slate-800 truncate">{ltx.segments.clients.previewTitle}</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ff5722] text-[10px] font-black shrink-0">
                      {ltx.segments.clients.previewBadge}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs min-w-0">
                    <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-100 min-w-0 gap-1">
                      <span className="font-bold text-slate-700 truncate">Empresa A</span>
                      <span className="font-black text-emerald-600 shrink-0">2.450 {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-100 min-w-0 gap-1">
                      <span className="font-bold text-slate-700 truncate">Empresa B</span>
                      <span className="font-black text-emerald-600 shrink-0">2.150 {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-100 min-w-0 gap-1">
                      <span className="font-bold text-slate-700 truncate">Empresa C</span>
                      <span className="font-black text-emerald-600 shrink-0">2.780 {currencySymbol}</span>
                    </div>
                  </div>
                  <div className="pt-1 text-center">
                    <button 
                      onClick={() => setShowClientRequestModal(true)}
                      className="text-[11px] font-black text-[#ff5722] hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      {ltx.segments.clients.previewCta} →
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="w-full">
                <button
                  onClick={() => setShowClientRequestModal(true)}
                  className="w-full py-3.5 sm:py-4 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 mb-2 sm:mb-3 cursor-pointer"
                >
                  <span>{ltx.segments.clients.cta}</span>
                  <ArrowRight size={16} />
                </button>

                {onOpenClientPortal && (
                  <button
                    onClick={onOpenClientPortal}
                    className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer truncate"
                  >
                    <Shield size={14} className="text-[#ff5722] shrink-0" />
                    <span className="truncate">{ltx.segments.clients.portalPrompt} <strong className="text-[#d9531e]">{ltx.segments.clients.portalLink}</strong></span>
                  </button>
                )}
              </div>

            </div>

            {/* Right Card: PARA PROFISSIONAIS */}
            <div id="para-profissionais" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-blue-100/90 shadow-sm flex flex-col justify-between text-left relative min-w-0 w-full">
              
              <div>
                {/* Tag */}
                <div className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider mb-4">
                  {ltx.segments.pro.badge}
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-slate-950 mb-2 break-words">
                  {ltx.segments.pro.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-6 break-words">
                  {ltx.segments.pro.sub}
                </p>

                {/* Bullets */}
                <ul className="space-y-3 mb-6 sm:mb-8">
                  {ltx.segments.pro.bullets.map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 sm:gap-3 text-slate-800 font-bold text-xs sm:text-sm min-w-0">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className="break-words">{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Mini Preview Box */}
                <div className="bg-slate-50/80 rounded-2xl p-3 sm:p-4 border border-slate-200/80 mb-6 space-y-2 min-w-0 w-full">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 gap-1">
                    <span className="text-xs font-black text-slate-800 truncate">{ltx.segments.pro.previewTitle}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black shrink-0">
                      {ltx.segments.pro.previewBadge}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center pt-1 min-w-0">
                    <div className="p-1.5 sm:p-2 bg-white rounded-xl border border-slate-100 min-w-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block truncate">{ltx.segments.pro.stat1Label}</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">{ltx.segments.pro.stat1Val}</span>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-white rounded-xl border border-slate-100 min-w-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block truncate">{ltx.segments.pro.stat2Label}</span>
                      <span className="text-[11px] sm:text-xs font-black text-slate-900 truncate block">{ltx.segments.pro.stat2Val}</span>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-white rounded-xl border border-slate-100 min-w-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block truncate">{ltx.segments.pro.stat3Label}</span>
                      <span className="text-[11px] sm:text-xs font-black text-slate-900 truncate block">{ltx.segments.pro.stat3Val}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="w-full">
                <button
                  onClick={onStartFree}
                  className="w-full py-3.5 sm:py-4 bg-[#0b1329] hover:bg-[#15203f] text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 mb-2 sm:mb-3 cursor-pointer border border-slate-800"
                >
                  <span>{ltx.segments.pro.cta}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={onStartFree}
                  className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer truncate"
                >
                  <Sparkles size={14} className="text-[#ff5722] shrink-0" />
                  <span className="truncate">Já é profissional? <strong className="text-[#d9531e]">Comece agora mesmo a receber pedidos</strong></span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. SECTION "FUNCIONALIDADES COMPLETAS PARA O DIA A DIA" */}
      <section id="funcionalidades" className="py-14 sm:py-28 bg-white border-t border-slate-100 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full max-w-full">
          
          <span className="text-slate-400 font-black text-xs uppercase tracking-[0.25em] block mb-2.5">
            {ltx.features10.eyebrow}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 mb-8 sm:mb-14 break-words">
            {ltx.features10.title}
          </h2>

          {/* 10 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 items-stretch text-left w-full max-w-full">
            {ltx.features10.items.map((feat, idx) => {
              const FeatIcon = FEATURE_ICONS[idx] || FileText;
              const isHighlight = feat.isHighlighted || idx === 2;
              const isNew = feat.isNew || idx === 6 || idx === 7;

              return (
                <div 
                  key={idx} 
                  className={`bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl ${isHighlight ? 'border-2 border-orange-400 shadow-sm' : 'border border-slate-200/80 shadow-xs'} hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between relative min-w-0`}
                >
                  {isNew && (
                    <span className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-0.5 rounded-full bg-[#ff5722] text-white text-[9px] font-black uppercase">
                      NOVO
                    </span>
                  )}
                  <div>
                    <div className={`w-10 h-10 rounded-2xl ${isHighlight ? 'bg-emerald-50 text-emerald-600' : idx === 4 || idx === 7 ? 'bg-orange-50 text-orange-600' : idx === 5 ? 'bg-purple-50 text-purple-600' : idx === 6 ? 'bg-rose-50 text-rose-600' : idx === 9 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center mb-3 sm:mb-4`}>
                      <FeatIcon size={20} />
                    </div>
                    <h3 className={`text-sm font-black ${isHighlight ? 'text-[#ff5722]' : 'text-slate-900'} mb-1.5 break-words`}>
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed break-words">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. SECTION "ANTES ERA ASSIM..." VS "AGORA É ASSIM..." */}
      <section className="py-14 sm:py-24 bg-slate-50/60 border-t border-slate-100 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
          
          {/* Comparison Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-200/80 shadow-sm mb-10 sm:mb-16 w-full max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center w-full max-w-full">
              
              {/* Left Box (Antes) */}
              <div className="lg:col-span-5 bg-[#fff5f5] rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-rose-100 text-left min-w-0 w-full">
                <div className="flex items-center gap-2 mb-4 sm:mb-6 text-rose-600 font-black text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate">{ltx.comparison.before.badge}</span>
                </div>

                <ul className="space-y-3 sm:space-y-4">
                  {ltx.comparison.before.items.map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 sm:gap-3 text-slate-800 font-bold text-xs sm:text-sm min-w-0">
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={12} strokeWidth={3} />
                      </div>
                      <span className="break-words">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Middle Arrow */}
              <div className="lg:col-span-2 flex items-center justify-center py-2 lg:py-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0b1329] text-white flex items-center justify-center shadow-md shrink-0">
                  <ArrowRight size={18} className="rotate-90 lg:rotate-0" />
                </div>
              </div>

              {/* Right Box (Depois) */}
              <div className="lg:col-span-5 bg-[#f0fdf4] rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-emerald-100 text-left min-w-0 w-full">
                <div className="flex items-center gap-2 mb-4 sm:mb-6 text-emerald-600 font-black text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{ltx.comparison.after.badge}</span>
                </div>

                <ul className="space-y-3 sm:space-y-4">
                  {ltx.comparison.after.items.map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 sm:gap-3 text-slate-800 font-bold text-xs sm:text-sm min-w-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="break-words">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Dark CTA Banner */}
          <div className="bg-[#0b1329] rounded-2xl sm:rounded-3xl p-5 sm:p-10 lg:p-14 text-white shadow-2xl border border-slate-800 w-full max-w-full overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center w-full max-w-full">
              
              {/* Left Copy */}
              <div className="lg:col-span-7 text-left space-y-4 sm:space-y-6 min-w-0 w-full">
                <h3 className="text-xl sm:text-3xl lg:text-[40px] font-black tracking-tight leading-tight break-words">
                  {ltx.comparison.ctaBanner.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-base font-normal max-w-xl break-words">
                  {ltx.comparison.ctaBanner.sub}
                </p>

                {/* 4 Trust points in row */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-800 w-full">
                  {ltx.comparison.ctaBanner.trust.map((item, idx) => {
                    const TrustIcon = TRUST_BANNER_ICONS[idx] || ShieldCheck;
                    return (
                      <div key={idx} className="flex items-start gap-2 min-w-0">
                        <TrustIcon size={18} className="text-[#ff5722] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{item.sub}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Right CTA Buttons */}
              <div className="lg:col-span-5 flex flex-col gap-3 min-w-0 w-full">
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  <button
                    onClick={() => setShowClientRequestModal(true)}
                    className="w-full p-4 sm:p-5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-center shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer min-w-0"
                  >
                    <div className="text-xs sm:text-base font-black uppercase tracking-wide truncate">
                      {ltx.comparison.ctaBanner.clientTitle}
                    </div>
                    <div className="text-[11px] sm:text-xs text-white/90 font-medium mt-0.5 truncate">
                      {ltx.comparison.ctaBanner.clientSub}
                    </div>
                  </button>

                  {onOpenClientPortal && (
                    <button
                      onClick={onOpenClientPortal}
                      className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group min-w-0 gap-1.5"
                      title="Portal do Cliente"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Shield size={13} className="text-orange-400 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate">
                          {ltx.hero.clientCard.portalPrompt} <strong className="text-orange-400">{ltx.hero.clientCard.portalLink}</strong>
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-w-0 w-full">
                  <button
                    onClick={onStartFree}
                    className="w-full p-4 sm:p-5 bg-[#121c38] hover:bg-[#1a2850] text-white rounded-2xl font-black text-center border border-slate-700 shadow-md active:scale-98 transition-all cursor-pointer min-w-0"
                  >
                    <div className="text-xs sm:text-base font-black uppercase tracking-wide text-white truncate">
                      {ltx.comparison.ctaBanner.proTitle}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 truncate">
                      {ltx.comparison.ctaBanner.proSub}
                    </div>
                  </button>

                  <button
                    onClick={onLogin}
                    className="w-full py-2 px-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group min-w-0 gap-1.5"
                    title="Login Profissional"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Users size={13} className="text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-300 group-hover:text-white truncate">
                        {ltx.hero.proCard.loginPrompt} <strong className="text-amber-400">{ltx.hero.proCard.loginLink}</strong>
                      </span>
                    </div>
                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-10 sm:py-14 bg-white border-t border-slate-100 text-slate-600 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 mb-8 sm:mb-12 w-full max-w-full">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-3 sm:space-y-4 text-left min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#ff5722] text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                  <Construction className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none truncate">
                    ÁTRIOS<span className="text-[#ff5722]">BUILD</span>
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 truncate">
                    {ltx.softwareSubtitle}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm break-words">
                {ltx.footer.desc}
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pt-1">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>{ltx.footer.secure}</span>
              </div>
            </div>

            {/* Produto Column */}
            <div className="md:col-span-2 text-left space-y-3 min-w-0">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {ltx.footer.product}
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><button onClick={() => scrollToSection('funcionalidades')} className="hover:text-slate-900 cursor-pointer">{ltx.footer.features}</button></li>
                <li><button onClick={() => scrollToSection('como-funciona')} className="hover:text-slate-900 cursor-pointer">{ltx.footer.howItWorks}</button></li>
                <li><button onClick={onStartFree} className="hover:text-slate-900 cursor-pointer">{ltx.footer.pdfQuotes}</button></li>
                <li><button onClick={onStartFree} className="hover:text-[#ff5722] font-black text-[#ff5722] cursor-pointer">{ltx.footer.createFree}</button></li>
              </ul>
            </div>

            {/* Empresa Column */}
            <div className="md:col-span-3 text-left space-y-3 min-w-0">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {ltx.footer.company}
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><span className="text-slate-700 font-bold">Atrios Software</span></li>
                <li className="flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <a href="mailto:atriossoftware@gmail.com" className="hover:text-slate-900 truncate">atriossoftware@gmail.com</a>
                </li>
                <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-slate-900 cursor-pointer">{ltx.footer.privacy}</button></li>
                <li><button onClick={() => onOpenLegal('terms')} className="hover:text-slate-900 cursor-pointer">{ltx.footer.terms}</button></li>
              </ul>
            </div>

            {/* Suporte Column */}
            <div className="md:col-span-2 text-left space-y-3 min-w-0">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {ltx.footer.support}
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li className="flex items-center gap-1.5 truncate">
                  <HelpCircle size={13} className="text-slate-400 shrink-0" />
                  <a href="mailto:atriossoftware@gmail.com" className="hover:text-slate-900 truncate">{ltx.footer.help}</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Play size={13} className="text-slate-400 shrink-0" />
                  <button onClick={() => setShowDemoModal(true)} className="hover:text-slate-900 cursor-pointer">{ltx.footer.demo}</button>
                </li>
                <li className="flex items-center gap-1.5">
                  <Download size={13} className="text-emerald-600 shrink-0" />
                  <button onClick={onDownloadApp} className="hover:text-emerald-600 font-bold text-emerald-600 cursor-pointer">{ltx.footer.installApp}</button>
                </li>
                {onOpenClientPortal && (
                  <li className="flex items-center gap-1.5 pt-1 truncate">
                    <Shield size={13} className="text-[#ff5722] shrink-0" />
                    <button onClick={onOpenClientPortal} className="hover:text-[#ff5722] font-black text-[#ff5722] cursor-pointer truncate">{ltx.footer.clientPortal}</button>
                  </li>
                )}
              </ul>
            </div>

          </div>

          <div className="pt-6 sm:pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-400 text-center sm:text-left">
            <p>© {new Date().getFullYear()} ÁTRIOSBUILD • {ltx.footer.rights}</p>
            <p>{ltx.footer.tagline}</p>
          </div>

        </div>
      </footer>

      {/* 8. MODAL DE DEMONSTRAÇÃO INTERATIVA / VÍDEO (60 SEGUNDOS) */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-7 shadow-2xl border border-slate-100 relative text-left overflow-hidden max-h-[95vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ff5722] text-white flex items-center justify-center font-black shrink-0">
                    <Play size={16} className="fill-white ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight truncate">
                      {currentVideo ? currentVideo.title : 'Demonstração Átrios Build'}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
                      {currentVideo?.type === 'youtube' ? 'Vídeo Oficial no YouTube HD' : currentVideo?.type === 'upload' ? 'Vídeo Demonstrativo do Sistema' : ltx.hero.video.badge60s}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer shrink-0"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode switch (Vídeo vs Passo a Passo) */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-3 sm:mb-4">
                <button
                  onClick={() => setDemoModalMode('video')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${demoModalMode === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Play size={13} className="fill-current text-[#ff5722]" /> Vídeo Demonstrativo
                </button>
                <button
                  onClick={() => setDemoModalMode('interactive')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${demoModalMode === 'interactive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <ClipboardList size={13} className="text-[#ff5722]" /> Passo a Passo Interativo
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 pr-0.5">
                {demoModalMode === 'video' ? (
                  <div className="space-y-3 mb-4 sm:mb-5">
                    <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                      {currentVideo?.type === 'youtube' && currentVideo.id ? (
                        <iframe
                          className="w-full h-full border-0"
                          src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=${currentVideo.muted ? 1 : 0}&loop=${currentVideo.loop ? 1 : 0}&playlist=${currentVideo.id}&controls=${currentVideo.showControls ? 1 : 0}&rel=0&modestbranding=1`}
                          title={currentVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : currentVideo?.type === 'upload' && currentVideo.url ? (
                        <video
                          className="w-full h-full object-contain bg-black"
                          src={currentVideo.url}
                          autoPlay
                          muted={currentVideo.muted}
                          loop={currentVideo.loop}
                          controls={currentVideo.showControls}
                          playsInline
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-[#070d1e]">
                          <div className="w-14 h-14 rounded-full bg-[#ff5722] text-white flex items-center justify-center shadow-lg mb-3">
                            <Play size={24} className="fill-white ml-0.5" />
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide mb-1">
                            Vídeo de Apresentação
                          </h4>
                          <p className="text-xs text-slate-400 max-w-md mb-3">
                            O vídeo pode ser configurado e atualizado diretamente nas Definições Master da plataforma.
                          </p>
                          <button
                            onClick={() => setDemoModalMode('interactive')}
                            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Ver Demonstração Interativa
                          </button>
                        </div>
                      )}
                    </div>
                    {currentVideo && (
                      <div className="flex items-center justify-between px-1 gap-2">
                        <span className="text-xs font-bold text-slate-700 truncate">{currentVideo.title}</span>
                        {currentVideo.type === 'youtube' ? (
                          <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Youtube size={12} /> YouTube HD
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Film size={12} /> Vídeo HD
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Step indicator tabs */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      {[
                        { num: '1', label: '1. Pedido' },
                        { num: '2', label: '2. Itens' },
                        { num: '3', label: '3. Total' },
                        { num: '4', label: '4. PDF Pronto' }
                      ].map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDemoStep(idx)}
                          className={`py-1.5 sm:py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${demoStep === idx ? 'bg-[#ff5722] text-white font-black shadow-md' : 'bg-slate-100 text-slate-500 font-bold hover:bg-slate-200'}`}
                        >
                          <span className="text-[11px] sm:text-xs block truncate">{s.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Demo Content Step Display */}
                    <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-4 sm:mb-6 min-h-[190px] flex flex-col justify-center">
                      {demoStep === 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                          <div className="flex items-center gap-2 text-[#ff5722] font-black text-xs uppercase">
                            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
                            <span>PASSO 1 — DADOS DO CLIENTE E DA OBRA</span>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                            <p className="text-xs font-bold text-slate-800">Cliente: <span className="font-black text-[#ff5722]">João Silva</span></p>
                            <p className="text-xs font-bold text-slate-800">Localização: <span className="font-medium text-slate-600">Lisboa, Portugal</span></p>
                            <p className="text-xs font-bold text-slate-800">Descrição: <span className="font-medium text-slate-600">Remodelação Geral WC & Cozinha</span></p>
                          </div>
                        </motion.div>
                      )}

                      {demoStep === 1 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                          <div className="flex items-center gap-2 text-[#ff5722] font-black text-xs uppercase">
                            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
                            <span>PASSO 2 — ADIÇÃO RÁPIDA DE MATERIAIS E SERVIÇOS</span>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-xs">
                            <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                              <span>Mão de Obra Especializada</span>
                              <span className="font-black">1.200,00 {currencySymbol}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                              <span>Cerâmica e Revestimentos</span>
                              <span className="font-black">850,00 {currencySymbol}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Canalização e Eletricidade</span>
                              <span className="font-black">470,00 {currencySymbol}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {demoStep === 2 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                          <div className="flex items-center gap-2 text-[#ff5722] font-black text-xs uppercase">
                            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
                            <span>PASSO 3 — CÁLCULO AUTOMÁTICO DE LUCRO E TOTAIS</span>
                          </div>
                          <div className="bg-orange-100/80 p-3 rounded-xl text-orange-950 font-black text-xs flex justify-between items-center">
                            <span>Total do Orçamento</span>
                            <span className="text-base text-[#ff5722]">2.520,00 {currencySymbol}</span>
                          </div>
                        </motion.div>
                      )}

                      {demoStep === 3 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase">
                            <CheckCircle2 size={14} />
                            <span>PASSO 4 — PROPOSTA EM PDF PROFISSIONAL GERADA</span>
                          </div>
                          <div className="bg-white p-4 rounded-xl border-2 border-emerald-500 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                                <FileText size={20} />
                              </div>
                              <div>
                                <span className="text-xs font-black text-slate-900 block">Proposta_Atrios_2026.pdf</span>
                                <span className="text-[10px] text-emerald-600 font-bold">Pronto para envio por WhatsApp</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-slate-900">2.520,00 {currencySymbol}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                {demoModalMode === 'interactive' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDemoStep(prev => (prev - 1 + 4) % 4)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setDemoStep(prev => (prev + 1) % 4)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Próximo
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDemoModalMode('interactive')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ClipboardList size={13} /> Ver Passo a Passo
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowDemoModal(false);
                      onStartFree();
                    }}
                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    {ltx.nav.startFree}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. MODAL DE PEDIDO DE ORÇAMENTO (PARTICULARES / CLIENTES COMUNS) */}
      <ClientRequestModal
        isOpen={showClientRequestModal}
        onClose={() => setShowClientRequestModal(false)}
        locale={locale}
        onOpenPortal={() => {
          setShowClientRequestModal(false);
          if (onOpenClientPortal) onOpenClientPortal();
        }}
      />

    </div>
  );
};

export default LandingPage;
