import React, { useContext, useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
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
    Truck,
    Plus,
    BarChart3,
    UserCircle,
    Palette,
    Info
} from 'lucide-react';

const AdminSidebar = ({ isOpen }) => {
    const { settings } = useSettings();
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
        const result = await Swal.fire({
            title: 'Logout Confirmation',
            text: 'Are you sure you want to sign out from the Admin Panel?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            await logout();
            navigate('/login');

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
    };

    const isPathActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    // Nav structure resembling the screenshot
    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <Gauge size={20} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
        { 
            name: 'Financial Reports', 
            icon: <BarChart3 size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin'],
            children: [
                { name: 'Summary Overview', path: '/admin/reports', icon: <BarChart3 size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] },
                { name: 'Profit & Loss Ledger', path: '/admin/profit-loss', icon: <History size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] }
            ]
        },
        { 
            name: 'Inventory', 
            icon: <Boxes size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'staff', 'pharmacist'],
            children: [
                { name: 'Manage Products', path: '/admin/products', icon: <Pill size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'Categories', path: '/admin/categories', icon: <Tag size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'Unit Management', path: '/admin/units', icon: <Scale size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'Expired Items', path: '/admin/expired', icon: <AlertTriangle size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'Reorder Alerts', path: '/admin/reorder-alerts', icon: <Bell size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] }
            ]
        },
        { 
            name: 'Sales & Logistics', 
            icon: <ShoppingCart size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'staff', 'pharmacist'],
            children: [
                { name: 'Point of Sale', path: '/admin/pos', icon: <ShoppingCart size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'All Sales History', path: '/admin/orders', icon: <History size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'New Purchase', path: '/admin/purchases/create', icon: <ShoppingCart size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'Purchase History', path: '/admin/purchases', icon: <History size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] },
                { name: 'Suppliers', path: '/admin/suppliers', icon: <Truck size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] }
            ]
        },
        { 
            name: 'Promotions', 
            icon: <Percent size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'pharmacist'],
            children: [
                { name: 'All Promotions', path: '/admin/promotions', icon: <Tag size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'pharmacist'] },
                { name: 'Create Promotion', path: '/admin/promotions/create', icon: <Plus size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'pharmacist'] }
            ]
        },
        { 
            name: 'Health Tips', 
            icon: <BookOpen size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'pharmacist'],
            children: [
                { name: 'Health Tips Archive', path: '/admin/health-tips', icon: <ClipboardList size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'pharmacist'] },
                { name: 'Create New Tip', path: '/admin/health-tips/create', icon: <Plus size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'pharmacist'] }
            ]
        },
        { 
            name: 'User Management', 
            icon: <Users size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin'],
            children: [
                { name: 'Staff & Customers', path: '/admin/users', icon: <UserCircle size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] },
                { name: 'Activity Logs', path: '/admin/logs', icon: <History size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] }
            ]
        },
        { name: 'Contact Us', path: '/admin/messages', icon: <MessageSquare size={20} className="stroke-2" />, roles: ['admin', 'superadmin'] },

        { 
            name: 'Settings', 
            icon: <Settings size={20} className="stroke-2" />, 
            roles: ['admin', 'superadmin', 'staff', 'pharmacist'],
            children: [
                { name: 'Branding & UI', path: '/admin/branding', icon: <Palette size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] },
                { name: 'About Us Page', path: '/admin/about-settings', icon: <Info size={18} className="stroke-2" />, roles: ['admin', 'superadmin'] },
                { name: 'Account Profile', path: '/admin/account-settings', icon: <UserCircle size={18} className="stroke-2" />, roles: ['admin', 'superadmin', 'staff', 'pharmacist'] }
            ]
        },
    ];

    const filteredItems = navItems.filter(item => item.roles.includes(user?.role))
        .map(item => {
            if (item.children) {
                return {
                    ...item,
                    children: item.children.filter(child => child.roles.includes(user?.role))
                };
            }
            return item;
        })
        .filter(item => !item.children || item.children.length > 0);

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white h-screen shrink-0 border-r border-gray-200 flex flex-col transition-all duration-300 z-20`}>
            {/* Logo Area */}
            <Link 
                to="/"
                className={`h-[60px] min-h-[60px] flex items-center border-b border-gray-200 shrink-0 transition-all hover:opacity-80 active:scale-95 duration-200 ${!isOpen ? 'justify-center px-0' : 'px-4'}`}
            >
                <img 
                    src={settings.site_logo ? `http://127.0.0.1:8000/storage/${settings.site_logo}` : "http://localhost/VitalCare/image/VitalCare_Logo.png"} 
                    alt="Logo" 
                    className={`${!isOpen ? 'w-10 h-10' : 'w-8 h-8 mr-3'} object-contain transition-all`} 
                />
                {isOpen && (
                    <div className="flex flex-col">
                        <span className="font-bold text-primary-green text-[16px] leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                            {settings.site_name}
                        </span>
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
                                                isActiveMenu ? 'bg-primary-light text-primary-green' : 'text-gray-700 hover:bg-gray-50'
                                            } ${!isOpen && 'justify-center mx-1 px-0 py-3'}`}
                                            title={!isOpen ? item.name : ""}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`${isActiveMenu ? 'text-primary-green' : 'text-gray-500'}`}>
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
                                                            end={true}
                                                            title={!isOpen ? child.name : ""}
                                                            className={({ isActive }) => 
                                                                `flex items-center rounded-md font-medium text-sm transition-colors ${
                                                                    isOpen ? 'pl-12 pr-4 py-2.5 mx-2 w-[calc(100%-16px)]' : 'justify-center py-1.5 w-8'
                                                                } ${
                                                                    isActive 
                                                                    ? 'text-primary-green bg-primary-light/50' 
                                                                    : 'text-gray-600 hover:text-primary-green hover:bg-gray-50'
                                                                }`
                                                            }
                                                        >
                                                            {({ isActive }) => (
                                                                <>
                                                                    {child.icon && (
                                                                        <span className={`${isActive ? 'text-primary-green' : 'text-gray-500'} ${isOpen ? 'mr-3' : ''}`}>
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
                                                ? 'bg-gray-50 text-primary-green font-semibold' 
                                                : 'text-gray-700 hover:bg-gray-50 font-semibold'
                                            } ${!isOpen && 'justify-center mx-1 px-0 py-3'}`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span className={isActive ? 'text-primary-green' : 'text-gray-500 group-hover:text-primary-green'}>
                                                    {item.icon}
                                                </span>
                                                {isOpen && <span className="text-[15px]">{item.name}</span>}
                                            </>
                                        )}
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
