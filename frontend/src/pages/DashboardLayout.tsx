import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Menu } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isWorkflowPage = location.pathname.includes('/workflows/');

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-[#0a0a0f]">
            {/* Mobile Header */}
            {!isWorkflowPage && (
                <header className="fixed top-0 left-0 right-0 h-16 bg-[#0e0e16]/80 backdrop-blur-md border-b border-[#1e1e2e] flex items-center px-4 z-50 md:hidden">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                        aria-label="Toggle Menu"
                        aria-expanded={isSidebarOpen}
                        aria-controls="main-sidebar"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="ml-4 font-bold text-[#f1f5f9] font-display text-lg tracking-tight">FlowAI</div>
                </header>
            )}

            {/* Desktop sidebar spacer — reserves width in flex flow so main content never overlaps */}
            <div className="hidden md:block w-48 shrink-0" aria-hidden="true" />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className={`flex-1 min-w-0 p-8 ${!isWorkflowPage ? 'pt-20' : 'pt-0'} relative bg-[#0a0a0f]`}>
                <Outlet />
            </main>
        </div>
    );
};
