import api from './axios';

export const getInvoices = async (params = {}) => {
    try {
        const response = await api.get('/invoices', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

export const getInvoice = async (id) => {
    try {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching invoice:', error);
        throw error;
    }
};

export const getInvoiceByInvoiceId = async (invoiceId) => {
    try {
        const response = await api.get(`/invoices/search/${invoiceId}`);
        return response.data;
    } catch (error) {
        console.error('Error searching invoice:', error);
        throw error;
    }
};

export const createInvoice = async (invoiceData) => {
    try {
        const response = await api.post('/invoices', invoiceData);
        return response.data;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
};

export const updateInvoice = async (id, invoiceData) => {
    try {
        const response = await api.put(`/invoices/${id}`, invoiceData);
        return response.data;
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await api.delete(`/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
};
