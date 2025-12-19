import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // DETECT TAB DUPLICATION:
        const navEntries = window.performance.getEntriesByType('navigation');
        const isFreshNav = navEntries.length > 0 && navEntries[0].type === 'navigate';

        console.log('[Auth] Init - isFreshNav:', isFreshNav, 'NavType:', navEntries[0]?.type);

        if (isFreshNav) {
            console.log('[Auth] New navigation detected - clearing inherited session');
            sessionStorage.removeItem('activeAccount');
            sessionStorage.removeItem('msana_tabId');
        }

        const tabId = sessionStorage.getItem('msana_tabId') || Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('msana_tabId', tabId);

        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
        let activeEmail = sessionStorage.getItem('activeAccount');

        console.log('[Auth] Checking existing session - activeEmail:', activeEmail);

        if (!activeEmail) {
            const availableEmails = Object.keys(accounts).filter(email => {
                const occ = occupancy[email];
                return !occ || (Date.now() - occ.lastSeen > 8000) || occ.tabId === tabId;
            });

            if (availableEmails.length > 0) {
                activeEmail = availableEmails.sort((a, b) =>
                    new Date(accounts[b].lastUsed) - new Date(accounts[a].lastUsed)
                )[0];
                console.log('[Auth] Picking available account:', activeEmail);
                sessionStorage.setItem('activeAccount', activeEmail);
            }
        }

        if (activeEmail && accounts[activeEmail]) {
            occupancy[activeEmail] = { tabId, lastSeen: Date.now() };
            localStorage.setItem('msana_occupancy', JSON.stringify(occupancy));

            console.log('[Auth] Restoring session for:', activeEmail);
            setToken(accounts[activeEmail].token);
            setUser(accounts[activeEmail].user);
        }

        setLoading(false);

        const heartbeat = setInterval(() => {
            const currentEmail = sessionStorage.getItem('activeAccount');
            if (currentEmail) {
                const currentOcc = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
                currentOcc[currentEmail] = { tabId, lastSeen: Date.now() };
                localStorage.setItem('msana_occupancy', JSON.stringify(currentOcc));
            }
        }, 4000);

        const cleanup = () => {
            const currentEmail = sessionStorage.getItem('activeAccount');
            if (currentEmail) {
                const currentOcc = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
                if (currentOcc[currentEmail]?.tabId === tabId) {
                    delete currentOcc[currentEmail];
                    localStorage.setItem('msana_occupancy', JSON.stringify(currentOcc));
                }
            }
        };

        window.addEventListener('beforeunload', cleanup);
        return () => {
            clearInterval(heartbeat);
            window.removeEventListener('beforeunload', cleanup);
        };
    }, []);

    const login = useCallback((userData, userToken) => {
        console.log('[Auth] Logging in:', userData.email);
        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
        const tabId = sessionStorage.getItem('msana_tabId');

        accounts[userData.email] = {
            user: userData,
            token: userToken,
            lastUsed: new Date().toISOString()
        };
        localStorage.setItem('msana_accounts', JSON.stringify(accounts));

        occupancy[userData.email] = { tabId, lastSeen: Date.now() };
        localStorage.setItem('msana_occupancy', JSON.stringify(occupancy));

        sessionStorage.setItem('activeAccount', userData.email);

        setToken(userToken);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        const activeEmail = sessionStorage.getItem('activeAccount');
        const tabId = sessionStorage.getItem('msana_tabId');
        console.log('[Auth] Logging out:', activeEmail);
        if (activeEmail) {
            const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
            const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');

            delete accounts[activeEmail];
            localStorage.setItem('msana_accounts', JSON.stringify(accounts));

            if (occupancy[activeEmail]?.tabId === tabId) {
                delete occupancy[activeEmail];
                localStorage.setItem('msana_occupancy', JSON.stringify(occupancy));
            }

            sessionStorage.removeItem('activeAccount');
            sessionStorage.removeItem('msana_tabId');
        }
        setToken(null);
        setUser(null);
    }, []);

    const switchAccount = useCallback((email) => {
        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
        const tabId = sessionStorage.getItem('msana_tabId');
        const oldEmail = sessionStorage.getItem('activeAccount');

        if (accounts[email]) {
            const occ = occupancy[email];
            if (occ && occ.tabId !== tabId && (Date.now() - occ.lastSeen < 8000)) {
                return { success: false, message: 'This account is already active in another tab' };
            }

            accounts[email].lastUsed = new Date().toISOString();
            localStorage.setItem('msana_accounts', JSON.stringify(accounts));

            if (oldEmail && occupancy[oldEmail]?.tabId === tabId) {
                delete occupancy[oldEmail];
            }
            occupancy[email] = { tabId, lastSeen: Date.now() };
            localStorage.setItem('msana_occupancy', JSON.stringify(occupancy));

            sessionStorage.setItem('activeAccount', email);
            setToken(accounts[email].token);
            setUser(accounts[email].user);
            return { success: true };
        }
        return { success: false, message: 'Account not found' };
    }, []);

    const getAvailableAccounts = useCallback(() => {
        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        return Object.values(accounts).map(acc => acc.user);
    }, []);

    const isAuthenticated = useCallback(() => !!token, [token]);
    const isAdmin = useCallback(() => user?.role === 'admin', [user]);
    const isStaff = useCallback(() => user && user.role !== 'admin', [user]);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        login,
        logout,
        switchAccount,
        getAvailableAccounts,
        isAuthenticated,
        isAdmin,
        isStaff,
    }), [user, token, loading, login, logout, switchAccount, getAvailableAccounts, isAuthenticated, isAdmin, isStaff]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
