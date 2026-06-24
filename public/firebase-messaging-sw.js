// Service Worker para Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// O Service Worker tentará carregar as credenciais dinamicamente do servidor
// para evitar expor chaves fixas no ficheiro público
let isInitialized = false;

async function initFirebaseInSW() {
  if (isInitialized) return;
  try {
    const res = await fetch('/api/push/firebase-config');
    if (!res.ok) throw new Error('Não foi possível carregar a configuração do Firebase');
    const config = await res.json();
    
    if (config && config.apiKey) {
      firebase.initializeApp(config);
      const messaging = firebase.messaging();
      
      messaging.onBackgroundMessage((payload) => {
        console.log('[FCM SW] Mensagem recebida em segundo plano:', payload);
        
        const notificationTitle = payload.notification?.title || payload.data?.title || 'Átrios';
        const notificationOptions = {
          body: payload.notification?.body || payload.data?.body || '',
          icon: payload.notification?.icon || payload.data?.icon || '/favicon.svg',
          badge: '/favicon.svg',
          data: payload.data,
          tag: 'fcm-push-notification',
          renotify: true
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
      });
      
      isInitialized = true;
      console.log('[FCM SW] Firebase inicializado com sucesso no Service Worker!');
    } else {
      console.warn('[FCM SW] Configuração do Firebase recebida está incompleta ou vazia.');
    }
  } catch (err) {
    console.error('[FCM SW] Erro ao inicializar o Firebase no Service Worker:', err);
  }
}

// Inicializar ao carregar ou receber eventos
self.addEventListener('install', (event) => {
  console.log('[FCM SW] Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[FCM SW] Ativado');
  event.waitUntil(initFirebaseInSW());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Intercetar push para garantir que o Firebase inicialize se necessário
self.addEventListener('push', (event) => {
  event.waitUntil(
    initFirebaseInSW().then(() => {
      console.log('[FCM SW] Evento push tratado.');
    })
  );
});
