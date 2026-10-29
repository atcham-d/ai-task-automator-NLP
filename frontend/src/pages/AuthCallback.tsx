import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';

/**
 * Handles the OAuth callback from Google.
 * Supabase automatically exchanges the code in the URL hash for a session.
 * We just need to wait for the auth state to update, then redirect.
 */
export function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for error parameters in URL
        const errorMsg = searchParams.get('error_description') || searchParams.get('error');
        if (errorMsg) {
            setError(errorMsg);
            return;
        }

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
            } else if (!error) {
                // If no session and no error after timeout, something is wrong
                setError("Authentication timed out. Please try again.");
            }
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [navigate, searchParams, error]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
                <div className="max-w-sm w-full bg-[#111118] border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl shadow-red-500/5">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-[#f1f5f9] mb-2">Authentication Failed</h2>
                    <p className="text-[#94a3b8] text-sm mb-8 leading-relaxed">
                        {error}
                    </p>
                    <Button 
                        onClick={() => navigate('/login')} 
                        variant="ghost" 
                        className="w-full gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="text-center">
                <Loader2 size={40} className="text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-white/60 text-sm font-medium">Completing secure sign in...</p>
            </div>
        </div>
    );
}
