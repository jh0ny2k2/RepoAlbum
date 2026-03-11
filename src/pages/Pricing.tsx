import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Sparkles, Shield, Zap, Menu, X } from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import SEO from '@/components/SEO';

import { useAuthStore } from '@/store/auth';

export default function Pricing() {
  const { t, language, setLanguage } = useLanguageStore();
  const { session } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 animate-in slide-in-from-top-5 shadow-xl">
             <div className="flex items-center justify-center gap-4 text-sm font-bold tracking-widest bg-gray-50 p-2 rounded-xl border border-gray-100">
                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-gray-900' : 'text-gray-400'}>English</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-gray-900' : 'text-gray-400'}>Español</button>
             </div>
             
             {session ? (
                <Link to="/app" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-center shadow-lg shadow-gray-200">
                   {t('dashboard_title')}
                </Link>
             ) : (
                <div className="flex flex-col gap-3">
                   <Link to="/login" className="w-full border border-gray-200 py-3 rounded-xl font-bold text-center hover:bg-gray-50 text-gray-700">
                      {t('login')}
                   </Link>
                   <Link to="/signup" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-center shadow-lg">
                      {t('signup')}
                   </Link>
                </div>
             )}
          </div>
        )}
      </nav>

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">{t('pricing_title')}</h1>
            <p className="text-xl text-gray-500">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">{t('plan_free_title')}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{t('plan_free_price')}</span>
                </div>
                <p className="text-gray-500 mt-2 text-sm">{t('plan_free_desc')}</p>
              </div>
              
              <ul className="space-y-3 mb-6 flex-1">
                {[
                  t('feature_1_album'),
                  t('feature_50_photos'),
                  t('feature_quality'),
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="w-full py-3 rounded-xl border-2 border-gray-900 text-gray-900 font-bold text-center hover:bg-gray-50 transition-colors text-sm">
                {t('btn_start_free')}
              </Link>
            </div>

            {/* Basic Plan */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 hover:border-rose-300 transition-all hover:shadow-lg flex flex-col relative overflow-hidden">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 text-rose-600">{t('plan_basic_title')}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{t('plan_basic_price')}</span>
                  <span className="text-gray-400 text-xs font-medium">/ {t('one_time_payment')}</span>
                </div>
                <p className="text-gray-500 mt-2 text-sm">{t('plan_basic_desc')}</p>
              </div>
              
              <ul className="space-y-3 mb-6 flex-1">
                {[
                  t('feature_1_album'),
                  t('feature_2000_photos'),
                  t('feature_quality'),
                  t('lifetime_access'),
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="https://luminamemories.lemonsqueezy.com/checkout/buy/85e82934-870a-40f3-97d5-53a6835791ad" 
                className="w-full py-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-center hover:bg-rose-100 transition-colors text-sm lemon-squeezy-button"
              >
                {t('btn_get_basic')}
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-gray-900 text-white rounded-3xl p-6 border border-gray-900 shadow-xl relative flex flex-col transform md:-translate-y-4 z-10">
              <div className="absolute top-0 right-0 -mt-3 mr-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                {t('most_popular')}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 text-rose-300">{t('plan_pro_title')}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{t('plan_pro_price')}</span>
                  <span className="text-gray-400 text-xs font-medium">/ {t('one_time_payment')}</span>
                </div>
                <p className="text-gray-300 mt-2 text-sm">{t('plan_pro_desc')}</p>
              </div>
              
              <ul className="space-y-3 mb-6 flex-1">
                {[
                  t('feature_unlimited_albums'),
                  t('feature_2000_photos'),
                  t('feature_slideshow'),
                  t('feature_zip'),
                  t('priority_support')
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="bg-rose-500/20 p-0.5 rounded-full mt-0.5">
                        <Check className="w-3 h-3 text-rose-400 shrink-0" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="https://luminamemories.lemonsqueezy.com/checkout/buy/2b39a6b5-1670-41ed-a3e6-dafd4fbc48cd" 
                className="w-full py-3 rounded-xl bg-white text-gray-900 font-bold text-center hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02] transform duration-200 text-sm lemon-squeezy-button"
              >
                {t('btn_get_pro')}
              </a>
            </div>

            {/* Unlimited Plan */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 border border-gray-700 shadow-lg flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24" />
               </div>
              <div className="mb-6 relative z-10">
                <h3 className="text-lg font-bold mb-2 text-yellow-300 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    {t('plan_unlimited_title')}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{t('plan_unlimited_price')}</span>
                  <span className="text-gray-400 text-xs font-medium">/ {t('one_time_payment')}</span>
                </div>
                <p className="text-gray-400 mt-2 text-sm">{t('plan_unlimited_desc')}</p>
              </div>
              
              <ul className="space-y-3 mb-6 flex-1 relative z-10">
                {[
                  t('feature_unlimited_albums'),
                  t('feature_unlimited'),
                  t('feature_quality'),
                  t('vip_support'),
                  t('lifetime_access'),
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="https://luminamemories.lemonsqueezy.com/checkout/buy/840e6a26-6867-4524-a52e-92e5bb51b979" 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold text-center hover:opacity-90 transition-opacity shadow-lg text-sm relative z-10 lemon-squeezy-button"
              >
                {t('btn_get_unlimited')}
              </a>
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