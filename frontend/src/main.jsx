import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './App.css';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ProyectoProvider } from './hooks/useProyecto.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import { startAutoSync } from './services/offlineSync';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Iniciar sincronización automática
startAutoSync();

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ProyectoProvider>
      <ToastProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ToastProvider>
    </ProyectoProvider>
  </AuthProvider>
);
