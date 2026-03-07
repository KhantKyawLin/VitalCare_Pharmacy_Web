import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Send, MessageCircle } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-light-grey pt-12 pb-6 mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                    {/* About */}
                    <div>
                        <h5 className="text-primary-green font-bold text-lg mb-4">Vital Care Pharmacy</h5>
                        <p className="text-text-muted leading-relaxed">
                            Providing trusted healthcare products, expert advice, and reliable service for your family's wellness.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="text-primary-green font-bold text-lg mb-4">Quick Links</h5>
                        <div className="flex gap-8">
                            <ul className="space-y-2">
                                <li><Link to="/" className="text-text-muted hover:text-accent-green hover:-translate-y-0.5 inline-block transition-all">Home</Link></li>
                                <li><Link to="/products" className="text-text-muted hover:text-accent-green hover:-translate-y-0.5 inline-block transition-all">Products</Link></li>
                                <li><Link to="/health-tips" className="text-text-muted hover:text-accent-green hover:-translate-y-0.5 inline-block transition-all">Health-Tips</Link></li>
                            </ul>
                            <ul className="space-y-2">
                                <li><Link to="/about" className="text-text-muted hover:text-accent-green hover:-translate-y-0.5 inline-block transition-all">About Us</Link></li>
                                <li><Link to="/contact" className="text-text-muted hover:text-accent-green hover:-translate-y-0.5 inline-block transition-all">Contact Us</Link></li>
                                <li><Link to="/login" className="text-text-muted hover:text-accent-green hover:-translate-y-0.5 inline-block transition-all">Login/Register</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h5 className="text-primary-green font-bold text-lg mb-4">Contact Us</h5>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start text-text-muted">
                                <MapPin size={20} className="mr-3 mt-1 flex-shrink-0" />
                                <span>No.(410) Padonmar Street, Yangon</span>
                            </li>
                            <li className="flex items-center text-text-muted">
                                <Phone size={20} className="mr-3 flex-shrink-0" />
                                <span>+95 9 966 454 595</span>
                            </li>
                            <li className="flex items-center text-text-muted">
                                <Mail size={20} className="mr-3 flex-shrink-0" />
                                <span>support@vitalcare.com</span>
                            </li>
                        </ul>

                        {/* Social Icons */}
                        <div className="flex gap-4">
                            <a href="#" className="text-[#1877F2] hover:text-[#0e5ce4] hover:scale-110 transition-all" aria-label="Facebook">
                                <Facebook size={24} />
                            </a>
                            <a href="#" className="text-[#7360F2] hover:text-[#5946e0] hover:scale-110 transition-all" aria-label="Viber">
                                <MessageCircle size={24} />
                            </a>
                            <a href="#" className="text-[#0088CC] hover:text-[#0077b6] hover:scale-110 transition-all" aria-label="Telegram">
                                <Send size={24} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Copyright */}
                <div className="border-t border-light-grey pt-6 text-center">
                    <p className="text-text-muted text-sm">
                        &copy; {currentYear} Vital Care Pharmacy. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
