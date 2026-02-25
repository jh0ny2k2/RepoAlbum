import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Camera } from 'lucide-react';
import { useLanguageStore } from '@/store/language';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguageStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/app');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex gap-4 text-xs font-bold tracking-widest">
         <button 
           onClick={() => setLanguage('en')}
           className={`transition-colors hover:text-black ${language === 'en' ? 'text-black underline decoration-2 underline-offset-4' : 'text-gray-400'}`}
         >
           EN
         </button>
         <button 
           onClick={() => setLanguage('es')}
           className={`transition-colors hover:text-black ${language === 'es' ? 'text-black underline decoration-2 underline-offset-4' : 'text-gray-400'}`}
         >
           ES
         </button>
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
             <Camera className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('login')}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t('no_account')}{' '}
            <Link to="/signup" className="font-bold text-black hover:underline">
              {t('signup')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
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
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm transition-shadow"
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
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm transition-shadow"
                placeholder={t('password_label')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('login')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
