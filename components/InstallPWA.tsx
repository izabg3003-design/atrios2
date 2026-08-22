import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, Bell, ShieldCheck, Share2, PlusSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallPWAProps {
  view: string;
}

export const InstallPWA: React.FC<InstallPWAProps> = ({ view }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIOS);

    // Registrar Service Worker de forma robusta
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').then(registration => {
          console.log('[InstallPWA] SW registrado com sucesso:', registration.scope);
        }).catch(err => {
          console.log('[InstallPWA] SW falhou:', err);
        });
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    // Handler para capturar o evento de instalação
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      if (typeof (window as any).onPwaPromptAvailable === 'function') {
        (window as any).onPwaPromptAvailable(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Ouvir evento customizado para abrir a janela a qualquer momento (ex: clique no botão "Baixar App")
    const handleOpenModal = () => {
      setIsVisible(true);
      setShowIosGuide(false);
    };
    window.addEventListener('open-install-pwa-modal', handleOpenModal);

    // Mostrar modal automaticamente após 3.5 segundos se não for standalone e não tiver sido dispensado na sessão
    const dismissedSession = sessionStorage.getItem('atrios_pwa_dismissed');
    let autoTimer: any = null;
    if (!isStandalone && !dismissedSession) {
      autoTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
    }

    const installedHandler = async () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      
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
              body: "O Átrios foi adicionado ao seu Ecrã Principal! 📱✨ Já pode aceder sem usar o navegador.",
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              vibrate: [200, 100, 200, 100, 300],
              tag: 'atrios-installed-alert',
              renotify: true
            };
            
            if ('serviceWorker' in navigator) {
              const reg = await navigator.serviceWorker.ready;
              reg.showNotification("Muitos Parabéns! 🎉", options);
            } else {
              new Notification("Muitos Parabéns! 🎉", options);
            }
          }
        } catch (e) {
          console.error('[PWA Install] Failed to trigger notification', e);
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
    if (showIosGuide) {
      handleDismiss();
      return;
    }

    const activePrompt = deferredPrompt || (window as any).deferredPrompt;

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        console.log(`[InstallPWA] Usuário escolheu: ${outcome}`);
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
        if (outcome === 'accepted') {
          setIsVisible(false);
        } else {
          setShowIosGuide(true);
        }
      } catch (err) {
        console.error("[InstallPWA] Erro no prompt de instalação:", err);
        setShowIosGuide(true);
      }
    } else {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIosGuide(false);
    sessionStorage.setItem('atrios_pwa_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-950/40 relative overflow-hidden text-white"
          >
            {/* Efeitos de luz no fundo */}
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-500/20 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-cyan-500/15 blur-[90px] rounded-full pointer-events-none" />

            {/* Botão Fechar */}
            <button 
              onClick={handleDismiss}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
              title="Fechar"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Smartphone size={32} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                  <Download size={12} className="text-slate-950 font-bold" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                ✨ Aplicativo Oficial Átrios
              </div>

              <h2 className="text-2xl font-black text-white leading-tight">
                Instale a Aplicação no seu Telemóvel!
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mt-2 leading-relaxed">
                Tenha a melhor experiência com acesso direto na sua tela inicial sem precisar abrir o navegador.
              </p>
            </div>

            {/* Vantagens */}
            {!showIosGuide ? (
              <div className="space-y-3 mb-6 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Acesso Ultrarrápido</h4>
                    <p className="text-[11px] text-slate-400">Abra a app com apenas 1 toque na tela do seu dispositivo.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Notificações em Tempo Real</h4>
                    <p className="text-[11px] text-slate-400">Receba alertas instantâneos de novos orçamentos, vendas e suporte.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Mais Seguro e Leve</h4>
                    <p className="text-[11px] text-slate-400">Não ocupa memória do telemóvel e funciona perfeitamente offline.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Guia Manual de Instalação (iOS / Navegadores) */
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 mb-6 text-left space-y-3 animate-fadeIn">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <Share2 size={16} /> Instruções de Instalação:
                </h4>
                {isIOS ? (
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                    <li>No navegador <strong className="text-white">Safari</strong>, toque no ícone de <strong className="text-white">Partilhar</strong> (quadrado com seta para cima).</li>
                    <li>Deslize para baixo e selecione <strong className="text-white">"Adicionar ao Ecrã Principal"</strong> <PlusSquare size={14} className="inline text-emerald-400 ml-1" />.</li>
                    <li>Toque em <strong className="text-white">Adicionar</strong> no canto superior direito!</li>
                  </ol>
                ) : (
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                    <li>No menu do seu navegador (três pontos no canto superior), procure a opção <strong className="text-white">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à tela inicial"</strong>.</li>
                    <li>Confirme a instalação e aceda ao Átrios a partir do seu ecrã principal!</li>
                  </ol>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="space-y-2.5">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black uppercase tracking-wider text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <Download size={18} />
                {showIosGuide ? "Entendi!" : "Baixar / Instalar Agora"}
                {!showIosGuide && <ArrowRight size={16} />}
              </button>

              <button
                onClick={handleDismiss}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
              >
                Continuar no Navegador
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

