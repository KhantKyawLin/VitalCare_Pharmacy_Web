import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCart = async () => {
        if (!token) {
            setCart(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/auth/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(response.data);
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    const addToCart = async (productId, quantity = 1) => {
        if (!token) return { success: false, error: 'Please login to add items to cart' };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/cart/add', {
                product_id: productId,
                quantity: quantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchCart();
            return { success: true, message: response.data?.message };
        } catch (error) {
            console.error("Error adding to cart:", error);
            return { success: false, error: error.response?.data?.message || 'Failed to add item to cart' };
        }
    };

    const removeFromCart = async (productId) => {
        if (!token) return { success: false };

        try {
            await axios.delete(`http://127.0.0.1:8000/api/auth/cart/remove/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchCart();
            return { success: true };
        } catch (error) {
            console.error("Error removing from cart:", error);
            return { success: false };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!token) return { success: false };

        // Client-side validation: quantity must be 1-5
        if (quantity < 1 || quantity > 5) {
            return { success: false, error: 'Quantity must be between 1 and 5' };
        }

        try {
            await axios.patch(`http://127.0.0.1:8000/api/auth/cart/update/${productId}`, {
                quantity: quantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchCart();
            return { success: true };
        } catch (error) {
            console.error("Error updating quantity:", error);
            return { success: false, error: error.response?.data?.message || 'Failed to update quantity' };
        }
    };

    // Compute from the cart object returned by backend (cart.items is the array)
    const cartItems = cart?.items || [];
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const cartTotal = cartItems.reduce((total, item) => {
        const itemPrice = parseFloat(item.product?.price || 0);
        return total + (itemPrice * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cart,
            cartItems,
            cartCount,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            isLoading,
            refreshCart: fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
