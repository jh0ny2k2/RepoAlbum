import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, Share2, FolderHeart, Zap, Globe, Heart, ArrowRight, Star, Aperture, Lock, Menu, X } from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import { useAuthStore } from '@/store/auth';
import SEO from '@/components/SEO';

export default function Home() {
  const { t, language, setLanguage } = useLanguageStore();
  const { session } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <SEO 
        title={t('hero_title_1') + " " + t('hero_title_2')}
        description={t('hero_subtitle')}
      />
      {/* Navbar - Kept similar but maybe slightly different glass effect */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Lumina Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold tracking-tighter text-foreground">Lumina</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
               {/* Language - Minimalist */}
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest bg-secondary/50 p-1 rounded-full border border-border">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 ${language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('es')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 ${language === 'es' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  ES
                </button>
              </div>

              <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('pricing')}
              </Link>

              {session ? (
                <Link
                  to="/app"
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                  {t('dashboard_title')}
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {t('login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-6 animate-in slide-in-from-top-5">
             <div className="flex items-center justify-center gap-4 text-sm font-bold tracking-widest bg-secondary/30 p-2 rounded-xl">
                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-primary' : 'text-muted-foreground'}>English</button>
                <span className="text-border">|</span>
                <button onClick={() => setLanguage('es')} className={language === 'es' ? 'text-primary' : 'text-muted-foreground'}>Español</button>
             </div>
             
             <Link to="/pricing" className="text-lg font-medium text-center py-2 hover:bg-secondary/50 rounded-lg transition-colors">
                {t('pricing')}
             </Link>

             {session ? (
                <Link to="/app" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-center">
                   {t('dashboard_title')}
                </Link>
             ) : (
                <div className="flex flex-col gap-3">
                   <Link to="/login" className="w-full border border-border py-3 rounded-xl font-bold text-center hover:bg-secondary/50">
                      {t('login')}
                   </Link>
                   <Link to="/signup" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-center">
                      {t('signup')}
                   </Link>
                </div>
             )}
          </div>
        )}
      </nav>

      {/* Hero Section - Asymmetric Split */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-xs font-bold tracking-widest uppercase text-muted-foreground">
                <Star className="w-3 h-3 text-foreground" fill="currentColor" />
                <span>The new standard for memories</span>
             </div>
             
             <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground leading-[0.9]">
               {t('hero_title_1')}
               <span className="block text-muted-foreground/30 mt-2">{t('hero_title_2')}</span>
             </h1>
             
             <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-light border-l-2 border-border pl-6">
               {t('hero_subtitle')}
             </p>

             <div className="flex flex-wrap gap-4 pt-4">
               <Link
                  to={session ? "/app" : "/signup"}
                  className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-medium text-lg flex items-center gap-3 transition-all hover:translate-x-1 hover:shadow-xl shadow-lg shadow-primary/10"
                >
                  {session ? "Dashboard" : t('hero_cta_primary')}
                  <ArrowRight className="w-5 h-5" />
               </Link>
               {!session && (
                 <Link
                    to="/login"
                    className="h-14 px-8 rounded-full border border-border bg-background text-foreground font-medium text-lg flex items-center gap-3 hover:bg-secondary transition-colors"
                  >
                    {t('hero_cta_secondary')}
                 </Link>
               )}
             </div>
          </div>

          <div className="relative lg:h-[600px] w-full animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 hidden lg:block">
             <div className="absolute top-0 right-0 w-4/5 h-full bg-secondary rounded-[3rem] -rotate-3 border border-border"></div>
             <div className="absolute top-10 right-10 w-4/5 h-full bg-card rounded-[3rem] shadow-2xl border border-border overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop"
                  alt="Minimalist Architecture"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                />
             </div>
             
             {/* Floating Badge */}
             <div className="absolute bottom-20 -left-10 bg-background/80 backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl max-w-xs">
                <div className="flex items-center gap-4 mb-3">
                   <div className="p-3 bg-primary rounded-full text-primary-foreground">
                      <Aperture className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="font-bold text-foreground">Smart Storage</p>
                      <p className="text-xs text-muted-foreground">Unlimited possibilities</p>
                   </div>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                   <div className="h-full bg-foreground w-2/3 rounded-full"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-6 lg:px-8 bg-secondary/20">
         <div className="max-w-7xl mx-auto">
            <div className="mb-20 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{t('features_subtitle')}</h2>
              <p className="text-lg text-muted-foreground">{t('features_title')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
               {/* Large Card */}
               <div className="md:col-span-2 row-span-1 md:row-span-2 bg-card rounded-[2rem] p-10 border border-border shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <FolderHeart className="w-64 h-64" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                     <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                        <FolderHeart className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-3xl font-bold mb-4">{t('feature_1_title')}</h3>
                        <p className="text-muted-foreground text-lg max-w-md">{t('feature_1_desc')}</p>
                     </div>
                  </div>
               </div>

               {/* Tall Card */}
               <div className="md:col-span-1 row-span-1 md:row-span-2 bg-foreground text-background rounded-[2rem] p-10 shadow-xl flex flex-col justify-between group">
                   <div>
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <Share2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold mb-4 text-white">{t('feature_2_title')}</h3>
                   </div>
                   <p className="text-white/60 text-lg">{t('feature_2_desc')}</p>
               </div>

               {/* Wide Card */}
               <div className="md:col-span-3 bg-card rounded-[2rem] p-10 border border-border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1">
                     <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="w-8 h-8" />
                     </div>
                     <h3 className="text-3xl font-bold mb-4">{t('feature_3_title')}</h3>
                     <p className="text-muted-foreground text-lg">{t('feature_3_desc')}</p>
                  </div>
                  <div className="flex-1 w-full h-full bg-secondary/50 rounded-xl min-h-[200px] flex items-center justify-center border border-border border-dashed">
                     <span className="text-muted-foreground font-medium flex items-center gap-2">
                        <Lock className="w-5 h-5" /> End-to-end Encrypted
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-20 border-t border-border bg-background">
         <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
            <img src="/logo.png" alt="Lumina Logo" className="h-16 w-16 object-contain mb-8" />
            <h2 className="text-2xl font-bold tracking-tight mb-8">Lumina</h2>
            
            <div className="flex gap-8 mb-12">
               <Link to="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer_contact')}
               </Link>
               <Link to="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  FAQs
               </Link>
               <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer_privacy')}
               </a>
            </div>
            
            <p className="text-muted-foreground/40 text-sm">
               © {new Date().getFullYear()} Lumina Inc. Crafted with precision.
            </p>
         </div>
      </footer>
    </div>
  );
}
