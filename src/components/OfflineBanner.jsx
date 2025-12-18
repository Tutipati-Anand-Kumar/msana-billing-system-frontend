import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { getSyncStatus } from '../services/syncService';

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState({ hasPending: false, pendingCount: 0, isSyncing: false });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check sync status periodically
        const checkSync = async () => {
            const status = await getSyncStatus();
            setSyncStatus(status);
        };

        checkSync();
        const interval = setInterval(checkSync, 5000); // Check every 5 seconds

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    // Don't show banner if online and no pending syncs
    if (isOnline && !syncStatus.hasPending && !syncStatus.isSyncing) {
        return null;
    }

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 ${isOnline ? 'bg-blue-600' : 'bg-orange-600'
            } text-white px-4 py-2 shadow-lg print:hidden`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {isOnline ? (
                        <Wifi size={20} />
                    ) : (
                        <WifiOff size={20} />
                    )}
                    <span className="text-sm font-medium">
                        {!isOnline && '⚠️ Offline – You can create invoices. They\'ll sync when back online.'}
                        {isOnline && syncStatus.isSyncing && (
                            <span className="flex items-center space-x-2">
                                <RefreshCw size={16} className="animate-spin" />
                                <span>Syncing {syncStatus.pendingCount} invoice(s)...</span>
                            </span>
                        )}
                        {isOnline && syncStatus.hasPending && !syncStatus.isSyncing && (
                            `📤 ${syncStatus.pendingCount} invoice(s) pending sync`
                        )}
                    </span>
                </div>
                {syncStatus.hasPending && (
                    <span className="text-xs opacity-90">
                        {syncStatus.pendingCount} queued
                    </span>
                )}
            </div>
        </div>
    );
};

export default OfflineBanner;
