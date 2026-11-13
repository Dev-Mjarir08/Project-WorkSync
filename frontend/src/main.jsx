import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import AppProviders from './app/providers.jsx';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('The application root element was not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
