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
            const response = await axios.get('http://localhost:8000/api/auth/cart');
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
            await axios.post('http://localhost:8000/api/auth/cart/add', {
                product_id: productId,
                quantity: quantity
            });
            await fetchCart(); // Refresh cart data
            return { success: true };
        } catch (error) {
            console.error("Error adding to cart:", error);
            return { success: false, error: 'Failed to add item to cart' };
        }
    };

    const removeFromCart = async (productId) => {
        if (!token) return { success: false };

        try {
            await axios.delete(`http://localhost:8000/api/auth/cart/remove/${productId}`);
            await fetchCart();
            return { success: true };
        } catch (error) {
            console.error("Error removing from cart:", error);
            return { success: false };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!token) return { success: false };

        try {
            await axios.patch(`http://localhost:8000/api/auth/cart/update/${productId}`, {
                quantity: quantity
            });
            await fetchCart();
            return { success: true };
        } catch (error) {
            console.error("Error updating quantity:", error);
            return { success: false };
        }
    };

    const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const cartTotal = cart?.items?.reduce((total, item) => {
        const itemPrice = parseFloat(item.product?.price || 0);
        return total + (itemPrice * item.quantity);
    }, 0) || 0;

    return (
        <CartContext.Provider value={{
            cart,
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
