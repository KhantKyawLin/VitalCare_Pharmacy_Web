import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Eye, Download } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserOrderHistory = () => {
    const { token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const location = useLocation();

    const handleDownloadPDF = (id) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const pdfUrl = `${apiUrl}/auth/orders/${id}/pdf`;
        
        // Open in new tab with auth token
        const win = window.open(`${pdfUrl}?token=${token}`, '_blank');
        if (win) win.focus();
    };

    useEffect(() => {
        if (location.state?.orderPlaced) {
            Swal.fire({
                title: 'Order Placed!',
                text: `Thank you! Your order #${location.state.order?.id} has been successfully placed.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: 'var(--primary-color)',
                customClass: {
                    title: 'text-2xl text-gray-800',
                    htmlContainer: 'text-gray-600'
                }
            });
            // Clear the state so the alert doesn't show again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const getSplitStatus = (status) => {
        const s = status?.toLowerCase() || 'pending';
        let mainStatus = { text: 'Pending', bg: 'bg-[#00b4d8] text-white' };
        let delivery = { text: 'Pending', bg: 'bg-gray-500 text-white' };
        let payment = { text: 'Unpaid', bg: 'bg-[#FFB822] text-white' };

        if (s === 'processing') {
            mainStatus = { text: 'Processing', bg: 'bg-blue-500 text-white' };
            delivery = { text: 'Shipping', bg: 'bg-blue-500 text-white' };
        } else if (s === 'completed') {
            mainStatus = { text: 'Completed', bg: 'bg-primary-green text-white' };
            delivery = { text: 'Delivered', bg: 'bg-primary-green text-white' };
            payment = { text: 'Paid', bg: 'bg-primary-green text-white' };
        } else if (s === 'cancelled') {
            mainStatus = { text: 'Cancelled', bg: 'bg-red-500 text-white' };
            delivery = { text: 'Cancelled', bg: 'bg-red-500 text-white' };
            payment = { text: 'Cancelled', bg: 'bg-red-500 text-white' };
        }

        return { mainStatus, delivery, payment };
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading order history...</div>;

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-7xl">
            <h2 className="text-[22px] text-primary-green font-normal mb-6">Your Orders</h2>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto p-5">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="pb-3 font-medium px-2">Order #</th>
                                <th className="pb-3 font-medium px-2">Date</th>
                                <th className="pb-3 font-medium px-2">Amount</th>
                                <th className="pb-3 font-medium text-center">Status</th>
                                <th className="pb-3 font-medium text-center">Delivery</th>
                                <th className="pb-3 font-medium text-center">Payment</th>
                                <th className="pb-3 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => {
                                    const { mainStatus, delivery, payment } = getSplitStatus(order.status);
                                    return (
                                        <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                            <td className="py-4 px-2 text-gray-800">#{order.id.toString().padStart(1, '0')}</td>
                                            <td className="py-4 px-2 text-gray-800">
                                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-2 text-gray-800 font-bold">Ks. {parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            
                                            <td className="py-4 px-2 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${mainStatus.bg}`}>
                                                    {mainStatus.text}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${delivery.bg}`}>
                                                    {delivery.text}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${payment.bg}`}>
                                                    {payment.text}
                                                </span>
                                            </td>
                                            
                                            <td className="py-4 px-2 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Link 
                                                        to={`/profile/orders/${order.id}`}
                                                        className="px-3 py-1 flex items-center justify-center gap-1.5 border border-primary-green text-primary-green rounded text-xs font-medium hover:bg-primary-light transition-colors"
                                                    >
                                                        <Eye size={14} /> View
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDownloadPDF(order.id)}
                                                        className="px-3 py-1 flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 rounded text-xs font-medium hover:bg-slate-50 transition-colors"
                                                    >
                                                        <Download size={14} /> PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserOrderHistory;
