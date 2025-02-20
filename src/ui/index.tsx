import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

const reactRoot = createRoot(root);
reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('UI script loaded'); 