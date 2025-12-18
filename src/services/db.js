import Dexie from 'dexie';

// Create IndexedDB database for offline support
class MSanaDB extends Dexie {
    constructor() {
        super('MSanaDB');

        this.version(1).stores({
            products: '++id, _id, name, stock, sellingPrice, gst',
            customers: '++id, _id, name, phone',
            invoicesQueue: '++id, createdAt, synced',
            invoiceDrafts: '++id, draftType, lastModified' // draftType: 'billing' or 'invoice'
        });
    }
}

// Create database instance
const db = new MSanaDB();

// Helper functions for products
export const saveProducts = async (products) => {
    try {
        await db.products.clear();
        await db.products.bulkAdd(products);
        console.log(`✅ Cached ${products.length} products to IndexedDB`);
    } catch (error) {
        console.error('Failed to cache products:', error);
    }
};

export const getProducts = async () => {
    try {
        const products = await db.products.toArray();
        return products;
    } catch (error) {
        console.error('Failed to get cached products:', error);
        return [];
    }
};

// Helper functions for invoices queue
export const queueInvoice = async (invoiceData) => {
    try {
        const id = await db.invoicesQueue.add({
            invoiceData,
            createdAt: new Date().toISOString(),
            synced: false
        });
        console.log(`✅ Queued invoice ${id} for offline sync`);
        return id;
    } catch (error) {
        console.error('Failed to queue invoice:', error);
        throw error;
    }
};

export const getPendingInvoices = async () => {
    try {
        // Use filter instead of where().equals() for boolean values to avoid IndexedDB key errors
        const allInvoices = await db.invoicesQueue.toArray();
        const pending = allInvoices.filter(invoice => invoice.synced === false);
        return pending;
    } catch (error) {
        console.error('Failed to get pending invoices:', error);
        return [];
    }
};

export const markInvoiceSynced = async (id) => {
    try {
        await db.invoicesQueue.update(id, { synced: true });
        console.log(`✅ Marked invoice ${id} as synced`);
    } catch (error) {
        console.error('Failed to mark invoice as synced:', error);
    }
};

export const deleteSyncedInvoices = async () => {
    try {
        // Use filter and delete individually to avoid IndexedDB key errors
        const allInvoices = await db.invoicesQueue.toArray();
        const syncedInvoices = allInvoices.filter(invoice => invoice.synced === true);
        let count = 0;
        for (const invoice of syncedInvoices) {
            await db.invoicesQueue.delete(invoice.id);
            count++;
        }
        console.log(`✅ Deleted ${count} synced invoices from queue`);
    } catch (error) {
        console.error('Failed to delete synced invoices:', error);
    }
};

// Helper functions for customers
export const saveCustomers = async (customers) => {
    try {
        await db.customers.clear();
        await db.customers.bulkAdd(customers);
        console.log(`✅ Cached ${customers.length} customers to IndexedDB`);
    } catch (error) {
        console.error('Failed to cache customers:', error);
    }
};

export const getCustomers = async () => {
    try {
        const customers = await db.customers.toArray();
        return customers;
    } catch (error) {
        console.error('Error getting customers:', error);
        return [];
    }
}

// Draft Management
export async function saveDraft(draftType, draftData) {
    try {
        await db.invoiceDrafts.clear(); // Only keep one draft per type
        await db.invoiceDrafts.add({
            draftType,
            draftData,
            lastModified: new Date()
        });
        console.log(`✅ Draft saved: ${draftType}`);
    } catch (error) {
        console.error('Error saving draft:', error);
    }
}

export async function getDraft(draftType) {
    try {
        const draft = await db.invoiceDrafts
            .where('draftType')
            .equals(draftType)
            .first();
        return draft?.draftData || null;
    } catch (error) {
        console.error('Error getting draft:', error);
        return null;
    }
}

export async function clearDraft(draftType) {
    try {
        await db.invoiceDrafts
            .where('draftType')
            .equals(draftType)
            .delete();
        console.log(`🗑️ Draft cleared: ${draftType}`);
    } catch (error) {
        console.error('Error clearing draft:', error);
    }
}

export default db;
