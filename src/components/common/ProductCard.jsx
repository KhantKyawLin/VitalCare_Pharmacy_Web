import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight } from 'lucide-react';

const ProductCard = ({ product }) => {
    const hasPromotion = product.promotions && product.promotions.length > 0;
    const currentPrice = parseFloat(product.price || 0);
    let originalPrice = null;
    let badgeText = null;
    let badgeColor = "bg-[#A3C93A]"; // Default green

    if (hasPromotion) {
        const promo = product.promotions[0];
        const val = parseFloat(promo.discount_value || 0);
        
        switch (promo.type) {
            case 'percentage':
                badgeText = `${val}% OFF`;
                originalPrice = currentPrice / (1 - (val / 100));
                badgeColor = "bg-red-500";
                break;
            case 'fixed_amount':
                badgeText = `${val.toLocaleString()} Ks OFF`;
                originalPrice = currentPrice + val;
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

    return (
        <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group overflow-hidden max-h-[380px]">
            {/* Top Section: Image & Badge */}
            <div className="relative aspect-[5/4] bg-white p-2 overflow-hidden flex-shrink-0">
                {/* Promotion Badge */}
                {badgeText && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                        <span className={`${badgeColor} text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[2px] shadow-sm`}>
                            {badgeText}
                        </span>
                    </div>
                )}

                <Link to={`/products/${product.id}`} className="block w-full h-full">
                    <img
                        src={product.image || (product.pictures?.length > 0 ? `http://127.0.0.1:8000/storage/${product.pictures[0].image_path}` : "https://placehold.co/400x320/f8fafc/a3c93a?text=Product")}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {!!product.is_expired && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[2px]">Expired</span>
                    </div>
                )}
            </div>

            {/* Middle Section: Name & Category */}
            <div className="px-2.5 pt-1.5 pb-0.5 flex justify-between items-start gap-1">
                <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1 leading-tight flex-grow group-hover:text-[#A3C93A] transition-colors">
                    {product.name}
                </h3>
                <span className="bg-gray-50 text-gray-400 text-[7px] font-black uppercase tracking-tighter px-1 py-0.5 rounded-[2px] border border-gray-100 whitespace-nowrap">
                    {product.category?.name || product.category || 'General'}
                </span>
            </div>

            {/* Price & View Link */}
            <div className="px-2.5 py-1 flex justify-between items-end">
                <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-[12px] font-black text-red-500">
                        Ks. {currentPrice.toLocaleString()}
                    </span>
                    {originalPrice && (
                        <span className="text-[9px] text-gray-400 line-through">
                            {originalPrice.toLocaleString()}
                        </span>
                    )}
                </div>
                <Link to={`/products/${product.id}`} className="text-[#A3C93A] text-[9px] font-black uppercase tracking-tighter border border-[#A3C93A]/20 px-1.5 py-0.5 rounded-[2px] flex items-center gap-0.5 hover:bg-[#A3C93A] hover:text-white transition-all">
                    View <ChevronRight size={10} strokeWidth={3} />
                </Link>
            </div>

            {/* Footer: Action Buttons */}
            <div className="px-2.5 pb-2.5 mt-auto grid grid-cols-2 gap-1.5">
                <button className="flex items-center justify-center gap-1 bg-[#A3C93A] hover:bg-[#8eb132] text-white py-1.5 rounded-[3px] text-[8px] font-black uppercase tracking-widest transition-all shadow-sm">
                    <Heart size={10} fill="white" /> Wishlist
                </button>
                <button className="flex items-center justify-center gap-1 bg-[#A3C93A] hover:bg-[#8eb132] text-white py-1.5 rounded-[3px] text-[8px] font-black uppercase tracking-widest transition-all shadow-sm">
                    <ShoppingCart size={10} /> Add
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
