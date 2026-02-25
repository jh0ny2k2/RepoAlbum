import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle, LogOut, Home, Users, Settings } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/app" className="flex-shrink-0 flex items-center gap-2 group">
                 <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                    <Home className="h-5 w-5 text-white" />
                 </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">Lumina</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
              
              <div className="ml-4 flex items-center space-x-4">
                 {/* Language Switcher */}
                <div className="flex items-center gap-2 mr-2 border-r border-gray-200 pr-4">
                    <button 
                    onClick={() => setLanguage('en')}
                    className={`text-xs font-bold transition-colors ${language === 'en' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    EN
                    </button>
                    <button 
                    onClick={() => setLanguage('es')}
                    className={`text-xs font-bold transition-colors ${language === 'es' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    ES
                    </button>
                </div>

                <span className="text-sm text-gray-700">
                  {user?.username || user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  title={t('sign_out')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {(user?.username || user?.email || 'U')[0].toUpperCase()}
                    </div>
                </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.full_name}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-4">
                   <div className="flex gap-4 py-2">
                        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'font-bold text-indigo-600' : 'text-gray-500'}>English</button>
                        <button onClick={() => setLanguage('es')} className={language === 'es' ? 'font-bold text-indigo-600' : 'text-gray-500'}>Español</button>
                   </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    {t('sign_out')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
