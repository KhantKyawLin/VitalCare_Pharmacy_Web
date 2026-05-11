import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { token, isLoading: isAuthLoading } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWishlist = async () => {
        if (!token) {
            setWishlist([]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/wishlist');
            setWishlist(response.data);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading) {
            fetchWishlist();
        }
    }, [token, isAuthLoading]);

    const addToWishlist = async (productId) => {
        if (!token) return { success: false, error: 'Please login to add items to wishlist' };

        try {
            await api.post('/auth/wishlist/add', {
                product_id: productId
            });
            await fetchWishlist(); // Refresh wishlist data
            return { success: true };
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            // Handle specific backend messages if available
            const errorMsg = error.response?.data?.message || 'Failed to add item to wishlist';
            return { success: false, error: errorMsg };
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!token) return { success: false };

        try {
            await api.delete(`/auth/wishlist/remove/${productId}`);
            await fetchWishlist();
            return { success: true };
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            return { success: false };
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product_id === productId);
    };

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider value={{
            wishlist,
            wishlistCount,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            isLoading,
            refreshWishlist: fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
