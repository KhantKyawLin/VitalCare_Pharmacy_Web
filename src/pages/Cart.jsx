import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2 } from 'lucide-react';
import axios from 'axios';

const Cart = () => {
    const { cart, cartTotal, removeFromCart, updateQuantity, isLoading, refreshCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        try {
            // Note: address_id is hardcoded here for testing checkout
            const response = await axios.post('http://localhost:8000/api/auth/checkout', {
                address_id: 1,
            });

            if (response.data.message === 'Order placed successfully') {
                alert('Order placed successfully!');
                await refreshCart();
                navigate('/orders'); // Redirect to orders page once it exists
            }
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Checkout failed. Please try again.");
        }
    };

    if (isLoading) {
        return <div className="container mx-auto px-4 py-24 text-center text-text-muted">Loading cart...</div>;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-light-grey rounded-full flex items-center justify-center text-text-muted mb-6">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-text-dark mb-4">Your cart is empty</h2>
                <p className="text-text-muted mb-8 max-w-md">Looks like you haven't added any health products to your cart yet.</p>
                <Link to="/products" className="bg-primary-green hover:bg-accent-green text-white px-8 py-3 rounded-md font-medium transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-text-dark mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-xl shadow-sm border border-light-grey overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-light-grey text-sm font-semibold text-text-muted uppercase tracking-wider">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        <div className="divide-y divide-light-grey">
                            {cart.items.map(item => {
                                const product = item.product;
                                const itemTotal = product.price * item.quantity;
                                const imageUrl = product.pictures?.length > 0 ? `http://localhost/VitalCare/uploads/${product.pictures[0].image_path}` : "https://placehold.co/100x100/f8fafc/a3c93a?text=Product";

                                return (
                                    <div key={item.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col sm:flex-row gap-4">

                                        <div className="col-span-6 flex flex-row items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <Link to={`/products/${product.id}`} className="font-semibold text-text-dark hover:text-primary-green transition-colors">
                                                    {product.name}
                                                </Link>
                                                <span className="text-xs text-text-muted uppercase tracking-wider mt-1">{product.category?.name}</span>
                                                <button
                                                    onClick={() => removeFromCart(product.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium text-left mt-2 flex items-center gap-1 w-fit"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-center font-medium md:mb-0 mb-2 before:content-['Price:'] md:before:content-none before:text-text-muted before:mr-2 before:text-sm md:flex-row flex items-baseline justify-between w-full md:w-auto">
                                            ${parseFloat(product.price).toFixed(2)}
                                        </div>

                                        <div className="col-span-2 flex justify-center w-full md:w-auto">
                                            <div className="flex items-center border border-light-grey rounded-md overflow-hidden bg-white w-24">
                                                <button
                                                    onClick={() => updateQuantity(product.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary-green hover:bg-gray-50 transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >-</button>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={item.quantity}
                                                    className="w-8 h-8 text-center text-sm font-medium text-text-dark border-x border-light-grey outline-none"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(product.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary-green hover:bg-gray-50 transition-colors"
                                                >+</button>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-right font-bold text-primary-green md:mb-0 mb-0 before:content-['Subtotal:'] md:before:content-none before:text-text-muted before:font-normal before:mr-2 before:text-sm md:flex-row flex items-baseline justify-between w-full md:w-auto">
                                            ${itemTotal.toFixed(2)}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-xl shadow-sm border border-light-grey p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-text-dark mb-6">Order Summary</h2>

                        <div className="flex justify-between items-center mb-4 text-text-muted">
                            <span>Subtotal ({cart.items.length} items)</span>
                            <span className="font-medium text-text-dark">${cartTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center mb-4 text-text-muted">
                            <span>Shipping</span>
                            <span className="font-medium text-text-dark">Free</span>
                        </div>

                        <hr className="my-4 border-light-grey" />

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-text-dark">Total</span>
                            <span className="text-2xl font-bold text-primary-green">${cartTotal.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-primary-green text-white hover:bg-accent-green font-bold py-3 px-4 rounded-md transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                        >
                            Proceed to Checkout
                        </button>

                        <div className="mt-4 text-center">
                            <Link to="/products" className="text-sm font-medium text-primary-green hover:underline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
