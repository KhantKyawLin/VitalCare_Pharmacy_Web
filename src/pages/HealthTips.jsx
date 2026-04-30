import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    BookOpen, 
    Calendar, 
    User, 
    ChevronRight, 
    Search, 
    TrendingUp,
    Clock,
    Star
} from 'lucide-react';

const HealthTips = () => {
    const [tips, setTips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/health-tips');
                setTips(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching health tips:", error);
                setIsLoading(false);
            }
        };
        fetchTips();
    }, []);

    const filteredTips = tips.filter(tip => 
        tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.content.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A3C93A]"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#F9FAFB] min-h-screen">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-[#A3C93A]/10 text-[#A3C93A] text-xs font-black uppercase tracking-widest rounded-[4px]">Verified Articles</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                            Health Tips & <span className="text-[#A3C93A]">Professional Advice</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl">
                            Empower yourself with expert-reviewed medical advice, wellness guides, and practical tips for a healthier lifestyle.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-[4px] focus:ring-2 focus:ring-[#A3C93A]/20 focus:border-[#A3C93A] outline-none transition-all text-gray-700 font-medium"
                                placeholder="Search health topics, symptoms, or advice..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#A3C93A]" /> Latest Insights
                    </h2>
                    <span className="text-sm text-gray-500 font-bold">{filteredTips.length} tips found</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTips.map((tip) => (
                        <Link 
                            key={tip.id} 
                            to={`/health-tips/${tip.id}`}
                            className="group bg-white rounded-[4px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <img 
                                    src={tip.image_path ? `http://127.0.0.1:8000/storage/${tip.image_path}` : "https://placehold.co/800x450/f8fafc/a3c93a?text=Health+Tip"} 
                                    alt={tip.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-[4px] text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                    <Clock size={12} className="text-[#A3C93A]" /> 5 min read
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <Calendar size={12} /> {new Date(tip.created_at).toLocaleDateString()}
                                    </div>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#A3C93A] uppercase tracking-wider">
                                        <Star size={12} className="fill-current" /> Expert Pick
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#A3C93A] transition-colors line-clamp-2 leading-snug">
                                    {tip.title}
                                </h3>

                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                                    {tip.content ? tip.content.replace(/<[^>]*>?/gm, '') : ''}
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#A3C93A]/10 flex items-center justify-center text-[#A3C93A]">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter leading-none mb-1">Author</p>
                                            <p className="text-xs font-bold text-gray-700 leading-none">{tip.author?.name || 'Medical Team'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[#A3C93A] font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                                        Read More <ChevronRight size={14} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredTips.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[4px] border border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No articles found matching your search.</h3>
                        <button onClick={() => setSearch('')} className="mt-4 text-[#A3C93A] font-bold underline">Clear filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthTips;
