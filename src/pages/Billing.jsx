import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../api/product';
import { createInvoice } from '../api/invoice';
import { formatCurrency } from '../utils/formatter';
import { Plus, Trash2, Printer, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueInvoice } from '../services/db';

const Billing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        billNo: '',
        billDate: new Date().toISOString().split('T')[0],
        patientName: '',
        patientAddress: '',
        admissionDate: '',
        dischargeDate: '',
        doctorName: '',
        department: '',
        accommodationType: '',
        roomNo: '',
        diagnosis: '',
        customerPhone: '',
    });

    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        description: '',
        unit: 'Nos',
        quantity: 1,
        pricePerUnit: 0,
        gstPercent: 0,
    });

    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'amount'

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
        if (!currentItem.description || currentItem.quantity <= 0 || currentItem.pricePerUnit <= 0) {
            toast.error('Please fill all item details');
            return;
        }

        const amount = currentItem.quantity * currentItem.pricePerUnit;
        const gstAmount = (amount * currentItem.gstPercent) / 100;
        const totalAmount = amount + gstAmount;

        setItems([...items, {
            ...currentItem,
            amount: totalAmount,
            gstAmount,
        }]);

        setCurrentItem({
            description: '',
            unit: 'Nos',
            quantity: 1,
            pricePerUnit: 0,
            gstPercent: 0,
        });
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => {
            const baseAmount = item.quantity * item.pricePerUnit;
            return sum + baseAmount;
        }, 0);
    };

    const calculateGST = () => {
        return items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
    };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        if (discountType === 'percent') {
            return (subtotal * discount) / 100;
        }
        return discount;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const gst = calculateGST();
        const discountAmount = calculateDiscount();
        return subtotal + gst - discountAmount;
    };

    const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if (num === 0) return 'Zero';

        const convertLessThanThousand = (n) => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000);
        const remainder = num % 1000;

        let result = '';
        if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
        if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
        if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
        if (remainder > 0) result += convertLessThanThousand(remainder);

        return result.trim() + ' Rupees Only';
    };

    const handleSave = async (shouldPrint = false) => {
        if (!formData.patientName || items.length === 0) {
            toast.error('Please fill patient name and add at least one item');
            return;
        }

        setLoading(true);
        try {
            const invoiceData = {
                patientName: formData.patientName,
                patientAddress: formData.patientAddress,
                admissionDate: formData.admissionDate,
                dischargeDate: formData.dischargeDate,
                doctorName: formData.doctorName,
                department: formData.department,
                roomNo: formData.roomNo,
                diagnosis: formData.diagnosis,
                customerPhone: formData.customerPhone,
                items: items.map(item => ({
                    productName: item.description,
                    qty: item.quantity,
                    unitRate: item.pricePerUnit,
                    gstPct: item.gstPercent,
                    amount: item.amount,
                })),
                subTotal: calculateSubtotal(),
                taxTotal: calculateGST(),
                discountTotal: calculateDiscount(),
                netPayable: calculateTotal(),
                paid: calculateTotal(),
                balance: 0,
                mode: 'CASH',
            };

            // Check if online
            if (navigator.onLine) {
                // Online: Create invoice normally
                await createInvoice(invoiceData);
                toast.success('Bill created successfully!');

                if (shouldPrint) {
                    setTimeout(() => window.print(), 500);
                }
            } else {
                // Offline: Queue invoice for later sync
                await queueInvoice(invoiceData);
                toast.success('📱 Offline: Bill queued. Will sync when online.');

                if (shouldPrint) {
                    setTimeout(() => window.print(), 500);
                }
            }

            // Reset form
            setFormData({
                billNo: '',
                billDate: new Date().toISOString().split('T')[0],
                patientName: '',
                patientAddress: '',
                admissionDate: '',
                dischargeDate: '',
                doctorName: '',
                department: '',
                accommodationType: '',
                roomNo: '',
                diagnosis: '',
                customerPhone: '',
            });
            setItems([]);
            setDiscount(0);
        } catch (err) {
            // If network error while supposedly online, try to queue
            if (err.code === 'ERR_NETWORK' || !navigator.onLine) {
                try {
                    const invoiceData = {
                        patientName: formData.patientName,
                        patientAddress: formData.patientAddress,
                        admissionDate: formData.admissionDate,
                        dischargeDate: formData.dischargeDate,
                        doctorName: formData.doctorName,
                        department: formData.department,
                        roomNo: formData.roomNo,
                        diagnosis: formData.diagnosis,
                        customerPhone: formData.customerPhone,
                        items: items.map(item => ({
                            productName: item.description,
                            qty: item.quantity,
                            unitRate: item.pricePerUnit,
                            gstPct: item.gstPercent,
                            amount: item.amount,
                        })),
                        subTotal: calculateSubtotal(),
                        taxTotal: calculateGST(),
                        discountTotal: calculateDiscount(),
                        netPayable: calculateTotal(),
                        paid: calculateTotal(),
                        balance: 0,
                        mode: 'CASH',
                    };
                    await queueInvoice(invoiceData);
                    toast.success('📱 Network error: Bill queued for sync.');

                    if (shouldPrint) {
                        setTimeout(() => window.print(), 500);
                    }
                } catch (queueError) {
                    toast.error('Failed to save bill offline');
                }
            } else {
                toast.error(err.response?.data?.message || 'Failed to create bill');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header - Hidden on Print */}
                <div className="mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-gray-900">Hospital Billing</h1>
                    <p className="text-gray-600 mt-2">Create hospital bill in standard format</p>
                </div>

                {/* Bill Container */}
                <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:rounded-none">
                    {/* Bill Header */}
                    <div className="text-center border-b-2 border-purple-600 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-purple-700">Hospital Bill Book Format</h2>
                        <div className="flex justify-between mt-4 text-sm">
                            <div className="text-left">
                                <p><strong>Bill No.:</strong> {formData.billNo || 'Auto-generated'}</p>
                                <p><strong>Name of Patient:</strong> {formData.patientName || '_____________'}</p>
                                <p><strong>Address:</strong> {formData.patientAddress || '_____________'}</p>
                            </div>
                            <div className="text-right">
                                <p><strong>Bill Date:</strong> {formData.billDate}</p>
                                <p><strong>Date/Time of Admission:</strong> {formData.admissionDate || '_____________'}</p>
                                <p><strong>Date/Time of Discharge:</strong> {formData.dischargeDate || '_____________'}</p>
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            <div className="text-left">
                                <p><strong>Name of Treating Doctor:</strong> {formData.doctorName || '_____________'}</p>
                                <p><strong>Accommodation Type:</strong> {formData.accommodationType || '_____________'}</p>
                                <p><strong>Diagnosis:</strong> {formData.diagnosis || '_____________'}</p>
                            </div>
                            <div className="text-right">
                                <p><strong>Department:</strong> {formData.department || '_____________'}</p>
                                <p><strong>Room No.:</strong> {formData.roomNo || '_____________'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Patient Details Form - Hidden on Print */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:hidden">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                            <input
                                type="text"
                                value={formData.patientName}
                                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                className="input"
                                required
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <input
                                type="text"
                                value={formData.patientAddress}
                                onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date/Time</label>
                            <input
                                type="datetime-local"
                                value={formData.admissionDate}
                                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date/Time</label>
                            <input
                                type="datetime-local"
                                value={formData.dischargeDate}
                                onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                            <input
                                type="text"
                                value={formData.doctorName}
                                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation Type</label>
                            <input
                                type="text"
                                value={formData.accommodationType}
                                onChange={(e) => setFormData({ ...formData, accommodationType: e.target.value })}
                                className="input"
                                placeholder="e.g., General Ward, Private Room"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room No</label>
                            <input
                                type="text"
                                value={formData.roomNo}
                                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                            <input
                                type="text"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Add Item Form - Hidden on Print */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 print:hidden">
                        <h3 className="text-lg font-semibold mb-4">Add Item</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2 relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={currentItem.description}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setCurrentItem({ ...currentItem, description: value });
                                        if (value.length > 0) {
                                            const filtered = products.filter(p =>
                                                p.name.toLowerCase().includes(value.toLowerCase())
                                            );
                                            setFilteredSuggestions(filtered);
                                            setShowSuggestions(true);
                                        } else {
                                            setShowSuggestions(false);
                                        }
                                    }}
                                    className="input"
                                    placeholder="Search product or type description"
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    autoComplete="off"
                                />
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                        {filteredSuggestions.map((product) => (
                                            <li
                                                key={product._id}
                                                onClick={() => {
                                                    setCurrentItem({
                                                        ...currentItem,
                                                        description: product.name,
                                                        pricePerUnit: product.sellingPrice || 0,
                                                        gstPercent: product.gst || 0,
                                                        unit: product.unit || 'Nos',
                                                    });
                                                    setShowSuggestions(false);
                                                }}
                                                className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                                            >
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    Stock: {product.stock} | Price: ₹{product.sellingPrice}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                                <select
                                    value={currentItem.unit}
                                    onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                                    className="input"
                                >
                                    <option value="Nos">Nos</option>
                                    <option value="Hour">Hour</option>
                                    <option value="Day">Day</option>
                                    <option value="Box">Box</option>
                                    <option value="Strip">Strip</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={currentItem.quantity}
                                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price/Unit</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentItem.pricePerUnit}
                                    onChange={(e) => setCurrentItem({ ...currentItem, pricePerUnit: parseFloat(e.target.value) || 0 })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GST %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentItem.gstPercent}
                                    onChange={(e) => setCurrentItem({ ...currentItem, gstPercent: parseFloat(e.target.value) || 0 })}
                                    className="input"
                                />
                            </div>
                        </div>
                        <button
                            onClick={addItem}
                            className="btn btn-primary mt-4 flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Item</span>
                        </button>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-purple-100">
                                <tr>
                                    <th className="border border-gray-300 px-2 py-2 text-sm">Sl. No.</th>
                                    <th className="border border-gray-300 px-2 py-2 text-sm">Description</th>
                                    <th className="border border-gray-300 px-2 py-2 text-sm">Unit</th>
                                    <th className="border border-gray-300 px-2 py-2 text-sm">Quantity</th>
                                    <th className="border border-gray-300 px-2 py-2 text-sm">Price/Unit</th>
                                    <th className="border border-gray-300 px-2 py-2 text-sm">GST %</th>
                                    <th className="border border-gray-300 px-2 py-2 text-sm">Amount</th>
                                    <th className="border border-gray-300 px-2 py-2 text-sm print:hidden">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                                            No items added yet
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 px-2 py-2">{item.description}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-center">{item.unit}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(item.pricePerUnit)}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-center">{item.gstPercent}%</td>
                                            <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-center print:hidden">
                                                <button
                                                    onClick={() => removeItem(index)}
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

                    {/* Discount Section - Hidden on Print */}
                    <div className="flex justify-end mb-4 print:hidden">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="input flex-1"
                                />
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="input w-24"
                                >
                                    <option value="percent">%</option>
                                    <option value="amount">₹</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t-2 border-purple-600 pt-4">
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2">
                                <div className="flex justify-between py-2">
                                    <span className="font-medium">Sub Total:</span>
                                    <span>{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="font-medium">GST:</span>
                                    <span>{formatCurrency(calculateGST())}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="font-medium">Discount:</span>
                                    <span className="text-red-600">- {formatCurrency(calculateDiscount())}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
                                    <span>Final Amount:</span>
                                    <span className="text-purple-700">{formatCurrency(calculateTotal())}</span>
                                </div>
                                <div className="py-2 text-sm italic">
                                    <strong>Amount in Words:</strong> {numberToWords(Math.round(calculateTotal()))}
                                </div>
                                <div className="flex justify-between py-2">
                                    <span>Amount Paid:</span>
                                    <span>{formatCurrency(calculateTotal())}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span>Balance:</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="mt-6 text-sm italic text-gray-700">
                        <p><strong>Declaration:</strong></p>
                        <p>Thanks for business with us!!! Please visit us again !!!</p>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-300">
                        <div className="text-center">
                            <div className="h-16"></div>
                            <p className="font-medium">Client's Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16"></div>
                            <p className="font-medium">Business Signature</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Hidden on Print */}
                <div className="flex space-x-4 mt-6 print:hidden">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={loading}
                        className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                        <Save size={20} />
                        <span>{loading ? 'Saving...' : 'Save Only'}</span>
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                        <Printer size={20} />
                        <span>{loading ? 'Saving...' : 'Save & Print'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
