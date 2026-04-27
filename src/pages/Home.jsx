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
            <section className="bg-[#f8f9fa] py-16 text-center">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="md:w-1/2 text-left mb-8 md:mb-0 lg:pl-12">
                            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold text-primary-green leading-tight mb-4">
                                Your Trusted Pharmacy
                            </h1>
                            <p className="text-xl text-text-muted mb-8 font-light">
                                Quality healthcare products with fast delivery to your doorstep.
                            </p>
                            <a href="/products" className="bg-primary-green hover:bg-accent-green text-white px-8 py-3 rounded text-lg font-medium transition-transform hover:scale-105 shadow-md hover:shadow-lg inline-block">
                                Shop Now
                            </a>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src="http://localhost/VitalCare/image/VitalCare_Home.png"
                                alt="Pharmacist Illustration"
                                className="w-full h-auto max-w-lg mx-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center">
                            <div className="text-primary-green mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                            </div>
                            <h5 className="text-xl font-semibold mb-2">Fast Delivery</h5>
                            <p className="text-text-muted">Same-day delivery in Yangon area</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-primary-green mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 11-4 4"/><path d="m13 13 4-4"/><circle cx="15" cy="9" r="6"/><circle cx="9" cy="15" r="6"/></svg>
                            </div>
                            <h5 className="text-xl font-semibold mb-2">Genuine Medicine</h5>
                            <p className="text-text-muted">100% authentic pharmaceutical products</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-primary-green mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                            </div>
                            <h5 className="text-xl font-semibold mb-2">Expert Support</h5>
                            <p className="text-text-muted">Pharmacist consultation available</p>
                        </div>
                    </div>
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
                                    image: product.pictures?.length > 0 ? `http://localhost/VitalCare/uploads/${product.pictures[0].image_path}` : null,
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
