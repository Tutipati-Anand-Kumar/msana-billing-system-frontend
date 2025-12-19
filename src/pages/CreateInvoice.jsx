import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/product';
import { createInvoice } from '../api/invoice';
import { formatCurrency } from '../utils/formatter';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueInvoice } from '../services/db';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        patientName: '',
        customerPhone: '',
        customerEmail: '',
        mode: 'CASH',
        paymentStatus: 'paid',
        notes: '',
        patientAddress: '',
        admissionDate: '',
        dischargeDate: '',
        department: '',
        roomNo: '',
        diagnosis: '',
    });
    const [items, setItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await getProducts();
            setProducts(response.data);
        } catch (err) {
            toast.error('Failed to load products');
        }
    };

    const addItem = () => {
        if (!selectedProduct || quantity <= 0) {
            toast.error('Please select a product and enter quantity');
            return;
        }

        const product = products.find((p) => p._id === selectedProduct);
        if (!product) return;

        if (product.stock < quantity) {
            toast.error(`Insufficient stock. Available: ${product.stock}`);
            return;
        }

        const existingItem = items.find((item) => item.product === product._id);
        if (existingItem) {
            toast.error('Product already added. Update quantity instead.');
            return;
        }

        setItems([
            ...items,
            {
                product: product._id,
                productName: product.name,
                price: product.price,
                quantity: parseInt(quantity),
            },
        ]);

        setSelectedProduct('');
        setQuantity(1);
    };

    const removeItem = (productId) => {
        setItems(items.filter((item) => item.product !== productId));
    };

    const updateItemQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) return;

        const product = products.find((p) => p._id === productId);
        if (product && product.stock < newQuantity) {
            toast.error(`Insufficient stock. Available: ${product.stock}`);
            return;
        }

        setItems(
            items.map((item) =>
                item.product === productId ? { ...item, quantity: parseInt(newQuantity) } : item
            )
        );
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patientName) {
            toast.error('Please enter patient name');
            return;
        }

        if (items.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        setLoading(true);

        try {
            const invoiceData = {
                ...formData,
                items: items.map((item) => ({
                    product: item.product,
                    quantity: item.quantity,
                })),
            };

            // Check if online
            if (navigator.onLine) {
                // Online: Create invoice normally
                await createInvoice(invoiceData);
                toast.success('Invoice created successfully!');
                navigate('/invoices');
            } else {
                // Offline: Queue invoice for later sync
                await queueInvoice(invoiceData);
                toast.success('📱 Offline: Invoice queued. Will sync when online.');
                navigate('/invoices');
            }
        } catch (err) {
            // If network error while supposedly online, try to queue
            if (err.code === 'ERR_NETWORK' || !navigator.onLine) {
                try {
                    const invoiceData = {
                        ...formData,
                        items: items.map((item) => ({
                            product: item.product,
                            quantity: item.quantity,
                        })),
                    };
                    await queueInvoice(invoiceData);
                    toast.success('📱 Network error: Invoice queued for sync.');
                    navigate('/invoices');
                } catch (queueError) {
                    toast.error('Failed to save invoice offline');
                }
            } else {
                toast.error(err.response?.data?.message || 'Failed to create invoice');
            }
        } finally {
            setLoading(false);
        }
    };

    const subtotal = calculateSubtotal();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
                    <p className="text-gray-600 mt-2">Generate a new bill for customer</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Patient Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    required
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <select
                                    value={formData.mode}
                                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                    className="input"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CREDIT">Credit / Bank Transfer</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Hospital / Admission Details */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospital / Admission Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Address</label>
                                <input
                                    type="text"
                                    value={formData.patientAddress || ''}
                                    onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
                                    className="input"
                                    placeholder="Full Address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date/Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.admissionDate || ''}
                                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date/Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.dischargeDate || ''}
                                    onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <input
                                    type="text"
                                    value={formData.department || ''}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Cardiology"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Room No</label>
                                <input
                                    type="text"
                                    value={formData.roomNo || ''}
                                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                    className="input"
                                    placeholder="e.g. 101"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                                <input
                                    type="text"
                                    value={formData.diagnosis || ''}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Viral Fever"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Products */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Products</h2>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="input"
                                >
                                    <option value="">Select Product</option>
                                    {products.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.name} - {formatCurrency(product.price)} (Stock: {product.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-32">
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Qty"
                                    className="input"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="btn btn-primary flex items-center justify-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add</span>
                            </button>
                        </div>

                        {/* Items List */}
                        {items.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="table-header">Product</th>
                                            <th className="table-header">Price</th>
                                            <th className="table-header">Quantity</th>
                                            <th className="table-header">Total</th>
                                            <th className="table-header">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {items.map((item) => (
                                            <tr key={item.product}>
                                                <td className="table-cell">{item.productName}</td>
                                                <td className="table-cell">{formatCurrency(item.price)}</td>
                                                <td className="table-cell">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQuantity(item.product, e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="table-cell font-semibold">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </td>
                                                <td className="table-cell">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.product)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {items.length > 0 && (
                        <div className="card bg-gray-50">
                            <div className="space-y-2">
                                <div className="flex justify-between text-lg">
                                    <span className="font-medium">Subtotal:</span>
                                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-2xl border-t pt-2">
                                    <span className="font-bold">Total:</span>
                                    <span className="font-bold text-primary-600">{formatCurrency(subtotal)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="card">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            className="input"
                            placeholder="Additional notes..."
                        ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/invoices')}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || items.length === 0}
                            className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="spinner border-white"></div>
                            ) : (
                                <>
                                    <ShoppingCart size={20} />
                                    <span>Create Invoice</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoice;