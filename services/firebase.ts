import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: "AIzaSyBZAyIZFSzqGwQkq853PA6yueVBkRYrDVg",
  authDomain: "pushbuild-164d9.firebaseapp.com",
  projectId: "pushbuild-164d9",
  storageBucket: "pushbuild-164d9.firebasestorage.app",
  messagingSenderId: "387301085750",
  appId: "1:387301085750:web:75a9b5c338eafeeb66fe97",
  measurementId: "G-2GE58ZJNWH"
};

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BDbP6H-i86jr1AR9GpbUJ6oNxH69LPQE5cntwWdI7Ez01T_isAPCAIyfFirzco3MLpTr9G1EWf-4z8-qqhzvMQU";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

let messaging: any = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
    messaging = getMessaging(app);
  }
} catch (e) {
  console.warn('Firebase Messaging não é suportado neste ambiente:', e);
}

export { app, messaging };

/**
 * Solicita permissão para receber notificações e obtém o Token do Firebase Cloud Messaging (FCM).
 * Inclui tratamento defensivo de erros e cache para entrega instantânea.
 */
export const requestFcmToken = async (): Promise<string | null> => {
  if (!messaging || typeof window === 'undefined') {
    console.warn('FCM não é suportado neste navegador ou dispositivo.');
    return null;
  }

  try {
    if (!('Notification' in window)) {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permissão para notificações negada pelo utilizador.');
      return null;
    }

    // Registrar e aguardar o Service Worker estar pronto
    let registration: ServiceWorkerRegistration | undefined;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      if ('ready' in navigator.serviceWorker) {
        registration = await navigator.serviceWorker.ready;
      }
    } catch (swErr) {
      console.warn('[FCM SW] Aviso ao registrar Service Worker:', swErr);
    }

    // Preparar opções de subscrição FCM com VAPID Key
    const options: { vapidKey?: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = {};
    if (VAPID_KEY && VAPID_KEY.trim()) {
      options.vapidKey = VAPID_KEY.trim();
    }
    if (registration) {
      options.serviceWorkerRegistration = registration;
    }

    let token: string | null = null;
    try {
      token = await getToken(messaging, options);
    } catch (tokenErr: any) {
      console.warn('[FCM] Tentativa padrão de getToken falhou, tentando fallback:', tokenErr?.message || tokenErr);
      try {
        const simpleOpts = registration ? { serviceWorkerRegistration: registration } : undefined;
        token = await getToken(messaging, simpleOpts);
      } catch (retryErr) {
        // Se ambos falharem (ex: rede temporária ou restrição de iframe), recuperar token existente em cache
        const cached = localStorage.getItem('atrios_fcm_token');
        if (cached) {
          console.log('[FCM] Utilizando token FCM existente em cache local.');
          return cached;
        }
        return null;
      }
    }

    if (token) {
      console.log('[FCM Token] Token obtido com sucesso:', token);
      localStorage.setItem('atrios_fcm_token', token);
      return token;
    } else {
      const cached = localStorage.getItem('atrios_fcm_token');
      return cached || null;
    }
  } catch (error: any) {
    console.warn('[FCM] Aviso na obtenção de token FCM:', error?.message || error);
    const cached = typeof window !== 'undefined' ? localStorage.getItem('atrios_fcm_token') : null;
    return cached || null;
  }
};

/**
 * Escuta por mensagens recebidas em primeiro plano (quando o app está aberto).
 */
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('[FCM Message] Recebida mensagem em primeiro plano:', payload);
    callback(payload);
  });
};
