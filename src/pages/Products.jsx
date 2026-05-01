import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Filter, 
    Package, 
    ChevronRight, 
    ChevronLeft,
    SlidersHorizontal,
    RefreshCw,
    X,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    
    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');

    const fetchData = async (page = 1) => {
        setIsLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/products`, {
                    params: {
                        page,
                        category_id: selectedCategory,
                        search: appliedSearch,
                        type: selectedType !== 'all' ? selectedType : null
                    }
                }),
                axios.get('http://127.0.0.1:8000/api/categories')
            ]);

            setProducts(productsRes.data.data);
            setTotalPages(productsRes.data.last_page);
            setTotalResults(productsRes.data.total);
            setCategories(categoriesRes.data);
            setIsLoading(false);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error("Error fetching data:", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, selectedCategory, selectedType, appliedSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setAppliedSearch(search);
        setCurrentPage(1);
    };

    const handleClearAll = () => {
        setSearch('');
        setAppliedSearch('');
        setSelectedCategory('');
        setSelectedType('all');
        setCurrentPage(1);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (appliedSearch) count++;
        if (selectedCategory) count++;
        if (selectedType !== 'all') count++;
        return count;
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header & Filter Toggle */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 md:py-6 lg:px-12">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Our Products</h1>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                {totalResults} products found {selectedCategory && `in ${categories.find(c => c.id == selectedCategory)?.name}`} {selectedType !== 'all' && `(${selectedType.replace('_', ' ')})`}
                            </p>
                        </div>

                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] border-2 transition-all font-black uppercase tracking-widest text-xs ${showFilters ? 'bg-[#A3C93A] border-[#A3C93A] text-white' : 'bg-white border-[#A3C93A] text-[#A3C93A] hover:bg-[#A3C93A]/5'}`}
                        >
                            <SlidersHorizontal size={14} strokeWidth={3} />
                            Filters
                            {getActiveFiltersCount() > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 bg-white text-[#A3C93A] rounded-full text-[10px]">
                                    {getActiveFiltersCount()}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Expandable Filter Panel */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {/* Search */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input 
                                            type="text"
                                            placeholder="Keyword..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-[4px] outline-none focus:ring-2 focus:ring-[#A3C93A]/20 focus:border-[#A3C93A] font-bold text-xs text-gray-700"
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                    <select 
                                        value={selectedCategory}
                                        onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-[4px] outline-none focus:ring-2 focus:ring-[#A3C93A]/20 focus:border-[#A3C93A] font-bold text-xs text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Type</label>
                                    <select 
                                        value={selectedType}
                                        onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-[4px] outline-none focus:ring-2 focus:ring-[#A3C93A]/20 focus:border-[#A3C93A] font-bold text-xs text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="all">All Products</option>
                                        <option value="top_sellers">Top Selling Products</option>
                                        <option value="promotions">Promotional Items</option>
                                    </select>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-end gap-2 md:col-span-3 lg:col-span-1">
                                    <button 
                                        type="submit"
                                        className="flex-grow bg-[#A3C93A] text-white py-2.5 rounded-[4px] font-black uppercase tracking-widest text-[10px] hover:bg-[#8eb132] transition-all shadow-lg shadow-[#A3C93A]/20"
                                    >
                                        Apply Filters
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleClearAll}
                                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-400 rounded-[4px] font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all flex items-center gap-2"
                                    >
                                        <RefreshCw size={12} strokeWidth={3} /> Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 py-12 lg:px-12">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-[4/5] bg-gray-50 rounded-[4px] border border-gray-100"></div>
                                <div className="h-4 bg-gray-50 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-inner mb-6">
                            <Package size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 italic">Oops! No products match your criteria.</h3>
                        <p className="text-gray-400 font-medium mt-2">Try relaxing your filters or searching for something else.</p>
                        <button 
                            onClick={handleClearAll}
                            className="mt-8 px-6 py-3 bg-[#A3C93A] text-white rounded-[4px] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#A3C93A]/20 transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="mt-24 flex justify-center items-center gap-3">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-4 bg-white border-2 border-gray-100 rounded-[4px] text-gray-400 hover:text-[#A3C93A] hover:border-[#A3C93A] disabled:opacity-20 transition-all shadow-sm group"
                        >
                            <ChevronLeft size={24} strokeWidth={3} />
                        </button>
                        
                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-14 h-14 rounded-[4px] text-sm font-black transition-all ${
                                        currentPage === i + 1 
                                        ? 'bg-[#A3C93A] text-white shadow-2xl shadow-[#A3C93A]/40 scale-110' 
                                        : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-gray-300'
                                    }`}
                                >
                                    {(i + 1).toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-4 bg-white border-2 border-gray-100 rounded-[4px] text-gray-400 hover:text-[#A3C93A] hover:border-[#A3C93A] disabled:opacity-20 transition-all shadow-sm"
                        >
                            <ChevronRight size={24} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
