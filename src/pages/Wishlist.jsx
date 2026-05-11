import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { getStorageUrl } from '../utils/api';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, isLoading } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    const handleRemove = async (productId, productName) => {
        const result = await removeFromWishlist(productId);
        if (result.success) {
            showSuccessToast(`${productName} removed from wishlist`);
        } else {
            showErrorToast('Failed to remove item');
        }
    };

    const handleAddToCart = async (productId, productName) => {
        const result = await addToCart(productId, 1);
        if (result.success) {
            showSuccessToast(`${productName} added to cart!`);
        } else {
            showErrorToast(result.error || 'Failed to add to cart');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading wishlist...</p>
            </div>
        );
    }

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                    <Heart size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Start adding products you love and come back later to purchase them.</p>
                <Link to="/products" className="bg-primary-green hover:bg-primary-dark text-white px-8 py-3 rounded-[4px] font-bold transition-colors flex items-center gap-2">
                    <ArrowLeft size={16} /> Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-primary-green mb-8">Your Wishlist</h1>

            {/* Wishlist Table */}
            <div className="bg-white rounded-[4px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {wishlist.map(item => {
                                const product = item.product;
                                if (!product) return null;

                                const price = parseFloat(product.price || 0);
                                const imageUrl = product.pictures?.length > 0
                                    ? getStorageUrl(product.pictures[0].image_path)
                                    : "https://placehold.co/80x80/f8fafc/a3c93a?text=P";

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Product */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-white rounded-[4px] border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                                    <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
                                                </div>
                                                <Link to={`/products/${product.id}`} className="font-bold text-gray-800 hover:text-primary-green transition-colors text-sm">
                                                    {product.name}
                                                </Link>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-5">
                                            <span className="text-primary-green font-bold">
                                                Ks. {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAddToCart(product.id, product.name)}
                                                    className="bg-primary-green hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5"
                                                >
                                                    <ShoppingCart size={13} /> Add to Cart
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(product.id, product.name)}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5"
                                                >
                                                    <Trash2 size={13} /> Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-start items-center mt-8">
                <Link 
                    to="/products" 
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-[4px] font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default Wishlist;
