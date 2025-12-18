import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
    Receipt,
    Package,
    BarChart3,
    Shield,
    Zap,
    Users,
    FileText,
    Pill,
    ClipboardList,
    TrendingUp,
    Lock,
    Cloud,
    Smartphone,
    CheckCircle,
    ArrowRight,
    Menu,
    X,
} from 'lucide-react';

const Home = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        {
            icon: Receipt,
            title: 'Hospital Billing',
            description: 'Streamline your hospital billing process with automated invoice generation and real-time tracking.',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: Pill,
            title: 'Pharmacy Billing',
            description: 'Manage pharmacy operations efficiently with integrated billing and inventory management.',
            color: 'from-green-500 to-green-600',
        },
        {
            icon: Package,
            title: 'Inventory Management',
            description: 'Track products, stock levels, and low-stock alerts to ensure seamless operations.',
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: BarChart3,
            title: 'Analytics & Reports',
            description: 'Get comprehensive insights with detailed reports and analytics for better decision-making.',
            color: 'from-orange-500 to-orange-600',
        },
        {
            icon: FileText,
            title: 'Invoice Management',
            description: 'Create, manage, and track invoices with GST calculations and automated numbering.',
            color: 'from-pink-500 to-pink-600',
        },
        {
            icon: Shield,
            title: 'Audit Logs',
            description: 'Maintain complete transparency with detailed audit logs of all system activities.',
            color: 'from-indigo-500 to-indigo-600',
        },
    ];

    const benefits = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Process bills and manage inventory with incredible speed and efficiency.',
        },
        {
            icon: Lock,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security with role-based access control and data encryption.',
        },
        {
            icon: Cloud,
            title: 'Cloud-Based',
            description: 'Access your data from anywhere, anytime with cloud synchronization.',
        },
        {
            icon: Smartphone,
            title: 'Mobile Responsive',
            description: 'Fully responsive design that works seamlessly on all devices.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center space-x-3">
                            <img src="/logo.jpg" alt="mSana Logo" className="w-10 h-10 rounded-xl shadow-lg ring-2 ring-primary-500/20" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                mSana Billing
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                Features
                            </a>
                            <a href="#benefits" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                Benefits
                            </a>
                            <a href="#use-cases" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                Use Cases
                            </a>
                            <Link
                                to="/login"
                                className="btn btn-primary flex items-center space-x-2"
                            >
                                <span>Login</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 py-4">
                            <div className="flex flex-col space-y-3">
                                <a
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                                >
                                    Features
                                </a>
                                <a
                                    href="#benefits"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                                >
                                    Benefits
                                </a>
                                <a
                                    href="#use-cases"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                                >
                                    Use Cases
                                </a>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="btn btn-primary flex items-center justify-center space-x-2 mx-4"
                                >
                                    <span>Login</span>
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent animate-fade-in">
                            Complete Hospital & Pharmacy
                            <br />
                            <span className="text-primary-600">Billing Solution</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Streamline your healthcare billing operations with our comprehensive platform.
                            Manage invoices, inventory, and reports all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/login"
                                className="btn btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
                            >
                                <span>Get Started</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="btn btn-secondary text-lg px-8 py-4">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage your healthcare billing operations efficiently
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="card group hover:scale-105 transition-all duration-300 animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="text-white" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-20 bg-gradient-to-br from-primary-50 to-primary-100 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose mSana Billing?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Built for healthcare professionals who demand excellence
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div
                                    key={index}
                                    className="text-center group"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="text-primary-600" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="py-20 bg-white scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Perfect For
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Designed to meet the needs of various healthcare settings
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card text-center">
                            <Users className="text-primary-600 mx-auto mb-4" size={48} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Hospitals</h3>
                            <p className="text-gray-600">
                                Complete billing solution for hospitals with patient management, discharge summaries, and comprehensive reporting.
                            </p>
                        </div>
                        <div className="card text-center">
                            <Pill className="text-green-600 mx-auto mb-4" size={48} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pharmacies</h3>
                            <p className="text-gray-600">
                                Specialized pharmacy billing with inventory tracking, expiry management, and supplier integration.
                            </p>
                        </div>
                        <div className="card text-center">
                            <ClipboardList className="text-purple-600 mx-auto mb-4" size={48} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Clinics</h3>
                            <p className="text-gray-600">
                                Streamlined billing for clinics with quick invoice generation and patient record management.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold mb-2">100%</div>
                            <div className="text-primary-100 text-lg">Accurate Billing</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">24/7</div>
                            <div className="text-primary-100 text-lg">System Availability</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">99.9%</div>
                            <div className="text-primary-100 text-lg">Uptime Guarantee</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">1000+</div>
                            <div className="text-primary-100 text-lg">Happy Users</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Ready to Transform Your Billing Process?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Join thousands of healthcare professionals who trust mSana Billing for their operations.
                        </p>
                        <Link
                            to="/login"
                            className="btn btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2 group"
                        >
                            <span>Start Free Trial</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <img src="/logo.jpg" alt="mSana Logo" className="w-10 h-10 rounded-xl" />
                                <span className="text-xl font-bold">mSana Billing</span>
                            </div>
                            <p className="text-gray-400">
                                Complete healthcare billing solution for hospitals, pharmacies, and clinics.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Features</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Hospital Billing</li>
                                <li>Pharmacy Billing</li>
                                <li>Inventory Management</li>
                                <li>Reports & Analytics</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Documentation</li>
                                <li>Help Center</li>
                                <li>Contact Us</li>
                                <li>FAQ</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>About Us</li>
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                                <li>Careers</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 mSana Billing. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

