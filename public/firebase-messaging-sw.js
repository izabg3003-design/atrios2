// Service Worker Unificado para Átrios App
// Suporta PWA (Caching), Web Push Padrão (VAPID) e Firebase Cloud Messaging (FCM) em Segundo Plano (App Fechado)

try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

  // 1. Inicializar Firebase no Service Worker com as credenciais do projeto Átrios
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

  // Cache para evitar notificações duplicadas entre onBackgroundMessage e push listener
  const recentNotificationsMap = new Map();
  const isDuplicateNotification = (title, body) => {
    const key = `${(title || '').trim()}:${(body || '').trim()}`;
    const now = Date.now();
    const lastTime = recentNotificationsMap.get(key) || 0;
    if (now - lastTime < 4000) {
      return true;
    }
    recentNotificationsMap.set(key, now);
    if (recentNotificationsMap.size > 50) {
      recentNotificationsMap.clear();
    }
    return false;
  };

  // 2. Lidar com mensagens FCM em segundo plano (quando o app está fechado no telemóvel/PC)
  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Recebida mensagem FCM em segundo plano:', payload);

    const title = payload.notification?.title || payload.data?.title || 'ÁTRIOS BUILD';
    const body = payload.notification?.body || payload.data?.body || 'Nova notificação recebida.';

    if (isDuplicateNotification(title, body)) {
      console.log('[FCM SW] Notificação FCM duplicada ignorada:', title);
      return;
    }

    const options = {
      body: body,
      icon: payload.notification?.icon || payload.data?.icon || '/atrios-logo.svg',
      badge: payload.notification?.badge || payload.data?.badge || '/atrios-logo.svg',
      vibrate: [200, 100, 200, 100, 300],
      tag: payload.data?.tag || ('atrios-push-' + encodeURIComponent(title)),
      renotify: true,
      data: payload.data || payload
    };

    return self.registration.showNotification(title, options);
  });
} catch (e) {
  console.warn('[FCM SW] Falha ao carregar scripts compat do Firebase:', e);
}

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
  // Passa as requisições de rede normalmente
  event.respondWith(fetch(event.request));
});

// Cache global de desduplicação para o ouvinte push
const pushTimestamps = new Map();

// 4. Listener resiliente para eventos Push nativos (VAPID padrão e Web Push) com o app FECHADO
self.addEventListener('push', (event) => {
  console.log('[SW] Evento Push nativo recebido:', event);

  const promiseChain = (async () => {
    let payload = null;
    if (event.data) {
      try {
        payload = event.data.json();
      } catch (e) {
        try {
          payload = { body: event.data.text() };
        } catch (err) {
          payload = null;
        }
      }
    }

    let title = 'ÁTRIOS BUILD';
    let body = 'Você tem uma nova atualização.';
    let icon = '/atrios-logo.svg';
    let badge = '/atrios-logo.svg';
    let tag = 'atrios-push-default';
    let additionalData = {};

    if (payload) {
      if (payload.notification) {
        title = payload.notification.title || title;
        body = payload.notification.body || body;
        icon = payload.notification.icon || icon;
      } else if (payload.data) {
        title = payload.data.title || payload.title || title;
        body = payload.data.body || payload.body || body;
        icon = payload.data.icon || icon;
      } else {
        title = payload.title || title;
        body = payload.body || body;
        icon = payload.icon || icon;
      }

      tag = payload.tag || payload.notification?.tag || payload.data?.tag || ('atrios-push-' + encodeURIComponent(title));
      additionalData = payload.data || payload;
    }

    // Desduplicação temporal
    const key = `${(title || '').trim()}:${(body || '').trim()}`;
    const now = Date.now();
    const lastTime = pushTimestamps.get(key) || 0;
    if (now - lastTime < 4000) {
      console.log('[SW] Push nativo duplicado ignorado:', title);
      return;
    }
    pushTimestamps.set(key, now);
    if (pushTimestamps.size > 50) {
      pushTimestamps.clear();
    }

    const options = {
      body: body,
      icon: icon,
      badge: badge,
      vibrate: [200, 100, 200, 100, 300],
      tag: tag,
      renotify: true,
      data: additionalData
    };

    console.log('[SW] Exibindo notificação no SO (App Fechado / Segundo Plano):', title);
    return self.registration.showNotification(title, options);
  })();

  event.waitUntil(promiseChain);
});

// 5. Manipulador de clique na notificação para focar ou abrir o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procurar aba existente e focar
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Se o app estiver fechado, abrir a página inicial
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
