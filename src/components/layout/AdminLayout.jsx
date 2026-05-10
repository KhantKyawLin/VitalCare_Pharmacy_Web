import React, { useState, useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, User as UserIcon, UserCircle, Bell, AlertCircle, Package, X, Clock, ShoppingCart, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/notifications/alerts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.alerts);
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all relative ${isOpen ? 'bg-primary-green/10 text-primary-green' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >
                <Bell size={20} className={unreadCount > 0 ? 'animate-swing origin-top' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">Notifications</h3>
                            <span className="text-[10px] font-black bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-full uppercase">
                                {unreadCount} Alerts
                            </span>
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
                            {notifications.length > 0 ? (
                                notifications.map((notif, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            setIsOpen(false);
                                            if (notif.type === 'low_stock') {
                                                navigate('/admin/reorder-alerts');
                                            } else if (notif.type === 'expiring') {
                                                navigate('/admin/expired');
                                            } else if (notif.type === 'contact_message') {
                                                navigate('/admin/messages');
                                            } else if (notif.type === 'online_order') {
                                                navigate('/admin/orders?order_type=online&status=pending');
                                            }
                                        }}
                                        className="p-4 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 group"
                                    >
                                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                            notif.severity === 'danger' ? 'bg-red-50 text-red-500' : 
                                            notif.severity === 'warning' ? 'bg-amber-50 text-amber-500' :
                                            notif.severity === 'primary' ? 'bg-blue-50 text-blue-500' :
                                            'bg-emerald-50 text-emerald-500'
                                        }`}>
                                            {notif.type === 'low_stock' ? <Package size={18} /> : 
                                             notif.type === 'expiring' ? <Clock size={18} /> :
                                             notif.type === 'contact_message' ? <MessageSquare size={18} /> :
                                             <ShoppingCart size={18} />}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-gray-800 group-hover:text-primary-green transition-colors">{notif.title}</p>
                                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{notif.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center space-y-3">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400">All clear! No alerts.</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-gray-50 text-center">
                                <button 
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/admin/products');
                                    }}
                                    className="text-[10px] font-black text-primary-green uppercase tracking-widest hover:underline"
                                >
                                    View Inventory Management
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const AdminLayout = () => {
    const { user } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Format time: 04:30:25 PM
    const timeString = currentTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    });

    // Format date: Sunday, May 10, 2026
    const dateString = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="flex h-screen bg-[#f4f6f9] font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="print:hidden">
                <AdminSidebar isOpen={isSidebarOpen} />
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
                {/* Admin Header */}
                <header className="h-[60px] min-h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shrink-0 print:hidden">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleSidebar}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <Menu size={20} className="stroke-2" />
                        </button>

                        {/* LEFT: User Greeting (Active Account) */}
                        <div className="hidden md:flex items-center gap-4 border-l border-gray-100 pl-4 h-6">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1">Active Account</p>
                                <p className="text-xs font-bold text-gray-700">
                                    Welcome, <span className="text-primary-green font-black">{user?.name || 'System Admin'}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* RIGHT: Real-time Clock (Current Session) */}
                        <div className="hidden lg:flex items-center gap-4 border-r border-gray-100 pr-6 h-6">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1">Current Session</p>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[9px] font-black text-primary-green/70 bg-primary-green/5 px-2 py-0.5 rounded-full border border-primary-green/10">
                                        {dateString}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-gray-800">
                                        <Clock size={13} className="text-primary-green opacity-80" />
                                        <span className="text-xs font-black tabular-nums tracking-tight">{timeString}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Stock & Expiry Notifications */}
                        <div className="flex items-center gap-4">
                            <NotificationBell />

                            {/* Quick Action Profile */}
                            <Link 
                                to="/admin/account-settings"
                                title="Account Settings"
                                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all relative group border border-slate-200 p-0.5"
                            >
                                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
                                    {user?.profile ? (
                                        <img src={`http://127.0.0.1:8000/storage/${user.profile}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={18} className="text-slate-500 group-hover:text-primary-green transition-colors" />
                                    )}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-green border-2 border-white rounded-full z-10"></span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-grow p-6 overflow-y-auto w-full print:p-0">
                    <div className="max-w-full w-full mx-auto animate-in fade-in duration-300">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
