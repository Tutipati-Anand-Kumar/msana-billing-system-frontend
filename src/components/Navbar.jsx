import { Link, useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard,
    Package,
    FileText,
    BarChart3,
    Users,
    LogOut,
    Menu,
    X,
    Receipt,
    ClipboardList,
    Settings as SettingsIcon,
    Shield,
    Pill,
    UserCircle,
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/');
        setShowLogoutConfirm(false);
    };

    // Don't render navbar if user is not authenticated
    if (!user) {
        return null;
    }

    let navItems = [];
    const role = user?.role;

    const commonItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];

    if (role === 'admin') {
        navItems = [
            ...commonItems,
            { name: 'Products', path: '/products', icon: Package },
            { name: 'Billing', path: '/billing', icon: Receipt },
            { name: 'Pharmacy Billing', path: '/pharmacy-billing', icon: Pill },
            { name: 'Discharge Summary', path: '/discharge-summary', icon: ClipboardList },
            { name: 'Invoices', path: '/invoices', icon: FileText },
            { name: 'Reports', path: '/reports', icon: BarChart3 },
            { name: 'Suppliers', path: '/suppliers', icon: Users },
            { name: 'Users', path: '/users', icon: Users },
            { name: 'Settings', path: '/settings', icon: SettingsIcon },
            { name: 'Audit Logs', path: '/audit-logs', icon: Shield }
        ];
    } else if (role === 'manager') {
        navItems = [
            ...commonItems,
            { name: 'Products', path: '/products', icon: Package },
            { name: 'Suppliers', path: '/suppliers', icon: Users },
            { name: 'Pharmacy Billing', path: '/pharmacy-billing', icon: Pill },
            // { name: 'Billing', path: '/billing', icon: Receipt }, // Assuming manager might oversee general billing too
            { name: 'Invoices', path: '/invoices', icon: FileText },
            { name: 'Reports', path: '/reports', icon: BarChart3 },
        ];
    } else if (role === 'pharmacy') {
        navItems = [
            ...commonItems,
            { name: 'Products', path: '/products', icon: Package },
            { name: 'Pharmacy Billing', path: '/pharmacy-billing', icon: Pill },
            { name: 'Invoices', path: '/invoices', icon: FileText },
        ];
    } else if (role === 'hospital') {
        navItems = [
            ...commonItems,
            { name: 'Products', path: '/products', icon: Package },
            { name: 'Billing', path: '/billing', icon: Receipt },
            { name: 'Invoices', path: '/invoices', icon: FileText },
        ];
    } else if (role === 'discharge') {
        navItems = [
            ...commonItems,
            { name: 'Discharge Summary', path: '/discharge-summary', icon: ClipboardList },
        ];
    } else {
        // Default staff view (fallback)
        navItems = [
            ...commonItems,
            { name: 'Billing', path: '/billing', icon: Receipt },
            { name: 'Pharmacy Billing', path: '/pharmacy-billing', icon: Pill },
            { name: 'Invoices', path: '/invoices', icon: FileText },
        ];
    }

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <img src="/logo.jpg" alt="mSana Logo" className="w-8 h-8 rounded-lg" />
                            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                mSana
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-white border-r border-gray-200 shadow-xl hidden lg:block`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <Link
                            to="/dashboard"
                            className={`flex items-center space-x-3 transition-all duration-300 ${!sidebarOpen && 'justify-center w-full'
                                }`}
                        >
                            <img
                                src="/logo.jpg"
                                alt="mSana Logo"
                                className="w-10 h-10 rounded-xl shadow-lg ring-2 ring-primary-500/20"
                            />
                            {sidebarOpen && (
                                <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                                    mSana Billing
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                        } ${!sidebarOpen && 'justify-center'}`}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    <Icon
                                        size={20}
                                        className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'}`}
                                    />
                                    {sidebarOpen && (
                                        <span className="font-medium whitespace-nowrap">{item.name}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="border-t border-gray-200 p-4">
                        <div
                            className={`flex items-center space-x-3 mb-3 ${!sidebarOpen && 'justify-center'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-primary-500/30">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            {sidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize truncate">
                                        {user?.role}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 ${!sidebarOpen && 'justify-center'
                                }`}
                            title={!sidebarOpen ? 'Logout' : ''}
                        >
                            <LogOut size={18} />
                            {sidebarOpen && <span className="font-medium">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                        }`}
                                >
                                    <Icon
                                        size={20}
                                        className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-primary-500/30">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize truncate">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                confirmText="Logout"
                cancelText="Cancel"
            />
        </>
    );
};

export default Navbar;