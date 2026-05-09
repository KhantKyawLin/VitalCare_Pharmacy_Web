import React, { useState, useEffect } from 'react';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send, 
    MessageCircle, 
    Clock, 
    ChevronRight,
    ShoppingBag,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import Swal from 'sweetalert2';

const Contact = () => {
    const { settings } = useSettings();
    const primaryColor = settings?.primary_color || '#8DB600';
    const accentColor = settings?.accent_color || '#7fa400';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        order_id: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/contact', formData);
            
            if (response.status === 201) {
                setSubmitted(true);
                Swal.fire({
                    icon: 'success',
                    title: 'Message Sent!',
                    text: 'Thank you for contacting us. We will get back to you shortly.',
                    confirmButtonColor: primaryColor,
                });
                setFormData({
                    name: '',
                    email: '',
                    subject: 'General Inquiry',
                    order_id: '',
                    message: ''
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.response?.data?.message || 'Something went wrong. Please try again later.',
                confirmButtonColor: primaryColor,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Header Section - Compact */}
            <div className="bg-white border-b border-slate-100 py-10 mb-8">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest mb-3">
                        <MessageCircle size={10} className="text-primary-green" />
                        Get In Touch
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                        Contact <span style={{ color: primaryColor }}>Our Team</span>
                    </h1>
                    <p className="text-slate-500 max-w-xl mx-auto text-xs lg:text-sm leading-relaxed">
                        Have a question? We're here to help you live a healthier life.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-700"></div>
                            
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 relative">
                                <Send size={20} style={{ color: primaryColor }} />
                                Send us a Message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Name</label>
                                        <input 
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            style={{ '--tw-ring-color': `${primaryColor}33` }}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                        <input 
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            style={{ '--tw-ring-color': `${primaryColor}33` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Type</label>
                                    <select 
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all appearance-none cursor-pointer"
                                        style={{ '--tw-ring-color': `${primaryColor}33` }}
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Order Inquiry">Order Inquiry</option>
                                        <option value="Product Question">Product Question</option>
                                        <option value="Feedback">Feedback</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Dynamic Order ID Field */}
                                {formData.subject === 'Order Inquiry' && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ShoppingBag size={12} /> Order ID
                                        </label>
                                        <input 
                                            type="text"
                                            name="order_id"
                                            value={formData.order_id}
                                            onChange={handleInputChange}
                                            required={formData.subject === 'Order Inquiry'}
                                            placeholder="e.g. ORD-12345"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            style={{ '--tw-ring-color': `${primaryColor}33` }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                                    <textarea 
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        placeholder="How can we help you?"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                                        style={{ '--tw-ring-color': `${primaryColor}33` }}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-[4px] text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                                    style={{ 
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 8px 12px -3px ${primaryColor}33`
                                    }}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </div>
                                    ) : (
                                        <>
                                            Submit Message
                                            <ChevronRight size={14} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Contact Info & Map */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Info Cards - Compact */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 transition-all hover:shadow-md">
                                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest mb-0.5">Our Location</h3>
                                    <p className="text-slate-500 text-[11px] leading-tight font-medium">
                                        123 Health Street, Yangon, Myanmar
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 transition-all hover:shadow-md">
                                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest mb-0.5">Call Us</h3>
                                    <p className="text-slate-500 text-[11px] leading-tight font-medium">
                                        +95 9 123 456 789
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 transition-all hover:shadow-md">
                                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest mb-0.5">Hours</h3>
                                    <p className="text-slate-500 text-[11px] leading-tight font-medium">
                                        Mon - Sat: 8:00 AM - 10:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Google Map Embed - Smaller */}
                        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[220px] relative group">
                            <iframe 
                                title="Vital Care Pharmacy Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122283.76569165313!2d96.0645089!3d16.8327116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30c1949e223e196b%3A0x56fbd271f808051e!2sYangon!5e0!3m2!1sen!2smm!4v1715230000000!5m2!1sen!2smm" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="grayscale transition-all duration-700 group-hover:grayscale-0"
                            ></iframe>
                            <div className="absolute top-4 left-4 pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-[4px] border border-slate-100 shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Live Map View</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
