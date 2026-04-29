import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Tag,
    Percent,
    Banknote,
    Clock,
    Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminPromotionList = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/promotions`, getConfig());
            setPromotions(response.data.promotions);
        } catch (error) {
            console.error("Error fetching promotions:", error);
            Swal.fire('Error', 'Failed to load promotions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete promotion: ${title}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/promotions/${id}`, getConfig());
                Swal.fire('Deleted!', 'Promotion has been deleted.', 'success');
                fetchPromotions(); 
            } catch (error) {
                Swal.fire('Error', 'Failed to delete promotion', 'error');
            }
        }
    };

    const filteredPromotions = promotions.filter(promo => 
        promo.title.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = promotions.filter(p => p.is_active && new Date(p.end_date) >= new Date()).length;
    const orderCount = promotions.filter(p => p.promotion_scope === 'order').length;

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] mx-auto px-4 sm:px-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Tag size={26} className="text-gray-800" strokeWidth={2.5}/>
                    <h2 className="text-[22px] text-gray-800 font-bold">Promotions Management</h2>
                </div>
                <Link to="/admin/promotions/create" className="bg-[#8DB600] text-white px-5 py-2.5 rounded shadow flex items-center gap-2 hover:bg-[#7a9e00] transition-colors text-[14px] font-bold">
                    <Plus size={18} strokeWidth={3}/> Add New Promotion
                </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Promotions</p>
                        <h3 className="text-3xl font-bold text-gray-800">{promotions.length}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">All time records</p>
                    </div>
                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-500">
                        <Tag size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Active Promotions</p>
                        <h3 className="text-3xl font-bold text-gray-800">{activeCount}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Running currently</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-[#8DB600]">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Cashback Offers</p>
                        <h3 className="text-3xl font-bold text-gray-800">{orderCount}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Order-level discounts</p>
                    </div>
                    <div className="bg-purple-50 p-2.5 rounded-lg text-purple-500">
                        <Banknote size={24} />
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 mt-6 pt-5">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 pb-4 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Available Promotions</h3>
                    <div className="relative flex w-full md:w-72 rounded overflow-hidden border border-gray-200 focus-within:border-[#8DB600] transition-all bg-gray-50 focus-within:bg-white text-gray-600">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2.5 bg-transparent"
                            placeholder="Search title..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-6">
                    <table className="w-full text-left text-[13px] whitespace-nowrap align-middle">
                        <thead className="text-gray-500 border-b-2 border-gray-100 bg-white font-semibold">
                            <tr>
                                <th className="py-3 font-medium text-gray-600">Title</th>
                                <th className="py-3 font-medium text-gray-600">Scope</th>
                                <th className="py-3 font-medium text-gray-600">Type & Value</th>
                                <th className="py-3 font-medium text-gray-600">Validity</th>
                                <th className="py-3 font-medium text-gray-600">Requirements</th>
                                <th className="py-3 font-medium text-gray-600">Status</th>
                                <th className="py-3 font-medium text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 align-middle">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-gray-100">
                                        <td colSpan="7" className="py-5"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredPromotions.length > 0 ? filteredPromotions.map((promo) => {
                                const isExpired = new Date(promo.end_date) < new Date();
                                const status = !promo.is_active ? 'Inactive' : (isExpired ? 'Expired' : 'Active');
                                const statusClass = status === 'Active' ? 'bg-[#1E8449]' : (status === 'Expired' ? 'bg-red-500' : 'bg-gray-400');
                                
                                return (
                                    <tr key={promo.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40 transition-colors">
                                        <td className="py-3.5">
                                            <span className="font-bold text-gray-800">{promo.title}</span>
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${promo.promotion_scope === 'item' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {promo.promotion_scope === 'item' ? 'Item Specific' : 'Whole Order'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-gray-700 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                {promo.type === 'percentage' ? <Percent size={14} className="text-gray-400"/> : <Banknote size={14} className="text-gray-400"/>}
                                                {parseFloat(promo.discount_value).toLocaleString()} {promo.type === 'percentage' ? '%' : 'Ks'}
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-xs text-gray-500 font-medium">
                                            {new Date(promo.start_date).toLocaleDateString()} - <span className={isExpired ? 'text-red-500' : ''}>{new Date(promo.end_date).toLocaleDateString()}</span>
                                        </td>
                                        <td className="py-3.5 text-xs text-gray-600">
                                            {promo.promotion_scope === 'item' 
                                                ? `Min Qty: ${promo.min_qty_requirement}` 
                                                : `Min Spend: Ks. ${parseFloat(promo.min_order_value).toLocaleString()}`
                                            }
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`px-3 py-1 rounded text-[11px] font-bold text-white shadow-sm inline-block min-w-[60px] text-center ${statusClass}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 align-middle">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/admin/promotions/view/${promo.id}`} className="p-1.5 border border-[#00b0e4]/30 text-[#00b0e4] hover:bg-[#00b0e4] hover:text-white rounded transition-colors shadow-sm bg-white" title="View Details">
                                                    <Eye size={14} strokeWidth={2.5}/>
                                                </Link>
                                                <Link to={`/admin/promotions/edit/${promo.id}`} className="p-1.5 border border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white rounded transition-colors shadow-sm bg-white" title="Edit">
                                                    <Edit size={14} strokeWidth={2.5}/>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(promo.id, promo.title)}
                                                    className="p-1.5 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444] hover:text-white rounded transition-colors shadow-sm bg-white"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center text-gray-500">
                                        No promotions found. Click "Add New Promotion" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPromotionList;
