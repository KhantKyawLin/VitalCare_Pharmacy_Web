import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Filter, 
    Package, 
    ChevronRight, 
    ShoppingCart,
    Heart,
    Eye,
    ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');

    const fetchData = async (page = 1) => {
        setIsLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/products`, {
                    params: {
                        page,
                        category_id: selectedCategory,
                        search: search
                    }
                }),
                axios.get('http://127.0.0.1:8000/api/categories')
            ]);

            setProducts(productsRes.data.data);
            setTotalPages(productsRes.data.last_page);
            setCategories(categoriesRes.data);
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, selectedCategory]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchData(1);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20">
            {/* Header / Sub-Hero - Compact version */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-4 md:py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="hidden md:block">
                            <h1 className="text-xl font-black text-gray-900">Our Products</h1>
                        </div>

                        {/* Search & Filter Bar - Compact */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-grow md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-[4px] outline-none focus:ring-2 focus:ring-[#A3C93A]/10 focus:border-[#A3C93A] transition-all font-medium text-xs"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearch}
                                />
                            </div>
                            
                            <div className="relative">
                                <select 
                                    className="appearance-none bg-gray-50 border border-gray-200 pl-3 pr-8 py-2 rounded-[4px] outline-none focus:border-[#A3C93A] text-xs font-bold text-gray-600 cursor-pointer"
                                    value={selectedCategory}
                                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid - Compact */}
            <div className="container mx-auto px-4 py-4">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/3] bg-white rounded-[4px] mb-2 border border-gray-100"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[4px] border border-dashed border-gray-200">
                        <Package size={64} className="mx-auto text-gray-100 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-400 italic">No products found here.</h3>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="mt-16 flex justify-center items-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-3 bg-white border border-gray-200 rounded-[4px] text-gray-500 hover:text-[#A3C93A] disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-[4px] text-sm font-black transition-all ${
                                    currentPage === i + 1 
                                    ? 'bg-[#A3C93A] text-white shadow-lg shadow-[#A3C93A]/30' 
                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-3 bg-white border border-gray-200 rounded-[4px] text-gray-500 hover:text-[#A3C93A] disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
