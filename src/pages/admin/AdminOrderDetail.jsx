import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    ShoppingCart,
    User,
    Calendar,
    CreditCard,
    CheckCircle,
    Store,
    Globe
} from 'lucide-react';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/admin/orders/${id}`, getConfig());
                setOrder(response.data);
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <div className="p-8 text-center animate-pulse">Loading order details...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

    return (
        <div className="space-y-6 pb-12 print:p-0">
            {/* Main Content (Hidden on Print) */}
            <div className="print:hidden space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                            <p className="text-sm text-gray-500">Order #{order.receipt_number || order.id}</p>
                        </div>
                    </div>
                    <Link
                        to="/admin/orders"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all font-medium shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft size={18} /> Back to Orders
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side: Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <ShoppingCart size={18} /> Order Items
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-gray-400 uppercase text-[11px] font-bold border-b border-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">Product</th>
                                            <th className="px-6 py-3 text-center">Quantity</th>
                                            <th className="px-6 py-3 text-right">Price</th>
                                            <th className="px-6 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-gray-600">
                                        {order.order_products?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.product?.pictures?.[0] && (
                                                            <img
                                                                src={`http://127.0.0.1:8000/storage/${item.product.pictures[0].image_path}`}
                                                                alt=""
                                                                className="w-10 h-10 object-cover rounded-md border border-gray-100"
                                                            />
                                                        )}
                                                        <span className="font-medium">{item.product?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right">{parseFloat(item.price).toLocaleString()} Ks</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    {(parseFloat(item.price) * item.quantity).toLocaleString()} Ks
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{(parseFloat(order.total_amount) + parseFloat(order.discount_amount || 0)).toLocaleString()} Ks</span>
                                </div>
                                {parseFloat(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-sm text-red-500 font-medium">
                                        <span>Discount</span>
                                        <span>-{parseFloat(order.discount_amount).toLocaleString()} Ks</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-black text-gray-800 pt-2 border-t border-gray-200">
                                    <span>Total Amount</span>
                                    <span className="text-[#8DB600]">{parseFloat(order.total_amount).toLocaleString()} Ks</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Order Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <h3 className="font-bold text-gray-800 border-b pb-3 border-gray-50 mb-4">Summary Information</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase">Order Date</p>
                                        <p className="text-sm font-medium">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase">Status</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                        {order.order_type === 'walk-in' ? <Store size={18} /> : <Globe size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase">Order Type</p>
                                        <p className="text-sm font-medium">{order.order_type === 'walk-in' ? 'POS / Walk-in' : 'Online Store'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase">Customer / Cashier</p>
                                        <p className="text-sm font-medium">
                                            {order.order_type === 'walk-in' ? (
                                                <>Walk-in <span className="text-[11px] text-gray-400">(Cashier: {order.cashier?.name})</span></>
                                            ) : (
                                                order.user?.name || 'Unknown'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {order.order_type === 'walk-in' && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase">Payment Info</p>
                                            <p className="text-xs text-gray-600">
                                                Received: {parseFloat(order.received_amount || 0).toLocaleString()} Ks<br />
                                                Change: {parseFloat(order.change_return || 0).toLocaleString()} Ks
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Print Action in Sidebar */}
                        <button
                            onClick={() => window.print()}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-[#8DB600]/30 hover:text-[#8DB600] transition-all font-bold shadow-sm group"
                        >
                            <Printer size={18} className="group-hover:scale-110 transition-transform" /> Print Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Printable Receipt Area (Only visible when printing) --- */}
            <div className="hidden print:block fixed top-0 left-0 w-[80mm] text-black bg-white p-4 z-[9999] text-sm h-auto overflow-visible">
                <div className="text-center">
                    <h2 className="font-bold text-xl mb-1">Vital Care Pharmacy</h2>
                    <p className="text-xs text-gray-600 mb-4">Receipt #{order.receipt_number}<br />{new Date(order.created_at).toLocaleString()}</p>

                    <div className="border-t border-b border-dashed border-gray-400 py-2 mb-2 text-left">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="text-left pb-1">Item</th>
                                    <th className="text-right pb-1">Qty</th>
                                    <th className="text-right pb-1">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.order_products?.map((op, i) => (
                                    <tr key={i}>
                                        <td className="py-1 pr-2">{op.product?.name}</td>
                                        <td className="text-right py-1">{op.quantity}</td>
                                        <td className="text-right py-1">{(parseFloat(op.price) * op.quantity).toLocaleString()} Ks</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-right text-xs space-y-1 mb-4">
                        <p>Subtotal: {(parseFloat(order.total_amount) + parseFloat(order.discount_amount || 0)).toLocaleString()} Ks</p>
                        {parseFloat(order.discount_amount) > 0 && <p>Discount: -{parseFloat(order.discount_amount).toLocaleString()} Ks</p>}
                        <p className="font-bold text-sm mt-1">Total: {parseFloat(order.total_amount).toLocaleString()} Ks</p>
                        <p className="mt-2 font-medium">Paid: {parseFloat(order.received_amount || order.total_amount).toLocaleString()} Ks</p>
                        <p>Change: {parseFloat(order.change_return || 0).toLocaleString()} Ks</p>
                    </div>

                    <p className="text-xs font-bold mt-6 mb-1 text-center">Thank you for your purchase!</p>
                    <p className="text-[10px] text-center text-gray-500">Please keep receipt for returns/exchanges.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
