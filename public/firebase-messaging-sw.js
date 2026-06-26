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

// 4. Listener resiliente para receber eventos Push brutos (VAPID padrão ou FCM nativo)
// Garante exibição de notificação mesmo com o app fechado sob qualquer circunstância
self.addEventListener('push', (event) => {
  console.log('[SW] Recebido evento push em segundo plano:', event);
  
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

  console.log('[SW] Payload de push recebido e decodificado:', payload);

  // Extrair título e conteúdo de forma extremamente resiliente (FCM, VAPID ou campos de texto puro)
  let title = 'Átrios App';
  let body = 'Você tem uma nova atualização.';
  let icon = '/favicon.svg';
  let badge = '/favicon.svg';
  let tag = 'atrios-global-push';
  let additionalData = {};

  if (payload) {
    // 1. Se estiver encapsulado na propriedade "notification" (Padrão FCM)
    if (payload.notification) {
      title = payload.notification.title || title;
      body = payload.notification.body || body;
      icon = payload.notification.icon || icon;
    }
    // 2. Se estiver encapsulado em "data" (FCM data-only ou VAPID encapsulado)
    else if (payload.data) {
      title = payload.data.title || payload.title || title;
      body = payload.data.body || payload.body || body;
      icon = payload.data.icon || icon;
    }
    // 3. Se for propriedades de primeiro nível (Web Push VAPID padrão)
    else {
      title = payload.title || title;
      body = payload.body || body;
      icon = payload.icon || icon;
    }

    tag = payload.tag || payload.notification?.tag || payload.data?.tag || 'atrios-bg-push';
    additionalData = payload.data || payload;
  }

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    vibrate: [200, 100, 200, 100, 300],
    tag: tag,
    data: additionalData
  };

  console.log('[SW] Exibindo notificação de fundo:', title, options);

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
