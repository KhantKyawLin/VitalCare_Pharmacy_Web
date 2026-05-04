import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    History, 
    Settings, 
    LogOut,
    Store
} from 'lucide-react';

const UserSidebar = ({ isOpen }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isPathActive = (path) => {
        if (path === '/profile') return location.pathname === '/profile';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { name: 'Dashboard', path: '/profile', icon: <LayoutDashboard size={20} className="stroke-2" /> },
        { name: 'Order History', path: '/profile/orders', icon: <History size={20} className="stroke-2" /> },
        { name: 'Profile Settings', path: '/profile/settings', icon: <Settings size={20} className="stroke-2" /> },
    ];

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white h-screen shrink-0 border-r border-gray-200 flex flex-col transition-all duration-300 z-20`}>
            {/* Logo Area */}
            <Link 
                to="/"
                className={`h-[60px] min-h-[60px] flex items-center border-b border-gray-200 shrink-0 transition-all hover:opacity-80 active:scale-95 duration-200 ${!isOpen ? 'justify-center px-0' : 'px-4'}`}
            >
                <img src="http://localhost/VitalCare/image/VitalCare_Logo.png" alt="Logo" className={`${!isOpen ? 'w-10 h-10' : 'w-8 h-8 mr-3'} object-contain transition-all`} />
                {isOpen && (
                    <div className="flex flex-col">
                        <span className="font-bold text-[#A3C93A] text-lg leading-tight tracking-tight">Vital Care</span>
                        <span className="font-bold text-[#A3C93A] text-lg leading-tight tracking-tight">Pharmacy</span>
                    </div>
                )}
            </Link>

            {/* Navigation */}
            <nav className="flex-grow py-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
                <ul className="space-y-1">
                    {navItems.map((item, idx) => {
                        const isActiveMenu = isPathActive(item.path);

                        return (
                            <li key={idx} className="relative group">
                                <Link 
                                    to={item.path}
                                    className={`flex items-center justify-between px-4 py-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                                        isActiveMenu ? 'bg-green-50/50 text-[#6CA52C]' : 'text-gray-700 hover:bg-gray-50'
                                    } ${!isOpen && 'justify-center mx-1 px-0 py-3'}`}
                                    title={!isOpen ? item.name : ""}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`${isActiveMenu ? 'text-[#6CA52C]' : 'text-gray-500'}`}>
                                            {item.icon}
                                        </span>
                                        {isOpen && <span className={`font-semibold text-[15px]`}>{item.name}</span>}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}

                    <li className="my-4 mx-4 h-px bg-gray-100"></li>

                    <li className="relative group">
                        <Link 
                            to="/"
                            className={`flex items-center justify-between px-4 py-3 mx-2 rounded-lg cursor-pointer transition-colors text-gray-700 hover:bg-gray-50 ${!isOpen && 'justify-center mx-1 px-0 py-3'}`}
                            title={!isOpen ? "Back to Shop" : ""}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500">
                                    <Store size={20} className="stroke-2" />
                                </span>
                                {isOpen && <span className="font-semibold text-[15px]">Back to Shop</span>}
                            </div>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* User Profile / Logout bottom section */}
            <div className="p-4 border-t border-gray-200 mt-auto shrink-0 bg-white">
                <button
                    onClick={handleLogout}
                    className={`flex items-center text-red-500 hover:bg-red-50 hover:text-red-600 w-full rounded-md transition-colors ${isOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2'}`}
                    title={!isOpen ? "Logout" : "Logout"}
                >
                    <LogOut size={20} className="stroke-2 shrink-0" />
                    {isOpen && <span className="font-semibold whitespace-nowrap">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default UserSidebar;
