import React, { useState, useEffect, useRef } from 'react';
import api, { getStorageUrl } from '../../utils/api';
import { 
    FileText, 
    Check, 
    X, 
    AlertTriangle, 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    RotateCcw, 
    RefreshCw, 
    Eye,
    User,
    Calendar,
    Phone,
    Clock,
    Pill
} from 'lucide-react';
import Swal from 'sweetalert2';
import echo from '../../utils/echo';

const AdminPrescriptionQueue = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    
    // Interactive viewer states
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);

    useEffect(() => {
        fetchPendingPrescriptions();

        // Real-time listener for updates
        const channel = echo.channel('admin-alerts')
            .listen('.new-order', () => {
                fetchPendingPrescriptions();
            })
            .listen('.order-status-updated', () => {
                fetchPendingPrescriptions();
            });

        return () => {
            echo.leaveChannel('admin-alerts');
        };
    }, []);

    const fetchPendingPrescriptions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/orders', {
                params: {
                    prescription_status: 'pending',
                    per_page: 50 // Get all pending up to 50 for the queue
                }
            });
            setOrders(response.data.data || []);
            
            // If the selected order is no longer pending or is removed, clear details
            if (selectedOrder) {
                const updatedSelected = (response.data.data || []).find(o => o.id === selectedOrder.id);
                if (!updatedSelected) {
                    setSelectedOrder(null);
                } else {
                    setSelectedOrder(updatedSelected);
                }
            }
        } catch (error) {
            console.error("Error fetching pending prescriptions:", error);
            Swal.fire('Error', 'Failed to fetch pending prescriptions.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrescriptionReview = async (orderId, status) => {
        try {
            const confirmText = status === 'approved' 
                ? 'Approve this prescription and allow fulfillment of the order?' 
                : 'Reject this prescription? This will automatically cancel all restricted items from this order and return their quantities to stock.';
                
            const result = await Swal.fire({
                title: status === 'approved' ? 'Approve Prescription' : 'Reject Prescription',
                text: confirmText,
                icon: status === 'approved' ? 'question' : 'warning',
                showCancelButton: true,
                confirmButtonColor: status === 'approved' ? '#10b981' : '#ef4444',
                confirmButtonText: `Yes, ${status} it!`
            });

            if (result.isConfirmed) {
                const response = await api.patch(`/admin/orders/${orderId}/prescription`, {
                    prescription_status: status
                });
                
                Swal.fire({
                    icon: 'success',
                    title: `Prescription ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                    text: response.data.message || 'Prescription status updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

                setIsViewerOpen(false);
                fetchPendingPrescriptions();
            }
        } catch (error) {
            console.error("Error updating prescription status:", error);
            Swal.fire('Error', 'Failed to update prescription status.', 'error');
        }
    };

    // Zoom and Pan actions
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handleRotateRight = () => setRotate(prev => (prev + 90) % 360);
    const handleRotateLeft = () => setRotate(prev => (prev - 90) % 360);
    const handleReset = () => {
        setScale(1);
        setRotate(0);
        setPosition({ x: 0, y: 0 });
    };

    // Drag handlers for pan behavior
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const openViewer = (order) => {
        setSelectedOrder(order);
        handleReset();
        setIsViewerOpen(true);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-primary-green p-2 rounded text-white shadow-md">
                    <FileText size={22} className="stroke-2" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Digital Prescription Queue</h2>
                    <p className="text-sm text-gray-500">Review restricted medical prescription documents for pending online orders.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            Awaiting Review
                            <span className="bg-red-100 text-red-600 font-extrabold text-xs px-2.5 py-1 rounded-full">
                                {orders.length}
                            </span>
                        </h3>
                    </div>

                    <div className="flex-grow overflow-x-auto">
                        {loading && orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-green"></div>
                                <span className="text-sm text-gray-400 font-medium">Loading queue items...</span>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                                <div className="bg-gray-50 p-4 rounded-full text-gray-300">
                                    <Check size={40} className="stroke-[1.5]" />
                                </div>
                                <h4 className="font-bold text-gray-700">All Caught Up!</h4>
                                <p className="text-sm text-center max-w-xs">There are no pending prescription reviews at this time.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase text-[10px] tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Prescription Products</th>
                                        <th className="px-6 py-4">Uploaded Date</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                                    {orders.map((order) => {
                                        const prescriptionItems = order.orderProducts?.filter(
                                            item => item.product?.requires_prescription
                                        ) || [];

                                        return (
                                            <tr 
                                                key={order.id} 
                                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                                    selectedOrder?.id === order.id ? 'bg-primary-light/30' : ''
                                                }`}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <td className="px-6 py-4 font-bold text-primary-green">
                                                    #VC-{String(order.id).padStart(4, '0')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                                                            {order.user?.name ? order.user.name[0].toUpperCase() : 'U'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800">{order.user?.name || 'Walk-in Customer'}</span>
                                                            <span className="text-[10px] text-gray-400">{order.contact_phone}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col max-w-[200px] truncate">
                                                        <span className="text-xs bg-red-50 text-red-600 border border-red-100 rounded px-2 py-0.5 w-fit font-bold">
                                                            {prescriptionItems.length} restricted item{prescriptionItems.length > 1 ? 's' : ''}
                                                        </span>
                                                        <span className="text-gray-400 text-xs mt-1 truncate">
                                                            {prescriptionItems.map(i => i.product?.name).join(', ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                        <span className="text-[10px] opacity-60">
                                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => openViewer(order)}
                                                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Inspect Prescription Document"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePrescriptionReview(order.id, 'approved')}
                                                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                            title="Approve Prescription"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePrescriptionReview(order.id, 'rejected')}
                                                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Reject Prescription"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Details Side Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between min-h-[500px]">
                    {selectedOrder ? (
                        <div className="space-y-6 flex-grow flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Order Details</h3>
                                        <p className="text-xs text-gray-400">Order #VC-{String(selectedOrder.id).padStart(4, '0')}</p>
                                    </div>
                                    <span className="text-xs bg-[#FFB822] text-white px-2.5 py-1 rounded font-black uppercase">
                                        {selectedOrder.status}
                                    </span>
                                </div>

                                {/* Patient Info */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Customer Details</h4>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User size={14} className="text-gray-400" />
                                            <span className="font-bold">{selectedOrder.user?.name || 'Walk-in'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>{selectedOrder.contact_phone || 'No Phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>Ordered on {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Medicine List */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Prescribed Medicine Checklist</h4>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                        {selectedOrder.orderProducts?.map((item) => (
                                            <div 
                                                key={item.id} 
                                                className={`flex items-start justify-between p-2.5 rounded-lg border text-xs ${
                                                    item.product?.requires_prescription 
                                                        ? 'border-red-100 bg-red-50/30' 
                                                        : 'border-gray-100 bg-gray-50/20'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className={`mt-0.5 p-1 rounded ${
                                                        item.product?.requires_prescription ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        <Pill size={12} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800">{item.product?.name}</span>
                                                        <span className="text-gray-400 text-[10px]">Qty: {item.quantity} × {item.price} Ks</span>
                                                    </div>
                                                </div>
                                                {item.product?.requires_prescription && (
                                                    <span className="text-[9px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
                                                        RX Needed
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Attachment Info */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 font-bold">Document Attachment</h4>
                                    {selectedOrder.prescription_image ? (
                                        <div 
                                            onClick={() => openViewer(selectedOrder)}
                                            className="relative rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-primary-green group transition-all h-24 flex items-center justify-center bg-gray-50 shadow-sm"
                                        >
                                            <img 
                                                src={getStorageUrl(selectedOrder.prescription_image)} 
                                                alt="Prescription Thumbnail" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                                                <Eye size={14} /> Click to Inspect
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400 flex flex-col items-center gap-1">
                                            <AlertTriangle size={16} className="text-yellow-500" />
                                            <span>No prescription image uploaded.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Direct Reviews Buttons */}
                            <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <button 
                                    onClick={() => handlePrescriptionReview(selectedOrder.id, 'rejected')}
                                    className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Reject
                                </button>
                                <button 
                                    onClick={() => handlePrescriptionReview(selectedOrder.id, 'approved')}
                                    className="flex-1 py-2.5 bg-primary-green text-white hover:bg-primary-dark font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Check size={16} /> Approve
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 py-20">
                            <div className="bg-gray-50 p-4 rounded-full text-gray-300">
                                <Eye size={32} className="stroke-[1.5]" />
                            </div>
                            <h4 className="font-bold text-gray-700">No Order Selected</h4>
                            <p className="text-xs text-center max-w-xs">Select an order from the list on the left to inspect customer details and order items.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Interactive Image Viewer Modal */}
            {isViewerOpen && selectedOrder && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-between select-none animate-in fade-in"
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {/* Top Bar */}
                    <div className="bg-slate-900/90 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">Reviewing Prescription</span>
                            <span className="text-xs text-slate-400">Order #VC-{String(selectedOrder.id).padStart(4, '0')} — {selectedOrder.user?.name}</span>
                        </div>
                        <button 
                            onClick={() => setIsViewerOpen(false)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Canvas Area */}
                    <div 
                        className="flex-grow flex items-center justify-center overflow-hidden relative"
                        style={{ height: 'calc(100vh - 140px)' }}
                    >
                        <div 
                            className={`relative transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            onMouseDown={handleMouseDown}
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px)`,
                            }}
                        >
                            <img 
                                ref={imageRef}
                                src={getStorageUrl(selectedOrder.prescription_image)} 
                                alt="Prescription Full Document" 
                                className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                                style={{
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.1, 0.76, 0.55, 0.94)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Bottom Toolbar & Action Bar */}
                    <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Interactive Viewer Toolbar */}
                        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <button 
                                onClick={handleZoomOut}
                                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-xs font-bold text-slate-400 px-2 min-w-[50px] text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            <button 
                                onClick={handleZoomIn}
                                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <div className="w-px h-5 bg-slate-700 mx-1"></div>
                            <button 
                                onClick={handleRotateLeft}
                                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                                title="Rotate Counter-Clockwise"
                            >
                                <RotateCcw size={16} />
                            </button>
                            <button 
                                onClick={handleRotateRight}
                                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                                title="Rotate Clockwise"
                            >
                                <RotateCw size={16} />
                            </button>
                            <div className="w-px h-5 bg-slate-700 mx-1"></div>
                            <button 
                                onClick={handleReset}
                                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                                title="Reset View"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        {/* Review Decisions Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => handlePrescriptionReview(selectedOrder.id, 'rejected')}
                                className="flex-1 md:flex-none px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/10"
                            >
                                <X size={16} /> Reject Prescription
                            </button>
                            <button 
                                onClick={() => handlePrescriptionReview(selectedOrder.id, 'approved')}
                                className="flex-1 md:flex-none px-6 py-2.5 bg-primary-green hover:bg-primary-dark text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                            >
                                <Check size={16} /> Approve & Allow Fulfillment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPrescriptionQueue;
