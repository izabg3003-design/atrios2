
import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import App from './App';
import './index.css';

// Initialize Google Analytics if ID is provided
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-L75RSF4D1Y';
if (GA_ID) {
  ReactGA.initialize(GA_ID);
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
}

// Auto-register Service Worker for Push Notifications and PWA functionality
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then(reg => {
      console.log('[App Boot] ServiceWorker registered:', reg.scope);
    }).catch(err => {
      console.warn('[App Boot] ServiceWorker register failed:', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
