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
        <div className="flex justify-between items-end mb-10 gap-4">
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} className="text-primary-green fill-primary-green" />
                    <span className="text-xs font-black text-primary-green uppercase tracking-widest">{subtitle}</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 leading-tight">{title}</h2>
            </div>
            {linkTo && (
                <div className="flex-shrink-0 pb-2">
                    <Link to={linkTo} className="group flex items-center gap-1 text-primary-green font-black text-[10px] lg:text-sm uppercase tracking-widest hover:gap-2 transition-all whitespace-nowrap">
                        <span className="hidden sm:inline">{linkText}</span>
                        <span className="sm:hidden">{linkText.split(' ').slice(-1)}</span>
                        <ChevronRight size={16} strokeWidth={3} />
                    </Link>
                </div>
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
            {/* Hero Section - Modern & Interactive */}
            <header className="relative bg-[#fdfdfd] pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-green/5 -skew-x-12 translate-x-1/2 -z-0"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl -z-0"></div>

                <div className="container mx-auto px-4 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                        <div className="max-w-xl lg:w-1/2 animate-in fade-in slide-in-from-left duration-1000">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/50 backdrop-blur-sm text-primary-green rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary-green/10">
                                <Zap size={14} className="fill-current" /> Fast Delivery Available
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[0.95] tracking-tighter">
                                 Your Health,<br/>
                                <span className="text-primary-green italic">Our Priority.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-500 font-medium mb-10 max-w-lg leading-relaxed">
                                Access premium healthcare products and professional medical advice from the comfort of your home.
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-6">
                                <Link to="/products" className="px-10 py-5 bg-primary-green text-white rounded-[4px] font-black uppercase tracking-widest shadow-2xl shadow-primary-green/30 hover:bg-primary-dark hover:-translate-y-1 transition-all duration-300">
                                    Shop Now
                                </Link>
                                <Link to="/health-tips" className="group flex items-center gap-3 text-gray-900 font-black text-sm uppercase tracking-widest">
                                    Health Tips 
                                    <div className="w-10 h-10 rounded-[4px] border border-gray-200 flex items-center justify-center group-hover:border-primary-green group-hover:bg-primary-green group-hover:text-white transition-all duration-300">
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-8 opacity-60">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-green"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">100% Genuine</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-green"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Expert Advice</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-green"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Safe Payments</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Hero Image Container with Floating Animation */}
                        <div className="lg:w-1/2 relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
                            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-8 border-white group animate-float">
                                <img 
                                    src="/VitalCare_Home.png" 
                                    alt="VitalCare Hero" 
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => e.target.src = "https://placehold.co/800x600/f8fafc/8DB600?text=VitalCare+Pharmacy"}
                                />
                                
                                {/* Promo Overlay for Guests */}
                                {!localStorage.getItem('token') && (
                                    <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 animate-in slide-in-from-bottom duration-700 delay-1000">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 leading-tight">First Order?<br/><span className="text-primary-green uppercase tracking-tighter">Get 20% OFF</span></h4>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">Join our healthy family today!</p>
                                            </div>
                                            <Link to="/register" className="shrink-0 px-6 py-3 bg-gray-900 text-white rounded-[4px] text-xs font-black uppercase tracking-widest hover:bg-primary-green transition-all shadow-lg">
                                                Join Now
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Decorative background blobs */}
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-green/20 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute -top-10 -left-10 w-48 h-48 bg-accent-green/20 rounded-full blur-3xl -z-10"></div>
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
                                        <Clock size={10} className="text-primary-green" /> 5 min
                                    </div>
                                </div>
                                <div className="p-4 flex-grow flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={10} className="text-gray-400" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(tip.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-primary-green transition-colors line-clamp-2 leading-snug">
                                        {tip.title}
                                    </h3>
                                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green">
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

            {/* Guest CTA Section - 20% Off Promotion */}
            {!localStorage.getItem('token') && (
                <section className="container mx-auto px-4 lg:px-12 py-20">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative group">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-green/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="max-w-2xl text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md text-primary-green rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    <Star size={12} className="fill-current" /> Exclusive Welcome Offer
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-none tracking-tighter">
                                    Join us today & get <br/>
                                    <span className="text-primary-green underline decoration-primary-green/30 underline-offset-8">20% OFF</span> your first order.
                                </h2>
                                <p className="text-gray-400 text-lg font-medium mb-10 max-w-lg">
                                    Create your account in less than a minute and start saving on your essential healthcare needs.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <Link to="/register" className="px-10 py-5 bg-primary-green text-white rounded-[4px] font-black uppercase tracking-widest hover:bg-primary-dark hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-primary-green/20">
                                        Register Now
                                    </Link>
                                    <Link to="/login" className="px-10 py-5 bg-white/10 text-white border border-white/10 rounded-[4px] font-black uppercase tracking-widest hover:bg-white/20 transition-all duration-300">
                                        Login Instead
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="w-64 h-64 border-4 border-dashed border-white/10 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                                    <div className="w-48 h-48 border-4 border-white/5 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                                        <div className="w-32 h-32 bg-primary-green/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <Package size={48} className="text-primary-green animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
