import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/supplier';
import { getProducts } from '../api/product';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    Plus, Search,  Trash2, Users, MapPin,
    Phone, Mail, FileText, StickyNote, Package, ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../utils/formatter';
import toast from 'react-hot-toast';

const Suppliers = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals state
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showProductsModal, setShowProductsModal] = useState(false);

    // Selected data state
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedSupplierProducts, setSelectedSupplierProducts] = useState([]);
    const [supplierLoading, setSupplierLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstNumber: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [suppliersRes, productsRes] = await Promise.all([
                getSuppliers(),
                getProducts()
            ]);
            setSuppliers(suppliersRes.data.filter(s => s.isActive));
            setAllProducts(productsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredSuppliers = suppliers.filter(supplier => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            supplier.name?.toLowerCase().includes(searchLower) ||
            supplier.phone?.toLowerCase().includes(searchLower) ||
            supplier.email?.toLowerCase().includes(searchLower) ||
            supplier.gstNumber?.toLowerCase().includes(searchLower)
        );
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.phone.length !== 10) {
            return toast.error('Phone number must be exactly 10 digits');
        }

        if (formData.gstNumber && formData.gstNumber.length !== 15) {
            return toast.error('GST number must be exactly 15 characters');
        }

        try {
            setSupplierLoading(true);

            const finalData = {
                ...formData,
                address: typeof formData.address === 'string' ? {
                    street: formData.address,
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India'
                } : formData.address
            };

            if (selectedSupplier) {
                await updateSupplier(selectedSupplier._id, finalData);
                toast.success('Supplier updated successfully');
            } else {
                await createSupplier(finalData);
                toast.success('Supplier created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSupplierLoading(false);
        }
    };

   

    const handleDelete = async () => {
        try {
            await deleteSupplier(selectedSupplier._id);
            toast.success('Supplier deleted successfully');
            setShowDeleteDialog(false);
            setSelectedSupplier(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const openDeleteDialog = (e, supplier) => {
        e.stopPropagation();
        setSelectedSupplier(supplier);
        setShowDeleteDialog(true);
    };

    const handleViewProducts = (supplier) => {
        const filtered = allProducts.filter(p => {
            const supplierId = p.supplier?._id || p.supplier;
            return supplierId === supplier._id;
        });
        setSelectedSupplier(supplier);
        setSelectedSupplierProducts(filtered);
        setShowProductsModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            gstNumber: '',
            notes: ''
        });
        setSelectedSupplier(null);
    };

    const formatAddress = (address) => {
        if (!address) return '';
        if (typeof address === 'string') return address;
        if (typeof address === 'object') {
            const { street, city, state, pincode, country } = address;
            return [street, city, state, pincode, country].filter(Boolean).join(', ');
        }
        return '';
    };

    if (loading) return <Loading message="Loading suppliers and products..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                            Suppliers
                        </h1>
                        <p className="text-gray-600 text-lg font-medium">Manage your active suppliers and vendors</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Supplier</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative group max-w-xl">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search suppliers by name, phone, email, or GST..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 w-full border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Suppliers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <Users className="mx-auto text-gray-300 mb-4" size={64} />
                            <p className="text-gray-500 text-xl font-medium">No suppliers found</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 text-primary-600 font-semibold hover:underline"
                            >
                                Add your first supplier
                            </button>
                        </div>
                    ) : (
                        filteredSuppliers.map((supplier) => {
                            const productCount = allProducts.filter(p => {
                                const supplierId = p.supplier?._id || p.supplier;
                                return supplierId === supplier._id;
                            }).length;

                            return (
                                <div
                                    key={supplier._id}
                                    onClick={() => handleViewProducts(supplier)}
                                    className="card group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer bg-white relative overflow-hidden"
                                >
                                    {/* Active hover overlay indicator */}
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink size={18} className="text-primary-500" />
                                    </div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                            <Users size={24} />
                                        </div>
                                        <div className="flex space-x-1">
                                        
                                            <button
                                                onClick={(e) => openDeleteDialog(e, supplier)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Supplier"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{supplier.name}</h3>
                                        <span className="flex-shrink-0 bg-primary-50 text-primary-600 text-xs font-bold px-2 py-1 rounded-full border border-primary-100">
                                            {productCount} Products
                                        </span>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center text-gray-600">
                                            <Phone size={16} className="mr-3 text-gray-400" />
                                            <span className="text-sm font-medium">{supplier.phone}</span>
                                        </div>

                                        {supplier.email && (
                                            <div className="flex items-center text-gray-600">
                                                <Mail size={16} className="mr-3 text-gray-400" />
                                                <span className="text-sm font-medium truncate">{supplier.email}</span>
                                            </div>
                                        )}

                                        {supplier.gstNumber && (
                                            <div className="flex items-center text-gray-600">
                                                <FileText size={16} className="mr-3 text-gray-400" />
                                                <span className="text-sm font-medium">GST: {supplier.gstNumber}</span>
                                            </div>
                                        )}

                                        {supplier.address && (
                                            <div className="flex items-start text-gray-600">
                                                <MapPin size={16} className="mr-3 text-gray-400 mt-0.5" />
                                                <span className="text-sm font-medium leading-relaxed">{formatAddress(supplier.address)}</span>
                                            </div>
                                        )}

                                        {supplier.notes && (
                                            <div className="flex items-start text-gray-600 pt-2 border-t border-gray-50 mt-2">
                                                <StickyNote size={16} className="mr-3 text-gray-400 mt-0.5" />
                                                <span className="text-xs italic leading-relaxed text-gray-500 line-clamp-2">{supplier.notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs font-semibold text-primary-600 uppercase tracking-wider group-hover:text-primary-700">
                                        <Package size={14} className="mr-2" />
                                        View Products
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Supplier Form Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Pharma Solutions Ltd"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input
                                type="tel"
                                required
                                maxLength="10"
                                className="input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                placeholder="10-digit number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                        <input
                            type="text"
                            maxLength="15"
                            className="input"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                            placeholder="15-character GST#"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            className="input h-24 resize-none"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Complete office address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="input h-20 resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Special terms, delivery schedules, etc."
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={supplierLoading}
                            className="btn btn-primary flex-1"
                        >
                            {supplierLoading ? 'Processing...' : (selectedSupplier ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Products List Modal */}
            <Modal
                isOpen={showProductsModal}
                onClose={() => setShowProductsModal(false)}
                title={`Products from: ${selectedSupplier?.name}`}
                size="lg"
            >
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar -m-6 p-6">
                    {selectedSupplierProducts.length === 0 ? (
                        <div className="text-center py-10">
                            <Package className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500 font-medium">No products registered for this supplier.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-gray-100 rounded-xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">MRP</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedSupplierProducts.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{product.brand}</div>
                                                <div className="text-xs text-gray-500">{product.generic}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock <= product.minStockLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {product.stock} {product.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {formatCurrency(product.mrp)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => setShowProductsModal(false)} className="btn btn-secondary px-8">
                        Close
                    </button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedSupplier(null);
                }}
                onConfirm={handleDelete}
                title="Delete Supplier"
                message={`Are you sure you want to delete "${selectedSupplier?.name}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default Suppliers;