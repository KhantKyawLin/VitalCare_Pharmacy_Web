import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    BookOpen, 
    Plus, 
    Search, 
    Eye, 
    Edit, 
    Trash2, 
    User, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Star,
    MessageSquare,
    Users,
    List as ListIcon
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminHealthTipList = () => {
    const navigate = useNavigate();
    const [tips, setTips] = useState([]);
    const [metrics, setMetrics] = useState({
        total_tips: 0,
        total_feedbacks: 0,
        avg_rating: 0,
        authors_count: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const getConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchTips();
    }, [currentPage]);

    const fetchTips = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/health-tips`, {
                ...getConfig(),
                params: {
                    page: currentPage,
                    search: search
                }
            });
            setTips(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalResults(response.data.total);
            if (response.data.metrics) {
                setMetrics(response.data.metrics);
            }
        } catch (error) {
            console.error("Error fetching health tips:", error);
            Swal.fire('Error', 'Failed to load health tips.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchTips();
        }
    };

    const handleDelete = async (id, title) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${title}". This action cannot be undone.`,
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
                fetchTips();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete health tip.', 'error');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/admin/health-tips/${id}/toggle-status`, {}, getConfig());
            setTips(prev => prev.map(tip => tip.id === id ? { ...tip, is_published: !currentStatus } : tip));
        } catch (error) {
            Swal.fire('Error', 'Failed to update status.', 'error');
        }
    };

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] mx-auto px-4 sm:px-6">
            
            {/* Minimalist Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <BookOpen size={26} className="text-gray-800" strokeWidth={2.5}/>
                    <h2 className="text-[22px] text-gray-800 font-bold">Health Tips Management</h2>
                </div>
                <Link to="/admin/health-tips/create" className="bg-[#A3C93A] text-white px-5 py-2.5 rounded shadow flex items-center gap-2 hover:bg-[#8eb132] transition-colors text-[14px] font-bold">
                    <Plus size={18} strokeWidth={3}/> Add New Health Tip
                </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Tips</p>
                        <h3 className="text-3xl font-bold text-gray-800">{metrics.total_tips}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Published articles</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-[#A3C93A]">
                        <BookOpen size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Feedbacks</p>
                        <h3 className="text-3xl font-bold text-gray-800">{metrics.total_feedbacks}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">User interactions</p>
                    </div>
                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-500">
                        <MessageSquare size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Avg. Rating</p>
                        <h3 className="text-3xl font-bold text-gray-800">{Number(metrics.avg_rating).toFixed(1)}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Overall score</p>
                    </div>
                    <div className="bg-yellow-50 p-2.5 rounded-lg text-yellow-500">
                        <Star size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Active Authors</p>
                        <h3 className="text-3xl font-bold text-gray-800">{metrics.authors_count}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Staff contributors</p>
                    </div>
                    <div className="bg-purple-50 p-2.5 rounded-lg text-purple-500">
                        <Users size={24} />
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 mt-6 pt-5">
                {/* Table Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center px-6 pb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <ListIcon size={20} className="text-gray-800 font-bold"/>
                        <h3 className="text-lg font-bold text-gray-800">Health Tips Archive</h3>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex w-full md:w-72 rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#A3C93A] focus-within:ring-2 focus-within:ring-[#A3C93A]/30 transition-all bg-gray-50 focus-within:bg-white text-gray-600">
                            <button onClick={fetchTips} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#A3C93A] transition-colors">
                                <Search size={16} />
                            </button>
                            <input 
                                type="text" 
                                className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2.5 bg-transparent"
                                placeholder="Search tips..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-6">
                    <table className="w-full text-left text-[13px] whitespace-nowrap align-middle">
                        <thead className="text-gray-500 border-b-2 border-gray-100 bg-white sticky top-0 font-semibold">
                            <tr>
                                <th className="py-3 font-medium text-gray-600">No.</th>
                                <th className="py-3 font-medium text-gray-600">ID</th>
                                <th className="py-3 font-medium text-gray-600">Article</th>
                                <th className="py-3 font-medium text-gray-600">Preview</th>
                                <th className="py-3 font-medium text-gray-600">Author</th>
                                <th className="py-3 font-medium text-gray-600 text-center">Status</th>
                                <th className="py-3 font-medium text-gray-600">Published</th>
                                <th className="py-3 font-medium text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 align-middle">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-gray-100">
                                        <td colSpan="8" className="py-5"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : tips.length > 0 ? tips.map((tip, index) => {
                                const realIndex = (currentPage - 1) * 15 + index + 1;
                                const formattedId = `HT-${String(tip.id).padStart(4, '0')}`;
                                
                                return (
                                    <tr key={tip.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40 transition-colors group">
                                        <td className="py-3.5 text-gray-500">{realIndex}</td>
                                        <td className="py-3.5 text-gray-600 font-medium">{formattedId}</td>
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-8 rounded border border-gray-200 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                                                    {tip.image_path ? (
                                                        <img 
                                                            src={`http://127.0.0.1:8000/storage/${tip.image_path}`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <BookOpen size={16} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-700 truncate max-w-[200px]" title={tip.title}>{tip.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <p className="text-gray-500 truncate max-w-[300px]">
                                                {tip.content ? tip.content.replace(/<[^>]*>?/gm, '') : '-'}
                                            </p>
                                        </td>
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-[#A3C93A]">
                                                    <User size={12} />
                                                </div>
                                                <span className="text-gray-600">{tip.author?.name || 'Staff'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(tip.id, tip.is_published)}
                                                className={`px-3 py-1 rounded text-[11px] font-bold text-white shadow-sm transition-all min-w-[85px] ${
                                                    tip.is_published ? 'bg-[#1E8449] hover:bg-[#155d33]' : 'bg-gray-400 hover:bg-gray-500'
                                                }`}
                                            >
                                                {tip.is_published ? 'PUBLISHED' : 'DRAFT'}
                                            </button>
                                        </td>
                                        <td className="py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-500">{formatDate(tip.created_at)}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Verified</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 align-middle">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/admin/health-tips/${tip.id}`} className="p-1.5 border border-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition-colors shadow-sm bg-white">
                                                    <Eye size={14} strokeWidth={2.5}/>
                                                </Link>
                                                <Link to={`/admin/health-tips/edit/${tip.id}`} className="p-1.5 border border-[#A3C93A]/30 text-[#A3C93A] hover:bg-[#A3C93A] hover:text-white rounded transition-colors shadow-sm bg-white">
                                                    <Edit size={14} strokeWidth={2.5}/>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(tip.id, tip.title)}
                                                    className="p-1.5 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors shadow-sm bg-white"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center text-gray-500">
                                        No health tips found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modern Pagination Footer */}
                <div className="px-6 py-5 border-t border-gray-100 flex justify-between items-center text-[13px] text-gray-500 mt-2">
                    <div>
                        Page {currentPage} of {totalPages} <span className="mx-2">•</span> {totalResults} result(s)
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Previous
                        </button>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHealthTipList;
