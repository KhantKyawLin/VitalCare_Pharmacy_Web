import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const Checkout = () => {
    const { cartItems, cartTotal, refreshCart } = useContext(CartContext);
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'online'
    const [paymentProof, setPaymentProof] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/login?redirect=/checkout');
        } else if (!cartItems || cartItems.length === 0) {
            navigate('/cart');
        }
        if (user) {
            setDeliveryAddress(user.address || 'Yangon'); // Defaulting to Yangon to match screenshot
            setContactPhone(user.phone || '');
        }
    }, [token, cartItems, navigate, user]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handlePlaceOrder = async () => {
        if (!deliveryAddress.trim()) {
            Swal.fire('Error', 'Please provide a delivery address.', 'warning');
            return;
        }
        if (!contactPhone.trim()) {
            Swal.fire('Error', 'Please provide a contact phone number.', 'warning');
            return;
        }
        if (paymentMethod === 'online' && !paymentProof) {
            Swal.fire('Error', 'Please upload a payment screenshot for online payment.', 'warning');
            return;
        }

        setIsPlacingOrder(true);
        try {
            const formData = new FormData();
            formData.append('delivery_address', deliveryAddress);
            formData.append('contact_phone', contactPhone);
            formData.append('payment_method', paymentMethod === 'online' ? 'Online' : 'Cash');
            if (paymentMethod === 'online' && paymentProof) {
                formData.append('payment_proof', paymentProof);
            }

            const response = await axios.post('http://localhost:8000/api/auth/checkout', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.message === 'Order placed successfully') {
                await refreshCart();
                // Redirect to Order History in User Dashboard
                navigate('/profile/orders', { state: { orderPlaced: true, order: response.data.order } });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Please try again later.';
            const stockErrors = error.response?.data?.stock_errors?.join('\n');
            Swal.fire('Checkout Failed', stockErrors ? `${errorMsg}\n${stockErrors}` : errorMsg, 'error');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (!cartItems || cartItems.length === 0) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold text-primary-green mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Order Summary */}
                <div className="lg:w-1/2">
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                        <div className="bg-slate-500 text-white px-4 py-3 font-bold">
                            Order Summary
                        </div>
                        <div className="p-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-100 text-left">
                                        <th className="pb-2 font-medium">Product</th>
                                        <th className="pb-2 font-medium text-center">Qty</th>
                                        <th className="pb-2 font-medium text-right">Price</th>
                                        <th className="pb-2 font-medium text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item, index) => {
                                        const product = item.product;
                                        const price = parseFloat(product.price || 0);
                                        const subtotal = price * item.quantity;
                                        const imageUrl = product.pictures?.length > 0 
                                            ? `http://127.0.0.1:8000/storage/${product.pictures[0].image_path}` 
                                            : "https://placehold.co/40x40/f8fafc/8DB600?text=P";

                                        return (
                                            <tr key={index} className="border-b border-gray-50">
                                                <td className="py-3 flex items-center gap-3">
                                                    <div className="w-10 h-10 border border-gray-200 p-0.5 rounded bg-white shrink-0">
                                                        <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <span className="text-gray-800">{product.name}</span>
                                                </td>
                                                <td className="py-3 text-center text-gray-800">{item.quantity}</td>
                                                <td className="py-3 text-right text-gray-800">Ks. {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="py-3 text-right text-gray-800">Ks. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                <span className="font-bold text-gray-800 text-base ml-auto mr-12">Total Amount:</span>
                                <span className="font-bold text-primary-green text-lg">Ks. {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Delivery & Payment */}
                <div className="lg:w-1/2">
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                        <div className="bg-slate-500 text-white px-4 py-3 font-bold">
                            Delivery & Payment
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Delivery Address */}
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Delivery Address</label>
                                <textarea
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    rows="3"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-green"
                                ></textarea>
                            </div>

                            {/* Contact Phone */}
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-green"
                                />
                                <p className="text-xs text-gray-500 mt-1">Your registered phone number. Update in profile if needed.</p>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">Payment Method</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cash' ? 'border-primary-green' : 'border-gray-300'}`}>
                                            {paymentMethod === 'cash' && <div className="w-2 h-2 bg-primary-green rounded-full"></div>}
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="cash" 
                                            checked={paymentMethod === 'cash'} 
                                            onChange={() => setPaymentMethod('cash')} 
                                            className="hidden" 
                                        />
                                        <span className={`text-sm ${paymentMethod === 'cash' ? 'text-primary-green' : 'text-gray-600'}`}>Cash on Delivery</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary-green' : 'border-gray-300'}`}>
                                            {paymentMethod === 'online' && <div className="w-2 h-2 bg-primary-green rounded-full"></div>}
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="online" 
                                            checked={paymentMethod === 'online'} 
                                            onChange={() => setPaymentMethod('online')} 
                                            className="hidden" 
                                        />
                                        <span className={`text-sm ${paymentMethod === 'online' ? 'text-primary-green' : 'text-gray-600'}`}>Online Payment (Bank Transfer / Mobile Pay)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Instructions (Conditional) */}
                            {paymentMethod === 'online' && (
                                <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm mt-3 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="font-bold text-gray-800 mb-2">Payment Instructions:</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                                        <li>Bank Name: KBZ, AYA, CB</li>
                                        <li>Account Number: 8234 4993 1433 6543</li>
                                        <li>Mobile Pay Number: 09-245678649</li>
                                    </ul>
                                    
                                    <label className="block text-gray-700 mb-1 font-medium">Upload Payment Screenshot</label>
                                    <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                                        <label className="bg-gray-50 border-r border-gray-300 px-3 py-1.5 cursor-pointer hover:bg-gray-100 text-gray-700 font-medium">
                                            Choose File
                                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                        <span className="px-3 text-gray-500 flex-1 truncate">
                                            {paymentProof ? paymentProof.name : 'No file chosen'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Please upload a screenshot of your successful payment.</p>
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                                className="w-full bg-primary-green hover:bg-primary-dark text-white font-bold py-2.5 rounded shadow flex items-center justify-center gap-2 mt-4 transition-colors disabled:opacity-70"
                            >
                                {isPlacingOrder ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
