// Service Worker minimal para suporte a PWA
const CACHE_NAME = 'atrios-cache-v1';

self.addEventListener('install', (event) => {
  console.log('SW: Instalado');
});

self.addEventListener('fetch', (event) => {
  // Apenas passa a requisição adiante
  event.respondWith(fetch(event.request));
});
