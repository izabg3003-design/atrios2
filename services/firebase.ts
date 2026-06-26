import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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
 */
export const requestFcmToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('FCM não é suportado neste navegador ou dispositivo.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permissão para notificações negada pelo utilizador.');
      return null;
    }

    // Registrar o service worker do Firebase explicitamente para garantir mapeamento correto
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('[FCM SW] Service Worker registrado com sucesso:', registration.scope);
    } catch (swErr) {
      console.warn('[FCM SW] Falha ao registrar Service Worker explicitamente:', swErr);
    }

    // Obter o token passando a referência do registration se disponível
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      ...(registration ? { serviceWorkerRegistration: registration } : {})
    });

    if (token) {
      console.log('[FCM Token] Token obtido com sucesso:', token);
      localStorage.setItem('atrios_fcm_token', token);
      return token;
    } else {
      console.warn('Nenhum token FCM disponível. Verifique as credenciais.');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter token FCM:', error);
    return null;
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
