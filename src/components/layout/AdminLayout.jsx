import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, User as UserIcon } from 'lucide-react';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-[#f4f6f9] font-sans overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} />

            {/* Main Content */}
            <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
                {/* Admin Header */}
                <header className="h-[60px] min-h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shrink-0">
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
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6CA52C] text-white hover:bg-[#5a8c24] transition-colors relative">
                            <UserIcon size={16} className="fill-current" />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-grow p-6 overflow-y-auto w-full">
                    <div className="max-w-full w-full mx-auto animate-in fade-in duration-300">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
