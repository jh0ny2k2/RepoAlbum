import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle, LogOut, Home, Users, Settings, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const { t, language, setLanguage } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation = [
    { name: t('feed'), href: '/app', icon: Home },
    { name: t('new_memory'), href: '/app/memories/new', icon: PlusCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-gray-100 selection:text-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/app" className="flex-shrink-0 flex items-center gap-2 group">
                 <div className="bg-black p-1.5 rounded-lg group-hover:bg-gray-800 transition-colors">
                    <Camera className="h-4 w-4 text-white" />
                 </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-gray-600 transition-colors">Lumina</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    isActive(item.href)
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-black hover:border-gray-200'
                  }`}
                >
                  <item.icon className={`h-4 w-4 mr-2 ${isActive(item.href) ? 'text-black' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              ))}
              
              <div className="ml-8 flex items-center space-x-6 pl-8 border-l border-gray-100">
                 {/* Language Switcher */}
                <div className="flex items-center gap-3 text-xs font-bold tracking-widest">
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

                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-bold text-xs border border-gray-200">
                      {(user?.username || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                      title={t('sign_out')}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden gap-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest border-r border-gray-100 pr-4">
                    <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-black' : 'text-gray-300'}>EN</button>
                    <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-black' : 'text-gray-300'}>ES</button>
                </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:bg-gray-50 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
            <div className="pt-2 pb-3 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className={`h-5 w-5 mr-3 ${isActive(item.href) ? 'text-black' : 'text-gray-400'}`} />
                    {item.name}
                  </div>
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-4 pt-4 pb-3">
                <div className="flex items-center px-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-bold text-sm border border-gray-200">
                      {(user?.username || user?.email || 'U')[0].toUpperCase()}
                    </div>
                </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                    <div className="text-xs font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('sign_out')}
                  </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}
