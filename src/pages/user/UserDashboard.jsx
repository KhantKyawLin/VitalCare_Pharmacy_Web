import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Percent, LayoutDashboard, History, Star, Eye, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';

const UserDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [recentOrders, setRecentOrders] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [specialOffers, setSpecialOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch orders
                const ordersRes = await axios.get('http://127.0.0.1:8000/api/auth/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecentOrders(ordersRes.data.slice(0, 5));

                /* 
                // Promotions route is currently admin-only. Removing from user dashboard to avoid 404.
                try {
                    const promosRes = await axios.get('http://127.0.0.1:8000/api/promotions');
                    setPromotions(promosRes.data.slice(0, 1));
                } catch (e) {
                    console.warn("Promotions not available:", e.message);
                }
                */
                
                try {
                    const offersRes = await axios.get('http://127.0.0.1:8000/api/products/special-offers');
                    setSpecialOffers(offersRes.data.slice(0, 4));
                } catch (e) {
                    console.warn("Special offers not available:", e.message);
                }

            } catch (error) {
                console.error("Dashboard primary fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const getStatusConfig = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': return 'bg-primary-green text-white';
            case 'pending': return 'bg-amber-500 text-white';
            case 'processing': return 'bg-blue-500 text-white';
            case 'cancelled': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                <div className="h-32 bg-white rounded-lg border border-gray-100 shadow-sm"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-white rounded-lg border border-gray-100 shadow-sm"></div>
                    <div className="h-96 bg-white rounded-lg border border-gray-100 shadow-sm"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-2 pb-8">
            
            {/* Welcome Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-900 p-1.5 rounded-full text-white">
                    <LayoutDashboard size={20} className="stroke-2" />
                </div>
                <h2 className="text-[22px] text-gray-800">Welcome, {user?.name}</h2>
            </div>

            {/* Current Promotions Banner */}
            {promotions.length > 0 ? (
                <div className="bg-primary-light rounded-lg p-5 border border-primary-green/20 flex flex-col justify-center h-auto min-h-[100px]">
                    <div className="flex items-center gap-3 mb-2">
                        <Percent className="text-primary-green stroke-2" size={24} />
                        <h2 className="text-xl text-primary-green">Current Promotions</h2>
                    </div>
                    <div>
                        <span className="inline-block bg-primary-green text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                            Special Promotion: {promotions[0].discount_value}{promotions[0].discount_type === 'percentage' ? '% off' : ' Flat Off'}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="bg-primary-light rounded-lg p-5 border border-primary-green/20 flex flex-col justify-center h-auto min-h-[100px]">
                    <div className="flex items-center gap-3 mb-2">
                        <Percent className="text-primary-green stroke-2" size={24} />
                        <h2 className="text-xl text-primary-green">Current Promotions</h2>
                    </div>
                    <div>
                        <span className="inline-block bg-primary-green text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                            Enjoy Free Consultations Today
                        </span>
                    </div>
                </div>
            )}

            {/* Recent Orders Table & Offers */}
            <div className="grid grid-cols-1 gap-6">
                
                {/* Recent Orders Table */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-[17px] text-gray-800 flex items-center gap-2">
                            <History size={20} className="stroke-2" /> Recent Orders
                        </h3>
                    </div>
                    <div className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="pb-3 font-medium">Order ID</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Items</th>
                                    <th className="pb-3 font-medium">Total</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">No recent orders found.</td>
                                    </tr>
                                ) : (
                                    recentOrders.map(order => (
                                        <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                            <td className="py-4 text-gray-800">#VC-{order.id.toString().padStart(4, '0')}</td>
                                            <td className="py-4 text-gray-800">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td className="py-4 text-gray-800">{order.products?.length || 0}</td>
                                            <td className="py-4 text-gray-800 font-bold">Ks. {parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getStatusConfig(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <Link to={`/profile/orders/${order.id}`} className="px-3 py-1 flex items-center justify-center gap-1.5 w-max border border-primary-green text-primary-green rounded text-xs font-medium hover:bg-primary-light transition-colors">
                                                    <Eye size={14} /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="mt-4 text-right">
                            <Link to="/profile/orders" className="text-sm font-medium text-gray-800 hover:text-primary-green flex items-center justify-end gap-1">
                                <History size={16} /> View All Orders
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Special Offers Grid */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col mb-8">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-[17px] text-gray-800 flex items-center gap-2">
                            <Star size={20} className="fill-current stroke-2" /> Special Offers & Popular Products
                        </h3>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {specialOffers.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                            {specialOffers.length === 0 && (
                                <div className="col-span-4 text-center py-8 text-gray-500">No special offers at the moment.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
