import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle, LogOut, Home, Camera } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Desktop Menu - Moved to Left */}
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-200 border-b-2 ${
                    isActive(item.href)
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <item.icon className={`h-4 w-4 mr-2 ${isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'}`} />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden gap-4">
                <div className="flex items-center gap-3 text-xs font-bold tracking-widest border-r border-border pr-4">
                    <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-foreground' : 'text-muted-foreground'}>EN</button>
                    <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-foreground' : 'text-muted-foreground'}>ES</button>
                </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-secondary focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {/* Right Side - Language & Profile */}
            <div className="hidden sm:flex items-center space-x-6 pl-8">
                 {/* Language Switcher */}
                <div className="flex items-center gap-4 text-xs font-semibold tracking-widest">
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

                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold text-xs border border-border ring-2 ring-background">
                      {(user?.username || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title={t('sign_out')}
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-background border-t border-border absolute w-full shadow-xl">
            <div className="pt-2 pb-3 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-4 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className={`h-5 w-5 mr-3 ${isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'}`} />
                    {item.name}
                  </div>
                </Link>
              ))}
              <div className="border-t border-border mt-4 pt-4 pb-3">
                <div className="flex items-center px-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold text-sm border border-border">
                      {(user?.username || user?.email || 'U')[0].toUpperCase()}
                    </div>
                </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-foreground">{user?.full_name}</div>
                    <div className="text-xs font-medium text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <Outlet />
      </main>
    </div>
  );
}
