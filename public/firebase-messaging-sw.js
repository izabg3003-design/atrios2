// Service Worker para Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Inicializar Firebase no Service Worker com as chaves do utilizador
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

// Lidar com mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recebida mensagem em segundo plano:', payload);
  
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

// Manipulador de clique para abrir/focar o app
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
