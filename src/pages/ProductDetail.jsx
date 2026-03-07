import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { token } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/products/${id}`);
                setProduct(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Failed to load product details.");
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleQuantityChange = (type) => {
        if (type === 'decrement' && quantity > 1) {
            setQuantity(quantity - 1);
        } else if (type === 'increment') {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCart = async () => {
        if (!token) {
            alert('Please login to add items to the cart');
            navigate('/login');
            return;
        }

        setIsAdding(true);
        const result = await addToCart(product.id, quantity);
        setIsAdding(false);

        if (result.success) {
            alert(`Added ${quantity} ${product.name}(s) to cart!`);
        } else {
            alert(result.error || 'Failed to add item to cart');
        }
    };

    if (isLoading) {
        return <div className="container mx-auto px-4 py-24 text-center text-text-muted">Loading product details...</div>;
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <p className="text-red-500 mb-4">{error || "Product not found"}</p>
                <Link to="/products" className="text-primary-green hover:underline">Return to Products</Link>
            </div>
        );
    }

    const imageUrl = product.pictures?.length > 0
        ? product.pictures[0].image_path
        : "https://placehold.co/600x600/f8fafc/a3c93a?text=Product";

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <nav className="text-sm mb-8">
                <ol className="list-none p-0 inline-flex text-text-muted">
                    <li className="flex items-center">
                        <Link to="/" className="hover:text-primary-green">Home</Link>
                        <span className="mx-2">/</span>
                    </li>
                    <li className="flex items-center">
                        <Link to="/products" className="hover:text-primary-green">Products</Link>
                        <span className="mx-2">/</span>
                    </li>
                    <li className="flex items-center text-text-dark font-medium">
                        {product.name}
                    </li>
                </ol>
            </nav>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Product Image */}
                <div className="md:w-1/2">
                    <div className="bg-[#f8fafc] rounded-2xl p-8 border border-light-grey flex items-center justify-center">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="max-w-full h-auto object-contain rounded-lg shadow-sm"
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="md:w-1/2 flex flex-col">
                    <div className="mb-2">
                        <span className="text-sm font-semibold text-accent-green uppercase tracking-wider">
                            {product.category?.name || 'Healthcare'}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">{product.name}</h1>

                    <div className="flex items-baseline gap-4 mb-6">
                        <span className="text-3xl font-bold text-primary-green">${parseFloat(product.price).toFixed(2)}</span>
                        {product.is_expired && (
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <p className="text-text-muted mb-8 text-lg">
                        {product.description || "No description available for this product."}
                    </p>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-y-4 mb-8 text-sm border-t border-b border-light-grey/50 py-6">
                        {product.dosage && (
                            <>
                                <div className="text-text-muted font-medium">Dosage:</div>
                                <div className="text-text-dark">{product.dosage}</div>
                            </>
                        )}
                        {product.usage && (
                            <>
                                <div className="text-text-muted font-medium">Usage:</div>
                                <div className="text-text-dark">{product.usage}</div>
                            </>
                        )}
                        {product.side_effects && (
                            <>
                                <div className="text-text-muted font-medium">Side Effects:</div>
                                <div className="text-text-dark">{product.side_effects}</div>
                            </>
                        )}
                        {product.unit && (
                            <>
                                <div className="text-text-muted font-medium">Unit:</div>
                                <div className="text-text-dark">{product.unit.name}</div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex items-center border border-light-grey rounded-md bg-white w-full sm:w-auto h-12">
                            <button
                                onClick={() => handleQuantityChange('decrement')}
                                className="px-4 text-text-muted hover:text-primary-green transition-colors h-full"
                                disabled={product.is_expired}
                            >
                                -
                            </button>
                            <input
                                type="text"
                                readOnly
                                value={quantity}
                                className="w-12 text-center font-medium text-text-dark outline-none bg-transparent"
                            />
                            <button
                                onClick={() => handleQuantityChange('increment')}
                                className="px-4 text-text-muted hover:text-primary-green transition-colors h-full"
                                disabled={product.is_expired}
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.is_expired}
                            className={`flex-1 w-full h-12 rounded-md font-bold transition-all shadow-md ${product.is_expired
                                ? 'bg-light-grey text-text-muted cursor-not-allowed shadow-none'
                                : 'bg-primary-green text-white hover:bg-accent-green hover:shadow-lg'
                                }`}
                        >
                            {product.is_expired ? 'Currently Unavailable' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
