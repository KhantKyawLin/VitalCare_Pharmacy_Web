import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    BookOpen, 
    ChevronLeft, 
    User, 
    Calendar, 
    Clock, 
    Star, 
    Edit, 
    Trash2, 
    Eye, 
    Share2, 
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Settings
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminHealthTipDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchTipDetails();
    }, [id]);

    const fetchTipDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/health-tips/${id}`, getConfig());
            setData(response.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to load health tip details.', 'error');
            navigate('/admin/health-tips');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${data.tip.title}". This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/health-tips/${id}`, getConfig());
                Swal.fire('Deleted!', 'Health tip has been deleted.', 'success');
                navigate('/admin/health-tips');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete health tip.', 'error');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A3C93A]"></div>
            </div>
        );
    }

    const { tip, related, stats } = data;

    return (
        <div className="space-y-6 pt-2 pb-20 max-w-[1200px] mx-auto px-4">
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#A3C93A]/10 rounded-lg">
                        <BookOpen size={28} className="text-[#A3C93A]" strokeWidth={2.5}/>
                    </div>
                    <h2 className="text-2xl text-gray-800 font-black tracking-tight">Health Tip Details</h2>
                </div>
                
                <button 
                    onClick={() => navigate('/admin/health-tips')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-gray-200 transition-all shadow-sm"
                >
                    <ChevronLeft size={18} /> Back to Health Tips
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Hero Image */}
                        <div className="relative aspect-[16/9] w-full">
                            {tip.image_path ? (
                                <img 
                                    src={`http://127.0.0.1:8000/storage/${tip.image_path}`} 
                                    alt={tip.title} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                    <BookOpen size={64} />
                                </div>
                            )}
                            <div className="absolute top-6 left-6">
                                <span className="bg-[#A3C93A] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[#A3C93A]/30 flex items-center gap-2">
                                    <ShieldCheck size={14}/> Verified Expert Content
                                </span>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="p-10">
                            <h1 className="text-4xl font-black text-[#A3C93A] leading-tight mb-6">
                                {tip.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-gray-100 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#A3C93A] border-2 border-white ring-2 ring-gray-50">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 leading-none">{tip.author?.name || 'Staff'}</p>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Pharmacist</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar size={16} />
                                    <span className="text-xs font-bold">{formatDate(tip.created_at)}</span>
                                </div>
                                {tip.updated_at !== tip.created_at && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={16} />
                                        <span className="text-xs font-bold italic">Updated {formatDate(tip.updated_at)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
                                {tip.content.split('\n').map((para, i) => para && (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related Health Tips */}
                    {related.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <TrendingUp size={20} className="text-red-500" />
                                <h3 className="text-lg font-black text-gray-800 tracking-tight">Related Health Tips</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {related.map(rel => (
                                    <div 
                                        key={rel.id} 
                                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 group cursor-pointer hover:shadow-md transition-all"
                                        onClick={() => navigate(`/admin/health-tips/${rel.id}`)}
                                    >
                                        <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
                                            {rel.image_path ? (
                                                <img src={`http://127.0.0.1:8000/storage/${rel.image_path}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                                                    <BookOpen size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between py-1">
                                            <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight group-hover:text-[#A3C93A] transition-colors">{rel.title}</h4>
                                            <button className="text-[11px] font-black text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Read More <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Sidebar Info */}
                <div className="space-y-6">
                    {/* Author Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-6">
                            <User size={18} className="text-gray-400" />
                            <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">About the Author</h3>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-3xl bg-[#A3C93A] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#A3C93A]/20">
                                <User size={40} />
                            </div>
                            <h4 className="text-lg font-black text-gray-800">{tip.author?.name || 'Staff Member'}</h4>
                            <p className="text-sm text-gray-500 font-bold mb-6">Certified Health Expert</p>
                            
                            <div className="w-full flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Tips</p>
                                    <p className="text-xl font-black text-gray-800">{tip.author?.health_tips_count || '1'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Experience</p>
                                    <p className="text-xl font-black text-gray-800">Expert</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-6">
                            <Settings size={18} className="text-gray-400" />
                            <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Actions</h3>
                        </div>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate(`/admin/health-tips/edit/${tip.id}`)}
                                className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-sm"
                            >
                                <Edit size={18} /> Edit This Tip
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm"
                            >
                                <Trash2 size={18} /> Delete This Tip
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-6">
                            <TrendingUp size={18} className="text-gray-400" />
                            <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Statistics</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Eye size={16} /> <span className="text-sm font-bold">Views:</span>
                                </div>
                                <span className="text-sm font-black text-gray-800">1,254</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Share2 size={16} /> <span className="text-sm font-bold">Shares:</span>
                                </div>
                                <span className="text-sm font-black text-gray-800">328</span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400" /> <span className="text-sm font-bold">Rating:</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-lg font-black text-gray-800">{stats.rating.toFixed(1)}</span>
                                    <div className="flex">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={12} className={s <= Math.round(stats.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHealthTipDetail;
