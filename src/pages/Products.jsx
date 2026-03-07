import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products and categories concurrently
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/products'),
                    axios.get('http://localhost:8000/api/categories')
                ]);

                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load products. Please try again later.");
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter products based on selected category
    const filteredProducts = selectedCategory
        ? products.filter(product => product.category_id === parseInt(selectedCategory))
        : products;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-text-dark mb-6">Our Products</h1>

            {/* Filters */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <select
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-text-muted">Loading products...</div>
                ) : error ? (
                    <div className="col-span-full py-12 text-center text-red-500">{error}</div>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={{
                                id: product.id,
                                name: product.name,
                                price: parseFloat(product.price),
                                category: product.category?.name || 'Healthcare',
                                image: product.pictures?.length > 0 ? product.pictures[0].image_path : null,
                                isOutOfStock: product.is_expired
                            }}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-text-muted">No products found for this category.</div>
                )}
            </div>
        </div>
    );
};

export default Products;
