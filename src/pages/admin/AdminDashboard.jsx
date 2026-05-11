import React, { useEffect, useState, useContext } from 'react';
import api from '../../utils/api';
import { 
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    AlertTriangle,
    Hourglass,
    History,
    Star,
    Eye,
    Activity,
    TrendingDown,
    DollarSign,
    Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SalesChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const maxAmount = Math.max(...data.map(d => d.amount), 1000);
    const height = 200;
    const width = 600;
    const padding = 40;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.amount / maxAmount) * (height - padding * 2) + padding);
        return { x, y };
    });

    const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaData = `${pathData} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-green animate-pulse"></div>
                    <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-widest">7-Day Sales Trend</h3>
                </div>
                <div className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded">CURRENCY: MMK</div>
            </div>
            <div className="relative flex-grow">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8DB600" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8DB600" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(tick => (
                        <line 
                            key={tick}
                            x1={padding} 
                            y1={height - (tick * (height - padding * 2) + padding)} 
                            x2={width - padding} 
                            y2={height - (tick * (height - padding * 2) + padding)} 
                            stroke="#f1f5f9" 
                            strokeWidth="1"
                        />
                    ))}

                    <path d={areaData} fill="url(#chartGradient)" />
                    <path d={pathData} fill="none" stroke="#8DB600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {points.map((p, i) => (
                        <g key={i} className="group">
                            <circle cx={p.x} cy={p.y} r="5" fill="#8DB600" stroke="white" strokeWidth="2" className="transition-all hover:r-7 cursor-pointer" />
                            <text x={p.x} y={height - 10} textAnchor="middle" className="text-[12px] font-bold fill-gray-400">{data[i].day}</text>
                            <text x={p.x} y={p.y - 15} textAnchor="middle" className="text-[10px] font-black fill-primary-green opacity-0 group-hover:opacity-100 transition-opacity">
                                {data[i].amount.toLocaleString()}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

const MonthlySalesChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const maxAmount = Math.max(...data.map(d => d.amount), 1000);
    const height = 180;
    const width = 500;
    const padding = 30;
    
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-[14px] font-black text-gray-800 uppercase tracking-widest">6-Month Trend</h3>
                </div>
            </div>
            <div className="flex-grow flex items-end justify-between gap-2 px-2">
                {data.map((d, i) => {
                    const barHeight = (d.amount / maxAmount) * (height - padding);
                    return (
                        <div key={i} className="flex-grow group relative flex flex-col items-center">
                            <div className="absolute -top-6 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                Ks. {d.amount.toLocaleString()}
                            </div>
                            <div 
                                className="w-full bg-blue-50 group-hover:bg-blue-100 transition-all rounded-t-sm relative flex items-end justify-center"
                                style={{ height: `${height}px` }}
                            >
                                <div 
                                    className="w-4/5 bg-blue-500 rounded-t-sm transition-all duration-700"
                                    style={{ height: `${barHeight}px` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 mt-2">{d.month}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TopProductsCard = ({ products }) => {
    if (!products || products.length === 0) return null;
    
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" />
                    <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-widest">Top Products</h3>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase">By Quantity</span>
            </div>
            <div className="space-y-4 flex-grow">
                {products.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-primary-green/10 group-hover:text-primary-green transition-colors">
                                {idx + 1}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                                <p className="text-[10px] text-gray-400 font-medium tracking-tight">Revenue: Ks. {parseFloat(item.total_revenue).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-primary-green">{item.total_qty} Sold</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);
    const maxVal = Math.max(...sortedData.map(d => d.value), 1);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <Activity size={18} className="text-primary-green" />
                <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-widest">Category Performance</h3>
            </div>
            <div className="space-y-5 flex-grow justify-center flex flex-col">
                {sortedData.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-tighter">
                            <span>{item.name}</span>
                            <span className="text-gray-800">{item.value} Sales</span>
                        </div>
                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary-green rounded-full transition-all duration-1000"
                                style={{ width: `${(item.value / maxVal) * 100}%`, opacity: 1 - (idx * 0.15) }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
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

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Dashboard Data Unavailable</h3>
                <p className="text-gray-500 max-w-md mb-6">We encountered an error while fetching the latest statistics. Please try refreshing the page or contact the system administrator.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary-green text-white rounded-lg font-bold hover:bg-primary-dark transition-all"
                >
                    REFRESH DASHBOARD
                </button>
            </div>
        );
    }

    // Role-based stat cards logic
    let statCards = [];

    const commonCards = [
        { 
            title: "Total Products", 
            value: stats?.total_products || 0, 
            subtitle: "In catalog", 
            subtitleColor: "text-gray-500",
            icon: <Pill className="text-primary-green" size={28} />,
            link: "/admin/products"
        },
        { 
            title: "Low Stock", 
            value: stats?.low_stock || 0, 
            subtitle: "Needs attention", 
            subtitleColor: "text-red-500",
            icon: <AlertTriangle className="text-primary-green" size={28} />,
            link: "/admin/reorder-alerts"
        },
        { 
            title: "Expiring Soon", 
            value: stats?.expiring_soon || 0, 
            valueColor: "text-amber-500",
            subtitle: "Within next 30 days", 
            subtitleColor: "text-amber-500",
            icon: <Hourglass className="text-amber-500" size={28} />,
            bgIconColor: "bg-amber-50",
            link: "/admin/expired?tab=expiring_soon"
        }
    ];

    if (['admin', 'superadmin'].includes(user?.role)) {
        statCards = [
            { 
                title: "Today's Sales", 
                value: `Ks. ${stats?.today_sales?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`, 
                subtitle: `${stats?.sales_change || 0}% from yesterday`,
                subtitleColor: (stats?.sales_change >= 0) ? 'text-primary-green' : 'text-red-500',
                icon: <ShoppingCart className="text-primary-green" size={28} />,
                trendUp: stats?.sales_change >= 0,
                trendDown: stats?.sales_change < 0,
                link: `/admin/orders`
            },
            { 
                title: "Today's Profit", 
                value: `Ks. ${stats?.today_profit?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`, 
                subtitle: `${stats?.profit_change || 0}% vs yesterday`,
                subtitleColor: (stats?.profit_change >= 0) ? 'text-primary-green' : 'text-red-500',
                icon: <DollarSign className="text-primary-green" size={28} />,
                trendUp: stats?.profit_change >= 0,
                trendDown: stats?.profit_change < 0,
                bgIconColor: "bg-green-50",
                link: "/admin/reports"
            },
            { 
                title: "New Orders", 
                value: stats?.new_orders || 0, 
                subtitle: "Placed today", 
                subtitleColor: "text-gray-500",
                icon: <ClipboardList className="text-primary-green" size={28} />,
                link: "/admin/orders"
            },
            commonCards[1], // Low Stock
        ];
    } else if (user?.role === 'pharmacist') {
        statCards = [
            { 
                title: "Health Tips", 
                value: stats?.health_tips_count || 0, 
                subtitle: `${stats?.published_tips || 0} published`, 
                subtitleColor: "text-primary-green",
                icon: <BookOpen className="text-primary-green" size={28} />,
                link: "/admin/health-tips"
            },
            commonCards[0], // Total Products
            commonCards[1], // Low Stock
            commonCards[2]  // Expiring Soon
        ];
    } else if (user?.role === 'staff') {
        statCards = [
            { 
                title: "Orders to Process", 
                value: stats?.new_orders || 0, 
                subtitle: "Recent activity", 
                subtitleColor: "text-gray-500",
                icon: <Package className="text-primary-green" size={28} />,
                link: "/admin/orders"
            },
            commonCards[0], // Total Products
            commonCards[1], // Low Stock
            commonCards[2]  // Expiring Soon
        ];
    }

    return (
        <div className="space-y-6 pt-2 pb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-900 p-1.5 rounded-full text-white">
                    <LayoutDashboard size={20} className="stroke-2" />
                </div>
                <div>
                    <h2 className="text-[22px] text-gray-800">Dashboard Overview</h2>
                    <p className="text-xs text-gray-500 capitalize">Logged in as {user?.role}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, idx) => (
                    <Link 
                        key={idx} 
                        to={card.link}
                        className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md hover:border-primary-green/30 transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-gray-600 font-medium text-sm group-hover:text-primary-green transition-colors">{card.title}</h3>
                                <div className={`text-3xl ${card.valueColor || 'text-gray-800'}`}>
                                    {card.value}
                                </div>
                            </div>
                            <div className={`${card.bgIconColor || ''} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className={`text-sm mt-3 flex items-center gap-1 ${card.subtitleColor}`}>
                            {card.trendUp && <TrendingUp size={16} />}
                            {card.trendDown && <TrendingDown size={16} />}
                            {card.subtitle}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Visual Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-2 min-h-[300px]">
                    <SalesChart data={stats?.sales_trend} />
                </div>
                <div className="min-h-[300px]">
                    <MonthlySalesChart data={stats?.monthly_trend} />
                </div>
                <div className="min-h-[300px]">
                    <TopProductsCard products={stats?.top_products} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Role-based table view (Pharmacists focus on content, others on orders) */}
                {user?.role === 'pharmacist' ? (
                    <div className="xl:col-span-3 bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                            <BookOpen size={48} className="text-gray-200" />
                            <h3 className="text-lg font-medium text-gray-700">Content Management Mode</h3>
                            <p className="max-w-md mx-auto">Your dashboard is optimized for Health Tips and Inventory monitoring. Use the sidebar to manage promotions and educational content.</p>
                        </div>
                    </div>
                ) : (
                    <>
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
                                                        order.status?.toLowerCase() === 'completed' ? 'bg-primary-dark' : 
                                                        order.status?.toLowerCase() === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}>
                                                        {order.status?.toUpperCase() || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <Link 
                                                        to={`/admin/orders/${order.id}`}
                                                        className="px-3 py-1 flex items-center justify-center gap-1.5 w-max border border-primary-green text-primary-green rounded text-xs font-medium hover:bg-primary-dark hover:text-white hover:scale-105 transition-all duration-300 shadow-sm"
                                                    >
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

                        {/* Category distribution */}
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col">
                            <CategoryChart data={stats?.category_distribution} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
