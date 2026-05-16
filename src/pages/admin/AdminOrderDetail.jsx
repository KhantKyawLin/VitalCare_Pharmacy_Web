import React, { useState, useEffect } from 'react';
import api, { getStorageUrl } from '../../utils/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    ArrowLeft,
    Printer,
    ShoppingCart,
    User,
    Calendar,
    CreditCard,
    CheckCircle,
    Store,
    Globe,
    Save,
    Image as ImageIcon,
    Phone,
    MapPin,
    Package,
    Download,
    FileText,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const AdminOrderDetail = () => {
    const { settings } = useSettings();
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state for status updates
    const [status, setStatus] = useState('');
    const [deliverStatus, setDeliverStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [refundReason, setRefundReason] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/admin/orders/${id}`);
            const data = response.data;
            setOrder(data);
            setStatus(data.status || 'pending');
            // Walk-in orders are always delivered and paid by nature
            const isWalkIn = data.order_type === 'walk-in';
            setDeliverStatus(isWalkIn ? 'delivered' : (data.deliver_status || 'pending'));
            setPaymentStatus(data.payment_status === 'refunded' ? 'refunded' : (isWalkIn ? 'paid' : (data.payment_status || 'pending')));
            setRefundReason(data.refund_reason || '');
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/orders/${id}`, {
                status,
                deliver_status: deliverStatus,
                payment_status: paymentStatus,
                refund_reason: refundReason
            });

            Swal.fire({
                icon: 'success',
                title: 'Order Updated',
                text: 'The order statuses have been successfully updated.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/admin/orders');
            });
        } catch (error) {
            Swal.fire('Error', 'Failed to update order statuses.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = () => {
        const token = localStorage.getItem('token');
        const url = `${import.meta.env.VITE_API_URL}/admin/orders/${id}/pdf?token=${token}`;
        window.open(url, '_blank');
    };

    const showPaymentSlip = () => {
        if (!order.slip_image) {
            Swal.fire('No Slip', 'No payment screenshot has been uploaded for this order.', 'info');
            return;
        }

        Swal.fire({
            title: 'Payment Verification',
            imageUrl: getStorageUrl(order.slip_image),
            imageAlt: 'Payment Slip',
            width: 'auto',
            padding: '1em',
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                image: 'max-h-[80vh] object-contain rounded-lg shadow-lg'
            }
        });
    };

    const showPrescriptionImage = () => {
        if (!order.prescription_image) {
            Swal.fire('No Image', 'No prescription image was uploaded for this order.', 'info');
            return;
        }

        Swal.fire({
            title: 'Prescription Document',
            imageUrl: getStorageUrl(order.prescription_image),
            imageAlt: 'Prescription',
            width: 'auto',
            padding: '1em',
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                image: 'max-h-[80vh] object-contain rounded-lg shadow-lg'
            }
        });
    };

    const handlePrescriptionReview = async (reviewStatus) => {
        try {
            const confirmText = reviewStatus === 'approved' 
                ? 'Approve prescription and allow fulfillment?' 
                : 'Reject prescription? This will automatically cancel the restricted items from the order and reverse inventory.';
                
            const result = await Swal.fire({
                title: 'Review Prescription',
                text: confirmText,
                icon: reviewStatus === 'approved' ? 'question' : 'warning',
                showCancelButton: true,
                confirmButtonColor: reviewStatus === 'approved' ? '#10b981' : '#ef4444',
                confirmButtonText: `Yes, ${reviewStatus} it!`
            });

            if (result.isConfirmed) {
                setSaving(true);
                await api.patch(`/admin/orders/${id}/prescription`, {
                    prescription_status: reviewStatus
                });
                Swal.fire('Success', `Prescription ${reviewStatus}.`, 'success');
                fetchOrder();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update prescription status.', 'error');
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
        </div>
    );
    
    if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

    const isOnline = order.order_type === 'online';

    return <React.Fragment>
            <div className="space-y-6 pb-12 print:p-0">
            {/* Header */}
            <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Edit Order <span className="text-primary-green">#{order.receipt_number || order.id}</span>
                        </h2>
                        <p className="text-sm text-gray-500 italic">Manage order lifecycle and verify payments.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Fulfillment Quick Actions */}
                    {status === 'pending' && deliverStatus === 'pending' && (
                        <button
                            onClick={() => { setDeliverStatus('shipped'); setStatus('pending'); }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Package size={16} /> Mark as Shipped
                        </button>
                    )}
                    {deliverStatus === 'shipped' && (
                        <button
                            onClick={() => { setDeliverStatus('delivered'); setStatus('completed'); setPaymentStatus('paid'); }}
                            className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-dark transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            <CheckCircle size={16} /> Mark as Delivered
                        </button>
                    )}

                    <button
                        onClick={handleDownloadPDF}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-bold text-xs flex items-center gap-2 shadow-sm"
                    >
                        <Download size={16} /> DOWNLOAD PDF
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all font-bold text-xs flex items-center gap-2 shadow-sm"
                    >
                        <Printer size={16} /> PRINT INVOICE
                    </button>
                    <Link
                        to="/admin/orders"
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all font-bold text-xs flex items-center gap-2 shadow-sm"
                    >
                        <ArrowLeft size={16} /> BACK
                    </Link>
                </div>
            </div>

            {/* Prescription Review Alert */}
            {order.prescription_status === 'pending' && (
                <div className="print:hidden bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-red-700 font-bold text-lg">Prescription Review Required</h3>
                            <p className="text-red-600/80 text-sm font-medium">This order contains restricted medicine. You must review and approve the prescription before fulfillment.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button 
                            onClick={showPrescriptionImage}
                            className="px-4 py-2.5 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <FileText size={16} /> View Image
                        </button>
                        <button 
                            onClick={() => handlePrescriptionReview('approved')}
                            className="px-4 py-2.5 bg-primary-green text-white font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                            onClick={() => handlePrescriptionReview('rejected')}
                            className="px-4 py-2.5 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <XCircle size={16} /> Reject
                        </button>
                    </div>
                </div>
            )}

            {/* Main Edit Form */}
            <div className="print:hidden bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                    <CheckCircle size={18} className="text-primary-green" />
                    <h3 className="font-bold text-gray-700">Order Management</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Info Block */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</p>
                                    <p className="text-sm font-bold text-gray-800">{order.user?.name || 'Walk-in Customer'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                                    <p className="text-sm font-bold text-gray-800">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-lg font-black text-primary-green">Ks. {parseFloat(order.total_amount).toLocaleString()}</p>
                            </div>
                            {isOnline && (
                                <>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10} /> Delivery Address</p>
                                        <p className="text-xs font-medium text-gray-600">{order.delivery_address || 'No address provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone size={10} /> Contact Phone</p>
                                        <p className="text-xs font-bold text-gray-800">{order.contact_phone || 'N/A'}</p>
                                    </div>
                                </>
                            )}
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700">{order.payment_method || 'Cash'}</span>
                                    {order.payment_method === 'Online' && (
                                        <button 
                                            onClick={showPaymentSlip}
                                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black hover:bg-blue-100 transition-colors border border-blue-100 flex items-center gap-1"
                                        >
                                            <ImageIcon size={12} /> CHECK SLIP
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Display Prescription Status if it's already reviewed */}
                            {order.prescription_status && order.prescription_status !== 'pending' && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prescription Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded text-[11px] font-black text-white ${order.prescription_status === 'approved' ? 'bg-primary-green' : 'bg-red-500'}`}>
                                            {order.prescription_status.toUpperCase()}
                                        </span>
                                        <button 
                                            onClick={showPrescriptionImage}
                                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black hover:bg-gray-200 transition-colors border border-gray-200 flex items-center gap-1"
                                        >
                                            <FileText size={12} /> VIEW
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Selectors */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Status</label>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={order?.status === 'completed' || order?.status === 'cancelled'}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-green transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Delivery Status</label>
                                <select 
                                    value={deliverStatus} 
                                    onChange={(e) => setDeliverStatus(e.target.value)}
                                    disabled={order?.status === 'completed' || order?.status === 'cancelled'}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-green transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="returned">Returned</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Status</label>
                                <select 
                                    value={paymentStatus} 
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    disabled={order?.payment_status === 'refunded'}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-green transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    {/* If order is completed/cancelled, hide 'pending' option */}
                                    {(order?.status !== 'completed' && order?.status !== 'cancelled') && (
                                        <option value="pending">Unpaid / Pending</option>
                                    )}
                                    <option value="paid">Paid</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            {/* Refund Reason - Shows only if status is refunded */}
                            {(paymentStatus === 'refunded' || order?.payment_status === 'refunded') && (
                                <div className="sm:col-span-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Refund Reason / Notes</label>
                                    <textarea 
                                        value={refundReason}
                                        onChange={(e) => setRefundReason(e.target.value)}
                                        placeholder="Enter reason for refund..."
                                        disabled={order?.payment_status === 'refunded'}
                                        className="w-full bg-white border border-red-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 transition-colors min-h-[80px] disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                            )}

                            <div className="sm:col-span-3 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || order?.payment_status === 'refunded'}
                                    className="w-full py-3 bg-primary-green text-white rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-400"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <><Save size={18} /> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items Table */}
            <div className="print:hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                        <ShoppingCart size={18} className="text-gray-600" />
                        <h3 className="font-bold text-gray-700">Purchased Items</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3 text-center">Qty</th>
                                    <th className="px-6 py-3 text-right">Unit Price</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-600">
                                {order.order_products?.map((item) => {
                                    const price = parseFloat(item.price);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
                                                        {item.product?.pictures?.[0] ? (
                                                            <img
                                                                src={getStorageUrl(item.product.pictures[0].image_path)}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : <Package size={18} className="text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-800">{item.product?.name}</span>
                                                        {!!item.is_gift && <span className="ml-2 px-1.5 py-0.5 bg-red-50 text-red-500 rounded text-[9px] font-black border border-red-100 uppercase">Gift</span>}
                                                        {item.product?.requires_prescription == 1 && <span className="ml-2 px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black border border-purple-100 uppercase">Rx</span>}
                                                        
                                                        {/* Batch Info */}
                                                        {item.batches && item.batches.length > 0 && (
                                                            <div className="mt-1 space-y-0.5">
                                                                {item.batches.map(batch => (
                                                                    <div key={batch.id} className="text-[10px] text-gray-500 flex items-center gap-2">
                                                                        <span className="bg-gray-100 px-1 rounded font-medium">Batch: {batch.product_movement?.batch_number || 'N/A'}</span>
                                                                        <span className="text-red-400 font-medium">Exp: {batch.product_movement?.expired_date}</span>
                                                                        <span className="bg-blue-50 text-blue-600 px-1 rounded font-bold">Qty: {batch.quantity}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-gray-700">{price.toLocaleString()} Ks</span>
                                                    {parseFloat(item.original_price) > price && (
                                                        <span className="text-[10px] text-gray-400 line-through">
                                                            {parseFloat(item.original_price).toLocaleString()} Ks
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-gray-900">
                                                {(price * item.quantity).toLocaleString()} Ks
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            {/* Calculate true subtotal from original prices if available */}
                            {(() => {
                                const subtotal = order.order_products?.reduce((acc, item) => {
                                    return acc + (parseFloat(item.original_price || item.price) * item.quantity);
                                }, 0);
                                return (
                                    <>
                                        <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span>{subtotal.toLocaleString()} Ks</span>
                                        </div>
                                        {parseFloat(order.discount_amount) > 0 && (
                                            <div className="flex justify-between text-xs text-red-500 font-bold uppercase tracking-widest">
                                                <span>Total Discount</span>
                                                <span>-{parseFloat(order.discount_amount).toLocaleString()} Ks</span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                            <div className="flex justify-between text-lg font-black text-gray-800 pt-2 border-t border-gray-200">
                                <span>Total Pay</span>
                                <span className="text-primary-green">{parseFloat(order.total_amount).toLocaleString()} Ks</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Additional Info / Internal Notes Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-3 border-gray-100 mb-4 flex items-center gap-2">
                             <Package size={18} className="text-gray-400" /> Logistics Detail
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Type</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${order.order_type === 'walk-in' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {order.order_type}
                                </span>
                            </div>
                            {order.cashier && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processed By</span>
                                    <span className="text-xs font-bold text-gray-700">{order.cashier.name}</span>
                                </div>
                            )}
                            {order.receipt_number && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt #</span>
                                    <span className="text-xs font-bold text-gray-700">{order.receipt_number}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-green to-primary-dark rounded-xl shadow-lg p-6 text-white text-center">
                         <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                             <CreditCard size={24} />
                         </div>
                         <h4 className="font-bold mb-2">Need Help?</h4>
                         <p className="text-xs text-white/80 leading-relaxed mb-4">If you find issues with payment slips, contact the customer directly at {order.contact_phone || 'the registered number'}.</p>
                         <button className="w-full bg-white text-primary-green py-2 rounded-lg font-black text-xs hover:bg-gray-100 transition-colors">CONTACT SUPPORT</button>
                    </div>
                </div>
            </div>

            {/* --- Printable Receipt Area (Advanced Invoice Template) --- */}
            <div className="hidden print:block w-full max-w-[210mm] mx-auto text-black bg-white p-12">
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-8 mb-8">
                    <div className="space-y-2">
                        {settings?.site_logo && (
                            <img 
                                src={getStorageUrl(settings.site_logo)} 
                                alt="Logo" 
                                className="h-16 grayscale brightness-0" 
                            />
                        )}
                        <h1 className="text-3xl font-black uppercase tracking-tighter">{settings?.site_name}</h1>
                        <p className="text-sm font-medium text-gray-600 max-w-xs">
                            Your Trusted Healthcare Partner.<br />
                            Serving the community with excellence.
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <h2 className="text-4xl font-black text-gray-200 uppercase mb-4 tracking-widest">INVOICE</h2>
                        <p className="text-sm font-black">ORDER ID: #{order.receipt_number || order.id}</p>
                        <p className="text-sm font-medium text-gray-500">DATE: {new Date(order.created_at).toLocaleString()}</p>
                        <p className="text-sm font-medium text-gray-500 uppercase">STATUS: {order.status}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Billed To</h3>
                        <p className="font-black text-lg">{order.user?.name || 'Walk-in Customer'}</p>
                        <p className="text-sm text-gray-600 font-medium">{order.contact_phone || 'No phone provided'}</p>
                        <p className="text-sm text-gray-600 font-medium max-w-xs">{order.delivery_address || 'Over-the-counter'}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1 text-right">Payment Info</h3>
                        <p className="font-black text-lg uppercase">{order.payment_method || 'Cash'}</p>
                        <p className="text-sm text-gray-600 font-medium italic">Payment Status: {order.payment_status}</p>
                    </div>
                </div>

                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-y-2 border-gray-900">
                            <th className="py-4 text-left text-xs font-black uppercase tracking-widest">Description</th>
                            <th className="py-4 text-center text-xs font-black uppercase tracking-widest">Qty</th>
                            <th className="py-4 text-right text-xs font-black uppercase tracking-widest">Unit Price</th>
                            <th className="py-4 text-right text-xs font-black uppercase tracking-widest">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.order_products?.map((op, i) => (
                            <tr key={i}>
                                <td className="py-5">
                                    <p className="font-black text-gray-900">{op.product?.name}</p>
                                    {!!op.is_gift && <p className="text-[10px] font-black text-red-500 uppercase italic">Promotional Gift</p>}
                                </td>
                                <td className="py-5 text-center font-bold">{op.quantity}</td>
                                <td className="py-5 text-right font-medium">{parseFloat(op.price).toLocaleString()} Ks</td>
                                <td className="py-5 text-right font-black">{(parseFloat(op.price) * op.quantity).toLocaleString()} Ks</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end border-t-2 border-gray-900 pt-8">
                    <div className="w-full max-w-xs space-y-3">
                        <div className="flex justify-between text-sm font-medium text-gray-500">
                            <span>SUBTOTAL</span>
                            <span>{(parseFloat(order.total_amount) + parseFloat(order.discount_amount || 0)).toLocaleString()} Ks</span>
                        </div>
                        {parseFloat(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-sm font-black text-red-500">
                                <span>TOTAL DISCOUNT</span>
                                <span>-{parseFloat(order.discount_amount).toLocaleString()} Ks</span>
                            </div>
                        )}
                        <div className="flex justify-between text-2xl font-black text-gray-900 border-t border-gray-100 pt-3">
                            <span>TOTAL</span>
                            <span>{parseFloat(order.total_amount).toLocaleString()} Ks</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-gray-100 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Thank you for choosing {settings?.site_name}</p>
                    <p className="text-[10px] text-gray-400 font-medium italic">This is a system-generated invoice and does not require a physical signature.</p>
                </div>
            </div>
        </div>
    </React.Fragment>;
};

export default AdminOrderDetail;
