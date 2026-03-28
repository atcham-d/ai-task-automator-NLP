import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitBranch, ScrollText, Settings, LogOut, Zap, User, Blocks, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarLink {
    label: string;
    to: string;
    icon: React.ReactNode;
}

const links: SidebarLink[] = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Workflows', to: '/dashboard/workflows/new', icon: <GitBranch size={18} /> },
    { label: 'Logs', to: '/dashboard/logs', icon: <ScrollText size={18} /> },
    { label: 'Integrations', to: '/dashboard/integrations', icon: <Blocks size={18} /> },
    { label: 'Settings', to: '/dashboard/settings', icon: <Settings size={18} /> },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-md transition-all duration-300 opacity-100"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 h-screen w-[240px] bg-[#0e0e16] border-r border-[#1e1e2e] 
                    flex flex-col z-[70] transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                `}
            >
                {/* Logo & Close Button */}
                <div className="p-5 md:p-6 border-b border-[#1e1e2e] flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 no-underline text-[#f1f5f9] font-display font-bold text-xl"
                    >
                        <Zap size={22} className="text-[#6366f1]" />
                        FlowAI
                    </Link>
                    <button 
                        onClick={onClose}
                        className="p-1 text-[#475569] hover:text-[#f1f5f9] md:hidden"
                        aria-label="Close Sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-3 md:p-4 flex flex-col gap-1 overflow-y-auto">
                    {links.map((link) => {
                        const isActive =
                            link.to === '/dashboard'
                                ? location.pathname === '/dashboard'
                                : location.pathname.startsWith(link.to);

                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline text-sm font-medium transition-all
                                    ${isActive 
                                        ? 'text-[#f1f5f9] bg-[#6366f1]/10' 
                                        : 'text-[#94a3b8] hover:bg-white/5 hover:text-[#f1f5f9]'
                                    }
                                `}
                            >
                                <span className={isActive ? 'text-[#6366f1]' : 'text-inherit'}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-[#1e1e2e] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a78bfa] flex items-center justify-center shrink-0">
                        <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#f1f5f9] truncate">
                            {displayName}
                        </div>
                        <div className="text-[12px] text-[#475569] truncate">
                            {user?.email || ''}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1 text-[#475569] hover:text-[#ef4444] transition-colors cursor-pointer"
                        title="Sign out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
};
