import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerDevPulseServiceWorker } from './utils/pwa';

registerDevPulseServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
