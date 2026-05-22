import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { initAnalytics } from './lib/analytics';
import { ConvexClientProvider } from './components/ConvexClientProvider';

// Initialize PostHog Analytics
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ConvexClientProvider>
          <App />
        </ConvexClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)

