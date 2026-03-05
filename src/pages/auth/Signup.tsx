import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Camera } from 'lucide-react';
import { useLanguageStore } from '@/store/language';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguageStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Send Welcome Email
      try {
        await fetch('https://maoxewgqbagqglqckluw.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                subject: 'Welcome to Lumina! ✨',
                html: `
                  <div style="font-family: sans-serif; text-align: center; color: #333;">
                    <h1 style="color: #333;">Welcome, ${fullName || username}!</h1>
                    <p>Thanks for joining Lumina. Your private space for memories is ready.</p>
                    <p>Start by creating your first album or exploring the demo.</p>
                    <br/>
                    <a href="https://luminamemories.netlify.app/app" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 99px; font-weight: bold;">Go to Dashboard</a>
                  </div>
                `
            })
        });
      } catch (err) {
        console.error("Failed to send welcome email", err);
      }

      navigate('/app');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex gap-4 text-xs font-bold tracking-widest">
         <button 
           onClick={() => setLanguage('en')}
           className={`transition-colors hover:text-foreground ${language === 'en' ? 'text-foreground border-b-2 border-foreground pb-0.5' : 'text-muted-foreground'}`}
         >
           EN
         </button>
         <button 
           onClick={() => setLanguage('es')}
           className={`transition-colors hover:text-foreground ${language === 'es' ? 'text-foreground border-b-2 border-foreground pb-0.5' : 'text-muted-foreground'}`}
         >
           ES
         </button>
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
           <img src="/logo.png" alt="Lumina Logo" className="mx-auto h-16 w-16 object-contain mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            {t('signup')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('have_account')}{' '}
            <Link to="/login" className="font-bold text-foreground hover:underline decoration-2 underline-offset-4">
              {t('login')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="sr-only">
                {t('full_name_label')}
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                placeholder={t('full_name_label')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                {t('username_label')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                placeholder={t('username_label')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t('email_label')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                placeholder={t('email_label')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('password_label')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border bg-background placeholder-muted-foreground text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                placeholder={t('password_label')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center font-medium bg-destructive/10 py-2 rounded-lg border border-destructive/20">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('signup')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
