/**
 * Serviço Universal de Áudio e Text-to-Speech (TTS)
 * Combina Web Speech API com fallback em streaming MP3 direto (/api/tts)
 * para garantir 100% de compatibilidade em todos os navegadores, iOS, Safari e Android.
 */

let currentHtmlAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let voicesLoaded = false;

// Pré-aquecer vozes do navegador
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        voicesLoaded = true;
      }
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  } catch (e) {}
}

export function stopAllAudio(): void {
  if (typeof window !== 'undefined') {
    if (currentHtmlAudio) {
      try {
        currentHtmlAudio.pause();
        currentHtmlAudio.currentTime = 0;
        currentHtmlAudio = null;
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        currentUtterance = null;
      } catch (e) {}
    }
  }
}

export function playTTSAudio(
  text: string,
  langCode: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    forceServerTTS?: boolean;
  }
): () => void {
  if (typeof window === 'undefined') return () => {};

  const cleanText = (text || '').trim();
  if (!cleanText) return () => {};

  // Parar áudio anterior
  stopAllAudio();

  const onStart = options?.onStart;
  const onEnd = options?.onEnd;
  const onError = options?.onError;

  let hasEnded = false;
  const triggerEnd = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (onEnd) onEnd();
    }
  };

  // Método 1: Streaming via /api/tts
  const playViaServerAudio = () => {
    try {
      if (onStart) onStart();
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(langCode)}&t=${Date.now()}`;
      const audio = new Audio();
      audio.src = audioUrl;
      audio.preload = 'auto';
      currentHtmlAudio = audio;

      audio.onended = () => {
        currentHtmlAudio = null;
        triggerEnd();
      };

      audio.onerror = (e) => {
        currentHtmlAudio = null;
        triggerEnd();
        if (onError) onError(e);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[TTS Audio Play Error]', err);
          // Se o áudio do servidor falhou por autoplay, tentar Web Speech API como último recurso
          if ('speechSynthesis' in window) {
            try {
              const utt = new SpeechSynthesisUtterance(cleanText);
              utt.lang = langCode;
              utt.onend = triggerEnd;
              utt.onerror = triggerEnd;
              window.speechSynthesis.speak(utt);
              return;
            } catch (e) {}
          }
          triggerEnd();
          if (onError) onError(err);
        });
      }
    } catch (err) {
      console.warn('[TTS Audio Exception]', err);
      triggerEnd();
      if (onError) onError(err);
    }
  };

  if (options?.forceServerTTS) {
    playViaServerAudio();
    return () => stopAllAudio();
  }

  // Método 2: Web Speech Synthesis Nativo (Se disponível no navegador)
  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance = utterance;
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const prefix = langCode.split('-')[0].toLowerCase();
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix) || v.lang.toLowerCase().includes(prefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      let started = false;
      let timeoutId: any = null;

      utterance.onstart = () => {
        started = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (timeoutId) clearTimeout(timeoutId);
        currentUtterance = null;
        triggerEnd();
      };

      utterance.onerror = (event) => {
        if (timeoutId) clearTimeout(timeoutId);
        currentUtterance = null;
        console.warn('[Web Speech API] Fallback para áudio do servidor:', event);
        playViaServerAudio();
      };

      // Timeout de segurança estendido para 1500ms
      timeoutId = setTimeout(() => {
        if (!started) {
          console.log('[Web Speech API Timeout] Usando áudio do servidor');
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}
          playViaServerAudio();
        }
      }, 1500);

      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      return () => stopAllAudio();
    } catch (e) {
      console.warn('[SpeechSynthesis Exception]', e);
      playViaServerAudio();
      return () => stopAllAudio();
    }
  } else {
    playViaServerAudio();
    return () => stopAllAudio();
  }
}
