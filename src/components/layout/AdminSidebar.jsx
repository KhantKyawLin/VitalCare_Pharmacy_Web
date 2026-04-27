import React, { useContext, useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Pill, 
    ShoppingCart, 
    Users, 
    Settings, 
    LogOut, 
    Package, 
    BookOpen,
    ClipboardList,
    Percent,
    MessageSquare,
    History,
    ChevronDown,
    ChevronUp,
    Tag,
    Scale,
    AlertTriangle,
    Boxes,
    Gauge,
    Store,
    Bell,
    Truck
} from 'lucide-react';

const AdminSidebar = ({ isOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = location.pathname;

    // Map to keep track of expanded menus
    const [expandedMenu, setExpandedMenu] = useState({});

    // Synchronize expanded state with current route and enforce accordion behavior
    React.useEffect(() => {
        const findActiveParent = () => {
            for (const item of navItems) {
                if (item.children && item.children.some(child => currentPath.startsWith(child.path))) {
                    return item.name;
                }
            }
            return null;
        };

        const activeParentName = findActiveParent();
        if (activeParentName) {
            setExpandedMenu({ [activeParentName]: true });
        } else {
            // Collapse all dropdowns if we are on a standalone page
            setExpandedMenu({});
        }
    }, [currentPath]);

    const toggleMenu = (menuName) => {
        setExpandedMenu(prev => {
            // Accordion: If opening a new one, close all others.
            // If clicking the currently open one, toggle it.
            if (prev[menuName]) {
                return {};
            }
            return { [menuName]: true };
        });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isPathActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    // Nav structure resembling the screenshot
    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <Gauge size={20} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] },
        { 
            name: 'Inventory', 
            icon: <Boxes size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'staff'],
            children: [
                { name: 'Products', path: '/admin/products', icon: <Pill size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] },
                { name: 'Categories', path: '/admin/categories', icon: <Tag size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] },
                { name: 'Units', path: '/admin/units', icon: <Scale size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] },
                { name: 'Expired Items', path: '/admin/expired', icon: <AlertTriangle size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] },
                { name: 'Reorder Alerts', path: '/admin/reorder-alerts', icon: <Bell size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] }
            ]
        },
        { 
            name: 'Sales & Logistics', 
            icon: <ShoppingCart size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'staff'],
            children: [
                { name: 'Order History', path: '/admin/orders', icon: <History size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] },
                { name: 'New Purchase', path: '/admin/purchases/create', icon: <ShoppingCart size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] },
                { name: 'Purchase History', path: '/admin/purchases', icon: <History size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] },
                { name: 'Suppliers', path: '/admin/suppliers', icon: <Truck size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff'] }
            ]
        },
        { 
            name: 'Promotions', 
            icon: <Percent size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'staff'],
            path: '/admin/promotions'
        },
        { 
            name: 'Health Tips', 
            icon: <BookOpen size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'pharmacist'],
            path: '/admin/health-tips'
        },
        { name: 'User Management', path: '/admin/users', icon: <Users size={20} className="stroke-2" />, roles: ['admin', 'superadmin'] },
        { name: 'Contact Us', path: '/admin/messages', icon: <MessageSquare size={20} className="stroke-2" />, roles: ['admin', 'superadmin'] },
        { name: 'Activity Audit', path: '/admin/logs', icon: <History size={20} className="stroke-2" />, roles: ['admin', 'superadmin'] },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} className="stroke-2" />, roles: ['admin', 'superadmin'] },
    ];

    const filterRoles = (items) => {
        return items.filter(item => {
            if (!item.roles.includes(user?.role)) return false;
            // If it has children, filter them too
            if (item.children) {
                item.children = item.children.filter(child => child.roles.includes(user?.role));
                if (item.children.length === 0) return false;
            }
            return true;
        });
    };

    const filteredItems = filterRoles(navItems);

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
                    {filteredItems.map((item, idx) => {
                        const hasChildren = !!item.children;
                        const isExpanded = !!expandedMenu[item.name];
                        const isActiveMenu = hasChildren 
                            ? item.children.some(child => isPathActive(child.path))
                            : isPathActive(item.path);

                        return (
                            <li key={idx} className="relative group">
                                {hasChildren ? (
                                    <>
                                        <div 
                                            onClick={() => toggleMenu(item.name)}
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
                                            {isOpen && (
                                                <span className="text-gray-400">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Dropdown Children */}
                                        {isExpanded && (
                                            <ul className={`mt-1 space-y-1 mb-2 ${!isOpen ? 'flex flex-col' : ''}`}>
                                                {item.children.map((child, cIdx) => (
                                                    <li key={cIdx} className={`w-full flex ${!isOpen ? 'justify-start pl-8' : 'justify-center'}`}>
                                                        <NavLink
                                                            to={child.path}
                                                            title={!isOpen ? child.name : ""}
                                                            className={({ isActive }) => 
                                                                `flex items-center rounded-md font-medium text-sm transition-colors ${
                                                                    isOpen ? 'pl-12 pr-4 py-2.5 mx-2 w-[calc(100%-16px)]' : 'justify-center py-1.5 w-8'
                                                                } ${
                                                                    isActive 
                                                                    ? 'text-[#6CA52C] bg-green-50/50' 
                                                                    : 'text-gray-600 hover:text-[#6CA52C] hover:bg-gray-50'
                                                                }`
                                                            }
                                                        >
                                                            {({ isActive }) => (
                                                                <>
                                                                    {child.icon && (
                                                                        <span className={`${isActive ? 'text-[#6CA52C]' : 'text-gray-500'} ${isOpen ? 'mr-3' : ''}`}>
                                                                            {React.cloneElement(child.icon, { 
                                                                                size: isOpen ? 18 : 14,
                                                                                className: child.icon.props.className 
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                    {isOpen && <span>{child.name}</span>}
                                                                </>
                                                            )}
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        end={item.path === '/admin'}
                                        title={!isOpen ? item.name : ""}
                                        className={({ isActive }) => 
                                            `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                                                isActive 
                                                ? 'bg-[#f4f6f9] text-[#6CA52C] font-semibold' 
                                                : 'text-gray-700 hover:bg-gray-50 font-semibold'
                                            } ${!isOpen && 'justify-center mx-1 px-0 py-3'}`
                                        }
                                    >
                                        <span className={({ isActive }) => isActive ? 'text-[#6CA52C]' : 'text-gray-500 group-hover:text-[#6CA52C]'}>
                                            {item.icon}
                                        </span>
                                        {isOpen && <span className="text-[15px]">{item.name}</span>}
                                    </NavLink>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout Logic at Bottom */}
            <div className="p-4 border-t border-gray-200">
                <button 
                    onClick={handleLogout}
                    title={!isOpen ? 'Sign Out' : ''}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-semibold text-[15px] w-full ${
                        !isOpen && 'justify-center px-0'
                    }`}
                >
                    <LogOut size={20} className="stroke-2" />
                    {isOpen && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
