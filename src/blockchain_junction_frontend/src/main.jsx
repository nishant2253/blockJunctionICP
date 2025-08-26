import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Polyfill for IC libraries
if (typeof global === 'undefined') {
  window.global = globalThis;
}
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
