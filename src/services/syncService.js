import { createInvoice } from '../api/invoice';
import { getPendingInvoices, markInvoiceSynced, deleteSyncedInvoices } from './db';
import toast from 'react-hot-toast';

let isSyncing = false;

// Sync pending invoices to server
export const syncPendingInvoices = async () => {
    if (isSyncing) {
        console.log('⏳ Sync already in progress...');
        return { success: false, message: 'Sync in progress' };
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
        console.log('🔒 No auth token - skipping sync');
        return { success: false, message: 'No auth token' };
    }

    if (!navigator.onLine) {
        console.log('📡 Offline - skipping sync');
        return { success: false, message: 'Offline' };
    }

    isSyncing = true;
    console.log('🔄 Starting invoice sync...');

    try {
        const pending = await getPendingInvoices();

        if (pending.length === 0) {
            console.log('✅ No pending invoices to sync');
            isSyncing = false;
            return { success: true, synced: 0 };
        }

        console.log(`📤 Syncing ${pending.length} pending invoice(s)...`);

        let synced = 0;
        let failed = 0;
        const errors = [];

        for (const queuedInvoice of pending) {
            try {
                // Attempt to create invoice on server
                await createInvoice(queuedInvoice.invoiceData);

                // Mark as synced
                await markInvoiceSynced(queuedInvoice.id);
                synced++;

                console.log(`✅ Synced invoice ${queuedInvoice.id}`);
            } catch (error) {
                failed++;
                errors.push({
                    id: queuedInvoice.id,
                    error: error.response?.data?.message || error.message
                });
                console.error(`❌ Failed to sync invoice ${queuedInvoice.id}:`, error);
            }
        }

        // Clean up synced invoices
        if (synced > 0) {
            await deleteSyncedInvoices();
        }

        isSyncing = false;

        // Show result toast
        if (synced > 0) {
            toast.success(`✅ Synced ${synced} offline invoice(s)`);
        }
        if (failed > 0) {
            toast.error(`❌ Failed to sync ${failed} invoice(s)`);
        }

        return {
            success: true,
            synced,
            failed,
            errors
        };

    } catch (error) {
        console.error('❌ Sync failed:', error);
        isSyncing = false;
        return {
            success: false,
            message: error.message
        };
    }
};

// Auto-sync on app load and when coming back online
export const initAutoSync = () => {
    // Sync on app load if online
    if (navigator.onLine) {
        setTimeout(() => {
            syncPendingInvoices();
        }, 2000); // Wait 2 seconds after app load
    }

    // Sync when coming back online
    window.addEventListener('online', () => {
        console.log('📡 Connection restored - syncing...');
        setTimeout(() => {
            syncPendingInvoices();
        }, 1000);
    });
};

// Get sync status
export const getSyncStatus = async () => {
    const pending = await getPendingInvoices();
    return {
        hasPending: pending.length > 0,
        pendingCount: pending.length,
        isSyncing
    };
};
