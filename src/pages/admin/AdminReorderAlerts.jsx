import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Bell, 
    AlertTriangle, 
    Info, 
    ShoppingCart,
    Search,
    Filter,
    Plus
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminReorderAlerts = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ alerts: [], stats: { critical: 0, warning: 0, notice: 0, total: 0 } });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/inventory/low-stock', getConfig());
            if (response.data) {
                setData({
                    alerts: response.data.alerts || [],
                    stats: response.data.stats || { critical: 0, warning: 0, notice: 0, total: 0 }
                });
            }
        } catch (error) {
            console.error("Error fetching reorder alerts:", error);
            Swal.fire('Error', 'Failed to load reorder alerts.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = (item) => {
        navigate(`/admin/purchases/create?reorder_product_id=${item.id}&supplier_id=${item.supplier_id || ''}`);
    };

    const getAlertUI = (severity) => {
        switch(severity) {
            case 'critical':
                return { 
                    icon: <AlertTriangle size={16} strokeWidth={2.5}/>, 
                    colorClass: 'text-white',
                    bgIconClass: 'bg-red-500', 
                    bgRowClass: 'bg-red-50/60',
                    badgeClass: 'bg-red-100 text-red-600 border border-red-200'
                };
            case 'warning':
                return { 
                    icon: <AlertTriangle size={16} strokeWidth={2.5}/>, 
                    colorClass: 'text-white',
                    bgIconClass: 'bg-yellow-400', 
                    bgRowClass: 'bg-yellow-50/40',
                    badgeClass: 'bg-yellow-100 text-yellow-600 border border-yellow-200'
                };
            case 'notice':
            default:
                return { 
                    icon: <Info size={16} strokeWidth={2.5}/>, 
                    colorClass: 'text-white',
                    bgIconClass: 'bg-blue-400', 
                    bgRowClass: 'bg-blue-50/20',
                    badgeClass: 'bg-blue-100 text-blue-600 border border-blue-200'
                };
        }
    };

    const alertsList = Array.isArray(data.alerts) ? data.alerts : [];
    const filteredAlerts = alertsList.filter(item => 
        item.name && item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1700px] mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Bell size={28} className="text-yellow-500 fill-yellow-500" strokeWidth={2}/>
                    <h2 className="text-[22px] text-gray-800 font-bold tracking-tight">Reorder Alerts</h2>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Critical */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border-l-4 border-l-red-500 border border-t border-b border-r border-gray-100 flex justify-between items-start relative overflow-hidden">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Critical Alerts</p>
                        <h3 className="text-3xl font-bold text-gray-800">{data.stats.critical}</h3>
                        <p className="text-[12px] text-red-500 font-bold mt-2.5 flex items-center gap-1">
                            ↓ Below 30% of reorder level
                        </p>
                    </div>
                    <div className="bg-[#8DB600] text-white p-3 rounded shadow-sm z-10">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border-l-4 border-l-yellow-400 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Warning Alerts</p>
                        <h3 className="text-3xl font-bold text-gray-800">{data.stats.warning}</h3>
                        <p className="text-[12px] text-yellow-500 font-bold mt-2.5 flex items-center gap-1">
                            ↓ Below 60% of reorder level
                        </p>
                    </div>
                    <div className="bg-yellow-50 text-yellow-500 p-3 rounded-full">
                        <AlertTriangle size={20} />
                    </div>
                </div>

                {/* Notice */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border-l-4 border-l-blue-400 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Notice Alerts</p>
                        <h3 className="text-3xl font-bold text-gray-800">{data.stats.notice}</h3>
                        <p className="text-[12px] text-blue-500 font-bold mt-2.5 flex items-center gap-1">
                            i Approaching reorder level
                        </p>
                    </div>
                    <div className="bg-blue-50 text-blue-400 p-3 rounded-full">
                        <Info size={20} />
                    </div>
                </div>

                {/* Total */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 border-l-4 border-l-gray-300 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-medium tracking-wide">Total Alerts</p>
                        <h3 className="text-3xl font-bold text-gray-800">{data.stats.total}</h3>
                        <p className="text-[12px] text-gray-500 font-medium mt-2.5 flex items-center gap-1">
                            {data.stats.critical} require attention
                        </p>
                    </div>
                    <div className="bg-green-50 text-green-500 p-3 rounded">
                        <Bell size={24} />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 pb-2 overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-white">
                    <div className="flex items-center gap-3 text-[#A3C93A]">
                        <div className="p-1.5 rounded bg-green-50 border border-green-100">
                            <ShoppingCart size={18} strokeWidth={2.5}/>
                        </div>
                        <h3 className="text-[16px] font-bold text-gray-800 tracking-tight">Active Reorder Alerts</h3>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <div className="relative flex w-64 rounded overflow-hidden border border-gray-200 bg-white focus-within:border-[#8DB600] transition-all">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2 text-gray-600 bg-transparent"
                                placeholder="Search product..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        <button 
                            onClick={() => navigate('/admin/purchases/create')}
                            className="bg-[#8DB600] text-white px-5 py-2 rounded border-2 border-[#8DB600] hover:bg-[#7fa400] hover:border-[#7fa400] transition-all text-[13px] font-bold shadow-md flex items-center gap-2"
                        >
                            <Plus size={16} strokeWidth={3}/> CREATE PURCHASE ORDER
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] whitespace-nowrap align-middle">
                        <thead className="text-gray-500 border-b border-gray-200 bg-white">
                            <tr className="uppercase text-[11px] font-black tracking-widest">
                                <th className="py-4 px-6 w-16 text-center">Alert</th>
                                <th className="py-4 px-6">Product Name</th>
                                <th className="py-4 px-6">Category</th>
                                <th className="py-4 px-6 text-center">Current Stock</th>
                                <th className="py-4 px-6 text-center">Reorder Level</th>
                                <th className="py-4 px-6">Supplier</th>
                                <th className="py-4 px-6">Last Stocked In</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 align-middle font-medium">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-gray-50">
                                        <td colSpan="8" className="py-6 px-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredAlerts.length > 0 ? filteredAlerts.map((item) => {
                                const uiInfo = getAlertUI(item.severity);
                                return (
                                    <tr key={item.id} className={`border-b border-white hover:brightness-95 transition-all ${uiInfo.bgRowClass}`}>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center">
                                                <div className={`p-1.5 rounded text-red-500`}>
                                                    {uiInfo.icon}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-gray-800">{item.name}</span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 text-xs w-48 whitespace-pre-wrap">
                                            {item.category}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="font-bold text-gray-800">{item.current_stock}</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-gray-600">{item.reorder_level}</span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-700">
                                            {item.supplier_name}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {item.last_stocked_date}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center items-center">
                                                <button 
                                                    onClick={() => handleReorder(item)}
                                                    className="bg-[#8DB600] text-white hover:bg-[#7fa400] px-5 py-2 rounded text-[11px] font-black uppercase shadow-sm transition-all flex items-center gap-2 whitespace-nowrap border-2 border-[#8DB600]"
                                                    title="Reorder"
                                                >
                                                    <ShoppingCart size={14} strokeWidth={3}/> Reorder
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center text-gray-500 bg-white">
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="font-bold text-gray-800 text-[15px]">Inventory looks good!</p>
                                            <p className="text-sm text-gray-500 mt-1">No products are currently running low on stock.</p>
                                        </div>
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

export default AdminReorderAlerts;
