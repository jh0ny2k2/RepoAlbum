import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, Share2, FolderHeart, Zap, Globe, Heart, Lock } from 'lucide-react';
import { useLanguageStore } from '@/store/language';

export default function Home() {
  const { t, language, setLanguage } = useLanguageStore();

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Lumina</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex items-center gap-2 mr-2">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`text-sm font-medium transition-colors ${language === 'en' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  EN
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => setLanguage('es')}
                  className={`text-sm font-medium transition-colors ${language === 'es' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ES
                </button>
              </div>

              <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                {t('login')}
              </Link>
              <Link
                to="/signup"
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t('signup')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            {t('hero_title_1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {t('hero_title_2')}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            {t('hero_subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-4 rounded-full font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              {t('hero_cta_primary')} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-gray-50 text-gray-900 text-lg px-8 py-4 rounded-full font-semibold border border-gray-200 transition-all hover:border-gray-300"
            >
              {t('hero_cta_secondary')}
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -z-10 w-full h-full overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">{t('features_title')}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('features_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <FolderHeart className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature_1_title')}</h3>
              <p className="text-gray-500 leading-relaxed">
                {t('feature_1_desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature_2_title')}</h3>
              <p className="text-gray-500 leading-relaxed">
                {t('feature_2_desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-pink-600" />
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
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                    {t('showcase_title')}
                </h2>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                    {t('showcase_desc')}
                </p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-gray-700">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span>{t('showcase_1')}</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <Globe className="h-5 w-5 text-blue-500" />
                        <span>{t('showcase_2')}</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <Heart className="h-5 w-5 text-red-500" />
                        <span>{t('showcase_3')}</span>
                    </li>
                </ul>
            </div>
            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 transform rotate-3 rounded-2xl opacity-20 blur-lg"></div>
                <img 
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="App Screenshot" 
                    className="relative rounded-2xl shadow-2xl border border-gray-200 transform -rotate-2 hover:rotate-0 transition-all duration-500"
                />
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="bg-gray-900 p-1.5 rounded-lg">
                    <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">Lumina</span>
            </div>
            <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Lumina. {t('footer_rights')}
            </p>
        </div>
      </footer>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
