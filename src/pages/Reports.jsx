import { useState, useEffect } from 'react';
import { getSalesReport, getProductSalesReport, getDaySalesReport } from '../api/reports';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/formatter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
    const today = new Date().toISOString().split('T')[0];
    const [salesData, setSalesData] = useState(null);
    const [productSales, setProductSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
        endDate: today,
    });
    const [groupBy, setGroupBy] = useState('day');

    // Day Report State
    const [dayReportDate, setDayReportDate] = useState(today);
    const [dayReportData, setDayReportData] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [sales, products, dayReport] = await Promise.all([
                getSalesReport({ ...dateRange, groupBy }),
                getProductSalesReport({ ...dateRange, limit: 10 }),
                getDaySalesReport(dayReportDate),
            ]);
            setSalesData(sales.data);
            setProductSales(products.data);
            setDayReportData(dayReport.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load reports');
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange, groupBy, dayReportDate]);

    if (loading) return <Loading message="Loading reports..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

    const chartData = salesData.salesData.map((item) => ({
        date: item._id || 'Total',
        revenue: item.totalSales,
        invoices: item.totalInvoices,
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
                    <p className="text-gray-600 mt-2">Analyze your business performance</p>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                max={today}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                max={today}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="input">
                                <option value="day">Daily</option>
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(salesData.summary.totalRevenue)}
                                </p>
                            </div>
                            <div className="bg-green-500 p-3 rounded-lg">
                                <DollarSign className="text-white" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900">{salesData.summary.totalInvoices}</p>
                            </div>
                            <div className="bg-blue-500 p-3 rounded-lg">
                                <TrendingUp className="text-white" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Average Sale</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(salesData.summary.averageSale)}
                                </p>
                            </div>
                            <div className="bg-purple-500 p-3 rounded-lg">
                                <Calendar className="text-white" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Tax</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(salesData.summary.totalTax)}
                                </p>
                            </div>
                            <div className="bg-orange-500 p-3 rounded-lg">
                                <Package className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Day Sales Report */}
                {dayReportData && (
                    <div className="card mb-8 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Day Sales Report ({formatDate(dayReportDate)})</h2>
                            <input
                                type="date"
                                value={dayReportDate}
                                max={today}
                                onChange={(e) => setDayReportDate(e.target.value)}
                                className="input w-auto"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-gray-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500">Total Sales</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(dayReportData.summary.totalRevenue)}</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-green-600">Cash</p>
                                <p className="text-xl font-bold text-green-700">{formatCurrency(dayReportData.summary.cash)}</p>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-blue-600">UPI</p>
                                <p className="text-xl font-bold text-blue-700">{formatCurrency(dayReportData.summary.upi)}</p>
                            </div>
                            <div className="bg-purple-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-purple-600">Card</p>
                                <p className="text-xl font-bold text-purple-700">{formatCurrency(dayReportData.summary.card)}</p>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-yellow-600">Other</p>
                                <p className="text-xl font-bold text-yellow-700">{formatCurrency(dayReportData.summary.other)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sales Chart */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Trend</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue (₹)" />
                            <Bar dataKey="invoices" fill="#8b5cf6" name="Invoices" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Selling Products</h2>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="table-header">Rank</th>
                                    <th className="table-header">Product</th>
                                    <th className="table-header">Quantity Sold</th>
                                    <th className="table-header">Revenue</th>
                                    <th className="table-header">Avg Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {productSales.map((product, index) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="table-cell">
                                            <span className="font-semibold text-primary-600">#{index + 1}</span>
                                        </td>
                                        <td className="table-cell font-medium">{product.productName}</td>
                                        <td className="table-cell">{product.totalQuantity}</td>
                                        <td className="table-cell font-semibold">
                                            {formatCurrency(product.totalRevenue)}
                                        </td>
                                        <td className="table-cell">{formatCurrency(product.averagePrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
