import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, 
    User, 
    Calendar, 
    Clock, 
    Share2, 
    TrendingUp, 
    ShieldCheck,
    MessageSquare,
    Facebook,
    Twitter,
    Linkedin
} from 'lucide-react';

const HealthTipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/health-tips/${id}`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tip:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A3C93A]"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Article not found</h2>
                <Link to="/health-tips" className="mt-4 inline-block text-[#A3C93A] font-bold">Back to Health Tips</Link>
            </div>
        );
    }

    const { tip, related } = data;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Navigation Header */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <button 
                        onClick={() => navigate('/health-tips')}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#A3C93A] font-bold text-sm transition-colors"
                    >
                        <ChevronLeft size={18} /> Back to Insights
                    </button>
                </div>
            </div>

            {/* Article Header */}
            <div className="container mx-auto px-4 pt-12 pb-8 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-[#A3C93A]/10 text-[#A3C93A] text-xs font-black uppercase tracking-widest rounded-[4px]">Medical Guide</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar size={14} /> {new Date(tip.created_at).toLocaleDateString()}
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
                    {tip.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#A3C93A]/10 flex items-center justify-center text-[#A3C93A]">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">Written By</p>
                            <p className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                                {tip.author?.name || 'Pharmacy Medical Team'}
                                <ShieldCheck size={16} className="text-blue-500" />
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Share:</span>
                        <button className="w-9 h-9 flex items-center justify-center rounded-[4px] border border-gray-200 text-gray-500 hover:bg-[#A3C93A] hover:text-white hover:border-[#A3C93A] transition-all">
                            <Facebook size={18} />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-[4px] border border-gray-200 text-gray-500 hover:bg-[#A3C93A] hover:text-white hover:border-[#A3C93A] transition-all">
                            <Twitter size={18} />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-[4px] border border-gray-200 text-gray-500 hover:bg-[#A3C93A] hover:text-white hover:border-[#A3C93A] transition-all">
                            <Linkedin size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
                {/* Article Body */}
                <article className="lg:col-span-8">
                    {tip.image_path && (
                        <div className="rounded-[4px] overflow-hidden shadow-xl mb-12 border border-gray-100">
                            <img 
                                src={`http://127.0.0.1:8000/storage/${tip.image_path}`} 
                                alt={tip.title}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed text-gray-700 leading-loose">
                        {tip.content.split('\n').map((paragraph, index) => (
                            paragraph.trim() && <p key={index} className="mb-6">{paragraph}</p>
                        ))}
                    </div>

                    {/* Feedback Box */}
                    <div className="mt-16 p-8 bg-gray-50 rounded-[4px] border border-gray-100 border-l-4 border-l-[#A3C93A]">
                        <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <MessageSquare size={20} className="text-[#A3C93A]" /> Was this helpful?
                        </h4>
                        <p className="text-sm text-gray-500 mb-6 font-medium">Your feedback helps our medical team provide better health advice for everyone.</p>
                        <div className="flex gap-4">
                            <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-[4px] text-sm font-bold text-gray-600 hover:border-[#A3C93A] hover:text-[#A3C93A] transition-all shadow-sm">
                                Yes, very helpful
                            </button>
                            <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-[4px] text-sm font-bold text-gray-600 hover:border-red-400 hover:text-red-500 transition-all shadow-sm">
                                No, I need more info
                            </button>
                        </div>
                    </div>
                </article>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-10">
                    {/* Newsletter or CTA */}
                    <div className="bg-[#1a2332] rounded-[4px] p-8 text-white relative overflow-hidden group shadow-lg">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#A3C93A] rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-xl font-black mb-4 relative z-10">Stay Informed</h4>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10">Get the latest health alerts and medication tips delivered to your inbox weekly.</p>
                        <div className="space-y-3 relative z-10">
                            <input type="email" placeholder="Your email address" className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-[4px] outline-none focus:border-[#A3C93A] transition-all text-sm" />
                            <button className="w-full bg-[#A3C93A] text-white py-3 rounded-[4px] font-black uppercase text-xs tracking-widest hover:bg-[#8eb132] transition-colors">Subscribe Now</button>
                        </div>
                    </div>

                    {/* Related Articles */}
                    <div>
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-[#A3C93A]" /> Recommended
                        </h4>
                        <div className="space-y-6">
                            {related.map(item => (
                                <Link key={item.id} to={`/health-tips/${item.id}`} className="group flex gap-4">
                                    <div className="w-20 h-20 rounded-[4px] overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                                        <img 
                                            src={item.image_path ? `http://127.0.0.1:8000/storage/${item.image_path}` : "https://placehold.co/100x100"} 
                                            alt="" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h5 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#A3C93A] transition-colors leading-tight mb-1">
                                            {item.title}
                                        </h5>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default HealthTipDetail;
