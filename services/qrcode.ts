import QRCode from 'qrcode';

let cachedPublicOrigin: string | null = null;

/**
 * Retorna a origem pública do aplicativo (resolvendo se estiver em localhost / container de dev)
 */
export const getAppPublicOrigin = async (): Promise<string> => {
  if (cachedPublicOrigin) return cachedPublicOrigin;

  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal && window.location.origin) {
      cachedPublicOrigin = window.location.origin;
      return cachedPublicOrigin;
    }

    // Se estiver em localhost (dev), perguntar ao servidor a URL pública acessível na internet por celulares
    try {
      const res = await fetch('/api/public-config');
      if (res.ok) {
        const data = await res.json();
        if (data.publicUrl) {
          cachedPublicOrigin = data.publicUrl;
          return data.publicUrl;
        }
      }
    } catch (e) {
      // Ignorar e usar fallback
    }

    if (window.location.origin) {
      return window.location.origin;
    }
  }

  return 'https://ais-dev-ahbfibyzzg5lvc7lb232ui-37225789255.europe-west1.run.app';
};

/**
 * Retorna a origem pública de forma síncrona
 */
export const getAppPublicOriginSync = (): string => {
  if (cachedPublicOrigin) return cachedPublicOrigin;
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal && window.location.origin) {
      return window.location.origin;
    }
  }
  return 'https://ais-dev-ahbfibyzzg5lvc7lb232ui-37225789255.europe-west1.run.app';
};

/**
 * Constrói a URL direta e inequívoca para entrar na sala de chat ao vivo com tradução
 */
export const buildChatRoomUrl = (params: {
  roomId: string;
  companyId?: string;
  companyName?: string;
  userLang?: string;
  clientLang?: string;
  baseOrigin?: string;
}): string => {
  const origin = params.baseOrigin || getAppPublicOriginSync();
  const searchParams = new URLSearchParams();

  // Flags explícitas de roteamento para garantir direcionamento imediato à sala de chat
  searchParams.set('portal', 'chat');
  searchParams.set('view', 'client-live-chat');
  searchParams.set('room', params.roomId);

  if (params.companyId) searchParams.set('companyId', params.companyId);
  if (params.companyName) searchParams.set('companyName', params.companyName);
  if (params.userLang) searchParams.set('user_lang', params.userLang);
  if (params.clientLang) searchParams.set('client_lang', params.clientLang);

  return `${origin}/?${searchParams.toString()}`;
};

/**
 * Extrai parâmetros de roteamento de forma resiliente (suportando search params normais e hash params de QR Code)
 */
export const extractUrlRoutingParams = (): URLSearchParams => {
  if (typeof window === 'undefined') return new URLSearchParams();

  const search = window.location.search;
  const hash = window.location.hash;
  const combined = new URLSearchParams(search);

  if (hash) {
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(qIndex + 1));
      hashParams.forEach((value, key) => {
        if (!combined.has(key)) combined.set(key, value);
      });
    } else if (hash.includes('=')) {
      const cleanHash = hash.replace(/^[#/]+/, '');
      const hashParams = new URLSearchParams(cleanHash);
      hashParams.forEach((value, key) => {
        if (!combined.has(key)) combined.set(key, value);
      });
    }
  }

  return combined;
};

export const generateQrCodeForUrl = async (url: string): Promise<string> => {
  if (!url) return '';
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 350,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
};

export const generateCompanyQrCode = async (companyId: string, customOrigin?: string): Promise<string> => {
  if (!companyId) return '';
  const baseOrigin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://atrios.app');
  const verifyUrl = `${baseOrigin}/?cert=${encodeURIComponent(companyId)}`;
  return generateQrCodeForUrl(verifyUrl);
};

