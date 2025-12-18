import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProducts, deleteProduct, createProduct, updateProduct, bulkImportProducts } from '../api/product';
import { getSuppliers } from '../api/supplier';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, getStockStatus } from '../utils/formatter';
import { Plus, Search, Edit, Trash2, Package, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        generic: '',
        brand: '',
        form: 'TAB',
        strength: '',
        schedule: 'OTC',
        mrp: '',
        stock: '',
        minStock: 10,
        hsnCode: '',
        batchNumber: '',
        expiryDate: '',
        gstPercent: 12,
        unitsPerPack: 1,
        supplier: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [productsData, suppliersData] = await Promise.all([
                getProducts(), // Fetch all products once
                getSuppliers(),
            ]);
            setProducts(productsData.data);
            setSuppliers(suppliersData.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Only fetch on mount

    // Client-side filtering
    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            product.brand?.toLowerCase().includes(searchLower) ||
            product.generic?.toLowerCase().includes(searchLower) ||
            product.sku?.toLowerCase().includes(searchLower)
        );
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedProduct) {
                await updateProduct(selectedProduct._id, formData);
                toast.success('Product updated successfully');
            } else {
                await createProduct(formData);
                toast.success('Product created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            sku: product.sku || '',
            generic: product.generic || '',
            brand: product.brand || '',
            form: product.form || 'TAB',
            strength: product.strength || '',
            schedule: product.schedule || 'OTC',
            mrp: product.mrp || '',
            stock: product.stock || 0,
            minStock: product.minStock || 10,
            hsnCode: product.hsnCode || '',
            batchNumber: product.batchNumber || '',
            expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
            gstPercent: product.gstPercent || 12,
            unitsPerPack: product.unitsPerPack || 1,
            supplier: product.supplier?._id || product.supplier || '',
        });
        setShowModal(true);
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const loadingToast = toast.loading('Importing products...');
        try {
            const result = await bulkImportProducts(file);
            toast.success(result.message || 'Import successful', { id: loadingToast });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Import failed', { id: loadingToast });
        } finally {
            e.target.value = ''; // Reset input
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProduct(selectedProduct._id);
            toast.success('Product deleted successfully');
            setShowDeleteDialog(false);
            setSelectedProduct(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            sku: '',
            generic: '',
            brand: '',
            form: 'TAB',
            strength: '',
            schedule: 'OTC',
            mrp: '',
            stock: '',
            minStock: 10,
            hsnCode: '',
            batchNumber: '',
            expiryDate: '',
            gstPercent: 12,
            unitsPerPack: 1,
            supplier: '',
        });
        setSelectedProduct(null);
    };

    if (loading) return <Loading message="Loading products..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header */}
                {/* Header with Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
                    <div className="flex-shrink-0">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                            Products
                        </h1>
                        <p className="text-gray-600 text-lg font-medium">Manage your inventory</p>
                    </div>

                    {/* Search Bar - Moved to Top */}
                    <div className="flex-1 w-full md:max-w-xl md:mx-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10 w-full border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        {/* Bulk Import - Only for Admin & Manager */}
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                            <>
                                <input
                                    type="file"
                                    id="bulk-import-input"
                                    hidden
                                    accept=".csv"
                                    onChange={handleBulkUpload}
                                />
                                <button
                                    onClick={() => document.getElementById('bulk-import-input').click()}
                                    className="btn btn-secondary bg-green-500 w-full md:w-auto flex items-center justify-center space-x-2"
                                >
                                    <Upload size={20} />
                                    <span>Bulk Import</span>
                                </button>
                            </>
                        )}

                        {/* Add Product Button - Hidden for Pharmacy Staff */}
                        {user?.role !== 'pharmacy' && (
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="btn btn-primary w-full md:w-auto flex items-center justify-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add Product</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto relative">
                        <table className="table min-w-full">
                            <thead className="bg-black sticky top-0 z-20">
                                <tr >
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">Brand Name</th>
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">Generic Name</th>
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">Sch</th>
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">Expiry</th>
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">MRP</th>
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">Stock</th>
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">Status</th>
                                    <th className="bg-white border border-gray-300 text-center py-2 sticky top-0 z-20 shadow-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12">
                                            <Package className="mx-auto text-gray-400 mb-4" size={48} />
                                            <p className="text-gray-500">No products found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const status = getStockStatus(product.stock, product.minStock || 10);
                                        return (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="table-cell border border-gray-300">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.brand}</p>
                                                        <p className="text-xs text-gray-500">{product.strength} | {product.form}</p>
                                                    </div>
                                                </td>
                                                <td className="table-cell text-sm border border-gray-300">{product.generic}</td>
                                                <td className="table-cell text-xs font-bold border border-gray-300 text-center">{product.schedule}</td>
                                                <td className="table-cell border border-gray-300 text-center">
                                                    {(() => {
                                                        if (!product.expiryDate) return <span className="text-gray-400">-</span>;
                                                        const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                                        if (daysUntilExpiry <= 30) {
                                                            return <span className="text-red-600 font-bold">{new Date(product.expiryDate).toLocaleDateString()}</span>;
                                                        }
                                                        return <span className="text-gray-300">-</span>;
                                                    })()}
                                                </td>
                                                <td className="table-cell border border-gray-300 text-center">{formatCurrency(product.mrp)}</td>
                                                <td className="table-cell border border-gray-300 text-center">
                                                    {product.stock}
                                                </td>
                                                <td className="table-cell border border-gray-300 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs ${status.bgColor} ${status.color}`}>
                                                        {status.status}
                                                    </span>
                                                </td>
                                                <td className="table-cell border border-gray-300 text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        {/* Delete button visible to admin and manager */}
                                                        {(user?.role === 'admin' || user?.role === 'manager') && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedProduct(product);
                                                                    setShowDeleteDialog(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Product Form Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={selectedProduct ? 'Edit Product' : 'Add New Product'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                required
                                className="input"
                                placeholder="e.g., PAR500TAB"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Generic Name *</label>
                            <input
                                type="text"
                                value={formData.generic}
                                onChange={(e) => setFormData({ ...formData, generic: e.target.value })}
                                required
                                className="input"
                                placeholder="e.g., Paracetamol"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                required
                                className="input"
                                placeholder="e.g., Crocin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Strength *</label>
                            <input
                                type="text"
                                value={formData.strength}
                                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                                required
                                className="input"
                                placeholder="e.g., 500mg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Form *</label>
                            <select
                                value={formData.form}
                                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                                required
                                className="input"
                            >
                                <option value="TAB">TAB - Tablet</option>
                                <option value="CAP">CAP - Capsule</option>
                                <option value="SYR">SYR - Syrup</option>
                                <option value="INJ">INJ - Injection</option>
                                <option value="CRM">CRM - Cream</option>
                                <option value="ONT">ONT - Ointment</option>
                                <option value="DRP">DRP - Drops</option>
                                <option value="PWD">PWD - Powder</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule *</label>
                            <select
                                value={formData.schedule}
                                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                required
                                className="input"
                            >
                                <option value="OTC">OTC - Over the Counter</option>
                                <option value="H">H - Prescription</option>
                                <option value="H1">H1 - Prescription (Schedule H1)</option>
                                <option value="X">X - Prescription (Schedule X)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">MRP (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.mrp}
                                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                required
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GST %</label>
                            <select
                                value={formData.gstPercent}
                                onChange={(e) => setFormData({ ...formData, gstPercent: Number(e.target.value) })}
                                className="input"
                            >
                               <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                className="input"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Level</label>
                            <input
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                className="input"
                                placeholder="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Units Per Pack</label>
                            <input
                                type="number"
                                value={formData.unitsPerPack}
                                onChange={(e) => setFormData({ ...formData, unitsPerPack: e.target.value })}
                                className="input"
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                            <input
                                type="text"
                                value={formData.hsnCode}
                                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                className="input"
                                placeholder="e.g., 30049099"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                            <input
                                type="text"
                                value={formData.batchNumber}
                                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                            <select
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                required
                                className="input"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                        <button type="submit" className="btn btn-primary flex-1">
                            {selectedProduct ? 'Update' : 'Create'} Product
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedProduct(null);
                }}
                onConfirm={handleDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${selectedProduct?.brand || selectedProduct?.name}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default Products;
