import api from './axios';

export const getAuditLogs = async (params = {}) => {
    try {
        const response = await api.get('/audit-logs', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
    }
};

export const getAuditStats = async (days = 30) => {
    try {
        const response = await api.get('/audit-logs/stats', { params: { days } });
        return response.data;
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        throw error;
    }
};
