import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, CreditCard, Banknote, QrCode, Printer, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

// Barcode Scanner Hook
const useBarcodeScanner = (onScan) => {
    const buffer = useRef('');
    const lastKeyTime = useRef(Date.now());

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            const currentTime = Date.now();
            if (currentTime - lastKeyTime.current > 50) {
                buffer.current = '';
            }

            if (e.key === 'Enter' && buffer.current.length > 2) {
                onScan(buffer.current);
                buffer.current = '';
                e.preventDefault();
            } else if (e.key !== 'Enter' && e.key.length === 1) {
                buffer.current += e.key;
            }
            lastKeyTime.current = currentTime;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
};

const AdminPOS = () => {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [receivedAmount, setReceivedAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useBarcodeScanner((barcode) => {
        searchAndAddProduct(barcode);
    });

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            fetchSearchResults(searchQuery);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchSearchResults = async (query) => {
        setIsSearching(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/admin/pos/search?q=${query}`, getConfig());
            setSearchResults(res.data);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const searchAndAddProduct = async (query) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/admin/pos/search?q=${query}`, getConfig());
            if (res.data.length === 1) {
                addToCart(res.data[0]);
                setSearchQuery('');
            } else if (res.data.length > 1) {
                setSearchResults(res.data);
            } else {
                Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Product not found', showConfirmButton: false, timer: 2000 });
            }
        } catch (err) {
            console.error("Error finding product:", err);
        }
    };

    const getProductPrice = (product) => {
        let price = parseFloat(product.price);
        const activePromo = product.promotions?.find(p => p.is_active);
        if (activePromo) {
            if (activePromo.type === 'percentage') {
                price = price - (price * (parseFloat(activePromo.discount_value) / 100));
            } else {
                price = price - parseFloat(activePromo.discount_value);
            }
        }
        return Math.max(0, price);
    };

    const addToCart = (product) => {
        const stock = product.current_stock || 0;
        const existingInCart = cart.find(item => item.product_id === product.id);
        const currentCartQty = existingInCart ? existingInCart.quantity : 0;

        if (stock <= 0) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `${product.name} is out of stock!`, showConfirmButton: false, timer: 2500 });
            return;
        }

        if (currentCartQty >= stock) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: `Only ${stock} unit(s) available for ${product.name}`, showConfirmButton: false, timer: 2500 });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            const price = getProductPrice(product);
            if (existing) {
                const newQty = existing.quantity + 1;
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: newQty, subtotal: newQty * price }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                original_price: parseFloat(product.price),
                price: price,
                quantity: 1,
                subtotal: price,
                stock: stock,
                promo: product.promotions?.find(p => p.is_active)
            }];
        });
        setSearchResults([]);
        setSearchQuery('');
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.product_id === id) {
                const maxStock = item.stock || 9999;
                const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
                if (item.quantity + delta > maxStock) {
                    Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: `Only ${maxStock} in stock`, showConfirmButton: false, timer: 2000 });
                }
                return { ...item, quantity: newQty, subtotal: newQty * item.price };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.product_id !== id));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, item) => sum + (item.original_price * item.quantity), 0);
    const totalDiscount = cart.reduce((sum, item) => sum + ((item.original_price - item.price) * item.quantity), 0);
    const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const changeReturn = paymentMethod === 'cash' && receivedAmount ? parseFloat(receivedAmount) - grandTotal : 0;

    const handleCheckout = async () => {
        if (paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < grandTotal)) {
            return Swal.fire('Error', 'Received amount must be greater or equal to grand total.', 'error');
        }

        setIsProcessing(true);
        try {
            const payload = {
                items: cart,
                payment_method: paymentMethod,
                total_order_amount: grandTotal,
                discount_amount: totalDiscount,
                tax_amount: 0,
                received_amount: paymentMethod === 'cash' ? parseFloat(receivedAmount) : grandTotal,
                change_return: Math.max(0, changeReturn)
            };

            const res = await axios.post('http://127.0.0.1:8000/api/admin/pos/checkout', payload, getConfig());

            Swal.fire({ title: 'Payment Successful!', text: `Receipt: ${res.data.order.receipt_number}`, icon: 'success', timer: 1500, showConfirmButton: false });

            setLastOrder(res.data.order);
            setCart([]);
            setShowCheckout(false);
            setReceivedAmount('');

            setTimeout(() => {
                window.print();
            }, 800);

        } catch (error) {
            const errData = error.response?.data;
            if (errData?.stock_errors) {
                Swal.fire({ title: 'Insufficient Stock', html: errData.stock_errors.map(e => `<p class="text-sm text-left mb-1">• ${e}</p>`).join(''), icon: 'warning' });
            } else {
                Swal.fire('Error', errData?.message || 'Checkout failed. Please try again.', 'error');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] font-sans print:h-auto">
            {/* Main POS Interface (Hidden on Print) */}
            <div className="flex gap-4 p-4 h-full print:hidden">
                {/* Left Panel: Products & Search */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Scan Barcode or Search Products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8DB600] outline-none text-gray-700 shadow-sm transition-all"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery) {
                                        searchAndAddProduct(searchQuery);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {searchResults.map(product => {
                                    const finalPrice = getProductPrice(product);
                                    const hasDiscount = finalPrice < product.price;
                                    const stock = product.current_stock || 0;
                                    const isOutOfStock = stock <= 0;

                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            disabled={isOutOfStock}
                                            className={`bg-white p-4 rounded-xl shadow-sm border transition-all text-left flex flex-col group relative overflow-hidden ${isOutOfStock ? 'border-red-100 opacity-60 cursor-not-allowed' : 'border-gray-100 hover:border-[#8DB600] hover:shadow-md'
                                                }`}
                                        >
                                            {hasDiscount && !isOutOfStock && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Sale</div>}
                                            {isOutOfStock && <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1"><AlertTriangle size={10} /> Out</div>}
                                            <p className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</p>
                                            <p className="text-[11px] text-gray-400 mb-1">{product.category?.name}</p>
                                            <p className={`text-[10px] font-bold mb-2 ${stock <= 5 && stock > 0 ? 'text-orange-500' : stock > 5 ? 'text-green-600' : 'text-red-500'}`}>Stock: {stock}</p>
                                            <div className="mt-auto">
                                                <span className="font-bold text-[#8DB600]">{finalPrice.toLocaleString()} Ks</span>
                                                {hasDiscount && <span className="ml-2 text-xs line-through text-gray-400">{parseFloat(product.price).toLocaleString()}</span>}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                                <Search size={48} className="opacity-20" />
                                <p className="font-medium text-sm">Scan barcode or type to search products</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Cart */}
                <div className="w-[400px] bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingCart size={18} className="text-[#8DB600]" />
                            Current Order
                        </h2>
                        {cart.length > 0 && (
                            <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-colors">
                                <Trash2 size={14} /> Clear
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">Cart is empty</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product_id} className="flex flex-col p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-sm text-gray-800 flex-1">{item.name}</p>
                                        <p className="font-bold text-sm text-gray-800 ml-2">{(item.original_price * item.quantity).toLocaleString()} Ks</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(item.product_id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"><Minus size={14} /></button>
                                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product_id, 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"><Plus size={14} /></button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.original_price > item.price && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold border border-red-100">Discounted</span>}
                                            <button onClick={() => removeFromCart(item.product_id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>{subtotal.toLocaleString()} Ks</span>
                            </div>
                            {totalDiscount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-{totalDiscount.toLocaleString()} Ks</span></div>}
                            <div className="flex justify-between font-black text-xl text-gray-800 mt-2 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span className="text-[#8DB600]">{grandTotal.toLocaleString()} Ks</span>
                            </div>
                        </div>
                        <button
                            disabled={cart.length === 0}
                            onClick={() => setShowCheckout(true)}
                            className="w-full py-4 bg-[#8DB600] text-white rounded-xl font-bold text-lg hover:bg-[#7a9e00] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#8DB600]/20"
                        >
                            Checkout ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Checkout Modal --- */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-gray-800">Process Payment</h2>
                            <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <p className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Payment Method</p>
                                <button onClick={() => setPaymentMethod('cash')} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-[#8DB600] bg-[#8DB600]/5 text-[#8DB600]' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}><Banknote size={24} /> <span className="font-bold">Cash</span></button>
                                <button onClick={() => setPaymentMethod('qr')} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'qr' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}><QrCode size={24} /> <span className="font-bold">Static QR Scan</span></button>
                                <button onClick={() => setPaymentMethod('card')} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}><CreditCard size={24} /> <span className="font-bold">Card Reader</span></button>
                            </div>
                            <div className="flex flex-col">
                                <div className="bg-gray-50 rounded-xl p-5 mb-4 text-center border border-gray-100">
                                    <p className="text-gray-500 font-bold mb-1">Amount Due</p>
                                    <p className="text-3xl font-black text-gray-800">{grandTotal.toLocaleString()} Ks</p>
                                </div>
                                {paymentMethod === 'cash' && (
                                    <div className="mb-4 space-y-2">
                                        <label className="text-sm font-bold text-gray-600">Amount Received (Ks)</label>
                                        <input type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8DB600] outline-none text-lg font-bold text-gray-800" placeholder="Enter amount..." autoFocus />
                                        {receivedAmount && parseFloat(receivedAmount) >= grandTotal && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Change Return</p>
                                                <p className="text-2xl font-black text-green-700">{changeReturn.toLocaleString()} Ks</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button onClick={handleCheckout} disabled={isProcessing || (paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < grandTotal))} className="mt-auto w-full py-4 bg-[#8DB600] text-white rounded-xl font-bold text-lg hover:bg-[#7a9e00] transition-all disabled:opacity-50">
                                    {isProcessing ? 'Processing...' : `Confirm & Print Receipt`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Printable Receipt Area (Only visible when printing) --- */}
            <div className="hidden print:block fixed top-0 left-0 w-[80mm] text-black bg-white p-4 z-[9999] text-sm h-auto overflow-visible">
                {lastOrder && (
                    <div className="text-center">
                        <h2 className="font-bold text-xl mb-1">Vital Care Pharmacy</h2>
                        <p className="text-xs text-gray-600 mb-4">Receipt #{lastOrder.receipt_number}<br />{new Date(lastOrder.created_at).toLocaleString()}</p>
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
                                    {lastOrder.order_products?.map((op, i) => (
                                        <tr key={i}>
                                            <td className="py-1 pr-2">{op.product?.name}</td>
                                            <td className="text-right py-1">{op.quantity}</td>
                                            <td className="text-right py-1">{(parseFloat(op.original_price || op.price) * op.quantity).toLocaleString()} Ks</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-right text-xs space-y-1 mb-4">
                            <p>Subtotal: {(parseFloat(lastOrder.total_amount) + parseFloat(lastOrder.discount_amount || 0)).toLocaleString()} Ks</p>
                            {parseFloat(lastOrder.discount_amount) > 0 && <p>Discount: -{parseFloat(lastOrder.discount_amount).toLocaleString()} Ks</p>}
                            <p className="font-bold text-sm mt-1">Total: {parseFloat(lastOrder.total_amount).toLocaleString()} Ks</p>
                            <p className="mt-2 font-medium">Paid: {parseFloat(lastOrder.received_amount || lastOrder.total_amount).toLocaleString()} Ks</p>
                            <p>Change: {parseFloat(lastOrder.change_return || 0).toLocaleString()} Ks</p>
                        </div>
                        <p className="text-xs font-bold mt-6 mb-1 text-center">Thank you for your purchase!</p>
                        <p className="text-[10px] text-center text-gray-500">Please keep receipt for returns/exchanges.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPOS;
