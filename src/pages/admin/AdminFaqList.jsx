import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
    HelpCircle, 
    Plus, 
    Edit2, 
    Trash2, 
    Eye, 
    EyeOff, 
    GripVertical, 
    Save, 
    X,
    CheckCircle2,
    MessageCircleQuestion
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminFaqList = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentFaq, setCurrentFaq] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        is_published: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState(null);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/faqs');
            setFaqs(response.data);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (faq = null) => {
        if (faq) {
            setCurrentFaq(faq);
            setFormData({
                question: faq.question,
                answer: faq.answer,
                is_published: !!faq.is_published
            });
        } else {
            setCurrentFaq(null);
            setFormData({
                question: '',
                answer: '',
                is_published: true
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentFaq(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (currentFaq) {
                await api.put(`/admin/faqs/${currentFaq.id}`, formData);
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Updated', 
                    text: 'FAQ updated successfully', 
                    timer: 2000, 
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } else {
                await api.post('/admin/faqs', formData);
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Created', 
                    text: 'FAQ created successfully', 
                    timer: 2000, 
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
            fetchFaqs();
            handleCloseModal();
        } catch (error) {
            Swal.fire('Error', 'Failed to save FAQ.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewFaq = (faq) => {
        setSelectedFaq(faq);
        setViewModalOpen(true);
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setSelectedFaq(null);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This FAQ will be removed permanently.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8DB600',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/faqs/${id}`);
                Swal.fire('Deleted!', 'FAQ has been deleted.', 'success');
                fetchFaqs();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete FAQ.', 'error');
            }
        }
    };

    const togglePublish = async (faq) => {
        const originalStatus = faq.is_published;
        // Optimistic Update: Change local state immediately for a smooth experience
        setFaqs(faqs.map(f => f.id === faq.id ? { ...f, is_published: !originalStatus } : f));
        
        try {
            await api.put(`/admin/faqs/${faq.id}`, {
                is_published: !originalStatus
            });
        } catch (error) {
            // Revert state if API fails
            setFaqs(faqs.map(f => f.id === faq.id ? { ...f, is_published: originalStatus } : f));
            Swal.fire('Error', 'Failed to update status.', 'error');
        }
    };

    return (
        <div className="space-y-6 pt-2 pb-12 max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-green p-1.5 rounded-full text-white">
                        <MessageCircleQuestion size={20} className="stroke-2" />
                    </div>
                    <div>
                        <h2 className="text-[22px] text-gray-800 font-bold uppercase tracking-tight">FAQ Management</h2>
                        <p className="text-xs text-gray-500 font-medium">Control the frequently asked questions on the storefront.</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-6 py-2.5 bg-primary-green text-white rounded font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary-green/20"
                >
                    <Plus size={16} /> Add New FAQ
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm"></div>
                    ))}
                </div>
            ) : faqs.length > 0 ? (
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={faq.id} className="bg-white p-5 rounded border border-gray-100 shadow-sm flex items-start gap-4 hover:border-primary-green/30 transition-all group">
                            <div className="mt-1 text-gray-300 cursor-grab active:cursor-grabbing">
                                <GripVertical size={20} />
                            </div>
                            <div className="flex-grow space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800 text-sm group-hover:text-primary-green transition-colors">{faq.question}</h3>
                                    {!faq.is_published && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[9px] font-black uppercase">Draft</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{faq.answer}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => togglePublish(faq)}
                                    title={faq.is_published ? "Unpublish" : "Publish"}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${faq.is_published ? 'bg-primary-green' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${faq.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                                <button 
                                    onClick={() => handleViewFaq(faq)}
                                    className="p-1.5 border border-primary-green/30 text-primary-green hover:bg-primary-green hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                >
                                    <Eye size={14} strokeWidth={2.5} />
                                </button>
                                <button 
                                    onClick={() => handleOpenModal(faq)}
                                    className="p-1.5 border border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                >
                                    <Edit2 size={14} strokeWidth={2.5} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(faq.id)}
                                    className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                >
                                    <Trash2 size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded border-2 border-dashed border-gray-200">
                    <HelpCircle size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg font-bold text-gray-400 italic">No FAQs configured yet.</h3>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="mt-4 text-primary-green font-black uppercase text-[10px] tracking-widest hover:underline"
                    >
                        Create your first FAQ
                    </button>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm flex items-center gap-2">
                                {currentFaq ? <><Edit2 size={16} className="text-blue-500" /> Edit FAQ</> : <><Plus size={16} className="text-primary-green" /> New FAQ</>}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                                    placeholder="e.g. Do you accept credit cards?"
                                    className="w-full bg-slate-50 border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Answer</label>
                                <textarea 
                                    required
                                    value={formData.answer}
                                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                                    rows="5"
                                    placeholder="Provide a clear, detailed answer..."
                                    className="w-full bg-slate-50 border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-green/20 transition-all resize-none leading-relaxed font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded border border-gray-100">
                                <input 
                                    type="checkbox"
                                    id="is_published"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                                    className="w-4 h-4 rounded text-primary-green focus:ring-primary-green border-gray-300"
                                />
                                <label htmlFor="is_published" className="text-xs font-bold text-gray-700 cursor-pointer">Publish immediately (visible to all users)</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 border border-gray-200 rounded text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                 <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-primary-green text-white rounded font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {isSubmitting ? 'Saving...' : 'Save FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewModalOpen && selectedFaq && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary-green/5">
                            <h3 className="font-black text-primary-green uppercase tracking-widest text-sm flex items-center gap-2">
                                <HelpCircle size={18} /> FAQ Details
                            </h3>
                            <button onClick={closeViewModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-primary-green uppercase tracking-[0.2em] px-2 py-1 bg-primary-green/10 rounded">Question</span>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                    {selectedFaq.question}
                                </h2>
                            </div>
                            
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Answer</span>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                                        {selectedFaq.answer}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${selectedFaq.is_published ? 'bg-primary-green' : 'bg-gray-300'}`}></span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Status: {selectedFaq.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <button 
                                    onClick={closeViewModal}
                                    className="px-8 py-3 bg-gray-900 text-white rounded font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFaqList;
