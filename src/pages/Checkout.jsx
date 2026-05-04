import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MapPin, CreditCard, CheckCircle2, ChevronRight, Package, Truck, Info } from 'lucide-react';

const Checkout = () => {
    const { cart, cartTotal, refreshCart } = useContext(CartContext);
    const { user, token, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [editAddress, setEditAddress] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');

    useEffect(() => {
        if (!token) {
            navigate('/login?redirect=/checkout');
        } else if (!cart || !cart.items || cart.items.length === 0) {
            navigate('/cart');
        }
        if (user) {
            setDeliveryAddress(user.address || '');
        }
    }, [token, cart, navigate, user]);

    const handleSaveAddress = async () => {
        try {
            const response = await axios.put('http://localhost:8000/api/auth/profile', {
                ...user,
                address: deliveryAddress
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.user) {
                setUser(response.data.user);
                setEditAddress(false);
                Swal.fire({ icon: 'success', title: 'Address Saved', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', 'Could not update address.', 'error');
        }
    };

    const handlePlaceOrder = async () => {
        if (!user?.address && !deliveryAddress) {
            Swal.fire('Delivery Address Required', 'Please provide a delivery address before placing your order.', 'warning');
            setEditAddress(true);
            return;
        }

        setIsPlacingOrder(true);
        try {
            // Note: Sending address_id: null for now as per current backend structure, 
            // the actual address is read from the user profile for delivery.
            const response = await axios.post('http://localhost:8000/api/auth/checkout', {
                address_id: null,
                payment_method: paymentMethod
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.message === 'Order placed successfully') {
                await refreshCart();
                Swal.fire({
                    icon: 'success',
                    title: 'Order Confirmed!',
                    text: 'Your order has been placed successfully. You can track it in your dashboard.',
                    confirmButtonColor: '#6CA52C',
                    confirmButtonText: 'View My Orders'
                }).then(() => {
                    navigate('/profile');
                });
            }
        } catch (error) {
            Swal.fire('Checkout Failed', error.response?.data?.message || 'Please try again later.', 'error');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (!cart || !cart.items || cart.items.length === 0) return null;

    return (
        <div className="bg-[#f4f6f9] min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
                    <Link to="/cart" className="hover:text-[#6CA52C] transition-colors">Cart</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-800 font-bold">Checkout</span>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-8">Secure Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:w-2/3 space-y-6">
                        
                        {/* 1. Delivery Address */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#6CA52C]/10 text-[#6CA52C] flex items-center justify-center font-bold">1</div>
                                <h2 className="text-xl font-bold text-slate-800">Delivery Address</h2>
                            </div>
                            <div className="p-6">
                                {!editAddress ? (
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="text-slate-400 mt-0.5 shrink-0" size={20} />
                                            <div>
                                                <p className="font-bold text-slate-800">{user?.name}</p>
                                                <p className="text-slate-600 mt-1 leading-relaxed">
                                                    {user?.address || <span className="text-amber-600 italic flex items-center gap-1"><Info size={14}/> No address provided</span>}
                                                </p>
                                                <p className="text-slate-500 mt-1">{user?.phone}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setEditAddress(true)} className="text-[#6CA52C] hover:text-[#5a8c24] font-bold text-sm bg-[#6CA52C]/10 px-4 py-2 rounded-lg transition-colors">
                                            {user?.address ? 'Change' : 'Add Address'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Street Address & City</label>
                                        <textarea 
                                            rows="3" 
                                            value={deliveryAddress} 
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Enter your full delivery address..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] outline-none transition-all resize-none"
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={() => { setEditAddress(false); setDeliveryAddress(user?.address || ''); }} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                                            <button onClick={handleSaveAddress} disabled={!deliveryAddress.trim()} className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#6CA52C] hover:bg-[#5a8c24] disabled:opacity-50 shadow-md">Save Address</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#6CA52C]/10 text-[#6CA52C] flex items-center justify-center font-bold">2</div>
                                <h2 className="text-xl font-bold text-slate-800">Payment Method</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#6CA52C] bg-[#6CA52C]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Cash on Delivery (COD)</p>
                                            <p className="text-sm text-slate-500 mt-0.5">Pay securely when your package arrives.</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#6CA52C]' : 'border-slate-300'}`}>
                                        {paymentMethod === 'cod' && <div className="w-3 h-3 bg-[#6CA52C] rounded-full"></div>}
                                    </div>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                                </label>

                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all opacity-60 ${paymentMethod === 'card' ? 'border-[#6CA52C] bg-[#6CA52C]/5' : 'border-slate-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Credit / Debit Card</p>
                                            <p className="text-sm text-blue-600 font-medium mt-0.5">Coming Soon</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" value="card" disabled className="hidden" />
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Package size={20} className="text-[#6CA52C]" /> Order Summary
                            </h2>

                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 divide-y divide-slate-100">
                                {cart.items.map(item => (
                                    <div key={item.id} className="pt-4 flex justify-between gap-4 first:pt-0">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm line-clamp-2">{item.product.name}</p>
                                            <p className="text-slate-500 text-xs mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-slate-800 text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-800">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping Estimate</span>
                                    <span className="font-bold text-[#6CA52C]">Free</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax</span>
                                    <span className="font-bold text-slate-800">$0.00</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
                                <span className="text-lg font-bold text-slate-800">Total</span>
                                <span className="text-3xl font-black text-[#6CA52C]">${cartTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || (!user?.address && !deliveryAddress)}
                                className="w-full mt-8 bg-[#6CA52C] text-white hover:bg-[#5a8c24] font-bold py-4 rounded-xl shadow-lg shadow-[#6CA52C]/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2 text-lg"
                            >
                                {isPlacingOrder ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Place Order <CheckCircle2 size={20} strokeWidth={3} /></>
                                )}
                            </button>
                            
                            <p className="text-xs text-center text-slate-500 mt-4 font-medium flex items-center justify-center gap-1">
                                <Shield size={14} className="text-emerald-500" /> Secure encrypted checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Quick mock for Shield icon if not imported above
import { Shield } from 'lucide-react';

export default Checkout;
