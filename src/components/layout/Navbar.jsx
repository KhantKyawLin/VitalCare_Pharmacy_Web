import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import Button from '../common/Button';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

// Temporary mock asset for logo
const Logo = () => (
    <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-bold text-xl mr-2">
        V
    </div>
);

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Get auth state from context
    const { user, token, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);

    // Derived states
    const isLoggedIn = !!token;
    // Replace with real counts later during Wishlist integration
    const wishlistCount = 0;

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Health Tips', path: '/health-tips' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];

    return (
        <nav className="bg-white border-b-2 border-light-grey sticky top-0 z-50">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex flex-col lg:flex-row lg:items-center py-2 lg:py-3 gap-2 lg:gap-0">

                    {/* Top Row: Logo, Search, Icons, Toggler */}
                    <div className="flex items-center justify-between w-full lg:w-auto lg:mr-8">
                        <Link to="/" className="flex items-center text-primary-green font-bold text-xl hover:text-accent-green transition-colors">
                            <Logo />
                            VitalCare Pharmacy
                        </Link>

                        <button
                            className="lg:hidden text-text-dark p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Desktop Right Side / Mobile Menu Content */}
                    <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row flex-grow w-full gap-4 pb-4 lg:pb-0`}>

                        {/* Search and Icons Row */}
                        <div className="flex flex-col lg:flex-row items-center lg:justify-end w-full gap-4">

                            {/* Search Bar */}
                            <form className="w-full lg:max-w-md flex" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="search"
                                    placeholder="Products or Health tips..."
                                    className="w-full px-4 py-2 border border-primary-green border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-green"
                                />
                                <button type="submit" className="bg-primary-green hover:bg-accent-green text-white px-4 py-2 rounded-r-md transition-colors">
                                    <Search size={20} />
                                </button>
                            </form>

                            {/* Action Icons */}
                            <div className="flex items-center gap-6 self-end lg:self-center mt-2 lg:mt-0">
                                <Link to="/wishlist" className="text-text-dark hover:text-accent-green transition-colors relative">
                                    <Heart size={24} />
                                    <span className="absolute -top-2 -right-2 bg-accent-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {wishlistCount}
                                    </span>
                                </Link>

                                <Link to="/cart" className="text-text-dark hover:text-accent-green transition-colors relative">
                                    <ShoppingCart size={24} />
                                    <span className="absolute -top-2 -right-2 bg-accent-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {cartCount}
                                    </span>
                                </Link>

                                <Link to={isLoggedIn ? "/profile" : "/login"} className="text-text-dark hover:text-accent-green transition-colors">
                                    <div className="w-7 h-7 bg-light-grey rounded-full flex items-center justify-center overflow-hidden">
                                        <User size={18} />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Bottom Row / Links */}
                        <div className="flex flex-col lg:flex-row w-full lg:justify-end mt-2 lg:mt-0 lg:border-t-0 border-t border-light-grey pt-2 lg:pt-0">
                            <ul className="flex flex-col lg:flex-row gap-2 lg:gap-6 w-full lg:w-auto">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className={`block py-2 lg:py-0 font-medium transition-colors ${isActive(link.path) ? 'text-accent-green' : 'text-text-dark hover:text-accent-green hover:-translate-y-0.5 inline-block transform duration-300'}`}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}

                                <li className="mt-2 lg:mt-0 lg:ml-2 flex flex-col lg:flex-row items-center gap-4">
                                    {isLoggedIn ? (
                                        <>
                                            <span className="text-sm font-medium text-text-muted hidden lg:inline-block">
                                                Hi, {user?.name?.split(' ')[0] || 'User'}
                                            </span>
                                            <button
                                                onClick={logout}
                                                className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors py-2 lg:py-0 w-full lg:w-auto"
                                            >
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </>
                                    ) : (
                                        <Link to="/login" className="w-full lg:w-auto">
                                            <Button variant="primary" size="sm" className="w-full">Login</Button>
                                        </Link>
                                    )}
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
