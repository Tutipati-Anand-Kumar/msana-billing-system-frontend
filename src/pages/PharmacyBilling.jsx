import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/product';
import { createInvoice } from '../api/invoice';
import { formatCurrency } from '../utils/formatter';
import { Plus, Trash2, ShoppingCart, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueInvoice, saveDraft, getDraft, clearDraft } from '../services/db';

const PharmacyBilling = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        patientName: '',
        patientPhone: '',
        mode: 'CASH',
        paymentStatus: 'paid',
    });
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('%');
    const [loading, setLoading] = useState(false);

    // New payment states
    const [paidAmount, setPaidAmount] = useState(0);
    const [balanceAmount, setBalanceAmount] = useState(0);

    const [lastInvoice, setLastInvoice] = useState(null); // For printing after save

    useEffect(() => {
        fetchProducts();
        loadDraft();
    }, []);

    // Auto-save draft on change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.patientName || items.length > 0) {
                saveDraft('pharmacy', { formData, items, discount, discountType, paidAmount });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData, items, discount, discountType, paidAmount]);

    // Auto-calculate balance whenever totals or paid amount changes
    useEffect(() => {
        const total = calculateGrandTotal();
        const safePaid = parseFloat(paidAmount) || 0;
        const balance = total - safePaid;
        setBalanceAmount(balance > 0 ? balance : 0);
    }, [items, discount, discountType, paidAmount]);

    // Default paid amount to full amount when items change (if "paid" status)
    useEffect(() => {
        if (formData.paymentStatus === 'paid') {
            const total = calculateGrandTotal();
            if (total > 0) setPaidAmount(total);
        }
    }, [items, discount, discountType, formData.paymentStatus]);


    const loadDraft = async () => {
        const draft = await getDraft('pharmacy');
        if (draft) {
            if (draft.formData) {
                // Map old paymentMethod to new mode field for backward compatibility
                const updatedFormData = { ...draft.formData };
                if (updatedFormData.paymentMethod && !updatedFormData.mode) {
                    updatedFormData.mode = updatedFormData.paymentMethod.toUpperCase();
                    delete updatedFormData.paymentMethod;
                }
                setFormData(updatedFormData);
            }
            if (draft.items) setItems(draft.items);
            if (draft.discount) setDiscount(draft.discount);
            if (draft.discountType) setDiscountType(draft.discountType);
            if (draft.paidAmount !== undefined) setPaidAmount(draft.paidAmount);
            // toast.success('📝 Draft restored');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await getProducts();
            setProducts(response.data);
        } catch (err) {
            toast.error('Failed to load products');
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value.length > 0) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(value.toLowerCase()) ||
                p.sku?.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredProducts(filtered);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setShowDropdown(false);
    };

    const addItem = () => {
        if (!selectedProduct || quantity <= 0) {
            toast.error('Please select a product and enter quantity');
            return;
        }

        if (selectedProduct.stock < quantity) {
            toast.error(`Insufficient stock. Available: ${selectedProduct.stock}`);
            return;
        }

        const existingItem = items.find(item => item.product === selectedProduct._id);
        if (existingItem) {
            toast.error('Product already added. Update quantity in the table.');
            return;
        }

        const newItem = {
            product: selectedProduct._id,
            productName: selectedProduct.name,
            unit: selectedProduct.unit || 'pcs',
            unitRate: selectedProduct.mrp || selectedProduct.sellingPrice || selectedProduct.price || 0,
            qty: parseFloat(quantity),
            gstPct: selectedProduct.gstPercent || 0,
            stock: selectedProduct.stock || 0,
        };

        setItems([...items, newItem]);
        setSearchTerm('');
        setSelectedProduct(null);
        setQuantity(1);
        toast.success('Item added');
    };

    const removeItem = (productId) => {
        setItems(items.filter(item => item.product !== productId));
    };

    const updateItemQuantity = (productId, newQty) => {
        if (newQty < 0) return;
        const item = items.find(i => i.product === productId);
        if (item && item.stock < newQty) {
            toast.error(`Insufficient stock. Available: ${item.stock}`);
            return;
        }
        setItems(items.map(item =>
            item.product === productId ? { ...item, qty: parseFloat(newQty) || 0 } : item
        ));
    };

    const updateItemPrice = (productId, newRate) => {
        if (newRate < 0) return;
        setItems(items.map(item =>
            item.product === productId ? { ...item, unitRate: parseFloat(newRate) || 0 } : item
        ));
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.qty * (item.unitRate || 0)), 0);
    };

    const calculateGSTTotal = () => {
        return items.reduce((sum, item) => {
            const baseAmount = item.qty * (item.unitRate || 0);
            return sum + (baseAmount * (item.gstPct || 0) / 100);
        }, 0);
    };

    const calculateDiscountAmount = () => {
        const subtotal = calculateSubtotal();
        if (discountType === '%') {
            return (subtotal * discount) / 100;
        }
        return discount;
    };

    const calculateGrandTotal = () => {
        return calculateSubtotal() + calculateGSTTotal() - calculateDiscountAmount();
    };

    const handleSubmit = async (e, shouldPrint = false) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        if (formData.patientPhone && formData.patientPhone.length !== 10) {
            toast.error('Mobile number must be exactly 10 digits');
            return;
        }

        setLoading(true);
        try {
            const grandTotal = calculateGrandTotal();
            const safePaid = parseFloat(paidAmount) || 0;
            const safeBalance = grandTotal - safePaid;

            const invoiceData = {
                patientName: formData.patientName || 'Walk-in Customer',
                patientPhone: formData.patientPhone || '',
                items: items,
                mode: formData.mode,
                paymentStatus: formData.paymentStatus,
                discount: calculateDiscountAmount(),
                paid: safePaid,
                balance: safeBalance > 0 ? safeBalance : 0,
                notes: 'Pharmacy Billing',

                // Fields required by model but calculated backend usually, sending for offline accuracy
                subTotal: calculateSubtotal(),
                taxTotal: calculateGSTTotal(),
                netPayable: grandTotal
            };

            const isOnline = navigator.onLine;
            let savedInvoice = null;

            if (!isOnline) {
                const result = await queueInvoice(invoiceData);
                toast.success('Invoice queued for sync (offline)');
                savedInvoice = { ...invoiceData, invoiceNo: 'PENDING-SYNC' }; // Mock for print
            } else {
                try {
                    const response = await createInvoice(invoiceData);
                    savedInvoice = response.data;
                    toast.success('Invoice created successfully!');

                    // Only clear draft if NOT printing (so data persists for reprint/view)
                    if (!shouldPrint) {
                        await clearDraft('pharmacy');
                    }
                } catch (error) {
                    await queueInvoice(invoiceData);
                    toast.success('Invoice queued for sync');
                    savedInvoice = { ...invoiceData, invoiceNo: 'OFFLINE' };
                }
            }

            if (shouldPrint && savedInvoice) {
                setLastInvoice(savedInvoice);
                // Allow state update then print
                setTimeout(() => {
                    window.print();
                    // Do NOT reset form here as per user request
                }, 500);
            } else {
                resetForm();
                navigate('/invoices');
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ patientName: '', patientPhone: '', mode: 'CASH', paymentStatus: 'paid' });
        setItems([]);
        setDiscount(0);
        setDiscountType('%');
        setPaidAmount(0);
        setBalanceAmount(0);
        // Don't clear lastInvoice immediately if we want it to persist on screen for a moment, but reset is fine
        // setLastInvoice(null); 
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Non-Printable Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:hidden">
                <div className="bg-white rounded-lg shadow-md p-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <img src="/logo.jpg" alt="mSana" className="w-10 h-10 rounded-lg mr-3 object-cover" />
                            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Billing</h1>
                        </div>
                    </div>

                    <form onSubmit={(e) => handleSubmit(e, false)}>
                        {/* Patient Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    className="input"
                                    placeholder="Walk-in Customer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile
                                </label>
                                <input
                                    type="tel"
                                    value={formData.patientPhone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, patientPhone: value });
                                    }}
                                    className="input"
                                    placeholder="9876543210"
                                    maxLength="10"
                                />
                            </div>
                        </div>

                        {/* Add Item Section */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h2 className="text-lg font-semibold mb-4">Add Item</h2>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {/* Product Autocomplete */}
                                <div className="md:col-span-2 relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product *
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        onFocus={() => searchTerm && setShowDropdown(true)}
                                        className="input"
                                        placeholder="Search product..."
                                        autoComplete="off"
                                    />
                                    {showDropdown && filteredProducts.length > 0 && (
                                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredProducts.map((product) => (
                                                <div
                                                    key={product._id}
                                                    onMouseDown={() => handleSelectProduct(product)}
                                                    className="px-4 py-2 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Stock: {product.stock} | MRP: ₹{product.mrp || product.price || 0} | GST: {product.gstPercent}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="0"
                                        step="any"
                                        className="input"
                                    />
                                </div>

                                {/* Unit (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedProduct?.unit || 'pcs'}
                                        readOnly
                                        className="input bg-gray-100"
                                    />
                                </div>

                                {/* Add Button */}
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="btn btn-primary w-full flex items-center justify-center"
                                    >
                                        <Plus size={20} className="mr-2" />
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Product Details (when selected) */}
                            {selectedProduct && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div><strong>Price:</strong> ₹{selectedProduct.mrp || selectedProduct.price || 0}</div>
                                        <div><strong>GST:</strong> {selectedProduct.gstPercent}%</div>
                                        <div><strong>Stock:</strong> {selectedProduct.stock}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="mb-6 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sl. No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST %</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                No items added yet
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={item.product}>
                                                <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{item.productName}</td>
                                                <td className="px-4 py-3 text-sm">{item.unit}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <input
                                                        type="tel"
                                                        value={item.qty}
                                                        onChange={(e) => updateItemQuantity(item.product, e.target.value)}
                                                        min="0"
                                                        step="any"
                                                        className="w-20 px-2 py-1 border rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center">
                                                        <span className="mr-1">₹</span>
                                                        <input
                                                            type="tel"
                                                            value={item.unitRate}
                                                            onChange={(e) => updateItemPrice(item.product, e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                            className="w-24 px-2 py-1 border rounded font-medium"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{item.gstPct}%</td>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    ₹{(
                                                        (item.qty * (item.unitRate || 0)) +
                                                        ((item.qty * (item.unitRate || 0)) * (item.gstPct || 0) / 100)
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.product)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Discount, Payment & Totals */}
                        <div className="flex flex-col md:flex-row justify-between mb-6 gap-6">

                            {/* Payment Section */}
                            <div className="w-full md:w-1/2 p-4 bg-gray-50 rounded-lg h-fit">
                                <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                {/* <option value="CREDIT">Credit</option> */}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={formData.paymentStatus}
                                                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                                className="input"
                                            >
                                                <option value="paid">Paid</option>
                                                <option value="pending">Pending</option>
                                                <option value="partial">Partial</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Paid Amount (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(e.target.value)}
                                                min="0"
                                                className="input font-semibold text-green-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Balance (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={balanceAmount.toFixed(2)}
                                                readOnly
                                                className="input bg-gray-200 text-gray-500 font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Totals Section */}
                            <div className="w-full md:w-1/3 space-y-3">
                                {/* Discount */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Discount:</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="tel"
                                            value={discount}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}

                                            className="w-24 px-2 py-1 border rounded"
                                        />
                                        <select
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value)}
                                            className="px-2 py-1 border rounded"
                                        >
                                            <option value="%">%</option>
                                            <option value="₹">₹</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Subtotal */}
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                                </div>

                                {/* GST */}
                                <div className="flex justify-between text-sm">
                                    <span>GST Total:</span>
                                    <span>₹{calculateGSTTotal().toFixed(2)}</span>
                                </div>

                                {/* Discount Amount */}
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Discount:</span>
                                        <span>- ₹{calculateDiscountAmount().toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Grand Total */}
                                <div className="flex justify-between text-2xl font-bold border-t pt-2 text-primary-700">
                                    <span>Grand Total:</span>
                                    <span>₹{calculateGrandTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3 max-sm:h-12  ">
                            <button
                                type="button"
                                onClick={async () => {
                                    await clearDraft('pharmacy');
                                    resetForm();
                                    navigate('/pharmacy-billing');
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={loading || items.length === 0}
                                className="btn btn-secondary flex items-center bg-white border-gray-400 text-primary-600 hover:bg-primary-100"
                            >
                                <Printer size={20} className="mr-2 max-sm:hidden" />
                                {loading ? 'Saving...' : 'Save & Print'}
                            </button>   
                            <button
                                type="submit"
                                disabled={loading || items.length === 0}
                                className="btn btn-primary flex items-center"
                            >
                                <ShoppingCart size={20} className="mr-2 max-sm:hidden" />
                                {loading ? 'Saving...' : 'Save Invoice'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Printable Invoice Template */}
            <div className="hidden print:block absolute top-0 left-0 w-full bg-white p-8 z-[99999]">
                {/* Only show if we have data to print, effectively items from state or lastInvoice */}
                <div className="max-w-3xl mx-auto border border-gray-300 p-8">
                    {/* Header */}
                    <div className="text-center mb-6 border-b pb-4">
                        <div className="flex justify-center mb-2">
                            <img src="/logo.jpg" alt="mSana Logo" className="w-24 h-24 rounded-lg object-contain" />
                        </div>
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800">mSana Pharmacy</h1>
                        <p className="text-sm text-gray-500 font-medium">Excellence in Healthcare</p>
                        <p className="text-xs text-gray-400 mt-1">Tax Invoice</p>
                    </div>

                    {/* Meta Data */}
                    <div className="flex justify-between mb-8 border-b pb-4">
                        <div>
                            <p className="text-sm text-gray-600">Bill To:</p>
                            <h3 className="font-bold text-lg">{formData.patientName || 'Walk-in Customer'}</h3>
                            {formData.patientPhone && <p className="text-sm">{formData.patientPhone}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-sm"><span className="font-medium">Invoice No:</span> {lastInvoice?.invoiceNo || 'Pending...'}</p>
                            <p className="text-sm"><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
                            <p className="text-sm"><span className="font-medium">Payment:</span> {formData.mode.toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-800">
                                <th className="text-left py-2 text-sm font-bold">Item</th>
                                <th className="text-center py-2 text-sm font-bold">Qty</th>
                                <th className="text-right py-2 text-sm font-bold">Rate</th>
                                <th className="text-right py-2 text-sm font-bold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-200">
                                    <td className="py-2 text-sm">{item.productName}</td>
                                    <td className="text-center py-2 text-sm">{item.qty}</td>
                                    <td className="text-right py-2 text-sm">{(item.unitRate || 0).toFixed(2)}</td>
                                    <td className="text-right py-2 text-sm font-medium">{((item.qty * (item.unitRate || 0))).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-1/2 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>GST:</span>
                                <span>{calculateGSTTotal().toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Discount:</span>
                                    <span>-{calculateDiscountAmount().toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t border-gray-800 pt-2 mt-2">
                                <span>Grand Total:</span>
                                <span>{calculateGrandTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2">
                                <span>Paid Amount:</span>
                                <span>{parseFloat(paidAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span>Balance Due:</span>
                                <span>{balanceAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
                        <p>Thank you for your business!</p>
                        <p className="mt-1">Computer Generated Invoice</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacyBilling;
