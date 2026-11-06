import React from 'react';
<<<<<<< HEAD
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
=======
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import AppProviders from './app/providers.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
>>>>>>> origin/jarir
  </React.StrictMode>
);