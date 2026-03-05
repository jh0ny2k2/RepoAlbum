import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (hash fragment from email link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If no session, maybe the link is invalid or expired
        // But for updateUser to work, we need to be authenticated via the link
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Password updated successfully
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
           <img src="/logo.png" alt="Lumina Logo" className="mx-auto h-16 w-16 object-contain mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleUpdate}>
          <div>
            <label htmlFor="new-password" className="sr-only">
              New Password
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              required
              minLength={6}
              className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm text-center font-medium bg-destructive/10 py-2 rounded-lg border border-destructive/20">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}