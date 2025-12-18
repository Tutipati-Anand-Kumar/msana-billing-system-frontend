import api from './axios';
import { saveProducts, getProducts as getCachedProducts } from '../services/db';

export const getProducts = async (params = {}) => {
    try {
        // Try to fetch from server
        const response = await api.get('/products', { params });

        // Cache products for offline use
        if (response.data && response.data.data) {
            await saveProducts(response.data.data);
        }

        return response.data;
    } catch (error) {
        // If offline or server error, try to return cached data
        if (!navigator.onLine || error.code === 'ERR_NETWORK') {
            console.log('📡 Offline - using cached products');
            const cached = await getCachedProducts();
            return {
                success: true,
                data: cached,
                cached: true
            };
        }
        throw error;
    }
};

export const getProduct = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

export const updateStock = async (id, quantity, operation) => {
    try {
        const response = await api.patch(`/products/${id}/stock`, {
            quantity,
            operation,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};

export const getLowStockProducts = async () => {
    try {
        const response = await api.get('/products/alerts/low-stock');
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        throw error;
    }
};

export const getExpiringProducts = async () => {
    try {
        const response = await api.get('/products/alerts/expiring');
        return response.data;
    } catch (error) {
        console.error('Error fetching expiring products:', error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await api.get('/products/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const bulkImportProducts = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/products/bulk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error importing products:', error);
        throw error;
    }
};
