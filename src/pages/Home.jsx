import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetching from your Laravel API
                const response = await axios.get('http://localhost:8000/api/products');
                // Let's just grab the first 4 products for the featured section
                setFeaturedProducts(response.data.slice(0, 4));
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load featured products.");
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col gap-12 py-8">
            {/* Hero Section */}
            <section className="bg-primary-green/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 mx-4 lg:mx-8">
                <div className="flex-1 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary-green leading-tight">
                        Your Health,<br />Our Priority
                    </h1>
                    <p className="text-lg text-text-muted">
                        Get your medications, health supplements, and personal care products delivered right to your door.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-primary-green hover:bg-accent-green text-white px-8 py-3 rounded-md font-medium transition-all shadow-md hover:shadow-lg">
                            Shop Now
                        </button>
                        <button className="border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white px-8 py-3 rounded-md font-medium transition-all">
                            Upload Prescription
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                        alt="Pharmacy Store"
                        className="rounded-xl shadow-lg w-full object-cover h-[400px]"
                    />
                </div>
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-text-dark mb-2">Featured Products</h2>
                        <p className="text-text-muted">Handpicked health essentials for you</p>
                    </div>
                    <a href="/products" className="text-primary-green font-medium hover:text-accent-green hover:underline">
                        View All
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-12 text-center text-text-muted">Loading products...</div>
                    ) : error ? (
                        <div className="col-span-full py-12 text-center text-red-500">{error}</div>
                    ) : featuredProducts.length > 0 ? (
                        featuredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: parseFloat(product.price),
                                    category: product.category?.name || 'Healthcare',
                                    // Use the first related picture as image if it exists
                                    image: product.pictures?.length > 0 ? product.pictures[0].image_path : null,
                                    isOutOfStock: product.is_expired // Using is_expired as out of stock proxy temporarily
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-text-muted">No products found.</div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
