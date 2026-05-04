import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { showSuccessToast, showErrorToast, showWarningToast } from '../utils/toast';
import Swal from 'sweetalert2';

const Cart = () => {
    const { cart, cartItems, cartTotal, removeFromCart, updateQuantity, isLoading } = useContext(CartContext);
    const navigate = useNavigate();

    const MAX_QTY = 5;
    const MIN_QTY = 1;

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleRemove = async (productId, productName) => {
        const result = await removeFromCart(productId);
        if (result.success) {
            showSuccessToast(`${productName} removed from cart`);
        } else {
            showErrorToast('Failed to remove item');
        }
    };

    const handleQuantityChange = async (productId, newQty) => {
        if (newQty > MAX_QTY) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Exceeded',
                text: `Maximum quantity per product is ${MAX_QTY}.`,
                confirmButtonColor: '#8DB600',
            });
            return;
        }
        if (newQty < MIN_QTY) return;

        const result = await updateQuantity(productId, newQty);
        if (!result.success && result.error) {
            showErrorToast(result.error);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8DB600] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading cart...</p>
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                    <ShoppingCart size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any health products to your cart yet.</p>
                <Link to="/products" className="bg-[#8DB600] hover:bg-[#769800] text-white px-8 py-3 rounded-[4px] font-bold transition-colors flex items-center gap-2">
                    <ArrowLeft size={16} /> Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-[#8DB600] mb-8">Your Shopping Cart</h1>

            {/* Cart Table */}
            <div className="bg-white rounded-[4px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Subtotal</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cartItems.map(item => {
                                const product = item.product;
                                if (!product) return null;
                                
                                const price = parseFloat(product.price || 0);
                                const subtotal = price * item.quantity;
                                const imageUrl = product.pictures?.length > 0 
                                    ? `http://127.0.0.1:8000/storage/${product.pictures[0].image_path}` 
                                    : "https://placehold.co/80x80/f8fafc/a3c93a?text=P";

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Product */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-white rounded-[4px] border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                                    <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
                                                </div>
                                                <Link to={`/products/${product.id}`} className="font-bold text-gray-800 hover:text-[#8DB600] transition-colors text-sm">
                                                    {product.name}
                                                </Link>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-5">
                                            <span className="text-[#8DB600] font-bold">
                                                Ks. {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-6 py-5">
                                            <div>
                                                <div className="flex items-center border border-gray-200 rounded-[4px] overflow-hidden w-fit bg-white">
                                                    <button
                                                        onClick={() => handleQuantityChange(product.id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#8DB600] hover:bg-gray-50 transition-colors font-bold text-lg disabled:opacity-30"
                                                        disabled={item.quantity <= MIN_QTY}
                                                    >−</button>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={item.quantity}
                                                        className="w-10 h-8 text-center text-sm font-bold text-gray-800 border-x border-gray-200 outline-none bg-gray-50"
                                                    />
                                                    <button
                                                        onClick={() => handleQuantityChange(product.id, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#8DB600] hover:bg-gray-50 transition-colors font-bold text-lg disabled:opacity-30"
                                                        disabled={item.quantity >= MAX_QTY}
                                                    >+</button>
                                                </div>
                                                {item.quantity >= MAX_QTY && (
                                                    <p className="text-[10px] text-orange-500 mt-1 font-medium">
                                                        Quantity must be between {MIN_QTY} and {MAX_QTY}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Subtotal */}
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-gray-800">
                                                Ks. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <button
                                                onClick={() => handleRemove(product.id, product.name)}
                                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5"
                                            >
                                                <Trash2 size={13} /> Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-gray-200">
                                <td colSpan="3" className="px-6 py-5 text-right font-bold text-gray-800 text-base">
                                    Total:
                                </td>
                                <td className="px-6 py-5">
                                    <span className="font-bold text-[#8DB600] text-lg">
                                        Ks. {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center mt-8">
                <Link 
                    to="/products" 
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-[4px] font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <button
                    onClick={handleCheckout}
                    className="flex items-center gap-2 bg-[#8DB600] hover:bg-[#769800] text-white px-6 py-2.5 rounded-[4px] font-bold transition-colors shadow-md hover:shadow-lg text-sm"
                >
                    Proceed to Checkout <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Cart;
