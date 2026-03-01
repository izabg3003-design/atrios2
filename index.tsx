
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
