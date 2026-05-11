import React, { useState, useEffect, useRef } from 'react';
import api, { getStorageUrl } from '../../utils/api';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, CreditCard, Banknote, QrCode, Printer, AlertTriangle, Info, RefreshCw } from 'lucide-react';
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
    const [allPromotions, setAllPromotions] = useState([]);

    useBarcodeScanner((barcode) => {
        searchAndAddProduct(barcode);
    });

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await api.get('/admin/promotions');
                const promos = Array.isArray(res.data?.promotions) ? res.data.promotions : [];
                setAllPromotions(promos.filter(p => p.is_active));
            } catch (err) {
                console.error("Promo fetch error:", err);
                setAllPromotions([]);
            }
        };
        fetchPromos();
    }, []);

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
            const res = await api.get(`/admin/pos/search?q=${query}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const searchAndAddProduct = async (query) => {
        try {
            const res = await api.get(`/admin/pos/search?q=${query}`);
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

    const getProductPriceInfo = (product, quantity = 1) => {
        let originalPrice = parseFloat(product.price || 0);
        let finalPrice = originalPrice;
        let promoData = product.promotions && product.promotions.length > 0 ? product.promotions[0] : null;
        let discountAmount = 0;

        // Strip promo to essential fields to prevent circular references and state bloat
        let promoApplied = null;
        if (promoData) {
            promoApplied = {
                id: promoData.id,
                type: promoData.type,
                discount_value: promoData.discount_value,
                max_discount_amount: promoData.max_discount_amount,
                min_qty_requirement: promoData.min_qty_requirement,
                gift_qty: promoData.gift_qty,
                gift_product_id: promoData.gift_product_id,
                gift_product: promoData.gift_product ? { id: promoData.gift_product.id, name: promoData.gift_product.name, price: promoData.gift_product.price } : null
            };
        }

        if (promoApplied) {
            if (promoApplied.type === 'percentage') {
                let discount = originalPrice * (parseFloat(promoApplied.discount_value || 0) / 100);
                if (promoApplied.max_discount_amount && discount > parseFloat(promoApplied.max_discount_amount)) {
                    discount = parseFloat(promoApplied.max_discount_amount);
                }
                finalPrice = originalPrice - discount;
                discountAmount = discount;
            } else if (promoApplied.type === 'fixed_amount') {
                finalPrice = originalPrice - parseFloat(promoApplied.discount_value || 0);
                discountAmount = parseFloat(promoApplied.discount_value || 0);
            }
        }
        return { 
            originalPrice, 
            finalPrice: Math.max(0, finalPrice), 
            promo: promoApplied,
            discountAmount
        };
    };

    const applyCartGifts = (newCart) => {
        try {
            const regularItems = newCart.filter(item => !item.isGift);
            const gifts = [];
            const outOfStockGifts = [];
            
            regularItems.forEach(item => {
                const p = item.promo;
                if (p && (p.type === 'buy_one_get_one' || p.type === 'buy_one_get_gift')) {
                    const minQty = parseInt(p.min_qty_requirement) || 1;
                    const giftQtyPerSet = parseInt(p.gift_qty) || 0;
                    
                    if (item.quantity >= minQty && giftQtyPerSet > 0) {
                        const expectedGiftQty = Math.floor(item.quantity / minQty) * giftQtyPerSet;
                        const giftId = p.type === 'buy_one_get_one' ? item.product_id : p.gift_product_id;
                        const giftProdObj = p.type === 'buy_one_get_one' ? item : p.gift_product;

                        if (giftProdObj && giftId && expectedGiftQty > 0) {
                            const giftStock = parseInt(giftProdObj.stock || giftProdObj.current_stock || 0);
                            
                            if (giftStock >= expectedGiftQty) {
                                gifts.push({
                                    product_id: giftId,
                                    name: `[GIFT] ${giftProdObj.name || 'Product'}`,
                                    original_price: parseFloat(giftProdObj.original_price || giftProdObj.price || 0),
                                    price: 0,
                                    quantity: expectedGiftQty,
                                    subtotal: 0,
                                    stock: giftStock,
                                    isGift: true,
                                    parent_id: item.product_id,
                                    promo: null
                                });
                            } else if (!outOfStockGifts.includes(giftProdObj.name)) {
                                outOfStockGifts.push(giftProdObj.name);
                            }
                        }
                    }
                }
            });

            if (outOfStockGifts.length > 0) {
                setTimeout(() => {
                    Swal.fire({
                        title: 'Gift Stock Alert',
                        text: `The free gift (${outOfStockGifts.join(', ')}) is currently out of stock and could not be added.`,
                        icon: 'info',
                        timer: 3000,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false
                    });
                }, 100);
            }
            
            return [...regularItems, ...gifts];
        } catch (error) {
            console.error("Critical error in gift application:", error);
            return newCart.filter(item => !item.isGift);
        }
    };

    const addToCart = (product) => {
        const stock = parseInt(product.stock || product.current_stock || 0);
        const existingInCart = cart.find(item => item.product_id === product.id && !item.isGift);
        const currentCartQty = existingInCart ? existingInCart.quantity : 0;

        if (stock <= 0) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Out of Stock`, text: `${product.name} is not available.`, showConfirmButton: false, timer: 3000 });
            return;
        }

        if (currentCartQty >= stock) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: `Stock Limit`, text: `Only ${stock} units available for ${product.name}`, showConfirmButton: false, timer: 3000 });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id && !item.isGift);
            const { originalPrice, finalPrice, promo } = getProductPriceInfo(product, (existing?.quantity || 0) + 1);
            
            let newCart = [...prev];
            
            if (existing) {
                const newQty = existing.quantity + 1;
                newCart = newCart.map(item =>
                    (item.product_id === product.id && !item.isGift)
                        ? { ...item, quantity: newQty, subtotal: newQty * finalPrice }
                        : item
                );
            } else {
                newCart.push({
                    product_id: product.id,
                    name: product.name,
                    original_price: originalPrice,
                    price: finalPrice,
                    quantity: 1,
                    subtotal: finalPrice,
                    stock: stock,
                    promo: promo,
                    isGift: false
                });
            }

            return applyCartGifts(newCart);
        });
        setSearchResults([]);
        setSearchQuery('');
    };

    const updateQuantity = (id, delta) => {
        let showStockWarning = false;
        let limitStock = 0;

        setCart(prev => {
            let newCart = prev.map(item => {
                if (item.product_id === id && !item.isGift) {
                    const maxStock = item.stock || 9999;
                    if (item.quantity + delta > maxStock) {
                        showStockWarning = true;
                        limitStock = maxStock;
                    }
                    const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
                    return { ...item, quantity: newQty, subtotal: newQty * item.price };
                }
                return item;
            });
            return applyCartGifts(newCart);
        });

        if (showStockWarning) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: `Only ${limitStock} in stock`, showConfirmButton: false, timer: 2000 });
        }
    };

    const removeFromCart = (id, isGift = false, parentId = null) => {
        setCart(prev => {
            // If we remove a main item, also remove its associated gifts
            if (!isGift) {
                return prev.filter(item => item.product_id !== id && item.parent_id !== id);
            }
            // If we remove a gift manually, just remove that gift
            return prev.filter(item => !(item.product_id === id && item.isGift && item.parent_id === parentId));
        });
    };

    const clearCart = () => setCart([]);

    // --- Totals Calculation (Memoized for performance and stability) ---
    const { subtotal, itemLevelDiscount, orderLevelDiscount, totalDiscount, grandTotal, changeReturn, activeOrderPromo } = React.useMemo(() => {
        const sub = cart.reduce((sum, item) => sum + (parseFloat(item.original_price || 0) * parseInt(item.quantity || 0)), 0);
        
        const itemDisc = cart.reduce((sum, item) => {
            // Include gifts in discount calculation: their full original price is the discount
            return sum + ((parseFloat(item.original_price || 0) - parseFloat(item.price || 0)) * parseInt(item.quantity || 0));
        }, 0);

        // Check if ANY item-level promotion is applied (Gifts or price discounts)
        const hasItemLevelPromo = cart.some(item => item.isGift || (item.original_price > item.price));

        const orderPromo = !hasItemLevelPromo ? allPromotions.find(p => 
            p.promotion_scope === 'order' && 
            sub >= parseFloat(p.min_order_value || 0)
        ) : null;

        let orderDisc = 0;
        if (orderPromo) {
            if (orderPromo.type === 'percentage') {
                orderDisc = sub * (parseFloat(orderPromo.discount_value) / 100);
                if (orderPromo.max_discount_amount && orderDisc > parseFloat(orderPromo.max_discount_amount)) {
                    orderDisc = parseFloat(orderPromo.max_discount_amount);
                }
            } else {
                orderDisc = parseFloat(orderPromo.discount_value);
            }
        }

        const totalDisc = itemDisc + orderDisc;
        const grand = Math.max(0, sub - totalDisc);
        const change = (paymentMethod === 'cash' && receivedAmount) ? parseFloat(receivedAmount) - grand : 0;

        return {
            subtotal: sub,
            itemLevelDiscount: itemDisc,
            orderLevelDiscount: orderDisc,
            totalDiscount: totalDisc,
            grandTotal: grand,
            changeReturn: change,
            activeOrderPromo: orderPromo
        };
    }, [cart, allPromotions, paymentMethod, receivedAmount]);

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

            const res = await api.post('/admin/pos/checkout', payload);

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
            <div className="flex gap-4 p-4 h-full no-print">
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
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-green outline-none text-gray-700 shadow-sm transition-all"
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
                                    const { finalPrice, originalPrice, promo } = getProductPriceInfo(product);
                                    const hasDiscount = finalPrice < originalPrice;
                                    const stock = product.current_stock || 0;
                                    const isOutOfStock = stock <= 0;

                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            disabled={isOutOfStock}
                                            className={`bg-white p-4 rounded-xl shadow-sm border transition-all text-left flex flex-col group relative overflow-hidden ${isOutOfStock ? 'border-red-100 opacity-60 cursor-not-allowed' : 'border-gray-100 hover:border-primary-green hover:shadow-md'
                                                }`}
                                        >
                                            {hasDiscount && !isOutOfStock && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Sale</div>}
                                            {promo?.type === 'buy_one_get_one' && !isOutOfStock && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">BOGO</div>}
                                            {promo?.type === 'buy_one_get_gift' && !isOutOfStock && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">GIFT</div>}
                                            {isOutOfStock && <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1"><AlertTriangle size={10} /> Out</div>}
                                            <p className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</p>
                                            <p className="text-[11px] text-gray-400 mb-1">{product.category?.name}</p>
                                            <p className={`text-[10px] font-bold mb-2 ${stock <= 5 && stock > 0 ? 'text-orange-500' : stock > 5 ? 'text-green-600' : 'text-red-500'}`}>Stock: {stock}</p>
                                            <div className="mt-auto">
                                                <span className="font-bold text-primary-green">{finalPrice.toLocaleString()} Ks</span>
                                                {hasDiscount && <span className="ml-2 text-xs line-through text-gray-400">{originalPrice.toLocaleString()}</span>}
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
                            <ShoppingCart size={18} className="text-primary-green" />
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
                            cart.map((item, index) => (
                                <div key={`${item.product_id}-${index}`} className={`flex flex-col p-3 border rounded-xl hover:shadow-sm transition-all group ${item.isGift ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                            {item.isGift && <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Automated Gift</span>}
                                        </div>
                                        <p className="font-bold text-sm text-gray-800 ml-2">{(item.price * item.quantity).toLocaleString()} Ks</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {!item.isGift ? (
                                                <>
                                                    <button onClick={() => updateQuantity(item.product_id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"><Minus size={14} /></button>
                                                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product_id, 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"><Plus size={14} /></button>
                                                </>
                                            ) : (
                                                <span className="text-xs font-bold text-orange-600 bg-white px-2 py-1 rounded-full shadow-sm border border-orange-200">Qty: {item.quantity}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.original_price > item.price && !item.isGift && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold border border-red-100">Discounted</span>}
                                            <button onClick={() => removeFromCart(item.product_id, item.isGift, item.parent_id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal (Items)</span>
                                <span>{subtotal.toLocaleString()} Ks</span>
                            </div>
                            {itemLevelDiscount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Item Discounts</span>
                                    <span>-{itemLevelDiscount.toLocaleString()} Ks</span>
                                </div>
                            )}
                            {orderLevelDiscount > 0 && (
                                <div className="flex justify-between text-purple-600 font-bold">
                                    <span className="flex items-center gap-1">Order Cashback <Info size={12} className="cursor-help" title={activeOrderPromo?.title} /></span>
                                    <span>-{orderLevelDiscount.toLocaleString()} Ks</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-xl text-gray-800 mt-2 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span className="text-primary-green">{grandTotal.toLocaleString()} Ks</span>
                            </div>
                        </div>
                        <button
                            disabled={cart.length === 0}
                            onClick={() => setShowCheckout(true)}
                            className="w-full py-4 bg-primary-green text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-green/20"
                        >
                            Checkout ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Checkout Modal --- */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-gray-800">Process Payment</h2>
                            <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <p className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Payment Method</p>
                                <button onClick={() => setPaymentMethod('cash')} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-primary-green bg-primary-light text-primary-green' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}><Banknote size={24} /> <span className="font-bold">Cash</span></button>
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
                                        <input type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-green outline-none text-lg font-bold text-gray-800" placeholder="Enter amount..." autoFocus />
                                        {receivedAmount && parseFloat(receivedAmount) >= grandTotal && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Change Return</p>
                                                <p className="text-2xl font-black text-green-700">{changeReturn.toLocaleString()} Ks</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button onClick={handleCheckout} disabled={isProcessing || (paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < grandTotal))} className="mt-auto w-full py-4 bg-primary-green text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-50">
                                    {isProcessing ? 'Processing...' : `Confirm & Print Receipt`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Printable Receipt Area (Only visible when printing) --- */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; visibility: visible !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    @page { margin: 0; size: auto; }
                }
            ` }} />
            
            <div className="hidden print-only print:block w-[80mm] text-black bg-white p-4 font-mono">
                {lastOrder && (
                    <div className="text-center">
                        {settings.site_logo && (
                            <img 
                                src={getStorageUrl(settings.site_logo)} 
                                alt="Logo" 
                                className="h-10 mx-auto mb-2 grayscale brightness-0" 
                            />
                        )}
                        <h2 className="font-bold text-lg mb-1">{settings.site_name}</h2>
                        <p className="text-[10px] mb-4">Receipt #{lastOrder.receipt_number}<br />{new Date(lastOrder.created_at).toLocaleString()}</p>
                        
                        <div className="border-t border-b border-dashed border-black py-2 mb-2 text-left">
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="text-left pb-1">Item</th>
                                        <th className="text-right pb-1">Qty</th>
                                        <th className="text-right pb-1">Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(lastOrder.order_products || lastOrder.orderProducts || [])?.map((op, i) => (
                                        <tr key={i}>
                                            <td className="py-1 pr-1 leading-tight text-[9px]">{op.product?.name} {op.is_gift ? '(GIFT)' : ''}</td>
                                            <td className="text-right py-1 align-top">{op.quantity}</td>
                                            <td className="text-right py-1 align-top">{(parseFloat(op.price || 0) * op.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="text-right text-[10px] space-y-0.5 mb-4">
                            <div className="flex justify-between"><span>Subtotal:</span><span>{(parseFloat(lastOrder.total_amount) + parseFloat(lastOrder.discount_amount || 0)).toLocaleString()} Ks</span></div>
                            {parseFloat(lastOrder.discount_amount) > 0 && <div className="flex justify-between"><span>Discount:</span><span>-{parseFloat(lastOrder.discount_amount).toLocaleString()} Ks</span></div>}
                            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-black"><span>TOTAL:</span><span>{parseFloat(lastOrder.total_amount).toLocaleString()} Ks</span></div>
                            <div className="flex justify-between pt-1"><span>Paid:</span><span>{parseFloat(lastOrder.received_amount || lastOrder.total_amount).toLocaleString()} Ks</span></div>
                            <div className="flex justify-between"><span>Change:</span><span>{parseFloat(lastOrder.change_return || 0).toLocaleString()} Ks</span></div>
                        </div>
                        
                        <p className="text-[10px] font-bold mt-4 mb-1 text-center italic uppercase">Thank you!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPOS;
