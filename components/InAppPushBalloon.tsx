import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { AtriosLogo } from './AtriosLogo';

export interface PushToastItem {
  id: string;
  title: string;
  body: string;
  time: string;
}

export const triggerInAppBalloon = (title: string, body: string, time?: string) => {
  if (typeof window === 'undefined' || !title || !body) return;
  const toastItem: PushToastItem = {
    id: String(Date.now() + Math.random()),
    title,
    body,
    time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // 1. Disparar no evento local da janela
  try {
    window.dispatchEvent(
      new CustomEvent('in_app_push_toast', {
        detail: toastItem
      })
    );
  } catch (err) {
    console.error('Erro ao disparar balão in-app:', err);
  }

  // 2. Disparar instantaneamente para todas as outras abas abertas no mesmo navegador
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('atrios_in_app_push_channel');
      bc.postMessage(toastItem);
      bc.close();
    }
  } catch (e) {}
};

export const isPushSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem('atrios_push_sound_enabled');
  return val === null ? true : val === 'true';
};

export const setPushSoundEnabled = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('atrios_push_sound_enabled', enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('atrios_push_sound_changed', { detail: { enabled } }));
  }
};

export const playPushChime = () => {
  try {
    if (!isPushSoundEnabled()) {
      return;
    }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Play dual-tone pleasant chime
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio autoplay restrictions bypass catch
  }
};

export const InAppPushBalloonContainer: React.FC = () => {
  const [toasts, setToasts] = useState<PushToastItem[]>([]);
  const recentToastsRef = React.useRef<Map<string, number>>(new Map());
  const dismissedKeysRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    // Load previously dismissed toast keys from sessionStorage
    try {
      const storedDismissed = sessionStorage.getItem('atrios_dismissed_push_toasts');
      if (storedDismissed) {
        const parsed = JSON.parse(storedDismissed);
        if (Array.isArray(parsed)) {
          parsed.forEach(k => dismissedKeysRef.current.add(k));
        }
      }
    } catch (e) {
      // Ignore sessionStorage parsing errors
    }

    const processToast = (detail: PushToastItem) => {
      if (!detail || !detail.title) return;

      const { title, body } = detail;
      const key = `${(title || '').trim()}:${(body || '').trim()}`;
      
      // Se foi fechado manualmente pelo utilizador nesta sessão, ignorar reabertura
      if (dismissedKeysRef.current.has(key)) {
        return;
      }

      const now = Date.now();
      const lastTime = recentToastsRef.current.get(key) || 0;

      // Descartar balão duplicado se recebido em menos de 5 segundos
      if (now - lastTime < 5000) {
        return;
      }
      recentToastsRef.current.set(key, now);

      if (recentToastsRef.current.size > 30) {
        recentToastsRef.current.clear();
      }

      const newToast: PushToastItem = {
        id: detail.id || String(now + Math.random()),
        title,
        body,
        time: detail.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setToasts(prev => [newToast, ...prev].slice(0, 3));
      playPushChime();

      // Auto dismiss após 2 minutos (120,000ms)
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 120000);
    };

    const handlePushEvent = (e: Event) => {
      const customEv = e as CustomEvent<PushToastItem>;
      if (customEv.detail) {
        processToast(customEv.detail);
      }
    };

    window.addEventListener('in_app_push_toast', handlePushEvent);

    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('atrios_in_app_push_channel');
        bc.onmessage = (msgEvent) => {
          if (msgEvent.data) {
            processToast(msgEvent.data);
          }
        };
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('in_app_push_toast', handlePushEvent);
      if (bc) bc.close();
    };
  }, []);

  const removeToast = (toast: PushToastItem) => {
    const key = `${(toast.title || '').trim()}:${(toast.body || '').trim()}`;
    dismissedKeysRef.current.add(key);
    try {
      sessionStorage.setItem('atrios_dismissed_push_toasts', JSON.stringify(Array.from(dismissedKeysRef.current)));
    } catch (e) {
      // Ignore storage errors
    }
    setToasts(prev => prev.filter(t => t.id !== toast.id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] w-[92%] max-w-md flex flex-col gap-3 pointer-events-none px-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-950/95 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-orange-500/40 backdrop-blur-xl animate-in slide-in-from-top-6 duration-300 relative overflow-hidden group"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start gap-3.5 relative z-10">
            {/* New Official Metallic Logo */}
            <div className="shrink-0 mt-0.5 relative group-hover:scale-105 transition-transform drop-shadow-md">
              <AtriosLogo size={40} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1">
                    <Sparkles size={11} className="text-orange-400" /> ÁTRIOS BUILD
                  </span>
                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    PUSH
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                  {toast.time}
                </span>
              </div>

              <h4 className="font-extrabold text-white text-xs sm:text-sm leading-snug tracking-tight mt-1 line-clamp-2">
                {toast.title}
              </h4>

              <p className="text-[11px] sm:text-xs font-medium text-slate-300 leading-relaxed mt-1 break-words">
                {toast.body}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0 ml-1"
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-300 animate-[shrink_120s_linear_forwards]" />
          </div>
        </div>
      ))}
    </div>
  );
};
