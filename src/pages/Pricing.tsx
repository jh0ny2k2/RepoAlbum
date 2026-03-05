import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Sparkles, Shield, Zap } from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import SEO from '@/components/SEO';

import { useAuthStore } from '@/store/auth';

export default function Pricing() {
  const { t, language, setLanguage } = useLanguageStore();
  const { session } = useAuthStore();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <SEO 
        title={`Lumina Pricing | ${t('pricing_title')}`}
        description={t('pricing_subtitle')}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">Lumina</Link>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold tracking-widest px-3 py-1.5 rounded-full bg-gray-100/50 border border-gray-200">
                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}>EN</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}>ES</button>
            </div>
            
            {session ? (
                <Link to="/app" className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                    {t('dashboard_title')}
                </Link>
            ) : (
                <>
                    <Link to="/login" className="text-sm font-medium hover:text-rose-600 transition-colors">{t('login')}</Link>
                    <Link to="/signup" className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">{t('signup')}</Link>
                </>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">{t('pricing_title')}</h1>
            <p className="text-xl text-gray-500">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{t('plan_free_title')}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{t('plan_free_price')}</span>
                </div>
                <p className="text-gray-500 mt-4">{t('plan_free_desc')}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  t('feature_1_album'),
                  t('feature_50_photos'),
                  t('feature_2_desc').split('.')[0], // "Share a secure link..."
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="w-full py-4 rounded-xl border-2 border-gray-900 text-gray-900 font-bold text-center hover:bg-gray-50 transition-colors">
                {t('btn_start_free')}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gray-900 text-white rounded-3xl p-8 border border-gray-900 shadow-2xl relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 right-0 -mt-4 mr-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                {t('most_popular')}
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-rose-300">{t('plan_pro_title')}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{t('plan_pro_price')}</span>
                  <span className="text-gray-400 text-sm font-medium">/ {t('one_time_payment')}</span>
                </div>
                <p className="text-gray-300 mt-4">{t('plan_pro_desc')}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  t('feature_unlimited'),
                  t('feature_quality'),
                  t('feature_slideshow'),
                  t('feature_zip'),
                  t('priority_support')
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="bg-rose-500/20 p-0.5 rounded-full">
                        <Check className="w-4 h-4 text-rose-400 shrink-0" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="https://luminamemories.lemonsqueezy.com/checkout/buy/2b39a6b5-1670-41ed-a3e6-dafd4fbc48cd" 
                className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-center hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02] transform duration-200 lemon-squeezy-button"
              >
                {t('btn_get_pro')}
              </a>
              
              <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                 <Shield className="w-3 h-3" /> {t('secure_payment')}
              </p>
            </div>
          </div>
          
          <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-50 grayscale">
             {/* Placeholders for logos if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}