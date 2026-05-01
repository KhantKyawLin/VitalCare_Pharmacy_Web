import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, 
    User, 
    Star, 
    Clock, 
    ChevronRight, 
    MessageSquare, 
    Send, 
    LogIn,
    TrendingUp,
    Bookmark
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const HealthTipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);

    const [tip, setTip] = useState(null);
    const [relatedTips, setRelatedTips] = useState([]);
    const [popularTips, setPopularTips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Feedback State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTipDetail = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/health-tips/${id}`);
                setTip(response.data.tip);
                setRelatedTips(response.data.related || []);
                setPopularTips(response.data.popular || []);
                setIsLoading(false);
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Error fetching health tip detail:", err);
                setError("Failed to load article details.");
                setIsLoading(false);
            }
        };
        fetchTipDetail();
    }, [id]);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!token) {
            navigate('/login');
            return;
        }
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`http://127.0.0.1:8000/api/health-tips/${id}/feedback`, 
                { rating, comments: comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Refresh tip to show new feedback
            const response = await axios.get(`http://127.0.0.1:8000/api/health-tips/${id}`);
            setTip(response.data.tip);
            
            // Reset form
            setRating(0);
            setComment('');
            alert("Thank you for your feedback!");
        } catch (err) {
            console.error("Error submitting feedback:", err);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A3C93A]"></div>
            </div>
        );
    }

    if (error || !tip) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <p className="text-red-500 mb-4 font-bold">{error || "Article not found"}</p>
                <Link to="/health-tips" className="text-[#A3C93A] font-bold underline">Return to Health Tips</Link>
            </div>
        );
    }

    const avgRating = tip.feedbacks?.length > 0 
        ? (tip.feedbacks.reduce((acc, f) => acc + f.rating, 0) / tip.feedbacks.length).toFixed(1)
        : "0.0";

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Link to="/" className="hover:text-[#A3C93A]">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/health-tips" className="hover:text-[#A3C93A]">Health Tips</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 truncate max-w-[200px] md:max-w-none">{tip.title}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Main Content Area */}
                    <div className="lg:w-2/3">
                        {/* Featured Image */}
                        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-10 shadow-2xl">
                            <img 
                                src={tip.image_path ? `http://127.0.0.1:8000/storage/${tip.image_path}` : "https://placehold.co/1200x500/f8fafc/a3c93a?text=Health+Tip"} 
                                alt={tip.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-[4px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                <Clock size={14} className="text-[#A3C93A]" /> 5 min read
                            </div>
                        </div>

                        {/* Title & Stats */}
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                {tip.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star 
                                                key={star} 
                                                size={16} 
                                                className={star <= Math.round(avgRating) ? 'fill-current' : ''} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-900">{avgRating}</span>
                                    <span className="text-xs font-medium italic">({tip.feedbacks?.length || 0} feedbacks)</span>
                                </div>
                                <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                                    <Calendar size={16} className="text-[#A3C93A]" />
                                    <span>{new Date(tip.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                                    <User size={16} className="text-[#A3C93A]" />
                                    <span className="text-gray-900">{tip.author?.name || 'Medical Team'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium mb-16">
                            {tip.content?.split('\n').map((para, i) => (
                                <p key={i} className="mb-6">{para}</p>
                            ))}
                        </div>

                        {/* Feedback & Comments Section */}
                        <div className="mt-20 pt-16 border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-10">
                                <MessageSquare size={28} className="text-[#A3C93A]" />
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Feedback & Comments</h2>
                            </div>

                            {/* Share Your Feedback Card */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 mb-12">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Share Your Feedback</h3>
                                
                                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="transition-transform hover:scale-110 outline-none"
                                                >
                                                    <Star 
                                                        size={32} 
                                                        className={`${(hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Comment</label>
                                        <textarea 
                                            rows="4"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your thoughts about this health tip..."
                                            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[4px] focus:ring-2 focus:ring-[#A3C93A]/20 focus:border-[#A3C93A] outline-none transition-all font-medium text-gray-700 resize-none"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">Max 500 characters</p>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-[#A3C93A] text-[#A3C93A] rounded-[4px] font-black uppercase tracking-widest hover:bg-[#A3C93A] hover:text-white transition-all flex items-center justify-center gap-3"
                                    >
                                        {token ? (
                                            <>
                                                <Send size={18} strokeWidth={3} /> {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                            </>
                                        ) : (
                                            <>
                                                <LogIn size={18} strokeWidth={3} /> Log in to leave feedback
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Recent Feedback List */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Recent Feedback</h3>
                                {tip.feedbacks?.length > 0 ? (
                                    tip.feedbacks.map((f, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-[#A3C93A] border border-gray-200 group-hover:bg-[#A3C93A] group-hover:text-white transition-colors">
                                                <User size={24} />
                                            </div>
                                            <div className="flex-grow bg-white p-6 rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{f.user?.name || 'Anonymous User'}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                            {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex text-yellow-400">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star 
                                                                key={star} 
                                                                size={12} 
                                                                className={star <= f.rating ? 'fill-current' : 'text-gray-200'} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                                    {f.comments}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-400 italic font-medium">
                                        No feedback yet. Be the first to share your thoughts!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3 space-y-12">
                        {/* Related Tips */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Bookmark size={18} className="text-[#A3C93A] fill-[#A3C93A]" /> Related Tips
                            </h4>
                            <div className="space-y-6">
                                {relatedTips.map(rel => (
                                    <Link key={rel.id} to={`/health-tips/${rel.id}`} className="flex gap-4 group">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                            <img 
                                                src={rel.image_path ? `http://127.0.0.1:8000/storage/${rel.image_path}` : "https://placehold.co/100x100/f8fafc/a3c93a?text=Tip"} 
                                                alt="" 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>
                                        <h5 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#A3C93A] transition-colors mt-1">
                                            {rel.title}
                                        </h5>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Popular Tips */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <TrendingUp size={18} className="text-[#A3C93A]" /> Popular Tips
                            </h4>
                            <div className="space-y-6">
                                {popularTips.map(pop => (
                                    <Link key={pop.id} to={`/health-tips/${pop.id}`} className="flex gap-4 group">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                                            <img 
                                                src={pop.image_path ? `http://127.0.0.1:8000/storage/${pop.image_path}` : "https://placehold.co/100x100/f8fafc/a3c93a?text=Tip"} 
                                                alt="" 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/10"></div>
                                        </div>
                                        <div className="flex-grow">
                                            <h5 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#A3C93A] transition-colors mb-2">
                                                {pop.title}
                                            </h5>
                                            <div className="flex text-yellow-400">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={10} 
                                                        className={star <= 4 ? 'fill-current' : 'text-gray-200'} // Placeholder logic
                                                    />
                                                ))}
                                                <span className="text-[10px] text-gray-400 ml-1 font-bold">4.0</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthTipDetail;
