import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getStorageUrl } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { 
    ChevronLeft, 
    Package, 
    Truck, 
    CreditCard, 
    Calendar, 
    Info,
    MapPin,
    Phone,
    User,
    Lock,
    X,
    Download
} from 'lucide-react';
import Swal from 'sweetalert2';

const UserOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('order');

    const handleDownloadPDF = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const pdfUrl = `${apiUrl}/auth/orders/${id}/pdf`;
        
        // Open in new tab with auth token
        const win = window.open(`${pdfUrl}?token=${token}`, '_blank');
        if (win) win.focus();
    };

    const handleViewScreenshot = (imageUrl) => {
        Swal.fire({
            imageUrl: imageUrl,
            imageAlt: 'Payment Proof',
            showConfirmButton: false,
            showCloseButton: true,
            width: 'auto',
            padding: '1em',
            background: '#fff',
            customClass: {
                image: 'rounded-lg max-h-[80vh] object-contain'
            }
        });
    };

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get(`/auth/orders/${id}`);
                setOrder(response.data);
            } catch (error) {
                console.error("Error fetching order detail:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
    }, [id, token]);

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

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

    const { mainStatus, delivery: deliveryStatus, payment: paymentStatus } = getSplitStatus(order.status);

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-green">Order #{order.id}</h1>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-bold shadow-sm"
                    >
                        <Download size={16} /> Download Invoice
                    </button>
                    <button 
                        onClick={() => navigate('/profile/orders')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                </div>
            </div>

            {/* Main Tabs Section */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 bg-gray-50/50">
                    <button 
                        onClick={() => setActiveTab('order')}
                        className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'order' ? 'border-primary-green text-primary-green bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Package size={18} /> Order
                    </button>
                    <button 
                        onClick={() => setActiveTab('delivery')}
                        className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'delivery' ? 'border-primary-green text-primary-green bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Truck size={18} /> Delivery
                    </button>
                    <button 
                        onClick={() => setActiveTab('payment')}
                        className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'payment' ? 'border-primary-green text-primary-green bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <CreditCard size={18} /> Payment
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {activeTab === 'order' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="text-gray-800 font-medium">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Status</p>
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${mainStatus.bg}`}>
                                        {mainStatus.text}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Status</p>
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${deliveryStatus.bg}`}>
                                        {deliveryStatus.text}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-gray-800 font-bold text-lg">
                                        Ks. {parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-gray-800 font-medium leading-relaxed max-w-2xl">
                                        {order.delivery_address || order.user?.address || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-800 font-medium">{order.user?.name}</p>
                                        <span className="text-gray-400 font-normal">({order.delivery_phone || order.user?.phone || 'N/A'})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Method</p>
                                        <p className="text-gray-800 font-medium capitalize">{order.payment_method || 'Online'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
                                        <Info size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${paymentStatus.bg}`}>
                                            {paymentStatus.text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Proof</p>
                                <div className="w-40 h-40 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {order.slip_image ? (
                                        <img 
                                            src={getStorageUrl(order.slip_image)} 
                                            alt="Payment Proof" 
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                            onClick={() => handleViewScreenshot(getStorageUrl(order.slip_image))}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-300">
                                            <div className="p-3 bg-white rounded-full shadow-sm">
                                                <Lock size={24} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secure</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Table Section */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-8">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-[17px] text-gray-800 font-bold">Products</h3>
                </div>
                <div className="overflow-x-auto p-5">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="pb-3 font-medium">Product</th>
                                <th className="pb-3 font-medium text-right">Price</th>
                                <th className="pb-3 font-medium text-center">Qty</th>
                                <th className="pb-3 font-medium text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {order.order_products?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded border border-gray-100 bg-white p-1 flex items-center justify-center shrink-0">
                                                <img 
                                                    src={item.product?.pictures?.[0]?.image_path ? getStorageUrl(item.product.pictures[0].image_path) : 'https://placehold.co/50x50/f8fafc/8DB600?text=P'} 
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <span className="text-gray-800 font-medium">{item.product?.name || 'Product'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right text-gray-600">
                                        Ks. {parseFloat(item.price).toLocaleString()}
                                    </td>
                                    <td className="py-4 text-center text-gray-600">
                                        {item.quantity}
                                    </td>
                                    <td className="py-4 text-right font-bold text-gray-800">
                                        Ks. {(parseFloat(item.price) * item.quantity).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="py-6 text-right font-bold text-gray-800 text-base">Total:</td>
                                <td className="py-6 text-right font-bold text-primary-green text-lg">
                                    Ks. {parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetail;
