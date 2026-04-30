import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    AlertTriangle,
    Hourglass,
    History,
    Star,
    Eye,
    TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-white rounded-lg border border-gray-100 shadow-sm"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-white rounded-lg border border-gray-100 shadow-sm"></div>
                    <div className="h-96 bg-white rounded-lg border border-gray-100 shadow-sm"></div>
                </div>
            </div>
        );
    }

    const statCards = [
        { 
            title: "Today's Sales", 
            value: `Ks. ${stats?.today_sales?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`, 
            subtitle: `${stats?.sales_change || 0}% from yesterday`,
            subtitleColor: (stats?.sales_change >= 0) ? 'text-[#8DB600]' : 'text-red-500',
            icon: <ShoppingCart className="text-[#8DB600]" size={28} />,
            trendUp: stats?.sales_change >= 0
        },
        { 
            title: "New Orders", 
            value: stats?.new_orders || 0, 
            subtitle: "0 today", 
            subtitleColor: "text-gray-500",
            icon: <ClipboardList className="text-[#8DB600]" size={28} />
        },
        { 
            title: "Low Stock", 
            value: stats?.low_stock || 0, 
            subtitle: "Needs attention", 
            subtitleColor: "text-red-500",
            icon: <AlertTriangle className="text-[#8DB600]" size={28} />
        },
        { 
            title: "Expiring Soon", 
            value: stats?.expiring_soon || 0, 
            valueColor: "text-amber-500",
            subtitle: "Within next 30 days", 
            subtitleColor: "text-amber-500",
            icon: <Hourglass className="text-amber-500" size={28} />,
            bgIconColor: "bg-amber-50"
        }
    ];

    return (
        <div className="space-y-6 pt-2 pb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-900 p-1.5 rounded-full text-white">
                    <LayoutDashboard size={20} className="stroke-2" />
                </div>
                <h2 className="text-[22px] text-gray-800">Dashboard Overview</h2>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-36">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-gray-600 font-medium text-sm">{card.title}</h3>
                                <div className={`text-3xl ${card.valueColor || 'text-gray-800'}`}>
                                    {card.value}
                                </div>
                            </div>
                            <div className={`${card.bgIconColor || ''} p-2 rounded-lg`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className={`text-sm mt-3 flex items-center gap-1 ${card.subtitleColor}`}>
                            {card.trendUp && <TrendingUp size={16} />}
                            {card.subtitle}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="xl:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-[17px] text-gray-800 flex items-center gap-2">
                            <History size={20} className="stroke-2" /> Recent Orders
                        </h3>
                    </div>
                    <div className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="pb-3 font-medium">Order ID</th>
                                    <th className="pb-3 font-medium">Customer</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_orders?.length > 0 ? stats.recent_orders.map((order, index) => (
                                    <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                        <td className="py-4 text-gray-600 font-medium">
                                            #{order.receipt_number ? order.receipt_number.split('-')[1] : `VC-${String(order.id).padStart(4, '0')}`}
                                        </td>
                                        <td className="py-4 text-gray-800">
                                            {order.order_type === 'walk-in' ? (
                                                <span className="text-blue-600 font-bold">Walk-in</span>
                                            ) : (
                                                order.user?.name || `Customer ${order.user_id || 'Guest'}`
                                            )}
                                        </td>
                                        <td className="py-4 text-gray-800">
                                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </td>
                                        <td className="py-4 text-gray-800 font-bold">
                                            Ks. {parseFloat(order.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold text-white ${
                                                order.status?.toLowerCase() === 'completed' ? 'bg-[#218F56]' : 
                                                order.status?.toLowerCase() === 'pending' ? 'bg-[#FFB822]' : 'bg-red-500'
                                            }`}>
                                                {order.status?.toUpperCase() || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <Link to={`/admin/orders/${order.id}`} className="px-3 py-1 flex items-center justify-center gap-1.5 w-max border border-blue-500 text-blue-500 rounded text-xs font-medium hover:bg-blue-50 transition-colors">
                                                <Eye size={14} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">No recent orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col">
                    <div className="p-5">
                        <h3 className="text-[17px] text-gray-800 flex items-center gap-2">
                            <Star size={20} className="fill-current stroke-2" /> Top Products
                        </h3>
                    </div>
                    <div className="flex-grow flex items-center justify-center p-8 text-gray-500 text-sm h-64">
                        No product data available
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
