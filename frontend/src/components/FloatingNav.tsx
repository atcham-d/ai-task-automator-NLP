import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from './ui/button';

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
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] 
            w-max max-w-[calc(100%-2rem)]
            bg-black/60 backdrop-blur-md 
            border border-violet-500/30
            rounded-full 
            px-8 py-3 md:px-10 md:py-4
            flex items-center gap-8 md:gap-14
            shadow-2xl shadow-violet-500/10 overflow-hidden whitespace-nowrap"
        >
            <div className="flex items-center gap-8">
                <Link
                    to="/"
                    className="flex items-center gap-2 no-underline text-[#f1f5f9] font-display font-bold text-lg md:text-xl transition-transform hover:scale-105 shrink-0"
                >
                    <Zap size={20} className="text-[#6366f1]" />
                    FlowAI
                </Link>

                {isLanding && (
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.to}
                                className="no-underline text-[#94a3b8] text-sm font-medium transition-colors hover:text-[#f1f5f9]"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Link to="/login" className="no-underline hidden md:block">
                    <Button variant="ghost" className="h-10 px-4 text-sm text-[#f1f5f9] hover:bg-white/5 border-none">
                        Sign In
                    </Button>
                </Link>
                <Link to="/signup" className="no-underline">
                    <Button className="h-10 px-6 text-sm bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 border-none transition-all rounded-full font-medium">
                        Get Started
                    </Button>
                </Link>
            </div>
        </nav>
    );
};
