import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Component as EtherealShadow } from '../components/etheral-shadow';

export const SignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signup, googleSignIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await signup(email, password, name);
            toast.success('Account created! Welcome to FlowAI');
            navigate('/dashboard');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Signup failed');
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
        <AnimatedPage className="min-h-screen flex items-center justify-center p-6 relative bg-[#0a0a0f] overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <EtherealShadow
                    color="rgba(99, 102, 241, 0.35)"
                    animation={{ scale: 50, speed: 65 }}
                    noise={{ opacity: 0.25, scale: 1.2 }}
                    sizing="fill"
                />
            </div>

            {/* Glowing orbs for depth */}
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none z-0" />

            <div className="w-full max-w-[440px] relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
                        <Zap size={32} className="text-[#6366f1]" />
                        <span className="font-display font-extrabold text-2xl text-[#f1f5f9] tracking-tight">FlowAI</span>
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="bg-[#111118]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50 overflow-hidden relative group">
                    {/* Subtle inner highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    <div className="relative">
                        <div className="text-center mb-10">
                            <h2 className="font-display text-3xl font-bold text-[#f1f5f9] mb-3">
                                Create account
                            </h2>
                            <p className="text-[#94a3b8] text-sm">
                                Join FlowAI and start automating your world
                            </p>
                        </div>

                        {/* Google Sign-In */}
                        <Button
                            variant="outline"
                            onClick={handleGoogleSignIn}
                            className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/40 text-[#f1f5f9] h-12 gap-3 transition-all font-medium"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-[#475569] text-[10px] font-bold uppercase tracking-widest leading-none">OR</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#94a3b8] ml-1">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Disha Sharma"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 focus:border-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#94a3b8] ml-1">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 focus:border-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" title="At least 6 characters" className="text-[#94a3b8] ml-1">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 focus:border-indigo-500/50"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="default"
                                className="w-full h-12 bg-[#6366f1] hover:bg-[#4f46e5] text-white transition-all shadow-lg shadow-indigo-500/25 mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="text-center mt-8">
                            <p className="text-[#94a3b8] text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#6366f1] font-semibold hover:underline decoration-2 underline-offset-4">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};
