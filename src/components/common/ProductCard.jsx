import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

    const [isAddingCart, setIsAddingCart] = useState(false);
    const [isAddingWishlist, setIsAddingWishlist] = useState(false);

    const hasPromotion = product.promotions && product.promotions.length > 0;
    let currentPrice = parseFloat(product.price || 0);
    let originalPrice = null;
    let badgeText = null;
    let badgeColor = "bg-[#A3C93A]"; // Default green

    if (hasPromotion) {
        const promo = product.promotions[0];
        const val = parseFloat(promo.discount_value || 0);

        switch (promo.type) {
            case 'percentage':
                badgeText = `${val}% OFF`;
                originalPrice = currentPrice;
                currentPrice = currentPrice - (currentPrice * (val / 100));
                badgeColor = "bg-red-500";
                break;
            case 'fixed_amount':
                badgeText = `${val.toLocaleString()} Ks OFF`;
                originalPrice = currentPrice;
                currentPrice = currentPrice - val;
                badgeColor = "bg-blue-500";
                break;
            case 'cashback':
                badgeText = `Cashback`;
                badgeColor = "bg-purple-500";
                break;
            case 'buy_one_get_one':
                badgeText = `Buy 1 Get 1`;
                badgeColor = "bg-orange-500";
                break;
            case 'buy_one_get_gift':
                badgeText = `Buy 1 Get Gift`;
                badgeColor = "bg-pink-500";
                break;
            default:
                badgeText = `SALE`;
        }
    }

    const handleAddToCart = async (e) => {
        e.preventDefault();
        
        if (!token) {
            showErrorToast('Please login to add items to cart');
            return;
        }

        if (user && user.role !== 'user') {
            import('sweetalert2').then(Swal => {
                Swal.default.fire({
                    title: 'Customer Action Only',
                    text: 'Only registered customers can perform this action. Staff members should use the POS system for sales.',
                    icon: 'warning',
                    confirmButtonColor: '#A3C93A',
                    confirmButtonText: 'I Understand'
                });
            });
            return;
        }

        setIsAddingCart(true);
        const result = await addToCart(product.id, 1);
        setIsAddingCart(false);

        if (result.success) {
            showSuccessToast('Product added to cart!');
        } else {
            showErrorToast(result.error || 'Failed to add item to cart');
        }
    };

    const handleWishlistToggle = async (e) => {
        e.preventDefault();

        if (!token) {
            showErrorToast('Please login to add items to wishlist');
            return;
        }

        if (user && user.role !== 'user') {
            import('sweetalert2').then(Swal => {
                Swal.default.fire({
                    title: 'Customer Action Only',
                    text: 'Only registered customers can perform this action.',
                    icon: 'warning',
                    confirmButtonColor: '#A3C93A',
                    confirmButtonText: 'I Understand'
                });
            });
            return;
        }

        setIsAddingWishlist(true);
        if (isInWishlist(product.id)) {
            await removeFromWishlist(product.id);
            showSuccessToast('Removed from wishlist');
        } else {
            const result = await addToWishlist(product.id);
            if (result.success) {
                showSuccessToast('Product added to wishlist!');
            } else {
                showErrorToast(result.error || 'Failed to update wishlist');
            }
        }
        setIsAddingWishlist(false);
    };

    // Determine if we should show the action buttons
    // Only show if user is NOT logged in (to redirect to login), OR if user is a customer
    const showActionButtons = true; // Show for everyone (guests and all roles) for visibility/testing
    const isWishlisted = isInWishlist(product.id);

    return (
        <div className="bg-white rounded-[8px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group overflow-hidden">
            {/* Top Section: Image & Badges */}
            <div className="relative aspect-square bg-white p-4 overflow-hidden flex-shrink-0">
                {/* Promotion Badge */}
                {badgeText && (
                    <div className="absolute top-2 left-2 z-10">
                        <span className="bg-[#A3C93A] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                            {badgeText}
                        </span>
                    </div>
                )}
                
                {/* Top Seller Badge */}
                <div className="absolute top-2 right-2 z-10">
                    <span className="bg-[#10b981] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                        Top Seller
                    </span>
                </div>

                <Link to={`/products/${product.id}`} className="block w-full h-full">
                    <img
                        src={product.image || (product.pictures?.length > 0 ? `http://127.0.0.1:8000/storage/${product.pictures[0].image_path}` : "https://placehold.co/400x400/f8fafc/a3c93a?text=Product")}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {!!product.is_expired && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Expired</span>
                    </div>
                )}
            </div>

            {/* Middle Section: Name & Category */}
            <div className="px-3 pt-2 flex justify-between items-start gap-2">
                <h3 className="text-[12px] font-bold text-gray-800 line-clamp-1 leading-tight flex-grow group-hover:text-[#A3C93A] transition-colors">
                    {product.name}
                </h3>
                <span className="bg-gray-50 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                    {product.category?.name || product.category || 'General'}
                </span>
            </div>

            {/* Price & View Link */}
            <div className="px-3 py-2 flex justify-between items-center">
                <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-sm font-bold text-red-500">
                        {currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})} Ks.
                    </span>
                    {originalPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                            {originalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})} Ks.
                        </span>
                    )}
                </div>
                <Link to={`/products/${product.id}`} className="text-[#A3C93A] border border-[#A3C93A]/30 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 hover:bg-[#A3C93A] hover:text-white transition-all">
                    View <ChevronRight size={10} />
                </Link>
            </div>

            {/* Footer: Action Buttons */}
            {showActionButtons && (
                <div className="px-3 pb-3 mt-auto grid grid-cols-2 gap-2">
                    <button 
                        onClick={handleWishlistToggle}
                        disabled={isAddingWishlist}
                        className={`flex items-center justify-center gap-1 bg-[#A3C93A] hover:bg-[#8eb132] text-white py-2 rounded text-[9px] font-bold transition-all shadow-sm disabled:opacity-50`}
                    >
                        <Heart size={12} fill={isWishlisted ? "white" : "none"} /> 
                        {isAddingWishlist ? '...' : 'Add to Wishlist'}
                    </button>
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.is_expired || isAddingCart}
                        className="flex items-center justify-center gap-1 bg-[#A3C93A] hover:bg-[#8eb132] text-white py-2 rounded text-[9px] font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                        <ShoppingCart size={12} /> 
                        {isAddingCart ? '...' : 'Add to Cart'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
