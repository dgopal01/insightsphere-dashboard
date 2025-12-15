import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import App from './App.tsx';
import { configureAmplify } from './amplify-config';
import { ThemeProvider } from './contexts';
import { initPerformanceMonitoring, initErrorTracking, initAnalytics } from './utils';

// Configure AWS Amplify
configureAmplify();

// Initialize error tracking (Requirement 9.3)
initErrorTracking();

// Initialize performance monitoring (Requirement 9.1, 9.2, 9.3)
initPerformanceMonitoring();

// Initialize analytics (Requirement 9.4)
initAnalytics();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
