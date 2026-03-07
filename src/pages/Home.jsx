import React from 'react';
import ProductCard from '../components/common/ProductCard';

const Home = () => {
    // Dummy products for now
    const featuredProducts = [
        {
            id: 1,
            name: "Vitamin C 1000mg",
            price: 15.99,
            originalPrice: 19.99,
            category: "Vitamins",
            image: "https://images.unsplash.com/photo-1550572017-edb73be26f50?auto=format&fit=crop&q=80&w=400",
            isOutOfStock: false
        },
        {
            id: 2,
            name: "First Aid Kit Pro",
            price: 29.99,
            category: "First Aid",
            image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400",
            isOutOfStock: false
        },
        {
            id: 3,
            name: "Digital Thermometer",
            price: 12.50,
            category: "Devices",
            image: "https://images.unsplash.com/photo-1584308666744-24d5e16541f5?auto=format&fit=crop&q=80&w=400",
            isOutOfStock: true
        },
        {
            id: 4,
            name: "Protein Powder Isolate",
            price: 45.00,
            originalPrice: 55.00,
            category: "Supplements",
            image: "https://images.unsplash.com/photo-1593095948074-a6984e4f509e?auto=format&fit=crop&q=80&w=400",
            isOutOfStock: false
        }
    ];

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
                    {featuredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
