import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ChevronRight, 
    Star, 
    Zap,
    TrendingUp,
    Heart,
    ShoppingCart,
    BookOpen,
    Calendar,
    User,
    Clock,
    Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';

const Home = () => {
    const [topSellers, setTopSellers] = useState([]);
    const [specialOffers, setSpecialOffers] = useState([]);
    const [healthTips, setHealthTips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            try {
                const [topRes, specialRes, tipsRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/products/top-sellers'),
                    axios.get('http://127.0.0.1:8000/api/products/special-offers'),
                    axios.get('http://127.0.0.1:8000/api/health-tips')
                ]);
                
                setTopSellers(topRes.data || []);
                setSpecialOffers(specialRes.data || []);
                setHealthTips(tipsRes.data?.slice(0, 4) || []);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching home data:", err);
                setError("Failed to load storefront data. Please try again.");
                setIsLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const SectionHeader = ({ title, subtitle, icon: Icon, linkTo, linkText }) => (
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} className="text-[#A3C93A] fill-[#A3C93A]" />
                    <span className="text-xs font-black text-[#A3C93A] uppercase tracking-widest">{subtitle}</span>
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">{title}</h2>
            </div>
            {linkTo && (
                <Link to={linkTo} className="group flex items-center gap-2 text-[#A3C93A] font-black text-sm uppercase tracking-widest hover:gap-3 transition-all">
                    {linkText} <ChevronRight size={18} strokeWidth={3} />
                </Link>
            )}
        </div>
    );

    const LoadingGrid = ({ count = 4 }) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[5/4] bg-gray-100 rounded-[4px] mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white">
            {/* Hero Section - Compact & Modern */}
            <header className="relative bg-[#F8FAFC] py-12 md:py-20 overflow-hidden">
                <div className="container mx-auto px-4 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-xl lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A3C93A]/10 text-[#A3C93A] rounded-full text-xs font-black uppercase tracking-widest mb-6">
                                <Zap size={14} className="fill-current" /> Fast Delivery Available
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-[1.1]">
                                Your Health, <br/>
                                Our <span className="text-[#A3C93A]">Priority.</span>
                            </h1>
                            <p className="text-lg text-gray-500 font-medium mb-10 max-w-lg leading-relaxed">
                                Access premium healthcare products and professional medical advice from the comfort of your home.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/products" className="px-8 py-4 bg-[#A3C93A] text-white rounded-[4px] font-black uppercase tracking-widest shadow-xl shadow-[#A3C93A]/20 hover:bg-[#8eb132] transition-all">
                                    Shop Now
                                </Link>
                                <Link to="/health-tips" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-[4px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                                    Health Tips
                                </Link>
                            </div>
                        </div>
                        
                        {/* Hero Image Container */}
                        <div className="lg:w-1/2 relative">
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                                <img 
                                    src="/VitalCare_Home.png" 
                                    alt="VitalCare Hero" 
                                    className="w-full h-auto object-cover"
                                    onError={(e) => e.target.src = "https://placehold.co/600x400/f8fafc/a3c93a?text=VitalCare+Pharmacy"}
                                />
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -bottom-6 -right-6 w-full h-full bg-[#A3C93A]/10 rounded-2xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Sellers Section */}
            <section className="container mx-auto px-4 lg:px-12 py-16">
                <SectionHeader 
                    title="Top Sellers" 
                    subtitle="Most Popular" 
                    icon={TrendingUp} 
                    linkTo="/products" 
                    linkText="View All Products"
                />
                {isLoading ? (
                    <LoadingGrid count={10} />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {topSellers.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Special Offers Section */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4 lg:px-12">
                    <SectionHeader 
                        title="Special Offers" 
                        subtitle="Exclusive Deals" 
                        icon={Star} 
                    />
                    {isLoading ? (
                        <LoadingGrid count={10} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {specialOffers.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Health Tips Section */}
            <section className="container mx-auto px-4 lg:px-12 py-16">
                <SectionHeader 
                    title="Health Tips" 
                    subtitle="Expert Advice" 
                    icon={BookOpen} 
                    linkTo="/health-tips" 
                    linkText="Read More Tips"
                />
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse bg-gray-50 aspect-[4/5] rounded-[4px]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {healthTips.map(tip => (
                            <Link 
                                key={tip.id} 
                                to={`/health-tips/${tip.id}`}
                                className="group bg-white rounded-[4px] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <img 
                                        src={tip.image_path ? `http://127.0.0.1:8000/storage/${tip.image_path}` : "https://placehold.co/400x225/f8fafc/a3c93a?text=Health+Tip"} 
                                        alt={tip.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-[2px] text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                        <Clock size={10} className="text-[#A3C93A]" /> 5 min
                                    </div>
                                </div>
                                <div className="p-4 flex-grow flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={10} className="text-gray-400" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(tip.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-[#A3C93A] transition-colors line-clamp-2 leading-snug">
                                        {tip.title}
                                    </h3>
                                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#A3C93A]/10 flex items-center justify-center text-[#A3C93A]">
                                            <User size={10} />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-600 truncate">{tip.author?.name || 'Medical Team'}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
