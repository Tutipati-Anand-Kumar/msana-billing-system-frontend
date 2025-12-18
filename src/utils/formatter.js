// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date and time
export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(2);
};

// Get stock status
export const getStockStatus = (stock, minStockLevel) => {
    if (stock === 0) {
        return { status: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (stock <= minStockLevel) {
        return { status: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
        return { status: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
};

// Get payment status badge
export const getPaymentStatusBadge = (status) => {
    const badges = {
        paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        partial: { label: 'Partial', color: 'bg-blue-100 text-blue-800' },
    };
    return badges[status] || badges.pending;
};

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// Generate random color
export const generateRandomColor = () => {
    const colors = [
        '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#6366f1', '#ef4444', '#14b8a6',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Download file
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
