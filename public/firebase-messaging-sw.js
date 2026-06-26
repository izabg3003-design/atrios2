// Service Worker Unificado para Átrios App
// Suporta PWA (Caching), Web Push Padrão (VAPID) e Firebase Cloud Messaging (FCM)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 1. Inicializar Firebase no Service Worker com as chaves do utilizador
firebase.initializeApp({
  apiKey: "AIzaSyBZAyIZFSzqGwQkq853PA6yueVBkRYrDVg",
  authDomain: "pushbuild-164d9.firebaseapp.com",
  projectId: "pushbuild-164d9",
  storageBucket: "pushbuild-164d9.firebasestorage.app",
  messagingSenderId: "387301085750",
  appId: "1:387301085750:web:75a9b5c338eafeeb66fe97",
  measurementId: "G-2GE58ZJNWH"
});

const messaging = firebase.messaging();

// 2. Lidar com mensagens FCM em segundo plano (quando o app está fechado)
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Recebida mensagem em segundo plano:', payload);
  
  // Evitar duplicados se a notificação já estiver preenchida pelo browser
  const title = payload.notification?.title || payload.data?.title || 'Átrios App';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'Nova notificação push recebida.',
    icon: payload.notification?.icon || payload.data?.icon || '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 300],
    tag: payload.data?.tag || 'atrios-firebase-push',
    data: payload.data
  };

  self.registration.showNotification(title, options);
});

// 3. Suporte PWA (Ciclo de vida e cache básico)
const CACHE_NAME = 'atrios-cache-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] PWA Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] PWA Ativado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Apenas passa a requisição adiante sem interferir no tráfego de rede
  event.respondWith(fetch(event.request));
});

// 4. Listener para receber eventos Push brutos (VAPID padrão ou FCM nativo)
self.addEventListener('push', (event) => {
  console.log('[SW] Recebido evento push bruto em segundo plano:', event);
  
  let payload = null;
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      try {
        payload = { body: event.data.text() };
      } catch (textErr) {
        payload = null;
      }
    }
  }

  // Se for uma mensagem do FCM, o SDK do Firebase Messaging já a intercepta e trata.
  // Ignoramos aqui para evitar notificações duplicadas.
  if (payload && (payload.from || payload.collapse_key || payload.gcm || payload.notification || payload.priority)) {
    console.log('[SW] Mensagem FCM detectada. Delegando ao SDK do Firebase.');
    return;
  }

  // Se não for FCM, é um Web Push VAPID padrão do backend
  console.log('[SW] Web Push VAPID padrão detectado:', payload);
  const title = payload?.title || 'Átrios Software';
  const options = {
    body: payload?.body || 'Tem uma nova atualização.',
    icon: payload?.icon || '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 300],
    tag: payload?.tag || 'atrios-bg-push',
    data: payload
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 5. Manipulador de clique na notificação (FCM e VAPID) para focar/abrir o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procurar aba existente e focar
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não houver abas abertas, abrir nova
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
