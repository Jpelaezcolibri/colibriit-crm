import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("🚀 [System] Real App Main executing...");

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("❌ [System] App Crash Detected:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#111', color: '#ff5555', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1 style={{ color: '#ff4444' }}>⚠️ Application Crash</h1>
          <div style={{ background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #444', marginBottom: '20px' }}>
            <p style={{ fontWeight: 'bold' }}>Error Message:</p>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#eee' }}>{this.state.error?.toString()}</pre>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }} 
            style={{ padding: '12px 24px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            PUERGA TOTAL (Clear Storage & Reload)
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Nota: Esto borrará el caché local por si hay datos corruptos.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
