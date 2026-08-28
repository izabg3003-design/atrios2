/**
 * Serviço Universal de Áudio e Text-to-Speech (TTS)
 * Combina Web Speech API com fallback em streaming MP3 direto (/api/tts)
 * para garantir 100% de compatibilidade em todos os navegadores, iOS, Safari e Android.
 */

let currentHtmlAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Pré-aquecer vozes do navegador
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
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

  // Parar áudio em reprodução
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

  // Método 1: Fallback direto via /api/tts (Super confiável e natural)
  const playViaServerAudio = () => {
    try {
      if (onStart) onStart();
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(langCode)}&t=${Date.now()}`;
      const audio = new Audio(audioUrl);
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

  // Método 2: Tentar Web Speech Synthesis primeiro
  if ('speechSynthesis' in window) {
    try {
      // Destravar speech synthesis caso esteja pausado no Chrome/Safari
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance = utterance;
      utterance.lang = langCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const prefix = langCode.split('-')[0].toLowerCase();
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
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
        console.warn('[Web Speech API Warning] Falha na síntese nativa, usando streaming /api/tts:', event);
        // Fallback imediato para o áudio do servidor
        playViaServerAudio();
      };

      // Se após 450ms a síntese de voz nativa não tiver iniciado (muito comum em mobile/iOS bloqueado), usar fallback
      timeoutId = setTimeout(() => {
        if (!started) {
          console.log('[Web Speech API Timeout] Síntese nativa demorou, comutando para streaming /api/tts...');
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}
          playViaServerAudio();
        }
      }, 450);

      window.speechSynthesis.speak(utterance);
      // Forçar resume após falar para evitar bug do Chrome
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
    // Se o browser não suporta Web Speech API
    playViaServerAudio();
    return () => stopAllAudio();
  }
}
