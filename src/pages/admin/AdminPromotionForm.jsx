import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Info,
    Calendar,
    Tag,
    List,
    Percent,
    Banknote,
    Search,
    Check,
    RefreshCw,
    Edit
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminPromotionForm = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const location = useLocation();
    const isViewOnly = location.pathname.includes('/view/');

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        promotion_scope: 'item',
        min_qty_requirement: 1,
        min_order_value: 0,
        max_usage_per_bill: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        is_active: true
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        const init = async () => {
            setFetchingData(true);
            try {
                // Fetch products for the selection table
                const prodRes = await axios.get('http://127.0.0.1:8000/api/admin/promotions/products', getConfig());
                const prods = prodRes.data.products;
                setProducts(prods);

                // Extract unique categories
                const cats = [...new Set(prods.filter(p => p.category_id).map(p => p.category_name))].map(name => {
                    return { id: prods.find(p => p.category_name === name).category_id, name };
                });
                setCategories(cats);

                // If editing, fetch promotion details
                if (isEditing) {
                    const promoRes = await axios.get(`http://127.0.0.1:8000/api/admin/promotions/${id}`, getConfig());
                    const p = promoRes.data.promotion;
                    if (p) {
                        setFormData({
                            title: p.title || '',
                            description: p.description || '',
                            discount_type: p.type || 'percentage',
                            discount_value: p.discount_value || '',
                            promotion_scope: p.promotion_scope || 'item',
                            min_qty_requirement: p.min_qty_requirement || 1,
                            min_order_value: p.min_order_value || 0,
                            max_usage_per_bill: p.max_usage_per_bill || '',
                            start_date: p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            end_date: p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            is_active: !!p.is_active
                        });

                        // Pre-select products
                        if (p.products && Array.isArray(p.products)) {
                            const preSelected = new Set(p.products.map(prod => prod.id));
                            setSelectedProducts(preSelected);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire('Error', 'Failed to load data', 'error');
            } finally {
                setFetchingData(false);
            }
        };

        init();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProductSelect = (productId) => {
        setSelectedProducts(prev => {
            const next = new Set(prev);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });
    };

    const handleSelectAll = (filteredList) => {
        setSelectedProducts(prev => {
            const next = new Set(prev);
            let anyUnselected = false;

            // Check if any in current view are not selected
            filteredList.forEach(p => {
                if (!next.has(p.id)) anyUnselected = true;
            });

            // Toggle logic
            filteredList.forEach(p => {
                if (anyUnselected) {
                    next.add(p.id);
                } else {
                    next.delete(p.id);
                }
            });
            return next;
        });
    };

    const handleClearSelection = () => {
        setSelectedProducts(new Set());
    };

    const handleSelectCategory = (catId) => {
        const catProds = products.filter(p => p.category_id === Number(catId));
        setSelectedProducts(prev => {
            const next = new Set(prev);
            catProds.forEach(p => next.add(p.id));
            return next;
        });
        Swal.fire({
            title: 'Selected!',
            text: `Added ${catProds.length} products from this category.`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.promotion_scope === 'item' && selectedProducts.size === 0) {
            return Swal.fire('Error', 'Please select at least one product for this item-level promotion.', 'error');
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                type: formData.discount_type,
                product_ids: Array.from(selectedProducts)
            };

            if (isEditing) {
                await axios.put(`http://127.0.0.1:8000/api/admin/promotions/${id}`, payload, getConfig());
                Swal.fire('Success', 'Promotion updated successfully', 'success');
            } else {
                await axios.post('http://127.0.0.1:8000/api/admin/promotions', payload, getConfig());
                Swal.fire('Success', 'Promotion created successfully', 'success');
            }
            navigate('/admin/promotions');
        } catch (error) {
            console.error('Submission error:', error);
            const msg = error.response?.data?.message || 'Failed to save promotion';
            Swal.fire('Error', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter ? p.category_id === Number(categoryFilter) : true;
        return matchSearch && matchCategory;
    });

    if (fetchingData) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin text-[#8DB600]"><RefreshCw size={32} /></div>
        </div>
    );

    return (
        <div className="space-y-6 pt-2 pb-12 max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                    <Tag size={24} className="text-[#8DB600]" />
                    <h2 className="text-xl font-bold text-gray-800">
                        {isViewOnly ? 'Promotion Details' : (isEditing ? 'Edit Promotion' : 'Create New Promotion')}
                    </h2>
                </div>
                <Link to="/admin/promotions" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded font-bold transition-all text-sm bg-white shadow-sm hover:shadow">
                    <ArrowLeft size={16} /> Back to Promotions
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Configuration Card */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                        <Info size={18} className="text-[#8DB600]" /> Promotion Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 block mb-1">Promotion Title *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Summer Skincare Sale"
                                disabled={isViewOnly}
                                className={`w-full px-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all ${isViewOnly ? 'bg-gray-50' : ''}`}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="text-sm font-bold text-gray-700 block mb-1">Promotion Scope *</label>
                            <select
                                name="promotion_scope"
                                value={formData.promotion_scope}
                                onChange={handleChange}
                                disabled={isViewOnly}
                                className={`w-full px-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all bg-white ${isViewOnly ? 'bg-gray-50' : ''}`}
                            >
                                <option value="item">Specific Products (Item Level)</option>
                                <option value="order">Whole Bill (Order Level Cashback)</option>
                            </select>
                        </div>

                        <div className="col-span-1">
                            {formData.promotion_scope === 'item' ? (
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1 flex items-center gap-1">
                                        Min Qty Requirement <span title="Minimum items a user must buy to get this discount"><Info size={14} className="text-gray-400 cursor-pointer" /></span>
                                    </label>
                                    <input
                                        type="number"
                                        name="min_qty_requirement"
                                        min="1"
                                        value={formData.min_qty_requirement}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        className={`w-full px-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all ${isViewOnly ? 'bg-gray-50' : ''}`}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1 flex items-center gap-1 text-purple-600">
                                        Minimum Order Amount * <span className="px-1 text-[10px] bg-purple-100 rounded text-purple-700">Cashback Trigger</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Ks.</span>
                                        <input
                                            type="number"
                                            name="min_order_value"
                                            min="0"
                                            required
                                            value={formData.min_order_value}
                                            onChange={handleChange}
                                            disabled={isViewOnly}
                                            className={`w-full pl-9 pr-4 py-2.5 rounded border border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm transition-all ${isViewOnly ? 'bg-gray-50' : ''}`}
                                            placeholder="e.g. 15000"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-span-1">
                            <label className="text-sm font-bold text-gray-700 block mb-1">Discount Type *</label>
                            <select
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleChange}
                                disabled={isViewOnly}
                                className={`w-full px-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all bg-white ${isViewOnly ? 'bg-gray-50' : ''}`}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed_amount">Fixed Amount</option>
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="text-sm font-bold text-gray-700 block mb-1">Discount Value *</label>
                            <div className="relative">
                                <span className={`absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 border-r border-gray-200 bg-gray-50 rounded-l ${formData.discount_type === 'percentage' ? 'text-blue-500' : 'text-[#8DB600]'}`}>
                                    {formData.discount_type === 'percentage' ? <Percent size={14} /> : 'Ks'}
                                </span>
                                <input
                                    type="number"
                                    name="discount_value"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={formData.discount_value}
                                    onChange={handleChange}
                                    placeholder={formData.discount_type === 'percentage' ? 'e.g. 10 for 10% off' : 'e.g. 500 for 500 MMK off'}
                                    disabled={isViewOnly}
                                    className={`w-full pl-12 pr-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all ${isViewOnly ? 'bg-gray-50' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="text-sm font-bold text-gray-700 block mb-1">Start Date *</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    name="start_date"
                                    required
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all text-gray-700 ${isViewOnly ? 'bg-gray-50' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="text-sm font-bold text-gray-700 block mb-1">End Date *</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    name="end_date"
                                    required
                                    min={formData.start_date}
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all text-gray-700 ${isViewOnly ? 'bg-gray-50' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 block mb-1">Description / Notes</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                disabled={isViewOnly}
                                className={`w-full px-4 py-2.5 rounded border border-gray-200 focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none text-sm transition-all ${isViewOnly ? 'bg-gray-50' : ''}`}
                                placeholder="Internal notes about this promotion..."
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    disabled={isViewOnly}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8DB600]"></div>
                                <span className="ml-3 text-sm font-bold text-gray-700">Promotion is Active</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Products Selection Card - Only visible if scope is item */}
                {formData.promotion_scope === 'item' && (
                    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6 animate-in fade-in duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-3 border-b border-gray-100 gap-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <List size={18} className="text-[#8DB600]" />
                                Applicable Products
                                <span className="ml-2 px-2.5 py-0.5 bg-[#8DB600]/10 text-[#8DB600] rounded text-[11px]">
                                    {selectedProducts.size} Selected
                                </span>
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                {!isViewOnly && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAll(filteredProducts)}
                                            className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                                        >
                                            <Check size={14} /> Select All Displayed
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClearSelection}
                                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded font-bold text-xs transition-colors shadow-sm"
                                        >
                                            Clear Selection
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Filters for Table */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="relative flex-1 rounded border border-gray-200 focus-within:border-[#8DB600] transition-all flex items-center bg-white overflow-hidden">
                                <Search size={16} className="absolute left-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search product name..."
                                    className="w-full pl-9 pr-4 py-2.5 outline-none text-sm text-gray-700 bg-transparent"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="px-4 py-2.5 border border-gray-200 rounded text-sm outline-none bg-white min-w-[200px]"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {categoryFilter && !isViewOnly && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelectCategory(categoryFilter)}
                                        className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded font-bold text-sm hover:bg-blue-100 transition-colors whitespace-nowrap border border-blue-100"
                                    >
                                        Select All in Category
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Compact Table */}
                        <div className="border border-gray-100 rounded overflow-hidden max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left text-[13px] relative">
                                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                                    <tr>
                                        <th className="py-2.5 px-4 w-12 text-center">Sel</th>
                                        <th className="py-2.5 px-4 font-bold">Product Name</th>
                                        <th className="py-2.5 px-4 font-bold">Category</th>
                                        <th className="py-2.5 px-4 font-bold">Base Price</th>
                                        <th className="py-2.5 px-4 font-bold">Other Promos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length > 0 ? filteredProducts.map(p => {
                                        const isSelected = selectedProducts.has(p.id);
                                        const activePromos = Array.isArray(p.active_promotions) ? p.active_promotions : [];
                                        const otherPromos = activePromos.filter(promo => promo.id !== Number(id));

                                        return (
                                            <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!isViewOnly ? 'cursor-pointer' : ''} ${isSelected ? 'bg-[#8DB600]/5' : ''}`} onClick={() => !isViewOnly && handleProductSelect(p.id)}>
                                                <td className="py-2.5 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        disabled={isViewOnly}
                                                        onChange={() => { }} // Handle via row click
                                                        className={`w-4 h-4 text-[#8DB600] rounded focus:ring-[#8DB600] accent-[#8DB600] ${!isViewOnly ? 'cursor-pointer' : ''}`}
                                                    />
                                                </td>
                                                <td className="py-2.5 px-4 font-bold text-gray-800">{p.name}</td>
                                                <td className="py-2.5 px-4 text-gray-600">{p.category_name}</td>
                                                <td className="py-2.5 px-4 text-gray-600">Ks. {parseFloat(p.price).toLocaleString()}</td>
                                                <td className="py-2.5 px-4">
                                                    {otherPromos.length > 0 ? (
                                                        <span className="text-orange-500 text-[10px] font-bold px-2 py-0.5 bg-orange-50 rounded border border-orange-100">
                                                            {otherPromos.map(op => op.title).join(', ')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-gray-400">No products match your filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/promotions')}
                        className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded font-bold bg-white hover:bg-gray-50 shadow-sm transition-all"
                    >
                        Cancel
                    </button>
                    {!isViewOnly ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#8DB600] text-white rounded font-bold hover:bg-[#7a9e00] shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Promotion')}
                        </button>
                    ) : (
                        <Link
                            to={`/admin/promotions/edit/${id}`}
                            className="px-6 py-2.5 bg-[#3b82f6] text-white rounded font-bold hover:bg-[#2563eb] shadow-md transition-all flex items-center gap-2"
                        >
                            <Edit size={18} />
                            Edit Promotion
                        </Link>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AdminPromotionForm;
