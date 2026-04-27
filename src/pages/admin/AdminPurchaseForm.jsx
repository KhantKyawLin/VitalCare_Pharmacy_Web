import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { 
    ArrowLeft, 
    Save, 
    RotateCcw, 
    Plus, 
    Trash2, 
    Search,
    Calendar,
    Truck,
    User as UserIcon,
    Package,
    ShoppingCart,
    DollarSign
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';

const AdminPurchaseForm = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const hasProcessedReorder = useRef(false);
    
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        items: []
    });

    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [taxFee, setTaxFee] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchSuppliers();
        
        // Handle Auto-Add from Reorder page (once only)
        if (!hasProcessedReorder.current) {
            const queryParams = new URLSearchParams(location.search);
            const reorderProductId = queryParams.get('reorder_product_id');
            const reorderSupplierId = queryParams.get('supplier_id');

            if (reorderSupplierId) {
                setFormData(prev => ({ ...prev, supplier_id: reorderSupplierId }));
            }

            if (reorderProductId) {
                autoAddProduct(reorderProductId);
            }
            hasProcessedReorder.current = true;
        }
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/admin/suppliers', getConfig());
            setSuppliers(res.data.suppliers);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };
    
    const autoAddProduct = async (id) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/admin/products/${id}`, getConfig());
            if (res.data) {
                addProductToItems(res.data);
            }
        } catch (error) {
            console.error("Failed to auto-add product:", error);
        }
    };

    const handleProductSearch = async (val) => {
        setProductSearch(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/admin/products-search?q=${val}`, getConfig());
            setSearchResults(res.data);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const addProductToItems = (product) => {
        const newItem = {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            purchase_price: product.price || 0,
            sale_price: Math.round((product.price || 0) * 1.1), // Suggest 10% profit
            manufactured_date: '',
            expired_date: ''
        };

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setProductSearch('');
        setSearchResults([]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        
        // Auto-update sale price if purchase price changes and sale price hasn't been manually tweaked much?
        // Let's just do it if it's 0 or based on user's Turn 3 rule
        if (field === 'purchase_price') {
            newItems[index].sale_price = Math.round(value * 1.1);
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateGrandTotal = () => {
        const itemsTotal = formData.items.reduce((sum, item) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.purchase_price) || 0)), 0);
        const taxVal = (itemsTotal * (parseFloat(taxFee) || 0)) / 100;
        return itemsTotal + taxVal + (parseFloat(deliveryFee) || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.supplier_id) return Swal.fire('Error', 'Please select a supplier', 'error');
        if (formData.items.length === 0) return Swal.fire('Error', 'Please add at least one product', 'error');
        
        // Validate dates
        for (const item of formData.items) {
            if (!item.expired_date) return Swal.fire('Error', `Please set expiry date for ${item.name}`, 'error');
        }

        // Combine identical rows
        const mergedItems = [];
        formData.items.forEach(item => {
            const existing = mergedItems.find(i => 
                i.product_id === item.product_id && 
                parseFloat(i.purchase_price || 0) === parseFloat(item.purchase_price || 0) &&
                parseFloat(i.sale_price || 0) === parseFloat(item.sale_price || 0) &&
                i.manufactured_date === item.manufactured_date &&
                i.expired_date === item.expired_date
            );
            if (existing) {
                existing.quantity = parseInt(existing.quantity || 0) + parseInt(item.quantity || 0);
            } else {
                mergedItems.push({...item});
            }
        });

        // Apportion tax and delivery to calculate True Landed Cost per item
        const itemsTotalCost = mergedItems.reduce((sum, item) => sum + (parseInt(item.quantity || 0) * parseFloat(item.purchase_price || 0)), 0);
        const taxVal = (itemsTotalCost * (parseFloat(taxFee) || 0)) / 100;
        const extraFees = taxVal + (parseFloat(deliveryFee) || 0);

        const finalItems = mergedItems.map(item => {
            const itemCost = parseInt(item.quantity || 0) * parseFloat(item.purchase_price || 0);
            const share = itemsTotalCost > 0 ? (itemCost / itemsTotalCost) : 0;
            const allocatedFee = share * extraFees;
            const unitFee = item.quantity > 0 ? (allocatedFee / item.quantity) : 0;

            return {
                ...item,
                purchase_price: parseFloat(item.purchase_price || 0) + unitFee
            };
        });

        const finalPayload = { ...formData, items: finalItems };

        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/admin/purchases', finalPayload, getConfig());
            Swal.fire('Success', 'Purchase recorded successfully!', 'success');
            navigate('/admin/purchases');
        } catch (error) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.message || "Failed to save purchase.";
            Swal.fire('Error', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-2 pb-10 space-y-6">
            
            {/* Header Area */}
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="bg-[#8DB600]/10 p-3 rounded-xl">
                        <ShoppingCart className="text-[#8DB600]" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Create New Purchase</h2>
                        <p className="text-xs text-gray-400 font-medium tracking-wide flex items-center gap-1.5">
                            Stock procurement & inventory intake
                        </p>
                    </div>
                </div>
                <Link to="/admin/purchases" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 transition-all">
                    <ArrowLeft size={18} /> Back to Purchases
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Top Configuration Card */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Supplier Selection */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1 flex items-center gap-2">
                                <Truck size={14} className="text-[#8DB600]"/> 
                                Supplier <span className="text-red-500">*</span>
                            </label>
                            <select 
                                required
                                value={formData.supplier_id}
                                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-[15px] rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8DB600] transition-all outline-none appearance-none"
                                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* Team Member (Read-only as per logic) */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1 flex items-center gap-2">
                                <UserIcon size={14} className="text-[#8DB600]"/>
                                Team Member
                            </label>
                            <div className="w-full bg-gray-100 border border-gray-200 text-gray-500 font-bold text-[15px] rounded-2xl px-5 py-4 flex items-center">
                                {user?.name || 'Administrator'}
                            </div>
                        </div>

                        {/* Purchase Date */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-[#8DB600]"/>
                                Purchase Date <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="date"
                                required
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-[15px] rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8DB600] transition-all outline-none"
                            />
                        </div>

                        {/* Extra Fees */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1 flex items-center gap-2">
                                <DollarSign size={14} className="text-[#8DB600]"/>
                                Delivery Fee
                            </label>
                            <input 
                                type="number"
                                placeholder="0"
                                value={deliveryFee}
                                onChange={(e) => setDeliveryFee(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-[15px] rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8DB600] transition-all outline-none"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1 flex items-center gap-2">
                                <DollarSign size={14} className="text-[#8DB600]"/>
                                Tax (%)
                            </label>
                            <input 
                                type="number"
                                placeholder="0%"
                                value={taxFee}
                                onChange={(e) => setTaxFee(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-[15px] rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8DB600] transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Search & List Card */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    
                    {/* Inner Search Box */}
                    <div className="p-8 border-b border-gray-50">
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search product to add (min 2 chars)..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-[15px] rounded-2xl pl-14 pr-6 py-4 focus:bg-white focus:border-[#8DB600] transition-all outline-none shadow-inner"
                                value={productSearch}
                                onChange={(e) => handleProductSearch(e.target.value)}
                                onFocus={() => productSearch.length >= 2 && setIsSearching(true)}
                            />
                            
                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-2xl rounded-2xl mt-2 border border-gray-100 max-h-80 overflow-y-auto animate-in slide-in-from-top-4 duration-200">
                                    {searchResults.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => addProductToItems(p)}
                                            className="flex items-center gap-4 p-4 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                                                <Package size={20} className="text-gray-400 group-hover:text-[#8DB600]"/>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800">{p.name}</p>
                                                <p className="text-[11px] text-gray-500 font-bold">{p.category?.name} • Tk. {parseFloat(p.price || 0).toLocaleString()}</p>
                                            </div>
                                            <Plus size={18} className="text-gray-300 group-hover:text-[#8DB600]" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="py-4 px-8 text-[12px] font-black text-gray-400 uppercase tracking-widest w-1/4">Product</th>
                                    <th className="py-4 px-4 text-[12px] font-black text-gray-400 uppercase tracking-widest w-24">QTY</th>
                                    <th className="py-4 px-4 text-[12px] font-black text-gray-400 uppercase tracking-widest">Pur. Price</th>
                                    <th className="py-4 px-4 text-[12px] font-black text-gray-400 uppercase tracking-widest">Sale Price</th>
                                    <th className="py-4 px-4 text-[12px] font-black text-gray-400 uppercase tracking-widest">MFG Date</th>
                                    <th className="py-4 px-4 text-[12px] font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                                    <th className="py-4 px-4 text-[12px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                    <th className="py-4 px-8 text-[12px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {formData.items.length > 0 ? formData.items.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="py-5 px-8">
                                            <p className="font-black text-[15px] text-gray-800">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Item Index: {idx + 1}</p>
                                        </td>
                                        <td className="py-5 px-4">
                                            <input 
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold focus:border-[#8DB600] outline-none transition-all"
                                            />
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Tk.</span>
                                                <input 
                                                    type="number"
                                                    value={item.purchase_price}
                                                    onChange={(e) => updateItem(idx, 'purchase_price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                    className="w-28 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 font-bold focus:border-[#8DB600] outline-none transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Tk.</span>
                                                <input 
                                                    type="number"
                                                    value={item.sale_price}
                                                    onChange={(e) => updateItem(idx, 'sale_price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                    className="w-28 bg-green-50/50 border border-green-100 rounded-xl pl-9 pr-3 py-2.5 font-bold text-[#6a8700] focus:border-[#8DB600] outline-none transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <input 
                                                type="date"
                                                value={item.manufactured_date}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => updateItem(idx, 'manufactured_date', e.target.value)}
                                                className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 font-bold text-[13px] focus:border-[#8DB600] outline-none transition-all"
                                            />
                                        </td>
                                        <td className="py-5 px-4">
                                            <input 
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={item.expired_date}
                                                onChange={(e) => updateItem(idx, 'expired_date', e.target.value)}
                                                className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 font-bold text-[13px] focus:border-[#8DB600] outline-none transition-all text-red-500"
                                            />
                                        </td>
                                        <td className="py-5 px-4">
                                            <p className="font-black text-gray-800">Tk. {(item.quantity * item.purchase_price).toLocaleString()}</p>
                                        </td>
                                        <td className="py-5 px-8 text-center">
                                            <button 
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-2xl transition-all border border-transparent hover:border-red-600"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-25">
                                                <ShoppingCart size={60} strokeWidth={1}/>
                                                <p className="font-black text-xl uppercase tracking-[0.2em]">List is empty</p>
                                                <p className="text-sm font-bold text-gray-400">Search and add products to begin</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Grand Total Bar */}
                    <div className="bg-gray-800 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <DollarSign size={24} className="text-[#8DB600]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Purchase Grand Total</p>
                                <p className="text-3xl font-black text-white">Tk. {calculateGrandTotal().toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setFormData({ ...formData, items: [] })}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95"
                            >
                                <RotateCcw size={20} /> Reset Form
                            </button>
                            <button 
                                type="submit"
                                disabled={loading || formData.items.length === 0}
                                className="px-10 py-4 bg-[#8DB600] hover:bg-[#7a9d00] text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-[#8DB600]/20 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 group"
                            >
                                {loading ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save size={20} /> Complete Purchase
                                        <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                            <ArrowLeft size={16} className="rotate-180"/>
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminPurchaseForm;
