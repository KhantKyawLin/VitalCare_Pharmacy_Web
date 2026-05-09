import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/faqs', getConfig());
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
        try {
            if (currentFaq) {
                await axios.put(`http://127.0.0.1:8000/api/admin/faqs/${currentFaq.id}`, formData, getConfig());
                Swal.fire({ icon: 'success', title: 'Updated', text: 'FAQ updated successfully', timer: 1500, showConfirmButton: false });
            } else {
                await axios.post('http://127.0.0.1:8000/api/admin/faqs', formData, getConfig());
                Swal.fire({ icon: 'success', title: 'Created', text: 'FAQ created successfully', timer: 1500, showConfirmButton: false });
            }
            fetchFaqs();
            handleCloseModal();
        } catch (error) {
            Swal.fire('Error', 'Failed to save FAQ.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This FAQ will be removed permanently.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8DB600',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/faqs/${id}`, getConfig());
                Swal.fire('Deleted!', 'FAQ has been deleted.', 'success');
                fetchFaqs();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete FAQ.', 'error');
            }
        }
    };

    const togglePublish = async (faq) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/admin/faqs/${faq.id}`, {
                is_published: !faq.is_published
            }, getConfig());
            fetchFaqs();
        } catch (error) {
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
                    className="px-6 py-2.5 bg-primary-green text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary-green/20"
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
                        <div key={faq.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-primary-green/30 transition-all group">
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
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => togglePublish(faq)}
                                    title={faq.is_published ? "Unpublish" : "Publish"}
                                    className={`p-2 rounded-lg transition-colors ${faq.is_published ? 'text-amber-500 hover:bg-amber-50' : 'text-primary-green hover:bg-primary-green/10'}`}
                                >
                                    {faq.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button 
                                    onClick={() => handleOpenModal(faq)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(faq.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
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
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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
                                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-bold"
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
                                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-green/20 transition-all resize-none leading-relaxed font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
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
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-primary-green text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary-green/20"
                                >
                                    <Save size={16} /> Save FAQ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFaqList;
