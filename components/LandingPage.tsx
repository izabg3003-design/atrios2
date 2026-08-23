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
  Shield
} from 'lucide-react';
import { Translation, Locale } from '../translations';
import { CurrencyCode, CURRENCIES, HeroVideoConfig, ActionVideoConfig } from '../types';
import { landingTranslations } from './landingTranslations';
import { getStoredHeroVideoConfig, getStoredActionVideoConfig, extractYouTubeId } from '../services/storage';
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
  onOpenLegal,
  onOpenClientPortal,
  onOpenIntroBanners
}) => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showClientRequestModal, setShowClientRequestModal] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HeroVideoConfig>(getStoredHeroVideoConfig);
  const [actionVideo, setActionVideo] = useState<ActionVideoConfig>(getStoredActionVideoConfig);
  const [demoModalMode, setDemoModalMode] = useState<'interactive' | 'video'>('interactive');
  const [activeHeroTab, setActiveHeroTab] = useState<'video' | 'live'>('video');

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 selection:bg-[#ff5722] selection:text-white font-sans antialiased">
      
      {/* 1. TOP NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-2 sm:py-3.5' : 'bg-white/95 backdrop-blur-sm py-3 sm:py-4 border-b border-slate-100/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer shrink-0" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 rounded-xl bg-[#ff5722] text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                <Construction className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                  ÁTRIOS<span className="text-[#ff5722]">BUILD</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  SOFTWARE PARA CONSTRUÇÃO CIVIL
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-[13px] font-bold text-slate-700">
              <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-[#ff5722] transition-colors">
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('como-funciona')} className="hover:text-[#ff5722] transition-colors">
                Como funciona
              </button>
              <button onClick={() => scrollToSection('para-clientes')} className="hover:text-[#ff5722] transition-colors">
                Para Clientes
              </button>
              <button onClick={() => scrollToSection('para-profissionais')} className="hover:text-[#ff5722] transition-colors">
                Para Profissionais
              </button>
            </nav>

            {/* Language Selector + Auth Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Language Pill */}
              <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/80 rounded-xl px-2 py-1.5 shadow-xs">
                <span className="text-xs">🇵🇹</span>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                  title="Idioma / Language"
                >
                  <option value="pt-PT" className="text-slate-900 font-bold">PT</option>
                  <option value="pt-BR" className="text-slate-900 font-bold">BR</option>
                  <option value="en-US" className="text-slate-900 font-bold">EN</option>
                  <option value="es-ES" className="text-slate-900 font-bold">ES</option>
                  <option value="fr-FR" className="text-slate-900 font-bold">FR</option>
                </select>
              </div>

              {/* Login Button */}
              <button
                onClick={onLogin}
                className="px-2.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-800 hover:text-[#ff5722] transition-colors shrink-0"
              >
                ENTRAR
              </button>

              {/* Create Free Account CTA */}
              <button
                onClick={onStartFree}
                className="px-3.5 sm:px-5 py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <span className="hidden sm:inline">CRIAR CONTA GRÁTIS</span>
                <span className="sm:hidden">CRIAR CONTA</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
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
              className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-700">
                <button
                  onClick={() => { scrollToSection('funcionalidades'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors"
                >
                  Funcionalidades
                </button>
                <button
                  onClick={() => { scrollToSection('como-funciona'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors"
                >
                  Como funciona
                </button>
                <button
                  onClick={() => { scrollToSection('para-clientes'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors"
                >
                  Para Clientes
                </button>
                <button
                  onClick={() => { scrollToSection('para-profissionais'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-xl hover:bg-orange-50 hover:text-[#ff5722] transition-colors"
                >
                  Para Profissionais
                </button>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  {onOpenClientPortal && (
                    <button
                      onClick={() => { onOpenClientPortal(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-[#ff5722] border border-orange-200 rounded-xl font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
                    >
                      <FileText size={14} />
                      Portal do Cliente (Ver Orçamentos)
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider text-center"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => { onStartFree(); setMobileMenuOpen(false); }}
                      className="flex-1 py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md text-center"
                    >
                      Criar Conta Grátis
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Presentation Banner Pill */}
          <div className="mb-6 sm:mb-8 text-left">
            <button
              onClick={() => {
                if (onOpenIntroBanners) {
                  onOpenIntroBanners();
                } else {
                  setShowDemoModal(true);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/80 text-[#d9531e] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs group"
            >
              <Sparkles size={14} className="text-[#ff5722]" />
              <span>VER BANNERS DE APRESENTAÇÃO DAS FUNÇÕES</span>
              <ChevronRight size={14} className="text-[#ff5722] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Subtitle, Large CTAs */}
            <div className="lg:col-span-6 text-left space-y-6">
              
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-950 leading-[1.12]">
                Encontre clientes.<br />
                Faça orçamentos.<br />
                Gerencie as suas obras.<br />
                <span className="text-[#ff5722]">Tudo num só lugar com o Atrios Build.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                Receba pedidos de orçamento de clientes, envie propostas profissionais e tenha todas as ferramentas para gerir o seu negócio e as suas obras.
              </p>

              {/* Large Dual Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-xl">
                
                {/* Orange Column: Sou Cliente / Pedir Orçamento + Login Portal do Cliente */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setShowClientRequestModal(true)}
                    className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-orange-500/25 active:scale-98 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-black uppercase tracking-wide leading-tight">
                        PEDIR ORÇAMENTO GRÁTIS
                      </div>
                      <div className="text-xs text-white/90 font-medium mt-0.5">
                        Sou cliente e preciso de uma obra
                      </div>
                    </div>
                  </button>

                  {onOpenClientPortal && (
                    <button
                      onClick={onOpenClientPortal}
                      className="w-full py-2 px-3 bg-orange-50 hover:bg-orange-100/90 border border-orange-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                      title="Aceder ao portal do cliente para acompanhar pedidos de obra"
                    >
                      <div className="flex items-center gap-2">
                        <Shield size={13} className="text-[#ff5722]" />
                        <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-950">
                          Já pediu orçamento? <strong className="text-[#d9531e]">Login Portal do Cliente</strong>
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-[#ff5722] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Dark Column: Sou Profissional */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={onStartFree}
                    className="w-full bg-[#0b1329] hover:bg-[#15203f] text-white p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 shadow-lg active:scale-98 transition-all text-left group cursor-pointer border border-slate-800"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <HardHat className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-black uppercase tracking-wide leading-tight text-white">
                        SOU PROFISSIONAL
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        Quero receber pedidos e gerir obras
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onLogin}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200/90 border border-slate-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                    title="Entrar na conta de profissional / empresa"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-slate-600" />
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-950">
                        Já tem conta? <strong className="text-slate-900">Login Profissional</strong>
                      </span>
                    </div>
                    <ChevronRight size={13} className="text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Interactive Video Player Mockup */}
            <div className="lg:col-span-6 relative">
              
              {/* Handwritten style note on top */}
              <div className="absolute -top-7 right-6 hidden sm:flex items-center gap-2 z-20 pointer-events-none">
                <span className="font-serif italic text-sm font-bold text-[#e64a19] tracking-wide">
                  Da solicitação à gestão completa
                </span>
                <span className="text-[#e64a19] text-xl font-bold rotate-45">↘</span>
              </div>

              {/* Main Player Frame */}
              <div className="bg-[#0b1329] rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-800 text-white overflow-hidden relative">
                
                {/* Top Player Header Tabs */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveHeroTab('video')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${activeHeroTab === 'video' ? 'bg-[#ff5722] text-white shadow-md' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
                    >
                      <Play size={12} className="fill-current" /> VÍDEO HERO
                    </button>
                    <button
                      onClick={() => {
                        setActiveHeroTab('live');
                        setShowDemoModal(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${activeHeroTab === 'live' ? 'bg-[#ff5722] text-white shadow-md' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
                    >
                      <ClipboardList size={12} /> PAINEL EM DIRETO
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>HD 60FPS</span>
                    <button onClick={() => setShowDemoModal(true)} className="p-1 hover:text-white text-slate-400">
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Player Inner Screen */}
                <div 
                  onClick={() => setShowDemoModal(true)}
                  className="relative aspect-video rounded-2xl overflow-hidden bg-[#070d1e] border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center cursor-pointer group hover:border-orange-500/50 transition-all"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                >
                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={11} /> SOFTWARE EM AÇÃO • 60 SEGUNDOS
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md">
                      01:45 MIN
                    </span>
                  </div>

                  {/* Big Orange Center Play Button */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff5722] hover:bg-[#e64a19] text-white flex items-center justify-center shadow-2xl shadow-orange-500/50 group-hover:scale-110 active:scale-95 transition-all mb-3">
                    <Play size={28} className="fill-white ml-1" />
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                    VER DEMONSTRAÇÃO COMPLETA
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Clique para assistir como funciona o Atrios Build
                  </p>

                  {/* Bottom Steps Indicator */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-800/80 pt-2.5">
                    <span className="text-orange-400 flex items-center gap-1">
                      <span className="font-black">1.</span> Pedidos de Obra
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-black text-slate-500">2.</span> Propostas Rápidas
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-black text-slate-500">3.</span> Gestão Total
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Trust Bar Below Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 sm:pt-16 max-w-4xl text-left">
            
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Seguro e confiável</span>
                <span className="text-[11px] text-slate-500 font-medium">Os seus dados protegidos</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Profissionais verificados</span>
                <span className="text-[11px] text-slate-500 font-medium">Mais segurança para si</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Acesso em qualquer lugar</span>
                <span className="text-[11px] text-slate-500 font-medium">Web e App mobile</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SECTION "COMO FUNCIONA PARA TODOS" (7 STEPS) */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-[#ff5722] font-black text-xs uppercase tracking-[0.25em] block mb-2.5">
            DO PRIMEIRO CONTACTO AO RESULTADO DA OBRA
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 mb-14">
            Como funciona para todos
          </h2>

          {/* 7 Workflow Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5 items-stretch text-left">
            
            {/* Step 01 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center">
                    01
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-2">
                  Cliente solicita um orçamento
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  O cliente descreve o que precisa e envia o pedido.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center">
                    02
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-2">
                  Profissional recebe o pedido
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Empresas e profissionais da plataforma são notificados.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center">
                    03
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-2">
                  Profissional prepara a proposta
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Analisa os detalhes da obra e prepara o orçamento.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center">
                    04
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                    <Send size={16} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-2">
                  Profissional envia a proposta
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  O cliente recebe a proposta e pode tirar dúvidas.
                </p>
              </div>
            </div>

            {/* Step 05 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center">
                    05
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-2">
                  Cliente analisa e escolhe
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Compara as propostas e escolhe o profissional ideal.
                </p>
              </div>
            </div>

            {/* Step 06 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center">
                    06
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                    <HardHat size={16} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-2">
                  Obra é criada no Atrios Build
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  O profissional inicia a obra e organiza tudo na plataforma.
                </p>
              </div>
            </div>

            {/* Step 07 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#ff5722] text-white text-xs font-black flex items-center justify-center">
                    07
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-2">
                  Gere e acompanhe os resultados
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Controle custos, pagamentos e veja os resultados.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. SECTION "PARA CLIENTES" VS "PARA PROFISSIONAIS" */}
      <section className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Card: PARA CLIENTES */}
            <div id="para-clientes" className="bg-white rounded-3xl p-6 sm:p-10 border border-orange-100/90 shadow-sm flex flex-col justify-between text-left relative">
              
              <div>
                {/* Tag */}
                <div className="inline-block px-3 py-1 rounded-lg bg-orange-100 text-[#d9531e] text-xs font-black uppercase tracking-wider mb-4">
                  PARA CLIENTES
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
                  Precisa de uma obra?
                </h3>
                <p className="text-slate-600 text-sm font-medium mb-6">
                  Encontre profissionais qualificados na nossa plataforma.
                </p>

                {/* Bullets */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Faça o seu pedido de orçamento grátis',
                    'Explique o serviço que precisa',
                    'Indique a localização e detalhes da obra',
                    'Receba propostas de profissionais verificados',
                    'Acompanhe os seus pedidos em tempo real',
                    'Escolha a melhor proposta para o seu projeto'
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#ff5722] text-white flex items-center justify-center shrink-0">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Mini Preview Box */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 mb-6 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="text-xs font-black text-slate-800">Receba propostas</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ff5722] text-[10px] font-black">
                      3 Propostas
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-100">
                      <span className="font-bold text-slate-700">Empresa A — 2.450 €</span>
                      <span className="font-black text-emerald-600">2.450 €</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-100">
                      <span className="font-bold text-slate-700">Empresa B — 2.150 €</span>
                      <span className="font-black text-emerald-600">2.150 €</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-white border border-slate-100">
                      <span className="font-bold text-slate-700">Empresa C — 2.780 €</span>
                      <span className="font-black text-emerald-600">2.780 €</span>
                    </div>
                  </div>
                  <div className="pt-1 text-center">
                    <button 
                      onClick={() => setShowClientRequestModal(true)}
                      className="text-[11px] font-black text-[#ff5722] hover:underline uppercase tracking-wider"
                    >
                      VER TODAS AS PROPOSTAS →
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => setShowClientRequestModal(true)}
                  className="w-full py-4 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
                >
                  <span>PEDIR ORÇAMENTO GRÁTIS</span>
                  <ArrowRight size={16} />
                </button>

                {onOpenClientPortal && (
                  <button
                    onClick={onOpenClientPortal}
                    className="w-full py-2.5 text-center text-xs font-bold text-slate-600 hover:text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shield size={14} className="text-[#ff5722]" />
                    <span>Já pediu orçamento? Entrar no Portal do Cliente</span>
                  </button>
                )}
              </div>

            </div>

            {/* Right Card: PARA PROFISSIONAIS */}
            <div id="para-profissionais" className="bg-white rounded-3xl p-6 sm:p-10 border border-blue-100/90 shadow-sm flex flex-col justify-between text-left relative">
              
              <div>
                {/* Tag */}
                <div className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider mb-4">
                  PARA PROFISSIONAIS
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
                  Transforme pedidos de orçamento em novas oportunidades.
                </h3>
                <p className="text-slate-600 text-sm font-medium mb-6">
                  Receba pedidos, feche obras e gerencie tudo no mesmo lugar.
                </p>

                {/* Bullets */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Receba novos pedidos de orçamento',
                    'Consulte detalhes e localização da obra',
                    'Analise e prepare o seu orçamento',
                    'Envie propostas de forma profissional',
                    'Organize obras, clientes e documentos',
                    'Acompanhe pagamentos e resultados',
                    'Tudo numa única plataforma'
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Mini Preview Box */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 mb-6 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="text-xs font-black text-slate-800">Resumo do mês</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                      +24% este mês
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Faturação</span>
                      <span className="text-sm font-black text-slate-900">18.650 €</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Obras</span>
                      <span className="text-xs font-black text-slate-900">8 Obras ativas</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Pedidos</span>
                      <span className="text-xs font-black text-slate-900">12 Novos pedidos</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={onStartFree}
                  className="w-full py-4 bg-[#0b1329] hover:bg-[#15203f] text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
                >
                  <span>QUERO RECEBER PEDIDOS</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. SECTION "FUNCIONALIDADES COMPLETAS PARA O DIA A DIA" */}
      <section id="funcionalidades" className="py-20 sm:py-28 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-slate-400 font-black text-xs uppercase tracking-[0.25em] block mb-2.5">
            TUDO O QUE PRECISA PARA GERIR O SEU NEGÓCIO
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 mb-14">
            Funcionalidades completas para o dia a dia
          </h2>

          {/* 10 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch text-left">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <FileText size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Orçamentos
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Crie orçamentos e propostas profissionais em minutos.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Hammer size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Obras
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Acompanhe o progresso de cada obra em tempo real.
                </p>
              </div>
            </div>

            {/* Card 3 (Highlighted) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-orange-400 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Users size={20} />
                </div>
                <h3 className="text-sm font-black text-[#ff5722] mb-1.5">
                  Clientes
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Organize clientes e fornecedores num só lugar.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Layers size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Serviços
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Gerencie serviços, materiais e mão de obra.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Pagamentos
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Controle recebimentos e pagamentos.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Relatórios
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Relatórios e indicadores para melhores decisões.
                </p>
              </div>
            </div>

            {/* Card 7 (New) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between relative">
              <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#ff5722] text-white text-[9px] font-black uppercase">
                NOVO
              </span>
              <div>
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <Inbox size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Pedidos de orçamento
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Receba solicitações de clientes diretamente na plataforma.
                </p>
              </div>
            </div>

            {/* Card 8 (New) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between relative">
              <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#ff5722] text-white text-[9px] font-black uppercase">
                NOVO
              </span>
              <div>
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <Send size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Propostas
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Envie propostas e acompanhe o interesse do cliente.
                </p>
              </div>
            </div>

            {/* Card 9 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Folder size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  Documentos
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Guarde e acesse documentos da obra com segurança.
                </p>
              </div>
            </div>

            {/* Card 10 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  App mobile
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Acesse de qualquer lugar pelo telemóvel.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. SECTION "ANTES ERA ASSIM..." VS "AGORA É ASSIM..." */}
      <section className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Comparison Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Box (Antes) */}
              <div className="lg:col-span-5 bg-[#fff5f5] rounded-2xl p-6 sm:p-8 border border-rose-100 text-left">
                <div className="flex items-center gap-2 mb-6 text-rose-600 font-black text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>ANTES ERA ASSIM...</span>
                </div>

                <ul className="space-y-4">
                  {[
                    'Pedidos espalhados pelo WhatsApp e chamadas',
                    'Orçamentos em papel ou planilhas',
                    'Informações desorganizadas',
                    'Dificuldade para acompanhar clientes',
                    'Pouco controle dos resultados'
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-800 font-bold text-xs sm:text-sm">
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <X size={12} strokeWidth={3} />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Middle Arrow */}
              <div className="lg:col-span-2 flex items-center justify-center py-2 lg:py-0">
                <div className="w-12 h-12 rounded-full bg-[#0b1329] text-white flex items-center justify-center shadow-md">
                  <ArrowRight size={20} className="rotate-90 lg:rotate-0" />
                </div>
              </div>

              {/* Right Box (Depois) */}
              <div className="lg:col-span-5 bg-[#f0fdf4] rounded-2xl p-6 sm:p-8 border border-emerald-100 text-left">
                <div className="flex items-center gap-2 mb-6 text-emerald-600 font-black text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>AGORA É ASSIM, COM O ATRIOS BUILD</span>
                </div>

                <ul className="space-y-4">
                  {[
                    'Pedidos organizados num só lugar',
                    'Propostas profissionais e centralizadas',
                    'Clientes e obras organizados',
                    'Mais controle de custos e pagamentos',
                    'Mais tempo e mais lucro para o seu negócio'
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-800 font-bold text-xs sm:text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Dark CTA Banner */}
          <div className="bg-[#0b1329] rounded-3xl p-8 sm:p-12 lg:p-14 text-white shadow-2xl border border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Copy */}
              <div className="lg:col-span-7 text-left space-y-6">
                <h3 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight leading-tight">
                  A plataforma completa para profissionais da construção civil.
                </h3>
                <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl">
                  Mais organização, mais oportunidades e mais resultados. Comece agora com o Atrios Build.
                </p>

                {/* 4 Trust points in row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={18} className="text-[#ff5722] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">Segurança total</span>
                      <span className="text-[10px] text-slate-400">Seus dados protegidos</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Headphones size={18} className="text-[#ff5722] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">Suporte dedicado</span>
                      <span className="text-[10px] text-slate-400">Estamos aqui para ajudar</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <RefreshCw size={18} className="text-[#ff5722] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">Atualizações constantes</span>
                      <span className="text-[10px] text-slate-400">Sempre melhor para si</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <TrendingUp size={18} className="text-[#ff5722] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">+ Profissionais</span>
                      <span className="text-[10px] text-slate-400">Plataforma em crescimento</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right CTA Buttons */}
              <div className="lg:col-span-5 flex flex-col gap-3.5">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setShowClientRequestModal(true)}
                    className="w-full p-4 sm:p-5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-center shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="text-sm sm:text-base font-black uppercase tracking-wide">
                      PEDIR ORÇAMENTO GRÁTIS
                    </div>
                    <div className="text-xs text-white/90 font-medium mt-0.5">
                      SOU CLIENTE E PRECISO DE UMA OBRA
                    </div>
                  </button>

                  {onOpenClientPortal && (
                    <button
                      onClick={onOpenClientPortal}
                      className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
                      title="Aceder ao portal do cliente"
                    >
                      <div className="flex items-center gap-2">
                        <Shield size={13} className="text-orange-400" />
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white">
                          Já pediu orçamento? <strong className="text-orange-400">Login Portal do Cliente</strong>
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={onStartFree}
                    className="w-full p-4 sm:p-5 bg-[#121c38] hover:bg-[#1a2850] text-white rounded-2xl font-black text-center border border-slate-700 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="text-sm sm:text-base font-black uppercase tracking-wide text-white">
                      QUERO SER PROFISSIONAL
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      QUERO RECEBER PEDIDOS E GERIR OBRAS
                    </div>
                  </button>

                  <button
                    onClick={onLogin}
                    className="w-full py-2 px-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
                    title="Entrar na conta de profissional"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
                        Já tem conta? <strong className="text-amber-400">Login Profissional</strong>
                      </span>
                    </div>
                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-14 bg-white border-t border-slate-100 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#ff5722] text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                  <Construction className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    ÁTRIOS<span className="text-[#ff5722]">BUILD</span>
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    SOFTWARE PARA CONSTRUÇÃO CIVIL
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                A plataforma completa para gestão de orçamentos, ordens de serviço e controlo financeiro de obras.
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pt-1">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Dados seguros e encriptados</span>
              </div>
            </div>

            {/* Produto Column */}
            <div className="md:col-span-2 text-left space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                PRODUTO
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><button onClick={() => scrollToSection('funcionalidades')} className="hover:text-slate-900">Funcionalidades</button></li>
                <li><button onClick={() => scrollToSection('como-funciona')} className="hover:text-slate-900">Como Funciona</button></li>
                <li><button onClick={onStartFree} className="hover:text-slate-900">Orçamentos PDF</button></li>
                <li><button onClick={onStartFree} className="hover:text-[#ff5722] font-black text-[#ff5722]">Criar Conta Grátis →</button></li>
              </ul>
            </div>

            {/* Empresa Column */}
            <div className="md:col-span-3 text-left space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                EMPRESA
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><span className="text-slate-700 font-bold">Atrios Software</span></li>
                <li className="flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  <a href="mailto:software.atrios@gmail.com" className="hover:text-slate-900">software.atrios@gmail.com</a>
                </li>
                <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-slate-900">Privacidade</button></li>
                <li><button onClick={() => onOpenLegal('terms')} className="hover:text-slate-900">Termos de Uso</button></li>
              </ul>
            </div>

            {/* Suporte Column */}
            <div className="md:col-span-2 text-left space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                SUPORTE
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li className="flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-slate-400" />
                  <a href="mailto:software.atrios@gmail.com" className="hover:text-slate-900">Ajuda e Dúvidas</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Play size={13} className="text-slate-400" />
                  <button onClick={() => setShowDemoModal(true)} className="hover:text-slate-900">Ver Demonstração</button>
                </li>
                <li className="flex items-center gap-1.5">
                  <Download size={13} className="text-emerald-600" />
                  <button onClick={onDownloadApp} className="hover:text-emerald-600 font-bold text-emerald-600">Instalar App Mobile</button>
                </li>
                {onOpenClientPortal && (
                  <li className="flex items-center gap-1.5 pt-1">
                    <Shield size={13} className="text-[#ff5722]" />
                    <button onClick={onOpenClientPortal} className="hover:text-[#ff5722] font-black text-[#ff5722]">Portal do Cliente (Login)</button>
                  </li>
                )}
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
            <p>© {new Date().getFullYear()} ÁTRIOSBUILD • Todos os direitos reservados.</p>
            <p>Desenvolvido com excelência para profissionais da construção civil.</p>
          </div>

        </div>
      </footer>

      {/* 8. MODAL DE DEMONSTRAÇÃO INTERATIVA / VÍDEO (60 SEGUNDOS) */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-left overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ff5722] text-white flex items-center justify-center font-black">
                    <Play size={18} className="fill-white ml-0.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      Demonstração Átrios Build
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400">
                      Veja em ação em 60 segundos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
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
                      { num: '1', label: '1. Pedido' },
                      { num: '2', label: '2. Itens' },
                      { num: '3', label: '3. Total' },
                      { num: '4', label: '4. PDF Pronto' }
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDemoStep(idx)}
                        className={`py-2 px-1 rounded-xl text-center transition-all ${demoStep === idx ? 'bg-[#ff5722] text-white font-black shadow-md' : 'bg-slate-100 text-slate-500 font-bold hover:bg-slate-200'}`}
                      >
                        <span className="text-xs block">{s.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Demo Content Step Display */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6 min-h-[200px] flex flex-col justify-center">
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
                        <div className="bg-orange-100/80 p-3 rounded-xl text-orange-950 font-black text-xs flex justify-between">
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

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setDemoStep(prev => (prev - 1 + 4) % 4)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowDemoModal(false);
                      onStartFree();
                    }}
                    className="px-6 py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Começar Agora Grátis
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
