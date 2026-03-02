import React, { useState } from 'react';
import { Loader2, Calendar as CalendarIcon, MapPin, Tag, Image as ImageIcon, Folder, Upload, Globe, ArrowLeft, X, Download, Play, MessageSquare, Send, LayoutGrid, List, ChevronLeft, ChevronRight, Calendar, Grid, Sparkles, Share2 } from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';

// MOCK DATA FOR DEMO
const DEMO_MEMORY = {
  title: "Maria & Alex - Wedding Day",
  content: "The best day of our lives! Thank you everyone for capturing these moments. ❤️",
  location: "Villa Toscana, Italy",
  created_at: new Date().toISOString(),
  status: "public",
  cover_media_id: 1
};

const DEMO_MEDIA = [
  { id: 1, file_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200", file_type: "image", created_at: new Date().toISOString() },
  { id: 2, file_url: "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=1200", file_type: "image", created_at: new Date().toISOString() },
  { id: 3, file_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200", file_type: "image", created_at: new Date().toISOString() },
  { id: 4, file_url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1200", file_type: "image", created_at: new Date().toISOString() },
  { id: 5, file_url: "https://images.unsplash.com/photo-1520854221256-17451cc330e7?auto=format&fit=crop&q=80&w=1200", file_type: "image", created_at: new Date().toISOString() },
  { id: 6, file_url: "https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=1200", file_type: "image", created_at: new Date().toISOString() },
];

const DEMO_COMMENTS = [
  { id: 1, author_name: "Sarah (Bridesmaid)", content: "Omg looking at these makes me cry! 😭 So beautiful!", created_at: new Date().toISOString() },
  { id: 2, author_name: "Uncle Bob", content: "Great party! The food was amazing.", created_at: new Date().toISOString() },
];

export default function DemoMemory() {
  const { t, language, setLanguage } = useLanguageStore();
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  const handleNextMedia = () => {
     if (!selectedMedia) return;
     const index = DEMO_MEDIA.findIndex(m => m.id === selectedMedia.id);
     const nextIndex = (index + 1) % DEMO_MEDIA.length;
     setSelectedMedia(DEMO_MEDIA[nextIndex]);
  };

  const handlePrevMedia = () => {
     if (!selectedMedia) return;
     const index = DEMO_MEDIA.findIndex(m => m.id === selectedMedia.id);
     const prevIndex = (index - 1 + DEMO_MEDIA.length) % DEMO_MEDIA.length;
     setSelectedMedia(DEMO_MEDIA[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SEO 
        title="Demo Album | Lumina" 
        description="Experience a Lumina shared album."
      />
      
      {/* Demo Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-rose-500 text-white py-3 px-4 text-center font-bold shadow-lg flex items-center justify-center gap-4">
        <span>✨ This is a demo album. Create yours for free!</span>
        <Link to="/signup" className="bg-white text-rose-600 px-4 py-1 rounded-full text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
            Get Started
        </Link>
      </div>

      {/* Sticky Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent text-white">
         <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="flex flex-col">
                  <h1 className="text-xl font-black tracking-tight leading-none text-white drop-shadow-md">
                     {DEMO_MEMORY.title}
                  </h1>
                  <span className="text-xs font-medium uppercase tracking-widest text-white/80 drop-shadow-md">
                      {t('shared_memory')} (Demo)
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-3 text-xs font-bold tracking-widest px-4 py-2 rounded-full backdrop-blur-md bg-black/20 text-white border border-white/10">
                    <button onClick={() => setLanguage('en')} className={language === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}>EN</button>
                    <button onClick={() => setLanguage('es')} className={language === 'es' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}>ES</button>
                </div>

                <label className="cursor-pointer px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 bg-white text-black hover:bg-white/90 shadow-black/20" onClick={() => alert("This is a demo! Sign up to upload real photos.")}>
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('add_photo')}</span>
                </label>
            </div>
         </div>
      </nav>

      {/* Hero Cover Image */}
      <div className="w-full h-[70vh] relative animate-in fade-in duration-700">
          <img src={DEMO_MEDIA[0].file_url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-32 max-w-7xl mx-auto">
              <div className="max-w-2xl animate-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex items-center gap-3 mb-4 text-white/80">
                      <span className="text-sm font-medium">@maria_alex</span>
                      <span className="text-white/40">•</span>
                      <span className="text-sm">{new Date(DEMO_MEMORY.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed line-clamp-3">
                    {DEMO_MEMORY.content}
                </p>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32 -mt-20 relative z-10">
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {t('unsorted_photos')}
                </h3>
             </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {DEMO_MEDIA.map((m: any) => (
                    <div 
                        key={m.id} 
                        className="break-inside-avoid rounded-xl overflow-hidden bg-secondary/20 relative group cursor-zoom-in mb-4" 
                        onClick={() => setSelectedMedia(m)}
                    >
                        <img src={m.file_url} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Floating Comments Button */}
      <div className="fixed bottom-24 right-8 z-40">
        <button 
            onClick={() => setShowComments(!showComments)}
            className="bg-foreground text-background p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
        >
            <MessageSquare className="h-6 w-6" />
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full absolute -top-1 -right-1">
                {DEMO_COMMENTS.length}
            </span>
        </button>
      </div>

      {/* Comments Sidebar */}
      {showComments && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background shadow-2xl z-50 p-6 flex flex-col border-l border-border animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Guest Book (Demo)</h2>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-secondary rounded-full">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                {DEMO_COMMENTS.map((comment: any) => (
                    <div key={comment.id} className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm">{comment.author_name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">{comment.content}</p>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-border opacity-50 pointer-events-none">
                <p className="text-center text-sm text-muted-foreground mb-4">Sign up to post comments!</p>
            </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
      {selectedMedia && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setSelectedMedia(null)}
        >
            <button 
               className="fixed top-6 right-6 z-[80] p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-all shadow-xl" 
               onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }}
            >
               <X className="w-6 h-6" />
            </button>
            
            <motion.div 
               className="relative max-w-7xl max-h-screen w-full h-full flex flex-col items-center justify-center" 
               onClick={e => e.stopPropagation()}
               drag
               dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
               dragElastic={0.8}
               onDragEnd={(e, { offset, velocity }) => {
                   const swipe = offset.x;
                   if (swipe < -50) handleNextMedia();
                   else if (swipe > 50) handlePrevMedia();
               }}
            >
               <motion.img 
                 key={selectedMedia.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.2 }}
                 src={selectedMedia.file_url} 
                 className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-none select-none" 
               />
            </motion.div>

             {/* Navigation Arrows */}
             <button 
                 className="fixed left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[80] hidden md:block"
                 onClick={(e) => { e.stopPropagation(); handlePrevMedia(); }}
             >
                 <ChevronLeft className="w-8 h-8" />
             </button>
             <button 
                 className="fixed right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[80] hidden md:block"
                 onClick={(e) => { e.stopPropagation(); handleNextMedia(); }}
             >
                 <ChevronRight className="w-8 h-8" />
             </button>
         </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}