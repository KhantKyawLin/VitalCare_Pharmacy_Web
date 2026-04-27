import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    AlertTriangle, 
    Clock, 
    Trash2, 
    DollarSign,
    Search,
    Download,
    Eye,
    ShieldAlert,
    CheckSquare,
    Square
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminExpiredItemList = () => {
    const [activeTab, setActiveTab] = useState('expired'); // 'expired', 'expiring_soon', 'disposals'
    const [data, setData] = useState({
        expired_items: [],
        expiring_soon: [],
        disposals: [],
        stats: {
            currently_expired: 0,
            currently_expired_qty: 0,
            expiring_soon_count: 0,
            disposals_this_month: 0,
            value_at_risk: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expiringDays, setExpiringDays] = useState(30);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItemDetail, setSelectedItemDetail] = useState(null);

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchData();
    }, [expiringDays]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch multiple endpoints in parallel
            const [expiredRes, expiringRes, disposalsRes] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/admin/inventory/expired-items`, getConfig()),
                axios.get(`http://127.0.0.1:8000/api/admin/inventory/expiring-soon-configured?days=${expiringDays}`, getConfig()),
                axios.get(`http://127.0.0.1:8000/api/admin/inventory/disposals`, getConfig())
            ]);

            setData({
                expired_items: expiredRes.data.expired_items,
                expiring_soon: expiringRes.data.expiring_soon,
                disposals: disposalsRes.data,
                stats: expiredRes.data.stats
            });
        } catch (error) {
            console.error("Error fetching expired items:", error);
            Swal.fire('Error', 'Failed to load expiration data', 'error');
        } finally {
            setLoading(false);
            setSelectedItems([]);
        }
    };

    const handleSelectAll = (checked, list) => {
        if (checked) {
            setSelectedItems(list.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleDisposeSelected = async () => {
        if (selectedItems.length === 0) return;

        const result = await Swal.fire({
            title: 'Confirm Disposal',
            text: `You are about to securely dispose ${selectedItems.length} selected batches. This will calculate financial loss and remove them from inventory.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Dispose Selected!'
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.post(`http://127.0.0.1:8000/api/admin/inventory/expired-items/dispose`, {
                    movement_ids: selectedItems
                }, getConfig());

                Swal.fire({
                    title: 'Disposed!',
                    text: `Successfully disposed ${res.data.disposed_count} items. Total financial loss logged: Ks. ${parseFloat(res.data.total_loss).toLocaleString()}`,
                    icon: 'success'
                });
                
                fetchData();
            } catch (error) {
                Swal.fire('Error', 'Failed to dispose items.', 'error');
            }
        }
    };

    const handleExport = () => {
        const list = getListToDisplay();
        if (list.length === 0) return;

        let headers = [];
        let rows = [];

        if (activeTab === 'disposals') {
            headers = ['Date Disposed', 'Product', 'Category', 'Expiry Date', 'Qty', 'Loss Value'];
            rows = list.map(item => [
                new Date(item.created_at).toLocaleDateString(),
                item.product?.name,
                item.product?.category?.name,
                item.product_movement?.expired_date || '-',
                Math.abs(item.adjustment),
                item.financial_value
            ]);
        } else {
            headers = ['Product', 'Category', 'Expiry Date', 'Days Diff', 'Qty', 'Value'];
            rows = list.map(item => [
                item.product?.name,
                item.product?.category?.name,
                item.expired_date,
                calculateDaysDiff(item.expired_date),
                item.instock_quantity,
                item.instock_quantity * item.purchase_price
            ]);
        }

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `inventory_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDisposeSingle = async (id) => {
        setSelectedItems([id]);
        setTimeout(() => handleDisposeSelected(), 50);
    };

    const openDetailModal = (item) => {
        setSelectedItemDetail(item);
        setIsDetailModalOpen(true);
    };

    const calculateDaysDiff = (dateString) => {
        const diffTime = new Date(dateString) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getListToDisplay = () => {
        let list = [];
        if (activeTab === 'expired') list = data.expired_items;
        else if (activeTab === 'expiring_soon') list = data.expiring_soon;
        else if (activeTab === 'disposals') list = data.disposals;

        if (search) {
            return list.filter(item => {
                const searchString = item.product?.name || item.productMovement?.product?.name || '';
                return searchString.toLowerCase().includes(search.toLowerCase());
            });
        }
        return list;
    };

    const displayedList = getListToDisplay();

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1700px] mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={28} className="text-red-500" strokeWidth={2.5}/>
                    <h2 className="text-[22px] text-gray-800 font-bold">Expired Items Management</h2>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Currently Expired */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Currently Expired</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-red-600">{data.stats.currently_expired}</h3>
                        </div>
                        <p className="text-[12px] text-red-500 font-bold mt-2.5 flex items-center gap-1">
                            ↑ {data.stats.currently_expired_qty} units wasted
                        </p>
                    </div>
                    <div className="bg-[#8DB600] text-white p-3 rounded-xl shadow-lg shadow-[#8DB600]/20">
                        <Clock size={24} />
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Expiring Soon</p>
                        <h3 className="text-3xl font-bold text-yellow-500">{data.stats.expiring_soon_count}</h3>
                        <p className="text-[12px] text-yellow-600 font-bold mt-2.5 flex items-center gap-1">
                            Within next {expiringDays} days
                        </p>
                    </div>
                    <div className="bg-yellow-50 text-yellow-500 p-3 rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                {/* Disposed This Month */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Disposed This Month</p>
                        <h3 className="text-3xl font-bold text-gray-800">{data.stats.disposals_this_month}</h3>
                        <p className="text-[12px] text-gray-400 font-medium mt-2.5">
                            Total disposed items
                        </p>
                    </div>
                    <div className="bg-gray-50 text-[#8DB600] p-3 rounded-xl">
                        <Trash2 size={24} />
                    </div>
                </div>

                {/* Value at Risk */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Value at Risk</p>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">Ks. {parseFloat(data.stats.value_at_risk).toLocaleString()}</h3>
                        <p className="text-[12px] text-red-500 font-bold mt-2.5 flex items-center gap-1">
                            ↓ Immediate loss value
                        </p>
                    </div>
                    <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 mt-6 pt-2 pb-0 px-6">
                <div className="flex gap-8 border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('expired')}
                        className={`pb-4 pt-4 px-1 text-[13px] font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'expired' ? 'border-[#8DB600] text-[#8DB600]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Clock size={16} strokeWidth={2.5}/> Currently Expired 
                        <span className="bg-[#8DB600] text-white text-[10px] px-2 py-0.5 rounded-full">{data.expired_items.length}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('expiring_soon')}
                        className={`pb-4 pt-4 px-1 text-[13px] font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'expiring_soon' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <AlertTriangle size={16} strokeWidth={2.5}/> Expiring Soon
                    </button>
                    <button 
                        onClick={() => setActiveTab('disposals')}
                        className={`pb-4 pt-4 px-1 text-[13px] font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'disposals' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Trash2 size={16} strokeWidth={2.5}/> Disposal Records
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 pb-2">
                
                {/* Toolbar */}
                <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30 border-b border-gray-100 rounded-t-xl">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {activeTab === 'expired' && (
                            <div className="flex items-center gap-2">
                                <div className="bg-red-500 p-1.5 rounded-full">
                                    <Clock size={14} className="text-white" strokeWidth={3}/>
                                </div>
                                <h3 className="text-[16px] font-bold text-gray-800">Currently Expired Items</h3>
                            </div>
                        )}
                        {activeTab === 'expiring_soon' && (
                            <div className="flex items-center gap-3">
                                <h3 className="text-[16px] font-bold text-gray-800">Alert Range:</h3>
                                <select 
                                    value={expiringDays}
                                    onChange={(e) => setExpiringDays(e.target.value)}
                                    className="border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 text-sm font-semibold focus:border-[#8DB600] outline-none"
                                >
                                    <option value={30}>Next 30 Days</option>
                                    <option value={60}>Next 60 Days</option>
                                    <option value={90}>Next 90 Days</option>
                                </select>
                            </div>
                        )}
                        {activeTab === 'disposals' && (
                            <h3 className="text-[16px] font-bold text-gray-800">Past Disposals</h3>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex w-full md:w-64 rounded-lg overflow-hidden border border-gray-200 bg-white">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2 text-gray-600"
                                placeholder="Search products..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        {(activeTab === 'expired' || activeTab === 'expiring_soon') && (
                            <button 
                                onClick={handleDisposeSelected}
                                disabled={selectedItems.length === 0}
                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded flex items-center gap-2 hover:bg-red-100 transition-colors text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={16} strokeWidth={2.5}/> Dispose Selected ({selectedItems.length})
                            </button>
                        )}
                        
                        <button 
                            onClick={handleExport}
                            className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-50 transition-colors text-[13px] font-bold"
                        >
                            <Download size={16} strokeWidth={2.5}/> Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] whitespace-nowrap align-middle">
                        <thead className="text-gray-500 border-b border-gray-200 bg-white">
                            <tr>
                                {(activeTab === 'expired' || activeTab === 'expiring_soon') && (
                                    <th className="py-3 px-6 w-12 pt-4">
                                        <button onClick={() => handleSelectAll(selectedItems.length !== displayedList.length, displayedList)}>
                                            {selectedItems.length > 0 && selectedItems.length === displayedList.length 
                                                ? <CheckSquare size={16} className="text-[#8DB600]"/> 
                                                : <Square size={16} className="text-gray-300"/>}
                                        </button>
                                    </th>
                                )}
                                {activeTab === 'disposals' && <th className="py-3 px-6 font-semibold">Date Disposed</th>}
                                <th className="py-3 px-6 font-semibold">Product</th>
                                <th className="py-3 px-6 font-semibold">Expiry Date</th>
                                <th className="py-3 px-6 font-semibold">{activeTab === 'expired' ? 'Days Expired' : 'Days Left'}</th>
                                <th className="py-3 px-6 font-semibold">Qty</th>
                                <th className="py-3 px-6 font-semibold">Loss Value</th>
                                {(activeTab === 'expired' || activeTab === 'expiring_soon') && (
                                    <th className="py-3 px-6 font-semibold text-center">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 align-middle">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-gray-50">
                                        <td colSpan="8" className="py-5 px-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : displayedList.length > 0 ? displayedList.map((item) => {
                                // For generic handling, extract correct nested objects based on tab context
                                const isDisposalRecord = activeTab === 'disposals';
                                const productItem = isDisposalRecord ? item.product : item.product;
                                const originalMovement = isDisposalRecord ? item.product_movement : null; // If loaded
                                
                                const expiryStr = isDisposalRecord 
                                    ? (item.product_movement?.expired_date || 'Unknown') 
                                    : item.expired_date;
                                
                                const expDate = new Date(expiryStr);
                                const daysDiff = calculateDaysDiff(expDate);
                                
                                const isExpired = daysDiff < 0;
                                const formattedExpiry = isNaN(expDate) ? '-' : expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                
                                const qty = isDisposalRecord ? Math.abs(item.adjustment) : item.instock_quantity;
                                const lossValue = isDisposalRecord ? item.financial_value : (qty * item.purchase_price);

                                return (
                                    <tr key={item.id} className={`border-b border-white ${activeTab === 'expired' ? 'bg-red-50/60' : activeTab === 'expiring_soon' ? 'bg-yellow-50/30' : 'bg-white hover:bg-gray-50'}`}>
                                        {(activeTab === 'expired' || activeTab === 'expiring_soon') && (
                                            <td className="py-4 px-6 w-12">
                                                <button onClick={() => handleSelectItem(item.id)}>
                                                    {selectedItems.includes(item.id)
                                                        ? <CheckSquare size={16} className="text-[#8DB600]"/> 
                                                        : <Square size={16} className="text-white bg-white border border-gray-300 rounded-sm"/>}
                                                </button>
                                            </td>
                                        )}
                                        
                                        {activeTab === 'disposals' && (
                                            <td className="py-4 px-6 text-gray-500">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                        )}

                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{productItem?.name || 'Unknown Product'}</span>
                                                <span className="text-[11px] text-gray-500">{productItem?.category?.name || 'No Category'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 font-medium">
                                            {formattedExpiry}
                                        </td>
                                        <td className="py-4 px-6">
                                            {isDisposalRecord ? (
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold shadow-sm whitespace-nowrap ${daysDiff < 0 ? 'bg-[#8DB600] text-white' : 'bg-red-500 text-white'}`}>
                                                    {daysDiff < 0 ? 'Expired' : 'Disposed early'}
                                                </span>
                                            ) : isExpired ? (
                                                <span className="px-2 py-1 bg-[#8DB600] text-white rounded text-[10px] font-bold shadow-sm whitespace-nowrap">
                                                    {Math.abs(daysDiff)} days
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-[10px] font-bold shadow-sm whitespace-nowrap">
                                                    {daysDiff} days
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-gray-700">
                                            {qty}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-gray-800">
                                            Ks. {parseFloat(lossValue).toLocaleString()}
                                        </td>
                                        {(activeTab === 'expired' || activeTab === 'expiring_soon') && (
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => openDetailModal(item)}
                                                        className="p-1 border border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white rounded shadow-sm bg-white/50 transition-colors"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDisposeSingle(item.id)}
                                                        className="p-1 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444] hover:text-white rounded shadow-sm bg-white/50 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center text-gray-500 bg-white">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckSquare size={32} className="text-green-500 mb-2 opacity-50"/>
                                            <p className="font-semibold text-gray-600">All clear! No items found matching this criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedItemDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                            <h3 className="text-[18px] font-bold text-gray-800">
                                {selectedItemDetail.product?.name} Details
                            </h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                                <Trash2 size={0}/> {/* Quick hack for icon size match */}
                                <span className="text-xl leading-none">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3 flex justify-center items-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                                {selectedItemDetail.product?.pictures && selectedItemDetail.product?.pictures.length > 0 ? (
                                    <img 
                                        src={selectedItemDetail.product.pictures[0].image_path.startsWith('http') ? selectedItemDetail.product.pictures[0].image_path : `http://127.0.0.1:8000/storage/${selectedItemDetail.product.pictures[0].image_path}`}
                                        alt="Product"
                                        className="h-48 object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-48 flex items-center justify-center">
                                        <ShieldAlert size={48} className="text-gray-300"/>
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-2/3">
                                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 px-4 font-semibold text-gray-500 bg-gray-50 w-1/3">Product Name</td>
                                            <td className="py-3 px-4 font-bold text-gray-800">{selectedItemDetail.product?.name}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 px-4 font-semibold text-gray-500 bg-gray-50 w-1/3">Category</td>
                                            <td className="py-3 px-4 text-gray-700">{selectedItemDetail.product?.category?.name}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 px-4 font-semibold text-gray-500 bg-gray-50 w-1/3">Expiry Date</td>
                                            <td className="py-3 px-4 font-bold text-red-600">{new Date(selectedItemDetail.expired_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 px-4 font-semibold text-gray-500 bg-gray-50 w-1/3">Quantity</td>
                                            <td className="py-3 px-4 font-bold text-gray-800">{selectedItemDetail.instock_quantity}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 font-semibold text-gray-500 bg-gray-50 w-1/3">Total Value</td>
                                            <td className="py-3 px-4 font-black text-gray-800">Ks. {parseFloat(selectedItemDetail.instock_quantity * selectedItemDetail.purchase_price).toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setIsDetailModalOpen(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-bold transition-colors"
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

export default AdminExpiredItemList;
