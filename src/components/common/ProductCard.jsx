import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const {
        id,
        name,
        image,
        price,
        originalPrice,
        category,
        isOutOfStock
    } = product;

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-light-grey/50 group">
            {/* Image Container */}
            <div className="relative pt-[100%] overflow-hidden bg-[#f8fafc]">
                {/* Placeholder image logic, replace with actual image later */}
                <img
                    src={image || "https://placehold.co/400x400/f8fafc/a3c93a?text=Product"}
                    alt={name}
                    className="absolute top-0 left-0 w-full h-full object-cover p-4 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Discount Badge if originalPrice exists */}
                {originalPrice && originalPrice > price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Sale
                    </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-text-dark font-bold px-4 py-2 rounded shadow">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">{category}</div>
                <h3 className="text-lg font-semibold text-text-dark mb-2 line-clamp-2">{name}</h3>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-primary-green">${price.toFixed(2)}</span>
                        {originalPrice && originalPrice > price && (
                            <span className="text-sm text-text-muted line-through">${originalPrice.toFixed(2)}</span>
                        )}
                    </div>

                    <Link
                        to={`/products/${id}`}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${isOutOfStock
                                ? 'bg-light-grey text-text-muted cursor-not-allowed'
                                : 'bg-primary-green text-white hover:bg-accent-green'
                            }`}
                    >
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
