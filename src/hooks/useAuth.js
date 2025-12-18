import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token and user
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        sessionStorage.setItem('token', userToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!token;
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isStaff = () => {
        return user?.role === 'staff';
    };

    return {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isStaff,
    };
};
