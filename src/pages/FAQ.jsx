import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    HelpCircle, 
    ChevronDown, 
    ChevronUp, 
    Search,
    MessageCircle,
    Phone,
    Mail,
    Plus,
    Minus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQItem = ({ faq, isOpen, toggle }) => {
    return (
        <div className={`border-2 rounded-2xl transition-all duration-500 overflow-hidden ${isOpen ? 'border-primary-green bg-primary-green/[0.02] shadow-xl shadow-primary-green/5' : 'border-gray-100 bg-white hover:border-primary-green/30'}`}>
            <button 
                onClick={toggle}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-lg font-black transition-colors ${isOpen ? 'text-primary-green' : 'text-gray-800 group-hover:text-primary-green'}`}>
                    {faq.question}
                </span>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary-green text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-primary-green/10 group-hover:text-primary-green'}`}>
                    {isOpen ? <Minus size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-8 pb-8">
                    <div className="h-px w-full bg-gradient-to-r from-primary-green/20 to-transparent mb-6"></div>
                    <p className="text-gray-600 leading-relaxed font-medium text-base whitespace-pre-line">
                        {faq.answer}
                    </p>
                </div>
            </div>
        </div>
    );
};

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState(0); // Open first by default
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/faqs');
                setFaqs(response.data);
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            } finally {
                setLoading(true); // Wait a bit for smooth entrance
                setTimeout(() => setLoading(false), 500);
            }
        };
        fetchFaqs();
        window.scrollTo(0, 0);
    }, []);

    const filteredFaqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-slate-900 py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary-green rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-green rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
                </div>
                
                <div className="container mx-auto px-4 lg:px-12 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-green/10 border border-primary-green/20 rounded-full text-primary-green mb-6 animate-bounce">
                        <HelpCircle size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">How can we help?</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter">
                        Frequently Asked <br />
                        <span className="text-primary-green">Questions.</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed mb-10">
                        Find answers to common questions about our services, insurance policies, delivery options, and how we care for your health.
                    </p>

                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-0 bg-primary-green blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                            <Search className="ml-4 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search for answers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none outline-none px-4 py-3 font-bold text-gray-700 placeholder:text-gray-300"
                            />
                            <button className="bg-primary-green text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all">Search</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ List Section */}
            <div className="container mx-auto px-4 lg:px-12 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Column: List */}
                    <div className="lg:col-span-8 space-y-6">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <FAQItem 
                                    key={faq.id} 
                                    faq={faq} 
                                    isOpen={openIndex === index}
                                    toggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-400 italic">No matching questions found.</h3>
                                <p className="text-gray-400 mt-2">Try different keywords or contact our support team.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Contact CTA */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-primary-green p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary-green/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                                
                                <div className="relative z-10 space-y-6">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                                        <MessageCircle size={28} />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight leading-none">Still have <br />questions?</h3>
                                    <p className="text-white/80 font-medium text-sm leading-relaxed">
                                        Can't find the answer you're looking for? Please chat with our friendly team.
                                    </p>
                                    <div className="space-y-3 pt-4">
                                        <a href="tel:+123456789" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                            <div className="w-8 h-8 bg-white text-primary-green rounded-lg flex items-center justify-center">
                                                <Phone size={16} />
                                            </div>
                                            <span className="font-bold text-sm">+1 (234) 567-890</span>
                                        </a>
                                        <Link to="/contact" className="flex items-center gap-3 p-3 bg-white text-primary-green rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="w-8 h-8 bg-primary-green text-white rounded-lg flex items-center justify-center">
                                                <Mail size={16} />
                                            </div>
                                            <span className="font-black text-sm uppercase tracking-widest">Message Us</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] space-y-4">
                                <h4 className="font-black text-gray-800 uppercase tracking-widest text-[10px]">Office Hours</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Mon - Fri</span>
                                        <span className="text-gray-800 font-bold">8:00 AM - 10:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Sat - Sun</span>
                                        <span className="text-gray-800 font-bold">9:00 AM - 8:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter/Trust Footer */}
            <div className="container mx-auto px-4 lg:px-12 py-24 border-t border-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-3">
                        <h5 className="font-black text-gray-900 uppercase tracking-widest text-xs">Verified Pharmacists</h5>
                        <p className="text-gray-500 text-sm font-medium">All medical answers are reviewed by our licensed pharmacy team.</p>
                    </div>
                    <div className="space-y-3 border-x border-gray-100 px-12">
                        <h5 className="font-black text-gray-900 uppercase tracking-widest text-xs">Fast Support</h5>
                        <p className="text-gray-500 text-sm font-medium">Typical response time for new inquiries is under 2 hours.</p>
                    </div>
                    <div className="space-y-3">
                        <h5 className="font-black text-gray-900 uppercase tracking-widest text-xs">Secure Data</h5>
                        <p className="text-gray-500 text-sm font-medium">Your medical inquiries are kept strictly confidential and secure.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
