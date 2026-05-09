import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Mail, 
    MessageSquare, 
    Calendar, 
    Filter, 
    Search, 
    Eye, 
    CheckCircle, 
    Clock, 
    Trash2,
    ArrowUpDown,
    MoreVertical,
    ExternalLink,
    AlertCircle,
    User,
    ShoppingBag
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import Swal from 'sweetalert2';

const AdminMessages = () => {
    const { settings } = useSettings();
    const primaryColor = settings?.primary_color || '#8DB600';

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/contact-messages', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(response.data);
            
            // Notification for unread messages if any
            const unreadCount = response.data.filter(m => m.status === 'unread').length;
            if (unreadCount > 0) {
                Swal.fire({
                    title: 'New Messages!',
                    text: `You have ${unreadCount} unread contact inquiries.`,
                    icon: 'info',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 4000,
                    timerProgressBar: true,
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            Swal.fire('Error', 'Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/admin/contact-messages/${id}`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status });
            }
            Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesFilter = filter === 'all' || m.status === filter;
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             m.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'unread': return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
            case 'read': return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
            case 'replied': return { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                        <MessageSquare size={24} style={{ color: primaryColor }} />
                        Contact Inquiries
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Manage customer questions and feedback from the storefront.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-green/20 w-full md:w-64 transition-all"
                        />
                    </div>
                    <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                        {['all', 'unread', 'read', 'replied'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                                    filter === f ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Message List */}
                <div className={`${selectedMessage ? 'lg:col-span-4 hidden lg:block' : 'lg:col-span-12'} space-y-3`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-green rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Inbox...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                            <Mail size={48} className="text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No messages found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredMessages.map((msg) => {
                                const style = getStatusStyle(msg.status);
                                return (
                                    <div 
                                        key={msg.id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                                            selectedMessage?.id === msg.id 
                                            ? 'bg-white border-slate-900 shadow-md translate-x-1' 
                                            : 'bg-white border-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>
                                                    {msg.status}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        </div>
                                        <h3 className={`font-black text-sm mb-1 truncate ${msg.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {msg.subject}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium truncate">
                                            {msg.name} • {msg.email}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Message Detail View */}
                {selectedMessage && (
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Detail Header */}
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedMessage.name}</h3>
                                        <p className="text-sm font-bold text-slate-400">{selectedMessage.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedMessage.id, 'unread')}
                                        className={`p-2 rounded-lg transition-all ${selectedMessage.status === 'unread' ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                        title="Mark as Unread"
                                    >
                                        <AlertCircle size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedMessage.id, 'read')}
                                        className={`p-2 rounded-lg transition-all ${selectedMessage.status === 'read' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                        title="Mark as Read"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedMessage.id, 'replied')}
                                        className={`p-2 rounded-lg transition-all ${selectedMessage.status === 'replied' ? 'bg-green-50 text-green-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                        title="Mark as Replied"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                    <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block"></div>
                                    <button 
                                        onClick={() => setSelectedMessage(null)}
                                        className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Detail Body */}
                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inquiry Details</span>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} />
                                            <span className="text-[11px] font-bold">
                                                {new Date(selectedMessage.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date(selectedMessage.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                                            {selectedMessage.subject}
                                        </h4>
                                        {selectedMessage.order_id && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-green/10 text-primary-green text-xs font-black uppercase tracking-widest mb-4">
                                                <ShoppingBag size={14} />
                                                Order ID: {selectedMessage.order_id}
                                            </div>
                                        )}
                                        <div className="h-px bg-slate-200 w-full my-6"></div>
                                        <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <a 
                                        href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`}
                                        className="flex-1 py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Mail size={16} />
                                        Reply via Email
                                    </a>
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedMessage.id, 'replied')}
                                        className="px-8 py-4 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                                    >
                                        Archive Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
