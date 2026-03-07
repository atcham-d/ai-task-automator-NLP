import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitBranch, ScrollText, Settings, LogOut, Zap, User, Blocks } from 'lucide-react';
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

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <aside
            style={{
                width: '240px',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                background: '#0e0e16',
                borderRight: '1px solid #1e1e2e',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid #1e1e2e',
                }}
            >
                <Link
                    to="/dashboard"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textDecoration: 'none',
                        color: '#f1f5f9',
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: '20px',
                    }}
                >
                    <Zap size={22} style={{ color: '#6366f1' }} />
                    FlowAI
                </Link>
            </div>

            {/* Nav Links */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {links.map((link) => {
                    const isActive =
                        link.to === '/dashboard'
                            ? location.pathname === '/dashboard'
                            : location.pathname.startsWith(link.to);

                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isActive ? '#f1f5f9' : '#94a3b8',
                                background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = '#f1f5f9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#94a3b8';
                                }
                            }}
                        >
                            <span style={{ color: isActive ? '#6366f1' : 'inherit' }}>{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div
                style={{
                    padding: '16px 16px',
                    borderTop: '1px solid #1e1e2e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}
            >
                <div
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <User size={18} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                    <div style={{ fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ color: '#475569', transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
                    title="Sign out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
};
