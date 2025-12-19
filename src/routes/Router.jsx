import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import CreateInvoice from '../pages/CreateInvoice';
import Reports from '../pages/Reports';
import Users from '../pages/Users';
import Invoices from '../pages/Invoices';
import Billing from '../pages/Billing';
import DischargeSummary from '../pages/DischargeSummary';
import PharmacyBilling from '../pages/PharmacyBilling';
import Settings from '../pages/Settings';
import AuditLogs from '../pages/AuditLogs';
import Suppliers from '../pages/Suppliers';
import Loading from '../components/Loading';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    return isAuthenticated() ? children : <Navigate to="/login" />;
};

const Router = () => {
    const { isAuthenticated } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />}
                />

                {/* Private Routes */}
                <Route
                    path="/*"
                    element={
                        // <PrivateRoute>
                        <div className="min-h-screen bg-gray-50">
                            <Navbar />
                            <div className="lg:pl-64 pt-16 lg:pt-0">
                                <main className="min-h-screen">
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/products" element={<Products />} />
                                        <Route path="/billing" element={<Billing />} />
                                        <Route path="/pharmacy-billing" element={<PharmacyBilling />} />
                                        <Route path="/discharge-summary" element={<DischargeSummary />} />
                                        <Route path="/invoices" element={<Invoices />} />
                                        <Route path="/invoices/create" element={<CreateInvoice />} />
                                        <Route path="/reports" element={<Reports />} />
                                        <Route path="/users" element={<Users />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/audit-logs" element={<AuditLogs />} />
                                        <Route path="/suppliers" element={<Suppliers />} />
                                        <Route path="*" element={<Navigate to="/dashboard" />} />
                                    </Routes>
                                </main>
                            </div>
                        </div>
                        // </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;