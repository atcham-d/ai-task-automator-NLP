import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Menu } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-[#0a0a0f]">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0e0e16]/80 backdrop-blur-md border-b border-[#1e1e2e] flex items-center px-4 z-50 md:hidden">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                    aria-label="Toggle Menu"
                >
                    <Menu size={24} />
                </button>
                <div className="ml-4 font-bold text-[#f1f5f9] font-display text-lg tracking-tight">FlowAI</div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 md:ml-[240px] relative">
                <Outlet />
            </main>
        </div>
    );
};
