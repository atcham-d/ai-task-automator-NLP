import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles the OAuth callback from Google.
 * Supabase automatically exchanges the code in the URL hash for a session.
 * We just need to wait for the auth state to update, then redirect.
 */
export function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                navigate('/dashboard', { replace: true });
            }
        });

        // Fallback: if already signed in, redirect after a short delay
        const timeout = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }, 3000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60 text-sm">Completing sign in...</p>
            </div>
        </div>
    );
}
