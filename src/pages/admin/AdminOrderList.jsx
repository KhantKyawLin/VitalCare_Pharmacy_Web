import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ShoppingCart, 
    Search, 
    Filter, 
    Eye, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    Store,
    Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        order_type: '',
        date: ''
    });

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchOrders();
    }, [page, filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let url = `http://127.0.0.1:8000/api/admin/orders?page=${page}`;
            if (filters.status) url += `&status=${filters.status}`;
            if (filters.order_type) url += `&order_type=${filters.order_type}`;
            if (filters.date) url += `&date=${filters.date}`;

            const response = await axios.get(url, getConfig());
            setOrders(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-[#8DB600] p-2 rounded-lg text-white">
                        <ShoppingCart size={22} className="stroke-2" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
                        <p className="text-sm text-gray-500">Manage online and walk-in sales</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        <Filter size={12}/> Order Type
                    </label>
                    <select 
                        name="order_type"
                        value={filters.order_type}
                        onChange={handleFilterChange}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DB600] outline-none min-w-[150px]"
                    >
                        <option value="">All Orders</option>
                        <option value="walk-in">Walk-in POS</option>
                        <option value="online">Online Order</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        Status
                    </label>
                    <select 
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DB600] outline-none min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        <Calendar size={12}/> Specific Date
                    </label>
                    <input 
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#8DB600] outline-none"
                    />
                </div>

                <button 
                    onClick={() => {setFilters({status:'', order_type:'', date:''}); setPage(1);}}
                    className="text-sm text-[#8DB600] font-bold hover:underline py-2"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Order ID</th>
                                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Type</th>
                                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Customer / Cashier</th>
                                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.length > 0 ? orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-600">
                                        #{order.receipt_number ? order.receipt_number.split('-')[1] : `VC-${String(order.id).padStart(4, '0')}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.order_type === 'walk-in' ? (
                                            <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-md w-max">
                                                <Store size={12}/> POS
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-purple-600 font-bold text-xs bg-purple-50 px-2 py-1 rounded-md w-max">
                                                <Globe size={12}/> Online
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">
                                                {order.order_type === 'walk-in' ? 'Walk-in Customer' : (order.user?.name || 'Unknown')}
                                            </span>
                                            {order.order_type === 'walk-in' && order.cashier && (
                                                <span className="text-[10px] text-gray-400">Cashier: {order.cashier.name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}<br/>
                                        <span className="text-[11px] opacity-60">
                                            {new Date(order.created_at).toLocaleTimeString('en-US', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-gray-800">
                                        {parseFloat(order.total_amount).toLocaleString()} Ks
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black text-white ${
                                            order.status === 'completed' ? 'bg-[#218F56]' : 
                                            order.status === 'pending' ? 'bg-[#FFB822]' : 'bg-red-500'
                                        }`}>
                                            {order.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <Link 
                                                to={`/admin/orders/${order.id}`}
                                                className="p-2 text-[#8DB600] hover:bg-green-50 rounded-lg transition-colors border border-green-100 shadow-sm"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">No orders found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <span className="text-xs text-gray-500 font-medium">Page {page} of {totalPages}</span>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            <button 
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrderList;
