import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Camera, Share2, Shield, ArrowRight, QrCode } from 'lucide-react';
import SEO from '@/components/SEO';
import { useLanguageStore } from '@/store/language';

import { useAuthStore } from '@/store/auth';

export default function Weddings() {
  const { t, language, setLanguage } = useLanguageStore();
  const { session } = useAuthStore();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-rose-200">
      <SEO 
        title={`Lumina Weddings | ${t('wedding_hero_title')} ${t('wedding_hero_title_highlight')}`}
        description={t('wedding_hero_desc')}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-serif font-bold tracking-tighter">Lumina <span className="text-rose-500">Weddings</span></div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest px-3 py-1.5 rounded-full bg-gray-100/50 border border-gray-200">
                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}>EN</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}>ES</button>
            </div>
            <Link to="/pricing" className="text-sm font-medium hover:text-rose-600 transition-colors">{t('pricing')}</Link>
            
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

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest mb-8">
              <Heart className="w-3 h-3 fill-current" /> {t('wedding_hero_tag')}
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[0.9] tracking-tight mb-8">
              {t('wedding_hero_title')} <span className="italic text-rose-500">{t('wedding_hero_title_highlight')}</span>.
            </h1>
            <p className="text-xl text-gray-500 font-light leading-relaxed max-w-xl mb-10">
              {t('wedding_hero_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="inline-flex items-center justify-center px-8 py-4 bg-rose-500 text-white rounded-full font-medium text-lg hover:bg-rose-600 transition-all hover:scale-105 shadow-xl shadow-rose-200">
                {t('wedding_cta_create')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/demo" className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium text-lg hover:bg-gray-50 transition-all">
                {t('wedding_cta_demo')}
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Image Grid */}
        <div className="hidden lg:block absolute top-20 right-0 w-[45%] h-full opacity-90 pointer-events-none">
           <div className="grid grid-cols-2 gap-4 rotate-[-6deg] translate-x-20">
              <div className="space-y-4 pt-20">
                 <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl" />
                 <img src="https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl" />
              </div>
              <div className="space-y-4">
                 <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl" />
                 <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl" />
              </div>
           </div>
        </div>
      </header>

      {/* How it works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t('wedding_how_title')}</h2>
            <p className="text-gray-500">{t('wedding_how_desc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Camera className="w-8 h-8 text-rose-500" />,
                title: t('wedding_step_1_title'),
                desc: t('wedding_step_1_desc')
              },
              {
                icon: <QrCode className="w-8 h-8 text-rose-500" />,
                title: t('wedding_step_2_title'),
                desc: t('wedding_step_2_desc')
              },
              {
                icon: <Shield className="w-8 h-8 text-rose-500" />,
                title: t('wedding_step_3_title'),
                desc: t('wedding_step_3_desc')
              }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-900 rounded-[3rem] overflow-hidden text-white relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520854221256-17451cc330e7?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20" />
            <div className="relative z-10 p-12 md:p-24 text-center">
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{t('wedding_feature_title')}</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
                {t('wedding_feature_desc')}
              </p>
              <Link to="/signup" className="inline-flex items-center justify-center px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105">
                {t('wedding_cta_start')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {t('wedding_footer_rights')}</p>
        </div>
      </footer>
    </div>
  );
}
