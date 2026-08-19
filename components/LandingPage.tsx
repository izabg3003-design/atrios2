import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Check, X, ChevronDown, 
  FileText, Hammer, Users, Layers, 
  CreditCard, BarChart3, Inbox, Send, 
  FolderArchive, Smartphone, ShieldCheck, 
  UserCheck, Laptop, Globe, MessageCircle, 
  FileSpreadsheet, Folder, Clock, CheckCircle2, 
  TrendingUp, HardHat, FileCheck2, Headphones, 
  Sparkles, RefreshCw, Star, Menu, ExternalLink,
  ChevronRight, Building2, MapPin, Search,
  Play, Pause, Maximize2, Volume2, VolumeX,
  Video, Eye, CheckCircle, Mail, Download, HelpCircle
} from 'lucide-react';
import { Translation, Locale } from '../translations';
import { CurrencyCode, HeroVideoConfig } from '../types';
import { landingTranslations } from './landingTranslations';
import { ClientRequestModal } from './ClientRequestModal';
import { AtriosLogo } from './AtriosLogo';
import { getStoredHeroVideoConfig, extractYouTubeId } from '../services/storage';

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
}

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'pt-PT', label: 'Português (PT)', flag: '🇵🇹' },
  { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' }
];

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
  onOpenClientPortal
}) => {
  const [showClientRequestModal, setShowClientRequestModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isPlayingHeroInline, setIsPlayingHeroInline] = useState(false);
  const [heroViewMode, setHeroViewMode] = useState<'video' | 'app'>('video');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HeroVideoConfig>(getStoredHeroVideoConfig);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Active translations
  const lt = landingTranslations[locale] || landingTranslations['pt-PT'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for real-time changes to the Hero Video from Master Panel
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

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenClientRequest = () => {
    setShowClientRequestModal(true);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentLangObj = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white relative">
      
      {/* ========================================================================= */}
      {/* 1. HEADER / NAVBAR                                                        */}
      {/* ========================================================================= */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3' 
            : 'bg-white border-b border-slate-100/80 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer group"
          >
            <AtriosLogo size={40} showText={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <button 
              onClick={() => scrollToSection('funcionalidades')} 
              className="hover:text-orange-500 transition-colors"
            >
              {lt.nav.features}
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')} 
              className="hover:text-orange-500 transition-colors"
            >
              {lt.nav.howItWorks}
            </button>
            <button 
              onClick={() => scrollToSection('para-clientes')} 
              className="hover:text-orange-500 transition-colors"
            >
              {lt.nav.forClients}
            </button>
            <button 
              onClick={() => scrollToSection('para-profissionais')} 
              className="hover:text-orange-500 transition-colors"
            >
              {lt.nav.forPros}
            </button>
          </nav>

          {/* Right Action Controls: Language Selector + Login + CTA */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                title="Selecione o Idioma / Select Language"
              >
                <span className="text-base leading-none">{currentLangObj.flag}</span>
                <span className="text-xs uppercase font-extrabold">{currentLangObj.code.split('-')[0]}</span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    {lt.nav.language}
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                        locale === lang.code 
                          ? 'bg-orange-50 text-orange-600 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </div>
                      {locale === lang.code && <Check size={14} className="text-orange-500 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Portal do Cliente Login Button */}
            {onOpenClientPortal && (
              <button
                onClick={onOpenClientPortal}
                className="px-3.5 py-2 text-xs font-black text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Aceder à área de orçamentos do cliente"
              >
                <ShieldCheck size={14} className="text-amber-600" />
                <span>Portal do Cliente</span>
              </button>
            )}

            {/* Login Button */}
            <button
              onClick={onLogin}
              className="px-4 py-2 text-xs font-black text-slate-800 hover:text-orange-500 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-wider"
            >
              {lt.nav.login}
            </button>

            {/* Start Free Button */}
            <button
              onClick={onStartFree}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 transition-all active:scale-95"
            >
              {lt.nav.startFree}
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
              >
                <span>{currentLangObj.flag}</span>
                <span className="text-[11px] uppercase font-bold">{currentLangObj.code.split('-')[0]}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left ${
                        locale === lang.code ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </div>
                      {locale === lang.code && <Check size={12} className="text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-bold text-slate-700">
              <button onClick={() => scrollToSection('funcionalidades')} className="text-left py-2 hover:text-orange-500">
                {lt.nav.features}
              </button>
              <button onClick={() => scrollToSection('como-funciona')} className="text-left py-2 hover:text-orange-500">
                {lt.nav.howItWorks}
              </button>
              <button onClick={() => scrollToSection('para-clientes')} className="text-left py-2 hover:text-orange-500">
                {lt.nav.forClients}
              </button>
              <button onClick={() => scrollToSection('para-profissionais')} className="text-left py-2 hover:text-orange-500">
                {lt.nav.forPros}
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              {onOpenClientPortal && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenClientPortal(); }}
                  className="w-full py-3 text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck size={16} className="text-amber-600" /> Portal do Cliente (Login)
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); onLogin(); }}
                className="w-full py-3 text-xs font-black text-slate-800 bg-slate-100 rounded-xl uppercase tracking-wider"
              >
                {lt.nav.login}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onStartFree(); }}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25"
              >
                {lt.nav.startFree}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="pt-10 pb-16 lg:pt-14 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Subtitle, Dual CTAs & Trust Badges */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8">
            
            {/* Main Headline */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-slate-950 leading-[1.15]">
                <span>{lt.hero.titleLine1}</span><br />
                <span>{lt.hero.titleLine2}</span><br />
                <span>{lt.hero.titleLine3}</span><br />
                <span className="text-orange-500">{lt.hero.titleHighlight}</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl pt-2">
                {lt.hero.subtitle}
              </p>
            </div>

            {/* Dual CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              
              {/* Button 1: Client Quote Request (Orange Card Button) */}
              <button
                onClick={handleOpenClientRequest}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 size={24} className="text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black uppercase tracking-wider leading-tight">
                    {lt.hero.ctaClient}
                  </div>
                  <div className="text-[11px] text-orange-100 font-medium leading-tight mt-0.5">
                    {lt.hero.ctaClientSub}
                  </div>
                </div>
              </button>

              {/* Button 2: Contractor Pro CTA (Dark Navy Card Button) */}
              <button
                onClick={onStartFree}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white shadow-lg shadow-slate-950/20 transition-all hover:scale-[1.02] active:scale-95 text-left group cursor-pointer border border-slate-800"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <HardHat size={24} className="text-amber-400 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black uppercase tracking-wider leading-tight">
                    {lt.hero.ctaPro}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                    {lt.hero.ctaProSub}
                  </div>
                </div>
              </button>

            </div>

            {/* 3 Trust Badges Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-emerald-600 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {lt.hero.badge1Title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {lt.hero.badge1Sub}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <UserCheck size={18} className="text-orange-500 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {lt.hero.badge2Title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {lt.hero.badge2Sub}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Laptop size={18} className="text-blue-600 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {lt.hero.badge3Title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {lt.hero.badge3Sub}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: High-Impact HERO Media / Video Player Showcase */}
          <div className="lg:col-span-6 relative flex items-center justify-center pt-6 lg:pt-0">
            
            {/* Handwritten Dotted Arrow and Script Annotation */}
            <div className="absolute -top-3.5 right-6 sm:right-14 z-20 flex items-center gap-2 pointer-events-none">
              <span className="font-serif italic font-bold text-xs sm:text-sm text-orange-600 rotate-[-4deg] drop-shadow-sm">
                {lt.hero.arrowNote}
              </span>
              <svg className="w-10 h-8 text-orange-500 rotate-12" viewBox="0 0 50 40" fill="none" stroke="currentColor">
                <path d="M5 25 C 20 10, 35 15, 45 30" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M38 28 L45 30 L43 23" strokeWidth="2" />
              </svg>
            </div>

            {/* Main Hero Container Frame */}
            <div className="w-full max-w-xl bg-slate-950 rounded-3xl p-3 sm:p-3.5 shadow-2xl border-4 border-slate-800 relative group overflow-hidden">
              
              {/* Top View Selector Bar: Vídeo Demonstrativo vs Painel */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800 text-xs px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setHeroViewMode('video'); setIsPlayingHeroInline(true); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                      heroViewMode === 'video'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Play size={12} className="fill-current" />
                    <span>VÍDEO HERO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setHeroViewMode('app'); setIsPlayingHeroInline(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                      heroViewMode === 'app'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Laptop size={12} />
                    <span>PAINEL EM DIRETO</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    HD 60fps
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Expandir Vídeo"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* View 1: Dynamic HERO VIDEO PLAYER */}
              {heroViewMode === 'video' && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  
                  {/* Option A: YouTube Configured */}
                  {heroVideo.type === 'youtube' && heroVideo.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${heroVideo.youtubeId}?autoplay=${isPlayingHeroInline || heroVideo.autoPlay ? 1 : 0}&mute=${heroVideo.muted ? 1 : 0}&loop=${heroVideo.loop ? 1 : 0}&controls=${heroVideo.showControls ? 1 : 0}&rel=0`}
                      title="Atrios Build Hero Video"
                      className="w-full h-full object-cover"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : heroVideo.type === 'upload' || (heroVideo.type === 'mp4' && heroVideo.videoUrl) ? (
                    /* Option B: Direct HTML5 Video */
                    <video
                      src={heroVideo.videoUrl}
                      controls={heroVideo.showControls}
                      autoPlay={isPlayingHeroInline || heroVideo.autoPlay}
                      muted={heroVideo.muted}
                      loop={heroVideo.loop}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Option C: Premium Interactive Default Hero Showcase */
                    <div 
                      onClick={() => setShowVideoModal(true)}
                      className="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 cursor-pointer group select-none"
                    >
                      {/* Background Visual Grid Lines */}
                      <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

                      {/* Top Pill / Title */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                          <Sparkles size={12} className="text-orange-400" />
                          <span>SOFTWARE EM AÇÃO • 60 SEGUNDOS</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                          01:45 MIN
                        </span>
                      </div>

                      {/* Center Glowing Play Button */}
                      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute w-20 h-20 rounded-full bg-orange-500/20 animate-ping"></span>
                          <span className="absolute w-16 h-16 rounded-full bg-orange-500/40"></span>
                          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/50 group-hover:scale-110 transition-transform relative z-10">
                            <Play size={24} className="fill-white translate-x-0.5 stroke-[2.5]" />
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <div className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
                            VER DEMONSTRAÇÃO COMPLETA
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Clique para assistir como funciona o Atrios Build
                          </div>
                        </div>
                      </div>

                      {/* Bottom Live Metrics Overlay Bar */}
                      <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-bold text-slate-300">
                        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-center">
                          <span className="text-orange-400 font-black">1. </span> Pedidos de Obra
                        </div>
                        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-center">
                          <span className="text-orange-400 font-black">2. </span> Propostas Rápidas
                        </div>
                        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-center">
                          <span className="text-orange-400 font-black">3. </span> Gestão Total
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* View 2: Interactive Real-Time Pro Dashboard (When toggled to Painel) */}
              {heroViewMode === 'app' && (
                <div className="bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-800 text-slate-900 text-left animate-in fade-in duration-200">
                  
                  {/* Laptop Header */}
                  <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white text-[10px] font-black">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 leading-tight">Olá, João Silva</div>
                        <div className="text-[10px] text-slate-400 font-medium">Vamos gerir o seu negócio hoje?</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-slate-500">Online</span>
                    </div>
                  </div>

                  {/* 4 Stat Metrics Cards */}
                  <div className="p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border-b border-slate-200">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-500">Orçamentos</div>
                      <div className="text-sm font-black text-slate-900">24</div>
                      <div className="text-[8px] font-bold text-emerald-600">+12% mês</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-500">Obras ativas</div>
                      <div className="text-sm font-black text-slate-900">8</div>
                      <div className="text-[8px] font-bold text-emerald-600">+5% andam.</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-500">Recebimentos</div>
                      <div className="text-sm font-black text-slate-900">18.650 €</div>
                      <div className="text-[8px] font-bold text-emerald-600">+18% mês</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-500">Lucro líquido</div>
                      <div className="text-sm font-black text-slate-900">7.450 €</div>
                      <div className="text-[8px] font-bold text-emerald-600">+15%</div>
                    </div>
                  </div>

                  {/* Two Columns: Pedidos & Propostas */}
                  <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[10px] font-black text-slate-900 flex items-center gap-1">
                          <Inbox size={11} className="text-orange-500" /> Pedidos de orçamento
                        </span>
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-orange-100 text-orange-700">3 Novos</span>
                      </div>
                      <div className="space-y-1">
                        <div className="p-1 rounded bg-slate-50 flex items-center justify-between text-[9px] font-bold">
                          <span>Remodelação cozinha</span>
                          <span className="text-[8px] px-1 py-0.2 bg-amber-500 text-slate-950 rounded">Novo</span>
                        </div>
                        <div className="p-1 rounded bg-slate-50 flex items-center justify-between text-[9px] font-bold">
                          <span>Construção moradia</span>
                          <span className="text-[8px] px-1 py-0.2 bg-amber-500 text-slate-950 rounded">Novo</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[10px] font-black text-slate-900 flex items-center gap-1">
                          <Send size={11} className="text-blue-500" /> Propostas enviadas
                        </span>
                        <span className="text-[8px] font-bold text-slate-400">Total 3</span>
                      </div>
                      <div className="space-y-1">
                        <div className="p-1 rounded bg-slate-50 flex items-center justify-between text-[9px] font-bold">
                          <span>Carlos M. (1.850 €)</span>
                          <span className="text-[8px] text-emerald-600">Enviada</span>
                        </div>
                        <div className="p-1 rounded bg-slate-50 flex items-center justify-between text-[9px] font-bold">
                          <span>Ana P. (1.220 €)</span>
                          <span className="text-[8px] text-emerald-600">Enviada</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Overlapping Connected Mobile Phone Card */}
            <div className="absolute -bottom-5 -right-2 sm:-right-4 w-44 sm:w-48 bg-slate-950 rounded-2xl p-2 shadow-2xl border-4 border-slate-800 z-30 hidden xs:block">
              <div className="bg-white rounded-xl p-2.5 border border-slate-100 text-left space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="text-[9px] font-black text-slate-800">Pedido de Obra</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[8px] font-black uppercase text-orange-600">Novo pedido</div>
                  <div className="text-[10px] font-black text-slate-900 leading-tight">Remodelação de Casa</div>
                  <div className="text-[8px] text-slate-500">Lisboa • há 30 min</div>
                </div>
                <button
                  onClick={handleOpenClientRequest}
                  className="w-full py-1 bg-orange-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider text-center"
                >
                  VER PEDIDO
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROCESS TIMELINE: COMO FUNCIONA PARA TODOS                             */}
      {/* ========================================================================= */}
      <section id="como-funciona" className="py-16 lg:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-black text-orange-600 tracking-widest uppercase">
              {lt.timeline.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              {lt.timeline.title}
            </h2>
          </div>

          {/* 7-Step Horizontal Grid with Connector Line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 relative">
            
            {lt.timeline.steps.map((step, idx) => {
              const stepIcons = [
                <FileText key={1} size={20} className="text-orange-500" />,
                <Users key={2} size={20} className="text-orange-500" />,
                <FileSpreadsheet key={3} size={20} className="text-orange-500" />,
                <Send key={4} size={20} className="text-orange-500" />,
                <UserCheck key={5} size={20} className="text-orange-500" />,
                <HardHat key={6} size={20} className="text-orange-500" />,
                <TrendingUp key={7} size={20} className="text-orange-500" />
              ];

              return (
                <div 
                  key={step.num}
                  className="bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-orange-400 transition-all hover:shadow-md space-y-3 flex flex-col justify-between text-left relative group"
                >
                  <div className="space-y-3">
                    {/* Top Number Badge and Icon */}
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-orange-500/20">
                        {step.num}
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                        {stepIcons[idx]}
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {step.title}
                    </h3>
                  </div>

                  {/* Step Description */}
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DUAL VALUE PROPOSITION CARDS (PARA CLIENTES & PARA PROFISSIONAIS)      */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: PARA CLIENTES (Warm Tinted Container) */}
          <div 
            id="para-clientes"
            className="bg-[#fffcf7] rounded-3xl p-6 sm:p-8 border border-orange-200/70 shadow-sm space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              
              {/* Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black tracking-wider uppercase">
                {lt.dualCards.client.tag}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {lt.dualCards.client.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {lt.dualCards.client.subtitle}
                </p>
              </div>

              {/* Checkpoints */}
              <div className="space-y-2.5 pt-2">
                {lt.dualCards.client.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Embedded Floating Proposals Card */}
            <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-md space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900">
                  {lt.dualCards.client.floatingTitle}
                </span>
                <span className="text-[10px] font-bold text-orange-600">3 Propostas</span>
              </div>

              <div className="space-y-1.5 text-xs font-bold text-slate-800">
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span>{lt.dualCards.client.floatingCompanyA}</span>
                  <span className="text-emerald-600 font-black">2.450 €</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span>{lt.dualCards.client.floatingCompanyB}</span>
                  <span className="text-emerald-600 font-black">2.150 €</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span>{lt.dualCards.client.floatingCompanyC}</span>
                  <span className="text-emerald-600 font-black">2.780 €</span>
                </div>
              </div>

              <button
                onClick={handleOpenClientRequest}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 block w-full text-center pt-1 cursor-pointer"
              >
                {lt.dualCards.client.floatingFooter} →
              </button>
            </div>

            {/* CTA Button */}
            <div className="space-y-2">
              <button
                onClick={handleOpenClientRequest}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{lt.dualCards.client.cta}</span>
                <ArrowRight size={18} />
              </button>
              {onOpenClientPortal && (
                <button
                  onClick={onOpenClientPortal}
                  className="w-full py-2.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/70 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-amber-600" />
                  <span>Já pediu orçamento? Entrar no Portal do Cliente</span>
                </button>
              )}
            </div>

          </div>

          {/* Card 2: PARA PROFISSIONAIS (Cool Sky Tinted Container) */}
          <div 
            id="para-profissionais"
            className="bg-[#f6f9fe] rounded-3xl p-6 sm:p-8 border border-blue-200/70 shadow-sm space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              
              {/* Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black tracking-wider uppercase">
                {lt.dualCards.pro.tag}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                  {lt.dualCards.pro.title}
                </h3>
              </div>

              {/* Checkpoints */}
              <div className="space-y-2.5 pt-2">
                {lt.dualCards.pro.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Embedded Floating Dashboard Card */}
            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900">
                  {lt.dualCards.pro.floatingTitle}
                </span>
                <span className="text-[10px] font-black text-emerald-600">+24% este mês</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-500">Faturação</div>
                  <div className="text-xs font-black text-slate-900">{lt.dualCards.pro.floatingRevenue}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-500">Obras</div>
                  <div className="text-xs font-black text-slate-900">{lt.dualCards.pro.floatingActiveWorks}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-500">Pedidos</div>
                  <div className="text-xs font-black text-slate-900">{lt.dualCards.pro.floatingRequests}</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onStartFree}
              className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-slate-950/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>{lt.dualCards.pro.cta}</span>
              <ArrowRight size={18} />
            </button>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURES GRID: FUNCIONALIDADES COMPLETAS PARA O DIA A DIA             */}
      {/* ========================================================================= */}
      <section id="funcionalidades" className="py-16 lg:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-black text-slate-500 tracking-widest uppercase">
              {lt.features.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              {lt.features.title}
            </h2>
          </div>

          {/* 10 Features Cards (5 x 2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            
            {lt.features.items.map((feat, idx) => {
              const featIcons = [
                <FileText key={0} size={22} className="text-blue-500" />,
                <Hammer key={1} size={22} className="text-blue-600" />,
                <Users key={2} size={22} className="text-emerald-500" />,
                <Layers key={3} size={22} className="text-blue-500" />,
                <CreditCard key={4} size={22} className="text-orange-500" />,
                <BarChart3 key={5} size={22} className="text-purple-500" />,
                <Inbox key={6} size={22} className="text-rose-500" />,
                <Send key={7} size={22} className="text-orange-500" />,
                <FolderArchive key={8} size={22} className="text-blue-500" />,
                <Smartphone key={9} size={22} className="text-amber-500" />
              ];

              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-orange-500/50 shadow-sm hover:shadow-md transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {featIcons[idx]}
                    </div>
                    {feat.isNew && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-500 text-white uppercase tracking-wider">
                        NOVO
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. COMPARISON: ANTES ERA ASSIM... VS AGORA É ASSIM                        */}
      {/* ========================================================================= */}
      <section id="comparacao" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            
            {/* Left Box: ANTES ERA ASSIM... (Soft Rose background) */}
            <div className="lg:col-span-5 bg-rose-50/60 border border-rose-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-rose-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                {lt.comparison.beforeTitle}
              </h3>

              <div className="space-y-3">
                {lt.comparison.beforeItems.map((item, i) => {
                  const beforeIcons = [
                    <MessageCircle key={0} size={16} className="text-rose-500 shrink-0" />,
                    <FileSpreadsheet key={1} size={16} className="text-rose-500 shrink-0" />,
                    <Users key={2} size={16} className="text-rose-500 shrink-0" />,
                    <Folder key={3} size={16} className="text-rose-500 shrink-0" />,
                    <Clock key={4} size={16} className="text-rose-500 shrink-0" />
                  ];
                  return (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-700">
                      {beforeIcons[i]}
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Central Connector Arrow */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                <ArrowRight size={20} />
              </div>
            </div>

            {/* Right Box: AGORA É ASSIM, COM O ATRIOS BUILD (Soft Emerald background) */}
            <div className="lg:col-span-5 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {lt.comparison.afterTitle}
              </h3>

              <div className="space-y-3">
                {lt.comparison.afterItems.map((item, i) => {
                  const afterIcons = [
                    <Inbox key={0} size={16} className="text-emerald-600 shrink-0" />,
                    <FileCheck2 key={1} size={16} className="text-emerald-600 shrink-0" />,
                    <UserCheck key={2} size={16} className="text-emerald-600 shrink-0" />,
                    <TrendingUp key={3} size={16} className="text-emerald-600 shrink-0" />,
                    <CheckCircle2 key={4} size={16} className="text-emerald-600 shrink-0" />
                  ];
                  return (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-black text-slate-900">
                      {afterIcons[i]}
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 7. BOTTOM BANNER / FINAL CTA                                              */}
      {/* ========================================================================= */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#0b132b] rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-10 border border-slate-800 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                {lt.banner.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
                {lt.banner.subtitle}
              </p>
            </div>

            {/* Right Dual Action Buttons */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
              
              <button
                onClick={handleOpenClientRequest}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center"
              >
                <div>
                  <div>{lt.banner.ctaClient}</div>
                  <div className="text-[10px] font-normal opacity-90">{lt.banner.ctaClientSub}</div>
                </div>
              </button>

              <button
                onClick={onStartFree}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center"
              >
                <div>
                  <div>{lt.banner.ctaPro}</div>
                  <div className="text-[10px] font-normal text-slate-400">{lt.banner.ctaProSub}</div>
                </div>
              </button>

            </div>

          </div>

          {/* Bottom 4 Trust Pillars */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left relative z-10">
            
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-orange-400 shrink-0" />
              <div>
                <div className="text-xs font-black text-white leading-tight">{lt.banner.trust1Title}</div>
                <div className="text-[10px] text-slate-400 font-medium">{lt.banner.trust1Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Headphones size={20} className="text-orange-400 shrink-0" />
              <div>
                <div className="text-xs font-black text-white leading-tight">{lt.banner.trust2Title}</div>
                <div className="text-[10px] text-slate-400 font-medium">{lt.banner.trust2Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <RefreshCw size={20} className="text-orange-400 shrink-0" />
              <div>
                <div className="text-xs font-black text-white leading-tight">{lt.banner.trust3Title}</div>
                <div className="text-[10px] text-slate-400 font-medium">{lt.banner.trust3Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <TrendingUp size={20} className="text-orange-400 shrink-0" />
              <div>
                <div className="text-xs font-black text-white leading-tight">{lt.banner.trust4Title}</div>
                <div className="text-[10px] text-slate-400 font-medium">{lt.banner.trust4Sub}</div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-100 pt-14 pb-8 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
            
            {/* Column 1 & 2: Brand Information */}
            <div className="lg:col-span-2 space-y-4">
              <div 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="cursor-pointer group inline-flex"
              >
                <AtriosLogo size={42} showText={true} />
              </div>

              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                A plataforma completa para gestão de orçamentos, ordens de serviço e controlo financeiro de obras.
              </p>

              <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Dados seguros e encriptados</span>
              </div>
            </div>

            {/* Column 3: Produto */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Produto
              </h4>
              <ul className="space-y-2.5 font-bold">
                <li>
                  <button 
                    onClick={() => scrollToSection('funcionalidades')} 
                    className="hover:text-orange-500 transition-colors text-left"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('como-funciona')} 
                    className="hover:text-orange-500 transition-colors text-left"
                  >
                    Como Funciona
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('funcionalidades')} 
                    className="hover:text-orange-500 transition-colors text-left"
                  >
                    Orçamentos PDF
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onStartFree} 
                    className="text-orange-600 hover:text-orange-700 font-black transition-colors text-left flex items-center gap-1"
                  >
                    <span>Criar Conta Grátis</span>
                    <ArrowRight size={12} />
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Empresa */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Empresa
              </h4>
              <ul className="space-y-2.5 font-medium">
                <li className="font-bold text-slate-800">
                  Atrios Software
                </li>
                <li>
                  <a 
                    href="mailto:software.atrios@gmail.com" 
                    className="hover:text-orange-500 transition-colors flex items-center gap-1.5 font-bold"
                  >
                    <Mail size={13} className="text-orange-500" />
                    <span>software.atrios@gmail.com</span>
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => onOpenLegal('privacy')} 
                    className="hover:text-orange-500 transition-colors text-left"
                  >
                    Privacidade
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onOpenLegal('terms')} 
                    className="hover:text-orange-500 transition-colors text-left"
                  >
                    Termos de Uso
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Suporte */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Suporte
              </h4>
              <ul className="space-y-2.5 font-bold">
                <li>
                  <a 
                    href="mailto:software.atrios@gmail.com?subject=Ajuda%20e%20Dúvidas%20-%20Atrios%20Build" 
                    className="hover:text-orange-500 transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle size={13} className="text-slate-400" />
                    <span>Ajuda e Dúvidas</span>
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => setShowVideoModal(true)} 
                    className="hover:text-orange-500 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Play size={13} className="text-orange-500" />
                    <span>Ver Demonstração</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onDownloadApp} 
                    className="hover:text-orange-500 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Download size={13} className="text-emerald-600" />
                    <span>Instalar App Mobile</span>
                  </button>
                </li>
                {onOpenClientPortal && (
                  <li>
                    <button 
                      onClick={onOpenClientPortal} 
                      className="hover:text-amber-600 text-amber-700 font-black transition-colors text-left flex items-center gap-1.5"
                    >
                      <ShieldCheck size={13} className="text-amber-600" />
                      <span>Portal do Cliente (Login)</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Bottom Copyright and Legal Notice */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-medium">
            <div>
              © {new Date().getFullYear()} <strong className="text-slate-700">ÁTRIOSBUILD</strong> • Todos os direitos reservados.
            </div>
            <div className="text-[11px]">
              Desenvolvido com excelência para profissionais da construção civil.
            </div>
          </div>

        </div>
      </footer>

      {/* Client Request Modal Popup */}
      {showClientRequestModal && (
        <ClientRequestModal
          isOpen={showClientRequestModal}
          onClose={() => setShowClientRequestModal(false)}
          locale={locale}
          onOpenPortal={() => {
            setShowClientRequestModal(false);
            if (onOpenClientPortal) onOpenClientPortal();
          }}
        />
      )}

      {/* Full-Screen Video Modal Popup */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl">
            
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-sm font-black text-white">{heroVideo.title || 'Demonstração Atrios Build'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {heroVideo.type === 'youtube' && heroVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${heroVideo.youtubeId}?autoplay=1&controls=1`}
                  title="Atrios Build Full Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : heroVideo.videoUrl ? (
                <video
                  src={heroVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4 p-8 text-center bg-slate-950">
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Video size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">Demonstração Interativa do Atrios Build</h4>
                    <p className="text-xs text-slate-400 max-w-md">
                      Pode configurar um vídeo próprio no Painel Master ou experimentar agora a plataforma criando a sua conta grátis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowVideoModal(false); onStartFree(); }}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30"
                  >
                    EXPERIMENTAR GRÁTIS AGORA
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
