import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registrado com sucesso:', registration.scope);
        }).catch(err => {
          console.log('SW falhou:', err);
        });
      });
    }

    const handler = (e: any) => {
      // Prevenir que o prompt padrão apareça
      e.preventDefault();
      // Guardar o evento para ser usado depois
      setDeferredPrompt(e);
      // Mostrar o balão após alguns segundos
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Para iOS, mostrar o balão mesmo sem beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
      setTimeout(() => setIsVisible(true), 3000);
    }

    const installedHandler = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    // Verificar se já está instalado
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Caso seja iOS ou outro navegador sem suporte ao prompt automático
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert('Para instalar no iOS: Toque no ícone de partilha (quadrado com seta) e selecione "Adicionar ao Ecrã Principal".');
      }
      return;
    }

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Esperar pela escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuário escolheu: ${outcome}`);

    // Limpar o prompt
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999]"
        >
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/50 backdrop-blur-xl relative overflow-hidden group">
            {/* Efeito de brilho no fundo */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <Smartphone size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg leading-tight mb-1">
                  Instalar Átrios App
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Tenha acesso rápido aos seus orçamentos e loja diretamente da sua tela inicial.
                </p>
                
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <Download size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                  Instalar Agora
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
