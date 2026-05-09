import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, User as UserIcon, UserCircle, Bell, AlertCircle, Package, X, Clock } from 'lucide-react';
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
                                            navigate(notif.type === 'low_stock' ? `/admin/products?stock=low` : '/admin/expired');
                                        }}
                                        className="p-4 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 group"
                                    >
                                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notif.severity === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                            {notif.type === 'low_stock' ? <Package size={18} /> : <Clock size={18} />}
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

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
                    <div className="flex items-center">
                        <button 
                            onClick={toggleSidebar}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <Menu size={20} className="stroke-2" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Real-time Stock & Expiry Notifications */}
                        <NotificationBell />

                        {/* Quick Action Profile */}
                        <Link 
                            to="/admin/account-settings"
                            title="Account Settings"
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all relative group border border-slate-200"
                        >
                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                {user?.profile ? (
                                    <img src={`http://127.0.0.1:8000/storage/${user.profile}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={18} className="text-slate-500 group-hover:text-primary-green transition-colors" />
                                )}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-green border-2 border-white rounded-full z-10"></span>
                        </Link>
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
