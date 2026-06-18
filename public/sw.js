// Service Worker com suporte a PWA e Notificações Push
const CACHE_NAME = 'atrios-cache-v1';

self.addEventListener('install', (event) => {
  console.log('SW: Instalado');
});

self.addEventListener('fetch', (event) => {
  // Apenas passa a requisição adiante
  event.respondWith(fetch(event.request));
});

// Manipulador de clique na notificação para abrir/focar no app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta do app, foca nela
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não houver, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
