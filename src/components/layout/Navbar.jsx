import React, { useState, useContext, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X, LogOut, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import axios from 'axios';
import Swal from 'sweetalert2';

// --- Sub-components (Defined outside to prevent re-mounting & focus loss) ---

const SearchBar = ({ 
    searchQuery, setSearchQuery, isSearching, 
    showSearchResults, setShowSearchResults, 
    searchResults, handleResultClick 
}) => (
    <div className="flex-grow max-w-md w-full relative search-container">
        <form className="flex w-full" onSubmit={(e) => e.preventDefault()}>
            <div className="relative w-full group">
                <input
                    type="text"
                    placeholder="Products or Health tips..."
                    className="w-full px-3 py-1.5 border border-primary-green border-r-0 rounded-l cursor-text focus:outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-medium text-xs lg:text-sm text-text-dark placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                />
                {searchQuery.length > 0 && (
                    <button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
            <button type="submit" className="bg-primary-green hover:bg-accent-green text-white px-3 py-1.5 rounded-r transition-colors flex items-center justify-center min-w-[40px] lg:min-w-[48px]">
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
        </form>

        {/* Search Results Dropdown */}
        {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto scrollbar-hide">
                    {searchResults.length > 0 ? (
                        <div className="p-2 space-y-1">
                            {searchResults.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full flex items-center gap-3 lg:gap-4 p-2 hover:bg-slate-50 rounded-md transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                                        {result.image ? (
                                            <img src={result.image} alt={result.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Search size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] lg:text-[9px] font-black uppercase tracking-tighter border ${
                                                result.type === 'product' 
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                    : 'bg-purple-50 text-purple-600 border-purple-100'
                                            }`}>
                                                {result.type}
                                            </span>
                                            {result.category && (
                                                <span className="text-[10px] text-slate-400 font-medium truncate italic">
                                                    {result.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-xs lg:text-sm font-bold text-slate-700 truncate group-hover:text-primary-green transition-colors">
                                            {result.name}
                                        </h4>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-slate-400 italic text-xs lg:text-sm">
                            No results found for "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);

const IconsRow = ({ wishlistCount, cartCount, isLoading, isLoggedIn, user }) => (
    <div className="flex items-center gap-3 lg:gap-6">
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

        {!isLoading ? (
            <Link 
                to={isLoggedIn ? (['admin', 'staff', 'pharmacist', 'superadmin'].includes(user?.role) ? "/admin" : "/profile") : "/login"} 
                className="text-text-dark hover:text-accent-green transition-transform hover:-translate-y-1 duration-300"
            >
                <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                    {user?.profile ? (
                        <img src={user.profile.startsWith('http') ? user.profile : `http://127.0.0.1:8000/storage/${user.profile}`} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={18} />
                    )}
                </div>
            </Link>
        ) : (
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50">
                <div className="w-4 h-4 border-2 border-primary-green/30 border-t-primary-green rounded-full animate-spin"></div>
            </div>
        )}
    </div>
);

const NavLinksList = ({ mobile = false, navLinks, isActive, setIsMobileMenuOpen, isLoggedIn, isLoading, user, handleLogout }) => (
    <ul className={`${mobile ? 'flex flex-col items-center py-6 space-y-4' : 'flex items-center gap-6'}`}>
        {navLinks.map((link) => (
            <li key={link.name}>
                <Link
                    to={link.path}
                    onClick={() => mobile && setIsMobileMenuOpen(false)}
                    className={`block font-bold text-sm lg:text-[15px] transition-all hover:text-accent-green hover:-translate-y-0.5 duration-300 py-1 ${isActive(link.path) ? 'text-accent-green' : 'text-text-dark'}`}
                >
                    {link.name}
                </Link>
            </li>
        ))}

        {isLoggedIn && !isLoading && user && (
            <>
                {['admin', 'staff', 'pharmacist', 'superadmin'].includes(user?.role) ? (
                    <li>
                        <Link 
                            to="/admin" 
                            onClick={() => mobile && setIsMobileMenuOpen(false)}
                            className="block font-bold text-sm lg:text-[15px] transition-all hover:text-accent-green hover:-translate-y-0.5 duration-300 text-text-dark"
                        >
                            Admin Dashboard
                        </Link>
                    </li>
                ) : (
                    <li>
                        <Link 
                            to="/profile" 
                            onClick={() => mobile && setIsMobileMenuOpen(false)}
                            className="block font-bold text-sm lg:text-[15px] transition-all hover:text-accent-green hover:-translate-y-0.5 duration-300 text-text-dark"
                        >
                            User Dashboard
                        </Link>
                    </li>
                )}
                <li className={mobile ? 'pt-2' : ''}>
                    <button
                        onClick={() => {
                            handleLogout();
                            if (mobile) setIsMobileMenuOpen(false);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-1.5 rounded-[4px] font-black uppercase tracking-widest text-[10px] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
                    >
                        Logout
                    </button>
                </li>
            </>
        )}

        {!isLoggedIn && !isLoading && (
            <li>
                <Link to="/login" onClick={() => mobile && setIsMobileMenuOpen(false)}>
                    <button className="bg-primary-green hover:bg-accent-green text-white px-6 py-1.5 rounded-[4px] font-black uppercase tracking-widest text-[10px] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300">
                        Login
                    </button>
                </Link>
            </li>
        )}

        {isLoading && (
            <li>
                <div className="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
            </li>
        )}
    </ul>
);

// --- Main Navbar Component ---

const Navbar = () => {
    const { settings } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const { user, token, logout, isLoading } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const { wishlistCount } = useContext(WishlistContext);

    const isLoggedIn = !!token;
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/api/search?q=${searchQuery}`);
                    setSearchResults(response.data);
                    setShowSearchResults(true);
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 150);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleResultClick = (result) => {
        setSearchQuery('');
        setShowSearchResults(false);
        if (result.type === 'product') {
            navigate(`/products/${result.id}`);
        } else {
            navigate(`/health-tips/${result.id}`);
        }
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.search-container')) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Health-Tips', path: '/health-tips' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Logout Confirmation',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            await logout();
            navigate('/');
            
            Swal.fire({
                icon: 'success',
                title: 'Logged Out',
                text: 'You have been successfully signed out.',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    }

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                {/* Desktop Header: Logo spanning both rows + Right side vertical stack */}
                <div className="hidden lg:flex items-center justify-between py-2">
                    {/* Left: Big Logo */}
                    <Link to="/" className="flex items-center gap-1 group transition-all shrink-0">
                        <div className="relative h-10 lg:h-13 w-auto flex items-center">
                            {settings.site_logo ? (
                                <img src={`http://127.0.0.1:8000/storage/${settings.site_logo}`} alt="Logo" className="h-full w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
                            ) : (
                                <img src="http://localhost/VitalCare/image/VitalCare_Logo.png" alt="VitalCare Logo" className="h-full w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
                            )}
                        </div>
                        <span className="text-primary-green font-black text-lg lg:text-2xl tracking-tighter leading-none group-hover:text-accent-green transition-colors">
                            VitalCare Pharmacy
                        </span>
                    </Link>

                    {/* Right: Vertical Stack */}
                    <div className="flex flex-col items-end gap-2">
                        {/* Row 1: Search & Icons */}
                        <div className="flex items-center gap-4 lg:gap-6">
                            <SearchBar 
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                isSearching={isSearching}
                                showSearchResults={showSearchResults}
                                setShowSearchResults={setShowSearchResults}
                                searchResults={searchResults}
                                handleResultClick={handleResultClick}
                            />
                            <IconsRow 
                                wishlistCount={wishlistCount}
                                cartCount={cartCount}
                                isLoading={isLoading}
                                isLoggedIn={isLoggedIn}
                                user={user}
                            />
                        </div>

                        {/* Row 2: Navigation Links */}
                        <div className="flex justify-end">
                            <NavLinksList 
                                navLinks={navLinks}
                                isActive={isActive}
                                isLoggedIn={isLoggedIn}
                                isLoading={isLoading}
                                user={user}
                                handleLogout={handleLogout}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Header (Now with text logo) */}
                <div className="lg:hidden flex items-center justify-between py-2">
                    {/* Logo (Icon + Text for mobile) */}
                    <Link to="/" className="flex items-center gap-1 group shrink-0">
                         <div className="h-8 w-auto flex items-center">
                            {settings.site_logo ? (
                                <img src={`http://127.0.0.1:8000/storage/${settings.site_logo}`} alt="Logo" className="h-full w-auto object-contain" />
                            ) : (
                                <img src="http://localhost/VitalCare/image/VitalCare_Logo.png" alt="Logo" className="h-full w-auto object-contain" />
                            )}
                        </div>
                        <span className="text-primary-green font-black text-base tracking-tighter leading-none">
                            VitalCare Pharmacy
                        </span>
                    </Link>

                    {/* Mobile Hamburger Button */}
                    <button
                        className="text-text-dark p-2 hover:bg-slate-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>

                {/* Mobile Second Row: Search Bar & Icons (Always visible on mobile) */}
                <div className="lg:hidden flex items-center gap-3 pb-3 border-t border-gray-50 pt-2">
                    <SearchBar 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isSearching={isSearching}
                        showSearchResults={showSearchResults}
                        setShowSearchResults={setShowSearchResults}
                        searchResults={searchResults}
                        handleResultClick={handleResultClick}
                    />
                    <IconsRow 
                        wishlistCount={wishlistCount}
                        cartCount={cartCount}
                        isLoading={isLoading}
                        isLoggedIn={isLoggedIn}
                        user={user}
                    />
                </div>

                {/* Mobile Menu Content (Toggled) */}
                <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden border-t border-gray-100 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <NavLinksList 
                        mobile={true}
                        navLinks={navLinks}
                        isActive={isActive}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        isLoggedIn={isLoggedIn}
                        isLoading={isLoading}
                        user={user}
                        handleLogout={handleLogout}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
