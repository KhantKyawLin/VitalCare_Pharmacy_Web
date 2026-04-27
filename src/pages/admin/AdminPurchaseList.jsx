import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Eye,
    Truck,
    History,
    DollarSign,
    Calendar,
    User as UserIcon,
    Package,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminPurchaseList = () => {
    const [purchases, setPurchases] = useState([]);
    const [stats, setStats] = useState({
        total_purchases: 0,
        total_value: 0,
        this_month_value: 0,
        top_supplier: null
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchPurchases();
    }, [currentPage]);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/purchases`, {
                ...getConfig(),
                params: {
                    page: currentPage,
                    search: search
                }
            });
            setPurchases(response.data.purchases.data);
            setTotalPages(response.data.purchases.last_page);
            setTotalResults(response.data.purchases.total);
            setStats(response.data.stats);
        } catch (error) {
            console.error("Error fetching purchases:", error);
            Swal.fire('Error', 'Failed to load purchase history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            setCurrentPage(1);
            fetchPurchases();
        }
    };

    // Auto-search when cleared
    useEffect(() => {
        if (search === '') {
            setCurrentPage(1);
            fetchPurchases();
        }
    }, [search]);

    const openDetailModal = (purchase) => {
        setSelectedPurchase(purchase);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] mx-auto px-4 sm:px-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <History size={26} className="text-gray-800" strokeWidth={2.5}/>
                    <h2 className="text-[22px] text-gray-800 font-bold">Purchase History</h2>
                </div>
                <Link 
                    to="/admin/purchases/create" 
                    className="bg-[#8DB600] hover:bg-[#7a9d00] text-white px-5 py-2.5 rounded font-bold flex items-center gap-2 shadow-lg shadow-[#8DB600]/20 transition-all active:scale-95"
                >
                    <Package size={20} className="stroke-2"/>
                    Make New Purchase
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Purchases</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.total_purchases}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">All time records</p>
                    </div>
                    <div className="bg-blue-50 p-2.5 rounded text-blue-600">
                        <Package size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Investment</p>
                        <h3 className="text-2xl font-bold text-gray-800 truncate max-w-[150px]">
                            Tk. {parseFloat(stats.total_value).toLocaleString()}
                        </h3>
                        <p className="text-[13px] text-gray-400 mt-2">Total procurement cost</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded text-green-600">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Spent This Month</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Tk. {parseFloat(stats.this_month_value).toLocaleString()}
                        </h3>
                        <p className="text-[13px] text-gray-400 mt-2">Current month total</p>
                    </div>
                    <div className="bg-purple-50 p-2.5 rounded text-purple-600">
                        <Calendar size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Top Supplier</p>
                        <h3 className="text-[18px] font-bold text-gray-800 truncate max-w-[180px]">
                            {stats.top_supplier?.name || 'N/A'}
                        </h3>
                        <p className="text-[13px] text-gray-400 mt-2">
                           Procured Tk. {stats.top_supplier ? parseFloat(stats.top_supplier.total).toLocaleString() : '0'}
                        </p>
                    </div>
                    <div className="bg-orange-50 p-2.5 rounded text-orange-600">
                        <Truck size={24} />
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 mt-6 pt-5 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 pb-4 gap-4 border-b border-gray-50 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <History size={20} className="text-[#8DB600]"/>
                        Recent Procurement Records
                    </h3>
                    <div className="relative flex w-full md:w-72 rounded overflow-hidden border border-gray-200 focus-within:border-[#8DB600] focus-within:ring-2 focus-within:ring-[#8DB600]/30 transition-all bg-gray-50 focus-within:bg-white text-gray-600">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2.5 bg-transparent"
                            placeholder="Invoice#, Supplier name..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto px-6">
                    <table className="w-full text-left text-[13px] whitespace-nowrap align-middle">
                        <thead className="text-gray-500 border-b border-gray-100 bg-white sticky top-0 font-semibold">
                            <tr>
                                <th className="py-3 font-medium text-gray-600">Invoice ID</th>
                                <th className="py-3 font-medium text-gray-600">Date</th>
                                <th className="py-3 font-medium text-gray-600">Supplier</th>
                                <th className="py-3 font-medium text-gray-600">Procured By</th>
                                <th className="py-3 font-medium text-gray-600">Items</th>
                                <th className="py-3 font-medium text-gray-600">Total Amount</th>
                                <th className="py-3 font-medium text-gray-600 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 align-middle">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-gray-50">
                                        <td colSpan="7" className="py-5"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : purchases.length > 0 ? purchases.map((purchase) => {
                                const formattedId = `INV-${String(purchase.id).padStart(5, '0')}`;
                                return (
                                    <tr key={purchase.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors group">
                                        <td className="py-4 font-bold text-gray-700">{formattedId}</td>
                                        <td className="py-4 text-gray-500">
                                            {new Date(purchase.purchase_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="py-4 flex items-center gap-2">
                                            <div className="w-7 h-7 rounded bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-[10px]">
                                                {purchase.supplier?.name.substring(0, 1)}
                                            </div>
                                            <span className="font-semibold text-gray-800">{purchase.supplier?.name}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <UserIcon size={14} className="text-gray-400"/>
                                                {purchase.user?.name}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2.5 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-600">
                                                {purchase.purchase_products.length} products
                                            </span>
                                        </td>
                                        <td className="py-4 font-bold text-gray-800">
                                            Tk. {parseFloat(purchase.total_purchase_amount).toLocaleString()}
                                        </td>
                                        <td className="py-4 text-center">
                                            <button 
                                                onClick={() => openDetailModal(purchase)}
                                                className="p-1.5 border border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2 opacity-60">
                                            <Package size={40} className="text-gray-300"/>
                                            <p>No procurement records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
                        <div className="text-[13px] text-gray-500">
                            Showing <span className="font-bold text-gray-700">{(currentPage - 1) * 15 + 1}</span> to <span className="font-bold text-gray-700">{Math.min(currentPage * 15, totalResults)}</span> of <span className="font-bold text-gray-700">{totalResults}</span> records
                        </div>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-4 py-1.5 border border-gray-200 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all text-gray-600"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-[#8DB600] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-white'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-4 py-1.5 border border-gray-200 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all text-gray-600"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedPurchase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Procurement Details</h3>
                                <p className="text-xs text-gray-500">Invoice: INV-{String(selectedPurchase.id).padStart(5, '0')}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
                                &times;
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Summary Box */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-tight">Purchase Date</p>
                                    <p className="text-sm font-bold text-gray-800">{new Date(selectedPurchase.purchase_date).toLocaleDateString()}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-tight">Supplier</p>
                                    <p className="text-sm font-bold text-gray-800">{selectedPurchase.supplier?.name}</p>
                                </div>
                                <div className="p-3 bg-[#8DB600]/10 rounded-xl border border-[#8DB600]/20">
                                    <p className="text-[11px] text-[#8DB600] uppercase font-bold tracking-tight">Total Investment</p>
                                    <p className="text-sm font-black text-gray-800">Tk. {parseFloat(selectedPurchase.total_purchase_amount).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Package size={16} className="text-gray-400"/>
                                    Purchased Items List
                                </h4>
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 text-gray-600 font-bold">
                                            <tr>
                                                <th className="py-2.5 px-4">Product Name</th>
                                                <th className="py-2.5 px-4">Qty</th>
                                                <th className="py-2.5 px-4">Pur. Price</th>
                                                <th className="py-2.5 px-4 text-center">Sale Price</th>
                                                <th className="py-2.5 px-4">Expiry</th>
                                                <th className="py-2.5 px-4 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPurchase.purchase_products.map((pp, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                    <td className="py-3 px-4 font-bold text-gray-800">
                                                        {pp.product_movement?.product?.name}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600 font-semibold">{pp.purchase_quantity}</td>
                                                    <td className="py-3 px-4 text-gray-600">Tk. {parseFloat(pp.product_movement?.purchase_price).toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className="text-gray-400 font-medium">Tk. {parseFloat(pp.product_movement?.sale_price).toLocaleString()}</span>
                                                            <div className="px-1.5 py-0.5 bg-green-50 text-[#8DB600] rounded text-[9px] font-bold">
                                                                {Math.round(((pp.product_movement?.sale_price - pp.product_movement?.purchase_price) / pp.product_movement?.purchase_price) * 100)}%
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${new Date(pp.product_movement?.expired_date) < new Date() ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            {new Date(pp.product_movement?.expired_date).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-gray-800">
                                                        Tk. {parseFloat(pp.purchase_quantity * pp.product_movement?.purchase_price).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button 
                                onClick={() => setIsDetailModalOpen(false)}
                                className="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-900 transition-all text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPurchaseList;
