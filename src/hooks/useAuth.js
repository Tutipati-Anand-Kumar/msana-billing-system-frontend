import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tabId = sessionStorage.getItem('msana_tabId') || Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('msana_tabId', tabId);

        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
        let activeEmail = sessionStorage.getItem('activeAccount');

        // Logic: Try to find which account this tab should 'own'
        if (!activeEmail) {
            const availableEmails = Object.keys(accounts).filter(email => {
                const occ = occupancy[email];
                // Available if:
                // 1. Not in occupancy map
                // 2. OR the claim is stale (over 8 seconds old)
                // 3. OR it was claimed by this exact tabId previously (sessionStorage cleared but tabId stayed)
                return !occ || (Date.now() - occ.lastSeen > 8000) || occ.tabId === tabId;
            });

            if (availableEmails.length > 0) {
                // Pick most recently used available account
                activeEmail = availableEmails.sort((a, b) =>
                    new Date(accounts[b].lastUsed) - new Date(accounts[a].lastUsed)
                )[0];
                sessionStorage.setItem('activeAccount', activeEmail);
            }
        }

        if (activeEmail && accounts[activeEmail]) {
            // Claim/Refresh occupancy
            occupancy[activeEmail] = { tabId, lastSeen: Date.now() };
            localStorage.setItem('msana_occupancy', JSON.stringify(occupancy));

            setToken(accounts[activeEmail].token);
            setUser(accounts[activeEmail].user);
        } else {
            // No available account found - ensure we are logged out
            setToken(null);
            setUser(null);
        }

        setLoading(false);

        // Start Heartbeat to keep this account marked as 'in use' by this tab
        const heartbeat = setInterval(() => {
            const currentEmail = sessionStorage.getItem('activeAccount');
            if (currentEmail) {
                const currentOcc = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
                currentOcc[currentEmail] = { tabId, lastSeen: Date.now() };
                localStorage.setItem('msana_occupancy', JSON.stringify(currentOcc));
            }
        }, 4000);

        // Cleanup on tab close
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

    const login = (userData, userToken) => {
        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
        const tabId = sessionStorage.getItem('msana_tabId');

        // 1. Save to persistent pool
        accounts[userData.email] = {
            user: userData,
            token: userToken,
            lastUsed: new Date().toISOString()
        };
        localStorage.setItem('msana_accounts', JSON.stringify(accounts));

        // 2. Claim occupancy for this tab
        occupancy[userData.email] = { tabId, lastSeen: Date.now() };
        localStorage.setItem('msana_occupancy', JSON.stringify(occupancy));

        // 3. Set this account as active for THIS tab
        sessionStorage.setItem('activeAccount', userData.email);

        setToken(userToken);
        setUser(userData);
    };

    const logout = () => {
        const activeEmail = sessionStorage.getItem('activeAccount');
        const tabId = sessionStorage.getItem('msana_tabId');
        if (activeEmail) {
            const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
            const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');

            // Remove from persistence
            delete accounts[activeEmail];
            localStorage.setItem('msana_accounts', JSON.stringify(accounts));

            // Remove occupancy claim
            if (occupancy[activeEmail]?.tabId === tabId) {
                delete occupancy[activeEmail];
                localStorage.setItem('msana_occupancy', JSON.stringify(occupancy));
            }

            sessionStorage.removeItem('activeAccount');
        }
        setToken(null);
        setUser(null);
    };

    const switchAccount = (email) => {
        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        const occupancy = JSON.parse(localStorage.getItem('msana_occupancy') || '{}');
        const tabId = sessionStorage.getItem('msana_tabId');
        const oldEmail = sessionStorage.getItem('activeAccount');

        if (accounts[email]) {
            // 1. Check if the target account is already in use by another tab
            const occ = occupancy[email];
            if (occ && occ.tabId !== tabId && (Date.now() - occ.lastSeen < 8000)) {
                return { success: false, message: 'This account is already active in another tab' };
            }

            // 2. Refresh freshness
            accounts[email].lastUsed = new Date().toISOString();
            localStorage.setItem('msana_accounts', JSON.stringify(accounts));

            // 3. Update occupancy (release old, claim new)
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
    };

    const getAvailableAccounts = () => {
        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
        return Object.values(accounts).map(acc => acc.user);
    };

    const isAuthenticated = () => {
        return !!token;
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isStaff = () => {
        return user && user.role !== 'admin';
    };

    return {
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
    };
};
