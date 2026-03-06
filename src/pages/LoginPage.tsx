import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatedPage } from '../components/AnimatedPage';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, googleSignIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
        }
    };

    return (
        <AnimatedPage
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                position: 'relative',
                zIndex: 1,
            }}
        >
            {/* Faint grid overlay */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.3 }}>
                <div style={{
                    width: '100%', height: '100%',
                    backgroundImage: 'linear-gradient(rgba(30,30,46,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,30,46,0.3) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
            </div>

            <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={28} style={{ color: '#6366f1' }} />
                        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '24px', color: '#f1f5f9' }}>FlowAI</span>
                    </Link>
                </div>

                <Card>
                    <h2
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#f1f5f9',
                            textAlign: 'center',
                            marginBottom: '8px',
                        }}
                    >
                        Welcome back
                    </h2>
                    <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>
                        Sign in to your account to continue
                    </p>

                    {/* Google Sign-In */}
                    <button
                        onClick={handleGoogleSignIn}
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#f1f5f9',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'background 0.2s, border-color 0.2s',
                            marginBottom: '16px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#94a3b8' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                            Sign up
                        </Link>
                    </p>
                </Card>
            </div>
        </AnimatedPage>
    );
};
