import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from './Button';

interface NavLink {
    label: string;
    to: string;
}

const navLinks: NavLink[] = [
    { label: 'Features', to: '/#features' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Docs', to: '#' },
];

export const FloatingNav: React.FC = () => {
    const location = useLocation();
    const isLanding = location.pathname === '/';

    return (
        <nav
            style={{
                position: 'fixed',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: 'rgba(17,17,24,0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid #1e1e2e',
                borderRadius: '9999px',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
            }}
        >
            <Link
                to="/"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: '#f1f5f9',
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                }}
            >
                <Zap size={20} style={{ color: '#6366f1' }} />
                FlowAI
            </Link>

            {isLanding && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.to}
                            style={{
                                textDecoration: 'none',
                                color: '#94a3b8',
                                fontSize: '14px',
                                fontWeight: 500,
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="sm">Get Started</Button>
                </Link>
            </div>
        </nav>
    );
};
