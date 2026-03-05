import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useLanguageStore } from '@/store/language';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { t } = useLanguageStore();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // This will send an email with a link to /reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the password reset link.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
           <img src="/logo.png" alt="Lumina Logo" className="mx-auto h-16 w-16 object-contain mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to receive a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <div className={`text-sm text-center font-medium py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Reset Link"}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}