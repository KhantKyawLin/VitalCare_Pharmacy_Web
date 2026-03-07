import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/auth/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [token, navigate]);

    if (!user) return null; // Wait for redirect if not logged in

    return (
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">

            {/* Sidebar - Profile Info */}
            <div className="md:w-1/3">
                <div className="bg-white rounded-xl shadow-sm border border-light-grey p-6 sticky top-24">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-primary-green rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-text-dark">{user.name}</h2>
                        <p className="text-text-muted mb-6">{user.email}</p>
                    </div>

                    <div className="space-y-4 border-t border-light-grey pt-6">
                        <div>
                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Phone Number</span>
                            <span className="text-text-dark font-medium">{user.phone || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Delivery Address</span>
                            <span className="text-text-dark font-medium leading-relaxed">{user.address || 'Not provided'}</span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="mt-8 w-full border border-red-500 text-red-500 hover:bg-red-50 py-2 rounded-md font-medium transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content - Order History */}
            <div className="md:w-2/3">
                <h1 className="text-3xl font-bold text-text-dark mb-8">Order History</h1>

                {isLoading ? (
                    <div className="py-12 text-center text-text-muted">Loading your orders...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-light-grey p-12 text-center">
                        <h3 className="text-xl font-bold text-text-dark mb-2">No orders yet</h3>
                        <p className="text-text-muted mb-6">Looks like you haven't made any purchases.</p>
                        <Link to="/products" className="bg-primary-green hover:bg-accent-green text-white px-6 py-2 rounded-md font-medium transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-light-grey overflow-hidden">
                                <div className="bg-gray-50 border-b border-light-grey p-4 md:p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                        <div>
                                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Order Placed</span>
                                            <span className="text-text-dark font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Total Amount</span>
                                            <span className="text-primary-green font-bold">${parseFloat(order.total_amount).toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Order #</span>
                                            <span className="text-text-dark font-medium">{order.id.toString().padStart(6, '0')}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 md:mt-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                            order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                                                order.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 md:p-6 divide-y divide-light-grey">
                                    {order.products.map(op => {
                                        const imageUrl = op.product.pictures?.length > 0 ? `http://localhost/VitalCare/uploads/${op.product.pictures[0].image_path}` : "https://placehold.co/80x80/f8fafc/a3c93a?text=Item";
                                        return (
                                            <div key={op.id} className="py-4 flex flex-row items-center gap-4 first:pt-0 last:pb-0">
                                                <img src={imageUrl} alt={op.product.name} className="w-16 h-16 rounded object-cover border border-light-grey" />
                                                <div className="flex-grow">
                                                    <Link to={`/products/${op.product.id}`} className="font-semibold text-text-dark hover:text-primary-green">
                                                        {op.product.name}
                                                    </Link>
                                                    <div className="text-sm text-text-muted">Qty: {op.quantity}</div>
                                                </div>
                                                <div className="font-bold text-text-dark">
                                                    ${parseFloat(op.price).toFixed(2)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
