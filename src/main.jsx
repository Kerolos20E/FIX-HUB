import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ensureDemoData } from './lib/demoSeed';

ensureDemoData();
createRoot(document.getElementById('root')).render(<StrictMode>
    <App />
  </StrictMode>);
