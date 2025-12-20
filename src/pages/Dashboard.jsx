import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/reports';
import { getLowStockProducts, getExpiringProducts, getProducts } from '../api/product';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDateTime, getStockStatus } from '../utils/formatter';
import {
    TrendingUp,
    ShoppingCart,
    Package,
    AlertTriangle,
    DollarSign,
    FileText,
    Clock,
    AlertOctagon
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Expiry Alert State
    const [expiringProducts, setExpiringProducts] = useState([]);
    const [showExpiryModal, setShowExpiryModal] = useState(false);
    const [expiryLoading, setExpiryLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsData, lowStockData, expiringData, productsData] = await Promise.all([
                getDashboardStats(),
                getLowStockProducts(),
                getExpiringProducts(),
                getProducts({ limit: 5 })
            ]);

            setStats(statsData.data);
            setLowStockProducts(lowStockData.data);
            setExpiringProducts(expiringData.data);
            setRecentProducts(productsData.data.slice(0, 5));

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load dashboard data');
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCheckExpiry = async () => {
        try {
            setExpiryLoading(true);
            const response = await getExpiringProducts();
            setExpiringProducts(response.data);
            setShowExpiryModal(true);
        } catch (error) {
            console.error(error);
            toast.error('Failed to refresh expiring products');
        } finally {
            setExpiryLoading(false);
        }
    };

    if (loading) return <Loading message="Loading dashboard..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

    const statCards = [
        {
            title: "Today's Sales",
            value: formatCurrency(stats.today.totalRevenue),
            subtitle: `${stats.today.totalInvoices} invoices`,
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            title: 'Monthly Sales',
            value: formatCurrency(stats.thisMonth.totalRevenue),
            subtitle: `${stats.thisMonth.totalInvoices} invoices`,
            icon: TrendingUp,
            color: 'bg-blue-500',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            subtitle: 'Active products',
            icon: Package,
            color: 'bg-purple-500',
        },
        {
            title: 'Low Stock Items',
            value: stats.lowStockCount,
            subtitle: 'Need attention',
            icon: AlertTriangle,
            color: 'bg-red-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 text-lg">Welcome back! Here's what's happening today.</p>
                    </div>

                    {(user?.role === 'pharmacy' || user?.role === 'manager') && (
                        <button
                            onClick={handleCheckExpiry}
                            disabled={expiryLoading}
                            className="btn bg-white text-red-600 border border-red-200 hover:bg-red-50 flex items-center shadow-sm relative"
                        >
                            {expiryLoading ? (
                                <Clock className="animate-spin mr-2" size={20} />
                            ) : (
                                <AlertOctagon className="mr-2" size={20} />
                            )}
                            Check Expiry Alerts
                            {expiringProducts.length > 0 && (
                                <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    {expiringProducts.length}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="card group hover:scale-[1.02] transition-all duration-300 animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 ">
                                        <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                        <p className="text-xs text-gray-500 font-medium">{stat.subtitle}</p>
                                    </div>
                                    <div className={`${stat.color} p-2 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="text-white" size={28} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Invoices */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
                            <Link to="/invoices" className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {stats.recentInvoices.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                                    <p className="text-gray-500 font-medium">No invoices yet</p>
                                </div>
                            ) : (
                                stats.recentInvoices.map((invoice) => (
                                    <div
                                        key={invoice._id}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 mb-1">{invoice.invoiceNo}</p>
                                            <p className="text-sm text-gray-600 mb-1">{invoice.patientName}</p>
                                            <p className="text-xs text-gray-500">{formatDateTime(invoice.createdAt)}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-bold text-lg text-gray-900 mb-2">{formatCurrency(invoice.netPayable)}</p>
                                            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
                            <Link to="/products?lowStock=true" className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {lowStockProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="mx-auto text-green-300 mb-3" size={48} />
                                    <p className="text-gray-500 font-medium">All stocked!</p>
                                </div>
                            ) : (
                                lowStockProducts.slice(0, 5).map((product) => {
                                    const status = getStockStatus(product.stock, product.minStockLevel);
                                    return (
                                        <div key={product._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 mb-1">{product.name}</p>
                                                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-bold text-lg text-gray-900 mb-2">{product.stock} {product.unit}</p>
                                                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${status.bgColor} ${status.color}`}>
                                                    {status.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Rows for Manager/Admin - Products and Expiry */}
                {(user?.role === 'manager' || user?.role === 'admin' || user?.role === 'pharmacy') && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
                        <div className="card">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
                                <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline">
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentProducts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="mx-auto text-gray-300 mb-3" size={48} />
                                        <p className="text-gray-500 font-medium">No products</p>
                                    </div>
                                ) : (
                                    recentProducts.map((product) => (
                                        <div key={product._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 mb-1">{product.brand}</p>
                                                <p className="text-sm text-gray-600">{product.generic}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-bold text-lg text-gray-900 mb-2">{formatCurrency(product.mrp)}</p>
                                                <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full font-semibold">Stock: {product.stock}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-red-600 flex items-center">
                                    <AlertOctagon className="mr-2" size={24} />
                                    Expiring Soon
                                </h2>
                                <button onClick={handleCheckExpiry} className="text-red-600 hover:text-red-700 text-sm font-semibold hover:underline">
                                    Check All →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {expiringProducts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Clock className="mx-auto text-green-300 mb-3" size={48} />
                                        <p className="text-gray-500 font-medium">All good!</p>
                                    </div>
                                ) : (
                                    expiringProducts.slice(0, 5).map((product) => (
                                        <div key={product._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 mb-1">{product.brand}</p>
                                                <p className="text-sm text-red-500 font-medium">Expires: {new Date(product.expiryDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <span className="bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-full font-bold">{product.stock} Left</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/invoices/create" className="group card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary-600 rounded-xl"><ShoppingCart className="text-white" size={28} /></div>
                            <div><p className="font-bold text-primary-900 text-lg">Create Invoice</p><p className="text-sm text-primary-700">New bill</p></div>
                        </div>
                    </Link>
                    <Link to="/products" className="group card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-600 rounded-xl"><Package className="text-white" size={28} /></div>
                            <div><p className="font-bold text-purple-900 text-lg">Manage Products</p><p className="text-sm text-purple-700">Inventory</p></div>
                        </div>
                    </Link>
                    {user?.role !== 'pharmacy' && (
                        <Link to="/reports" className="group card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-600 rounded-xl"><TrendingUp className="text-white" size={28} /></div>
                                <div><p className="font-bold text-green-900 text-lg">View Reports</p><p className="text-sm text-green-700">Analytics</p></div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            {/* Expiry Products Modal */}
            {showExpiryModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowExpiryModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Expiring Soon</h3>
                                        <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr><th>Product</th><th>Expiry</th><th>Stock</th></tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {expiringProducts.map((p) => (
                                                        <tr key={p._id}><td>{p.brand}</td><td className="text-red-600">{new Date(p.expiryDate).toLocaleDateString()}</td><td>{p.stock}</td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button className="btn bg-red-600 text-white w-full sm:w-auto" onClick={() => setShowExpiryModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;