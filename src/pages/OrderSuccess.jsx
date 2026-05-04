import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { CheckCircle, Lock, ShoppingBag, List } from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    useEffect(() => {
        if (!order) {
            navigate('/products');
        } else {
            // Show Success Modal
            Swal.fire({
                title: 'Order Placed!',
                text: `Thank you! Your order #${order.id} has been successfully placed.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#4CAF50',
                customClass: {
                    title: 'text-2xl text-gray-800',
                    htmlContainer: 'text-gray-600'
                }
            });
        }
    }, [order, navigate]);

    if (!order) return null;

    // Format date
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-[#00BCD4] text-white px-6 py-4 flex items-center gap-2">
                    <CheckCircle className="w-8 h-8 fill-white text-[#00BCD4]" />
                    <h1 className="text-2xl font-bold">Order Confirmed!</h1>
                </div>

                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column */}
                        <div className="lg:w-1/2 space-y-6">
                            {/* Order Info */}
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-slate-500 text-white px-4 py-2 text-sm font-medium">
                                    Order Info
                                </div>
                                <div className="p-4 bg-gray-50/50">
                                    <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
                                        <span className="font-bold text-gray-800">Order #:</span>
                                        <span className="text-gray-600">#{order.id}</span>

                                        <span className="font-bold text-gray-800">Date:</span>
                                        <span className="text-gray-600">{orderDate}</span>

                                        <span className="font-bold text-gray-800">Method:</span>
                                        <span className="text-gray-600 capitalize">{order.payment_method || 'Cash'}</span>

                                        <span className="font-bold text-gray-800">Payment Status:</span>
                                        <div>
                                            <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                                Unpaid
                                            </span>
                                        </div>

                                        <span className="font-bold text-gray-800">Total:</span>
                                        <span className="font-bold text-[#8DB600]">
                                            Ks. {parseFloat(order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-slate-500 text-white px-4 py-2 text-sm font-medium">
                                    Delivery
                                </div>
                                <div className="p-4 bg-gray-50/50">
                                    <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
                                        <span className="font-bold text-gray-800">Customer:</span>
                                        <span className="text-gray-600">{order.user?.name || 'Customer'}</span>

                                        <span className="font-bold text-gray-800">Phone:</span>
                                        <span className="text-gray-600">{order.contact_phone || '-'}</span>

                                        <span className="font-bold text-gray-800">Address:</span>
                                        <span className="text-gray-600">{order.delivery_address || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:w-1/2">
                            {/* Products in your Order */}
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-slate-500 text-white px-4 py-2 text-sm font-medium">
                                    Products in your Order
                                </div>
                                <div className="p-4">
                                    <div className="space-y-4">
                                        {order.order_products?.map((item, index) => {
                                            const product = item.product;
                                            const price = parseFloat(item.price || 0);
                                            const subtotal = price * item.quantity;
                                            const imageUrl = product?.pictures?.length > 0 
                                                ? `http://127.0.0.1:8000/storage/${product.pictures[0].image_path}` 
                                                : "https://placehold.co/40x40/f8fafc/a3c93a?text=P";

                                            return (
                                                <div key={index} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 border border-gray-200 p-0.5 rounded bg-white shrink-0">
                                                            <img src={imageUrl} alt={product?.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-gray-600 text-sm">{product?.name || 'Product'}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 text-right shrink-0">
                                                        <span>Ks. {price.toLocaleString(undefined, { minimumFractionDigits: 2 })} × {item.quantity} = </span>
                                                        <span className="font-bold text-gray-800">Ks. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                        <span className="font-bold text-gray-800 text-sm">Total:</span>
                                        <span className="font-bold text-[#8DB600] text-sm">
                                            Ks. {parseFloat(order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <Link 
                            to="/products"
                            className="flex items-center gap-2 border border-[#8DB600] text-[#8DB600] px-4 py-2 rounded text-sm font-medium hover:bg-[#8DB600] hover:text-white transition-colors"
                        >
                            <ShoppingBag size={16} /> Continue Shopping
                        </Link>
                        <Link 
                            to="/profile"
                            className="flex items-center gap-2 bg-[#8DB600] hover:bg-[#769800] text-white px-4 py-2 rounded text-sm font-medium shadow transition-colors"
                        >
                            <List size={16} /> View Orders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
