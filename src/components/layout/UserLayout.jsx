import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import { Menu, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const UserLayout = () => {
    const { user, token } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!user) return null;

    return (
        <div className="flex h-screen bg-[#f4f6f9] font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="print:hidden">
                <UserSidebar isOpen={isSidebarOpen} />
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
                {/* Header */}
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
                        {/* Quick Action Profile */}
                        <Link 
                            to="/profile/settings"
                            title="Profile Settings"
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all relative group border border-slate-200"
                        >
                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                {user?.profile ? (
                                    <img src={`http://localhost:8000/storage/${user.profile}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={18} className="text-slate-500 group-hover:text-primary-green transition-colors" />
                                )}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-green border-2 border-white rounded-full z-10"></span>
                        </Link>
                    </div>
                </header>

                {/* Page Content Container */}
                <main className="flex-grow p-6 overflow-y-auto w-full print:p-0 bg-[#f4f6f9]">
                    <div className="max-w-full w-full mx-auto animate-in fade-in duration-300">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
