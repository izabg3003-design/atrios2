import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Zap, 
  Bell, 
  ShieldCheck, 
  Share2, 
  PlusSquare, 
  ArrowRight, 
  CheckCircle2, 
  Laptop, 
  Apple, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AtriosLogo } from './AtriosLogo';

interface InstallPWAProps {
  view: string;
}

export const InstallPWA: React.FC<InstallPWAProps> = ({ view }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [stepNotice, setStepNotice] = useState<string | null>(null);

  useEffect(() => {
    // Detectar ambiente e dispositivo
    const ua = navigator.userAgent || '';
    const checkIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const checkAndroid = /Android/i.test(ua);
    const checkDesktop = !checkIOS && !checkAndroid;
    const checkIframe = window.self !== window.top;

    setIsIOS(checkIOS);
    setIsAndroid(checkAndroid);
    setIsDesktop(checkDesktop);
    setIsInIframe(checkIframe);

    if (checkIOS) setActiveTab('ios');
    else if (checkAndroid) setActiveTab('android');
    else setActiveTab('desktop');

    // Verificar se já está em modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Registrar Service Worker de forma robusta
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').then(registration => {
          console.log('[InstallPWA] SW registrado com sucesso:', registration.scope);
        }).catch(err => {
          console.log('[InstallPWA] SW registo info:', err);
        });
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // Handler para capturar o evento de instalação PWA do navegador
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      if (typeof (window as any).onPwaPromptAvailable === 'function') {
        (window as any).onPwaPromptAvailable(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    // Ouvir evento customizado para abrir a janela a qualquer momento
    const handleOpenModal = () => {
      setIsVisible(true);
      setInstallSuccess(false);
      setStepNotice(null);
    };
    window.addEventListener('open-install-pwa-modal', handleOpenModal);

    // Mostrar modal automaticamente após 3 segundos na primeira visita se não for standalone
    const dismissedSession = sessionStorage.getItem('atrios_pwa_dismissed');
    let autoTimer: any = null;
    if (!isStandalone && !dismissedSession) {
      autoTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    const installedHandler = async () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      setIsInstalled(true);
      
      const alreadyInstalledNotified = localStorage.getItem('atrios_installed_notified');
      if (alreadyInstalledNotified === 'true') return;
      localStorage.setItem('atrios_installed_notified', 'true');
      
      if ('Notification' in window) {
        try {
          let permission = Notification.permission;
          if (permission === 'default') {
            permission = await Notification.requestPermission();
          }
          
          if (permission === 'granted') {
            const options = {
              body: "O ÁTRIOS BUILD foi instalado com sucesso no seu dispositivo! 📱✨",
              icon: '/atrios-logo.svg',
              badge: '/atrios-logo.svg',
              vibrate: [200, 100, 200, 100, 300],
              tag: 'atrios-installed-alert',
              renotify: true
            };
            
            if ('serviceWorker' in navigator) {
              const reg = await navigator.serviceWorker.ready;
              reg.showNotification("Instalação Concluída! 🎉", options);
            } else {
              new Notification("Instalação Concluída! 🎉", options);
            }
          }
        } catch (e) {
          console.error('[PWA Install] Notification trigger error', e);
        }
      }
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      if (autoTimer) clearTimeout(autoTimer);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('open-install-pwa-modal', handleOpenModal);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [view]);

  const handleInstallClick = async () => {
    const activePrompt = deferredPrompt || (window as any).deferredPrompt;

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        console.log(`[InstallPWA] Resposta da instalação: ${outcome}`);
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
        if (outcome === 'accepted') {
          setInstallSuccess(true);
          setTimeout(() => {
            setIsVisible(false);
            setInstallSuccess(false);
          }, 2000);
        }
      } catch (err) {
        console.error("[InstallPWA] Erro ao invocar prompt nativo:", err);
        setStepNotice("Siga os passos abaixo no menu do seu navegador para adicionar o app.");
      }
    } else {
      // Se não há prompt nativo disponível imediatamente (iOS, iframe ou já disparado)
      if (isInIframe) {
        try {
          window.open(window.location.href, '_blank');
        } catch (e) {}
      }
      setStepNotice("Siga os passos ilustrados abaixo para adicionar o ÁTRIOS BUILD ao seu ecrã principal.");
    }
  };

  const handleOpenInNewWindow = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch (e) {
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('atrios_pwa_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.25 }}
            className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-amber-950/40 relative overflow-hidden text-white flex flex-col max-h-[92vh]"
          >
            {/* Ambient Brand Glow Effects */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-orange-600/15 blur-[100px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={handleDismiss}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
              title="Fechar"
            >
              <X size={18} />
            </button>

            {/* Modal Header with Official Metallic Logo */}
            <div className="flex flex-col items-center text-center mb-4 shrink-0">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="p-3 bg-gradient-to-b from-slate-800 to-slate-950 rounded-3xl border border-amber-500/40 shadow-xl shadow-amber-500/15 flex items-center justify-center">
                  <AtriosLogo size={52} variant="metallic" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Download size={13} className="text-slate-950 font-black stroke-[3]" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-1.5">
                <Sparkles size={12} className="text-amber-400" />
                <span>Aplicação Oficial ÁTRIOS BUILD</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Instalar Aplicação no Dispositivo
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm leading-relaxed">
                Adicione o Átrios Build diretamente ao ecrã inicial do seu telemóvel ou computador para acesso instantâneo.
              </p>
            </div>

            {/* Device Selector Tabs */}
            <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-white/10 mb-4 shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab('android'); setStepNotice(null); }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone size={14} /> Android
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('ios'); setStepNotice(null); }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Apple size={14} /> iPhone / iPad
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('desktop'); setStepNotice(null); }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Laptop size={14} /> Computador
              </button>
            </div>

            {/* Body Content - Scrollable */}
            <div className="overflow-y-auto no-scrollbar flex-1 mb-4 space-y-3.5 pr-0.5">
              {installSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-2 animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={26} className="font-bold" />
                  </div>
                  <h4 className="text-sm font-black text-white">Instalação Concluída com Sucesso!</h4>
                  <p className="text-xs text-emerald-200/90">O Átrios Build já está pronto no seu ecrã principal.</p>
                </div>
              ) : activeTab === 'ios' ? (
                /* iOS Specific Guide */
                <div className="bg-slate-950/60 border border-amber-500/30 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <Apple size={15} />
                    <span>Como instalar no Safari (iPhone / iPad):</span>
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-[11px]">1</div>
                      <p className="leading-snug">No navegador <strong className="text-white font-bold">Safari</strong>, toque no botão de <strong className="text-amber-400 font-bold">Partilhar</strong> <Share2 size={13} className="inline text-amber-400 mx-0.5" /> na barra inferior.</p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-[11px]">2</div>
                      <p className="leading-snug">Deslize para baixo no menu e toque em <strong className="text-white font-bold">"Adicionar ao Ecrã Principal"</strong> <PlusSquare size={13} className="inline text-emerald-400 mx-0.5" />.</p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-[11px]">3</div>
                      <p className="leading-snug">Toque em <strong className="text-amber-400 font-bold">"Adicionar"</strong> no canto superior direito para fixar o ícone no seu ecrã.</p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'android' ? (
                /* Android Guide */
                <div className="bg-slate-950/60 border border-amber-500/30 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <Smartphone size={15} />
                    <span>Como instalar no Chrome / Android:</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-[11px]">1</div>
                      <p className="leading-snug">Toque no botão <strong className="text-amber-400 font-bold">"Instalar no Dispositivo"</strong> abaixo.</p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-[11px]">2</div>
                      <p className="leading-snug">Caso o prompt não abra automaticamente, toque nos <strong className="text-white font-bold">3 pontos (⋮)</strong> no topo do Chrome e selecione <strong className="text-white font-bold">"Instalar aplicação"</strong> ou <strong className="text-white font-bold">"Adicionar ao ecrã principal"</strong>.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Guide */
                <div className="bg-slate-950/60 border border-amber-500/30 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <Laptop size={15} />
                    <span>Instalação no Computador (Chrome / Edge):</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-[11px]">1</div>
                      <p className="leading-snug">Clique no botão <strong className="text-amber-400 font-bold">"Instalar no Dispositivo"</strong> abaixo ou no ícone <Download size={12} className="inline text-amber-400 mx-0.5" /> na barra de endereço do navegador.</p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-[11px]">2</div>
                      <p className="leading-snug">Confirme em <strong className="text-white font-bold">"Instalar"</strong> para abrir o Átrios Build como uma aplicação independente e ultra rápida.</p>
                    </div>
                  </div>
                </div>
              )}

              {stepNotice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>{stepNotice}</p>
                </div>
              )}

              {/* Vantagens do App */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                  <Zap size={16} className="text-amber-400 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white uppercase">Acesso 1-Toque</p>
                  <p className="text-[9px] text-slate-400">Ecrã Principal</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                  <Bell size={16} className="text-orange-400 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white uppercase">Alertas Reais</p>
                  <p className="text-[9px] text-slate-400">Push instantâneo</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                  <ShieldCheck size={16} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white uppercase">Sem Instalação Pesada</p>
                  <p className="text-[9px] text-slate-400">Leve e Seguro</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 shrink-0 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-2xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Download size={18} className="stroke-[2.5]" />
                <span>Instalar no Dispositivo</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center gap-2">
                {isInIframe && (
                  <button
                    type="button"
                    onClick={handleOpenInNewWindow}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Abrir em nova aba para instalação direta"
                  >
                    <ExternalLink size={14} className="text-amber-400" />
                    <span>Abrir em Nova Janela</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 px-4 text-slate-400 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Continuar no Navegador
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


