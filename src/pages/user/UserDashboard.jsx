import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Percent, LayoutDashboard, History, Star, Eye, ChevronRight, AlertCircle } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import echo from '../../utils/echo';
import toast from '../../utils/toast';

const UserDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [recentOrders, setRecentOrders] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [specialOffers, setSpecialOffers] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch orders
                const ordersRes = await api.get('/auth/orders');
                setRecentOrders(ordersRes.data.slice(0, 5));

                try {
                    const offersRes = await api.get('/products/special-offers');
                    setSpecialOffers(offersRes.data.slice(0, 4));
                } catch (e) {
                    console.warn("Special offers not available:", e.message);
                }

                try {
                    const remindersRes = await api.get('/refill-reminders');
                    setReminders(remindersRes.data.data || []);
                } catch (e) {
                    console.warn("Reminders not available:", e.message);
                }

            } catch (error) {
                console.error("Dashboard primary fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        
        if (user && token) {
            echo.connector.pusher.config.auth = {
                headers: { Authorization: `Bearer ${token}` }
            };
            echo.private(`App.Models.User.${user.id}`)
                .listen('.refill-reminder', (e) => {
                    if (e.reminder) {
                        setReminders(prev => [...prev, e.reminder]);
                    }
                    toast.info(e.message);
                });
        }
        
        return () => {
            if (user) {
                echo.leave(`App.Models.User.${user.id}`);
            }
        };
    }, [token, user]);

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

    const handleReminderAction = async (id, action) => {
        try {
            await api.post(`/refill-reminders/${id}/action`, { action });
            setReminders(prev => prev.filter(r => r.id !== id));
            if (action === 'actioned') {
                const reminder = reminders.find(r => r.id === id);
                if (reminder) {
                    window.location.href = `/products/${reminder.product_id}`;
                }
            }
        } catch (error) {
            console.error("Failed to update reminder action:", error);
            toast.error("Failed to update reminder");
        }
    };

    return (
        <div className="space-y-6 pt-2 pb-8">
            
            {/* Welcome Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-900 p-1.5 rounded-full text-white">
                    <LayoutDashboard size={20} className="stroke-2" />
                </div>
                <h2 className="text-[22px] text-gray-800">Welcome, {user?.name}</h2>
            </div>

            {/* Refill Reminders Banner */}
            {reminders.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-5 border border-orange-200 flex flex-col justify-center h-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="text-orange-500 stroke-2" size={24} />
                        <h2 className="text-xl text-orange-700 font-semibold">Medication Refill Reminders</h2>
                    </div>
                    <div className="space-y-3 mt-2">
                        {reminders.map(reminder => (
                            <div key={reminder.id} className="bg-white p-4 rounded-md shadow-sm border border-orange-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                                        {reminder.product?.image && (
                                            <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${reminder.product.image}`} alt={reminder.product.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{reminder.product?.name}</p>
                                        <p className="text-sm text-gray-500">You are running low. Due for refill around {new Date(reminder.due_date).toLocaleDateString()}.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleReminderAction(reminder.id, 'actioned')}
                                        className="px-4 py-2 bg-primary-green text-white text-sm font-medium rounded-md hover:bg-primary-dark transition"
                                    >
                                        ⚡ Refill Now
                                    </button>
                                    <button 
                                        onClick={() => handleReminderAction(reminder.id, 'ignored')}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-200 transition"
                                    >
                                        Skip
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
