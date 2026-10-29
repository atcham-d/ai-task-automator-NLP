import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MOCK_USER = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'dev@example.com',
    app_metadata: {},
    user_metadata: { full_name: 'Dev User' },
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
} as User;

const MOCK_SESSION = {
    access_token: 'DEV_BYPASS_TOKEN',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: '',
    user: MOCK_USER,
} as Session;

/** True when the dev bypass is enabled and a bypass login is stored. */
function isBypassActive(): boolean {
    return import.meta.env.VITE_DEV_BYPASS === 'true'
        && localStorage.getItem('sb-bypass-token') === 'DEV_BYPASS_TOKEN';
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string) => Promise<void>;
    googleSignIn: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Check for dev bypass token first
                if (isBypassActive()) {
                    setSession(MOCK_SESSION);
                    setUser(MOCK_USER);
                    return;
                }

                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(session);
                setUser(session?.user ?? null);
            } catch (err: unknown) {
                console.error("Auth initialization failed:", err instanceof Error ? err.message : err);
                setUser(null);
                setSession(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                // Supabase has no session for the mock user; don't let it clear the bypass login
                if (isBypassActive()) return;
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        if (import.meta.env.VITE_DEV_BYPASS === 'true' && data.access_token === 'DEV_BYPASS_TOKEN') {
            localStorage.setItem('sb-bypass-token', 'DEV_BYPASS_TOKEN');
            setSession(MOCK_SESSION);
            setUser(MOCK_USER);
            return;
        }

        // Set the session in Supabase client so getSession() works
        await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token || '',
        });
    }, []);

    const signup = useCallback(async (email: string, password: string, fullName: string) => {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: fullName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Signup failed');

        if (import.meta.env.VITE_DEV_BYPASS === 'true' && data.access_token === 'DEV_BYPASS_TOKEN') {
            localStorage.setItem('sb-bypass-token', 'DEV_BYPASS_TOKEN');
            setSession(MOCK_SESSION);
            setUser(MOCK_USER);
            return;
        }

        await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token || '',
        });
    }, []);

    const googleSignIn = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw error;
    }, []);


    const logout = useCallback(async () => {
        localStorage.removeItem('sb-bypass-token');
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading, login, signup, googleSignIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
