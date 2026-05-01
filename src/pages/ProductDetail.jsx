import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ShoppingCart, 
    Heart, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle,
    Zap,
    ShieldCheck,
    Truck
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { token } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}`);
                setProduct(response.data.product);
                setRelatedProducts(response.data.related || []);
                setIsLoading(false);
                window.scrollTo(0, 0);
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
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A3C93A]"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <p className="text-red-500 mb-4 font-bold">{error || "Product not found"}</p>
                <Link to="/products" className="text-[#A3C93A] font-bold underline">Return to Products Catalog</Link>
            </div>
        );
    }

    const images = product.pictures?.length > 0 
        ? product.pictures.map(p => `http://127.0.0.1:8000/storage/${p.image_path}`)
        : ["https://placehold.co/600x600/f8fafc/a3c93a?text=Product"];

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Link to="/" className="hover:text-[#A3C93A]">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/products" className="hover:text-[#A3C93A]">Products</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    
                    {/* Left: Image Gallery */}
                    <div className="lg:w-1/2 flex flex-col gap-6">
                        <div className="relative aspect-square bg-[#F8FAFC] rounded-[4px] border border-gray-100 flex items-center justify-center p-12 group overflow-hidden">
                            <img 
                                src={images[activeImageIndex]} 
                                alt={product.name}
                                className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-[#A3C93A] opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        onClick={() => setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-[#A3C93A] opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-20 h-20 rounded-[4px] border-2 transition-all p-2 flex-shrink-0 bg-gray-50 ${activeImageIndex === idx ? 'border-[#A3C93A]' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:w-1/2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-[2px] border border-gray-200">
                                {product.category?.name || 'Healthcare'}
                            </span>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-[2px] ${product.is_expired ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                {product.is_expired ? 'Out of Stock' : 'Limited Stock'}
                            </span>
                        </div>

                        <h1 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                            {product.name}
                        </h1>

                        <div className="mb-8">
                            <span className="text-3xl font-black text-[#A3C93A]">
                                Ks. {parseFloat(product.price).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </span>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-col gap-6 mb-12">
                            <div className="flex items-center gap-6">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Quantity:</span>
                                <div className="flex items-center bg-gray-50 rounded-[4px] border border-gray-200 overflow-hidden">
                                    <button 
                                        onClick={() => handleQuantityChange('decrement')}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-black"
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="text" 
                                        value={quantity} 
                                        readOnly 
                                        className="w-12 text-center bg-transparent font-black text-gray-800 outline-none"
                                    />
                                    <button 
                                        onClick={() => handleQuantityChange('increment')}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-black"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-xs font-bold text-gray-400 italic">
                                    {product.unit?.name || 'Box'}
                                </span>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={product.is_expired || isAdding}
                                    className="flex-grow bg-[#A3C93A] hover:bg-[#8eb132] text-white py-4 rounded-[4px] font-black uppercase tracking-widest shadow-xl shadow-[#A3C93A]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
                                >
                                    <ShoppingCart size={20} strokeWidth={3} /> {isAdding ? 'Adding...' : 'Add to Cart'}
                                </button>
                                <button className="w-16 h-14 border-2 border-gray-100 rounded-[4px] flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-500 transition-all shadow-sm">
                                    <Heart size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Product Highlights */}
                        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                            <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
                                <Zap size={18} className="text-[#A3C93A] fill-[#A3C93A]" /> Product Highlights
                            </h4>
                            <ul className="flex flex-col gap-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle size={18} className="text-[#A3C93A] mt-0.5" />
                                    <p className="text-sm text-gray-600 font-medium">
                                        <span className="font-bold text-gray-900">Dosage:</span> {product.dosage || 'Consult your physician for correct dosage.'}
                                    </p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck size={18} className="text-[#A3C93A] mt-0.5" />
                                    <p className="text-sm text-gray-600 font-medium">Genuine pharmaceutical product verified by health experts.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Truck size={18} className="text-[#A3C93A] mt-0.5" />
                                    <p className="text-sm text-gray-600 font-medium">Fast and secure delivery available nationwide.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Information Tabs */}
                <div className="mt-24">
                    <div className="flex border-b border-gray-100 gap-12 overflow-x-auto no-scrollbar">
                        {['description', 'usage_instructions', 'side_effects'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all relative ${activeTab === tab ? 'text-[#A3C93A]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.replace('_', ' ')}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#A3C93A] rounded-t-full shadow-[0_-2px_8px_#A3C93A66]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="py-12 max-w-4xl">
                        <div className="text-lg text-gray-600 leading-relaxed font-medium">
                            {activeTab === 'description' && (
                                <p>{product.description || "No detailed description available."}</p>
                            )}
                            {activeTab === 'usage_instructions' && (
                                <p>{product.usage || "Please follow the instructions on the packaging or consult a professional."}</p>
                            )}
                            {activeTab === 'side_effects' && (
                                <p>{product.side_effects || "No specific side effects reported. Consult a doctor if you experience unusual symptoms."}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 mb-2">You May Also Like</h2>
                                <p className="text-gray-400 font-medium italic underline decoration-[#A3C93A]/30">Handpicked alternatives for you</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                            {relatedProducts.map(rel => (
                                <ProductCard key={rel.id} product={rel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
