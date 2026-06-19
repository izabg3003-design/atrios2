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

// Listener para receber eventos Push diretamente do sistema operativo / browser (mesmo com o app fechado)
self.addEventListener('push', (event) => {
  console.log('SW: Recebida notificação Push em segundo plano!');
  
  let data = {
    title: 'Átrios Software',
    body: 'Tem uma nova atualização em segundo plano.',
    icon: '/favicon.svg',
    badge: '/favicon.svg'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = {
        title: parsed.title || data.title,
        body: parsed.body || data.body,
        icon: parsed.icon || data.icon || '/favicon.svg',
        badge: parsed.badge || data.badge || '/favicon.svg',
        vibrate: parsed.vibrate || [200, 100, 200, 100, 300],
        tag: parsed.tag || 'atrios-bg-push'
      };
    } catch (e) {
      // Se for formato de texto plano
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate || [200, 100, 200, 100, 300],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    tag: data.tag || 'atrios-bg-push',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

