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

  // Cache para evitar notificações duplicadas entre onBackgroundMessage e push listener (apenas ecos simultâneos)
  const recentNotificationsMap = new Map();
  const isDuplicateNotification = (title, body) => {
    const key = `${(title || '').trim()}:${(body || '').trim()}`;
    const now = Date.now();
    const lastTime = recentNotificationsMap.get(key) || 0;
    if (now - lastTime < 1200) {
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

    const title = payload.notification?.title || payload.data?.title || 'Átrios App';
    const body = payload.notification?.body || payload.data?.body || 'Nova notificação recebida.';

    if (isDuplicateNotification(title, body)) {
      console.log('[FCM SW] Notificação FCM duplicada ignorada:', title);
      return;
    }

    // Se for mensagem de atualização forçada disparada pelo Master
    if (payload.data?.type === 'app_update' || payload.data?.forceUpdate === 'true' || payload.data?.type === 'FORCE_UPDATE' || payload.data?.forceUpdate === true) {
      console.log('[FCM SW] Ordem de atualização remota do app recebida do Master');
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'FORCE_UPDATE', version: payload.data?.version });
        });
      }).catch(() => {});
    }

    const uniqueTag = payload.data?.tag || payload.data?.id || ('atrios-push-' + Date.now() + '-' + Math.floor(Math.random() * 1000));

    const options = {
      body: body,
      icon: payload.notification?.icon || payload.data?.icon || '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 300],
      tag: uniqueTag,
      renotify: true,
      requireInteraction: true,
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
  console.log('[SW] PWA Ativado - Limpando caches e assumindo controle');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      typeof caches !== 'undefined' ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))) : Promise.resolve()
    ])
  );
});

// Listener de mensagens enviadas pela aplicação cliente
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'CLEAR_CACHES' || event.data.type === 'FORCE_UPDATE') {
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
    }
    self.clients.claim();
  }
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

    let title = 'Átrios App';
    let body = 'Você tem uma nova atualização.';
    let icon = '/favicon.svg';
    let badge = '/favicon.svg';
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

      tag = payload.tag || payload.notification?.tag || payload.data?.tag || payload.data?.id || ('atrios-push-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
      additionalData = payload.data || payload;
    }

    // Se for mensagem de atualização forçada disparada pelo Master
    if (additionalData?.type === 'FORCE_UPDATE' || additionalData?.type === 'app_update' || payload?.type === 'FORCE_UPDATE' || additionalData?.forceUpdate === true) {
      console.log('[SW Push] Ordem de atualização remota do app recebida via Push nativo');
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'FORCE_UPDATE', version: additionalData?.version });
        });
      }).catch(() => {});
    }

    // Desduplicação temporal apenas para evitar ecos simultâneos
    const key = `${(title || '').trim()}:${(body || '').trim()}`;
    const now = Date.now();
    const lastTime = pushTimestamps.get(key) || 0;
    if (now - lastTime < 1200) {
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
      requireInteraction: true,
      data: additionalData
    };

    console.log('[SW] Exibindo notificação no SO (App Fechado / Segundo Plano):', title);
    return self.registration.showNotification(title, options);
  })();

  event.waitUntil(promiseChain);
});

// 5. Manipulador de clique na notificação para focar ou abrir o app na tela correta
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || event.notification.data?.click_action || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procurar aba existente e focar
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client && targetUrl && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Se o app estiver fechado, abrir a página correspondente
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
