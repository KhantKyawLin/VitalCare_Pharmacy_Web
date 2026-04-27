import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import Button from '../common/Button';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const { user, token, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);

    const isLoggedIn = !!token;
    const wishlistCount = 0;

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Health-Tips', path: '/health-tips' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    }

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-3 lg:px-4">
                <div className="flex flex-col lg:flex-row items-center py-2">
                    {/* Logo Area */}
                    <div className="flex w-full lg:w-auto items-center justify-between">
                        <Link to="/" className="flex items-center text-primary-green font-bold text-xl leading-tight hover:text-accent-green transition-colors mr-10">
                            {/* Using local XAMPP url as placeholder, this can be served from backend later */}
                            <img src="http://localhost/VitalCare/image/VitalCare_Logo.png" alt="VitalCare Logo" className="h-10 mr-2" />
                            <span>VitalCare Pharmacy</span>
                        </Link>
                        
                        <button
                            className="lg:hidden text-text-dark p-2 focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Right Container */}
                    <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col flex-grow w-full mt-3 lg:mt-0`}>
                        {/* First Row - Search + Icons */}
                        <div className="flex flex-col lg:flex-row items-center justify-end w-full gap-4">
                            {/* Search Bar */}
                            <div className="flex-grow max-w-md w-full">
                                <form className="flex w-full" onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="search"
                                        placeholder="Products or Health tips..."
                                        className="w-full px-4 py-1.5 border border-primary-green border-r-0 rounded-l cursor-text focus:outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-medium text-sm text-text-dark placeholder:text-gray-400"
                                    />
                                    <button type="submit" className="bg-primary-green hover:bg-accent-green text-white px-4 py-1.5 rounded-r transition-colors flex items-center justify-center">
                                        <Search size={18} />
                                    </button>
                                </form>
                            </div>

                            {/* Icons */}
                            <div className="flex items-center gap-4 lg:gap-6 ml-2">
                                <Link to="/wishlist" className="text-text-dark hover:text-accent-green transition-transform hover:-translate-y-1 relative duration-300">
                                    <Heart size={20} />
                                    <span className="absolute -top-2 -right-2 bg-accent-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {wishlistCount}
                                    </span>
                                </Link>

                                <Link to="/cart" className="text-text-dark hover:text-accent-green transition-transform hover:-translate-y-1 relative duration-300">
                                    <ShoppingCart size={20} />
                                    <span className="absolute -top-2 -right-2 bg-accent-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {cartCount}
                                    </span>
                                </Link>

                                <Link to={isLoggedIn ? "/profile" : "/login"} className="text-text-dark hover:text-accent-green transition-transform hover:-translate-y-1 duration-300">
                                    <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                                        {user?.profile ? (
                                            <img src={user.profile.startsWith('http') ? user.profile : `http://127.0.0.1:8000/storage/${user.profile}`} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={18} />
                                        )}
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Second Row - Links */}
                        <div className="flex justify-center lg:justify-end mt-4 mb-1">
                            <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-6 w-full lg:w-auto mt-2 lg:mt-0 pt-2 lg:pt-0 border-t border-transparent lg:border-none">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className={`block py-2 lg:py-0 font-medium transition-colors hover:text-accent-green hover:-translate-y-0.5 duration-300 inline-block ${isActive(link.path) ? 'text-accent-green' : 'text-text-dark'}`}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}

                                {isLoggedIn ? (
                                    <>
                                        {user?.role === 'admin' || user?.role === 'staff' || user?.role === 'pharmacist' ? (
                                            <li className="nav-item">
                                                <Link to="/admin" className={`block py-2 lg:py-0 font-medium transition-colors hover:text-accent-green hover:-translate-y-0.5 duration-300 inline-block text-text-dark`}>
                                                    Admin Dashboard
                                                </Link>
                                            </li>
                                        ) : (
                                            <li className="nav-item">
                                                <Link to="/profile" className={`block py-2 lg:py-0 font-medium transition-colors hover:text-accent-green hover:-translate-y-0.5 duration-300 inline-block text-text-dark`}>
                                                    User Dashboard
                                                </Link>
                                            </li>
                                        )}
                                        <li className="mt-2 lg:mt-0 lg:ml-2">
                                            <button
                                                onClick={handleLogout}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded font-medium transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <li className="mt-2 lg:mt-0 lg:ml-2">
                                        <Link to="/login">
                                            <button className="bg-primary-green hover:bg-accent-green text-white px-5 py-1.5 rounded font-medium transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300">
                                                Login
                                            </button>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
