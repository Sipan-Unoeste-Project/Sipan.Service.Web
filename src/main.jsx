import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../style.css';
import './modules/animais/index.css';
import { clearAllLocalData } from './storage/localStorageKeys';
import App from './App';

// Limpa dados de demonstração uma vez (preparação para o backend).
const DATA_VERSION_KEY = 'sipan_local_data_version';
const CURRENT_DATA_VERSION = 'backend-prep-1';

if (localStorage.getItem(DATA_VERSION_KEY) !== CURRENT_DATA_VERSION) {
  clearAllLocalData();
  localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
