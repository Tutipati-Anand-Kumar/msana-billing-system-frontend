import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Router from './routes/Router';
import OfflineBanner from './components/OfflineBanner';
import { initAutoSync } from './services/syncService';
import { AuthProvider } from './hooks/useAuth';
import './index.css';

function App() {
    useEffect(() => {
        // Initialize auto-sync for offline invoices
        initAutoSync();
    }, []);

    return (
        <AuthProvider>
            <OfflineBanner />
            <Router />
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </AuthProvider>
    );
}

export default App;
