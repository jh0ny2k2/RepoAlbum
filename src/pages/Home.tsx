import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, Share2, FolderHeart, Zap, Globe, Heart, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const { t, language, setLanguage } = useLanguageStore();
  const { session } = useAuthStore();

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-gray-100 selection:text-black">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-black p-1.5 rounded-lg">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Lumina</span>
            </div>
            <div className="flex items-center gap-6">
              {/* Language Switcher */}
              <div className="flex items-center gap-3 text-xs font-bold tracking-widest hidden sm:flex">
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

              {session ? (
                <Link
                  to="/app"
                  className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
                >
                  {t('dashboard_title')}
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-black transition-colors hidden sm:block">
                    {t('login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            {t('hero_title_1')} <br />
            <span className="text-gray-400">
              {t('hero_title_2')}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            {session ? (
               <Link
                to="/app"
                className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
                >
                  {t('hero_cta_primary')} <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="bg-white hover:bg-gray-50 text-gray-900 text-lg px-8 py-4 rounded-full font-bold border border-gray-200 transition-all hover:border-gray-400"
                >
                  {t('hero_cta_secondary')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('features_title')}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('features_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <FolderHeart className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature_1_title')}</h3>
              <p className="text-gray-500 leading-relaxed">
                {t('feature_1_desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Share2 className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature_2_title')}</h3>
              <p className="text-gray-500 leading-relaxed">
                {t('feature_2_desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature_3_title')}</h3>
              <p className="text-gray-500 leading-relaxed">
                {t('feature_3_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Showcase */}
      <div className="py-24 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    {t('showcase_title')}
                </h2>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                    {t('showcase_desc')}
                </p>
                <ul className="space-y-6">
                    <li className="flex items-center gap-4 text-gray-900 font-medium">
                        <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                           <Zap className="h-5 w-5" />
                        </div>
                        <span>{t('showcase_1')}</span>
                    </li>
                    <li className="flex items-center gap-4 text-gray-900 font-medium">
                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                           <Globe className="h-5 w-5" />
                        </div>
                        <span>{t('showcase_2')}</span>
                    </li>
                    <li className="flex items-center gap-4 text-gray-900 font-medium">
                        <div className="p-2 bg-red-50 rounded-full text-red-600">
                           <Heart className="h-5 w-5" />
                        </div>
                        <span>{t('showcase_3')}</span>
                    </li>
                </ul>
            </div>
            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 transform rotate-3 rounded-3xl"></div>
                <img 
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="App Screenshot" 
                    className="relative rounded-3xl shadow-2xl border border-gray-100 transform -rotate-2 hover:rotate-0 transition-all duration-500"
                />
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="bg-black p-1.5 rounded-lg">
                    <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">Lumina</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">
                © {new Date().getFullYear()} Lumina. {t('footer_rights')}
            </p>
        </div>
      </footer>
    </div>
  );
}
