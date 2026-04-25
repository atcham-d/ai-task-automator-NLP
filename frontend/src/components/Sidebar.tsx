import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitBranch, ScrollText, Settings, LogOut, Zap, User, Blocks, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarLink {
    label: string;
    to: string;
    icon: React.ReactNode;
}

const links: SidebarLink[] = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { label: 'Workflows', to: '/dashboard/workflows/new', icon: <GitBranch size={16} /> },
    { label: 'Logs', to: '/dashboard/logs', icon: <ScrollText size={16} /> },
    { label: 'Integrations', to: '/dashboard/integrations', icon: <Blocks size={16} /> },
    { label: 'Settings', to: '/dashboard/settings', icon: <Settings size={16} /> },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                id="main-sidebar"
                aria-hidden={!isOpen && isMobile}
                // @ts-expect-error - inert is relatively new in React types but supported in browsers
                inert={!isOpen && isMobile ? "" : undefined}
                className={`
                    fixed left-0 top-0 h-screen w-48 bg-surface-container-low
                    flex flex-col z-[70] transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                `}
            >
                {/* Logo & Close Button */}
                <div className="p-5 md:p-6 flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 no-underline text-on-surface font-display font-bold text-base"
                    >
                        <Zap size={22} className="text-primary" />
                        FlowAI
                    </Link>
                    <button 
                        onClick={onClose}
                        className="p-1 text-outline-variant hover:text-on-surface md:hidden"
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
                                        ? 'text-[#c0c1ff] bg-[#1b1b20]' 
                                        : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                                    }
                                `}
                            >
                                <span className={isActive ? 'text-primary' : 'text-inherit'}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 flex items-center gap-3 mt-auto">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
                        <User size={18} className="text-surface" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-on-surface truncate">
                            {displayName}
                        </div>
                        <div className="text-[12px] text-outline-variant truncate">
                            {user?.email || ''}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1 text-outline-variant hover:text-error transition-colors cursor-pointer"
                        title="Sign out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
};
