import api from './axios';

export const getSalesReport = async (params = {}) => {
    try {
        const response = await api.get('/reports/sales', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching sales report:', error);
        throw error;
    }
};

export const getProductSalesReport = async (params = {}) => {
    try {
        const response = await api.get('/reports/products', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching product sales report:', error);
        throw error;
    }
};

export const getInventoryReport = async () => {
    try {
        const response = await api.get('/reports/inventory');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory report:', error);
        throw error;
    }
};

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/reports/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

export const getDaySalesReport = async (date) => {
    try {
        const response = await api.get(`/reports/daily${date ? `?date=${date}` : ''}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching daily sales report:', error);
        throw error;
    }
};
