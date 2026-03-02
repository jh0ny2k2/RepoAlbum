import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Calendar as CalendarIcon, MapPin, Tag, Image as ImageIcon, Folder, Upload, Globe, ArrowLeft, X, Download, Play, MessageSquare, Send, LayoutGrid, List, ChevronLeft, ChevronRight, Calendar, Grid, Sparkles, Share2 } from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { compressImage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';

export default function PublicMemory() {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useLanguageStore();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{date: string, media: any[]} | null>(null);

  // Comments State
  const [commentForm, setCommentForm] = useState({ name: '', content: '' });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { data: sharedData, isLoading, error } = useQuery({
    queryKey: ['shared_memory', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');

      const { data, error } = await supabase.rpc('get_shared_memory', { p_token: token });

      if (error) throw error;
      if (!data || data.error) throw new Error(data?.error || 'Memory not found');
      
      return data;
    },
    enabled: !!token,
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', token],
    queryFn: async () => {
        if (!sharedData?.memory?.id) return [];
        const { data, error } = await supabase
            .from('memory_comments')
            .select('*')
            .eq('memory_id', sharedData.memory.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    enabled: !!sharedData?.memory?.id
  });

  const { memory, media = [], sections = [], tags = [], profile, can_upload } = sharedData || {};

  const activeSection = sections.find((s: any) => s.id === activeSectionId);
  const currentMedia = media.filter((m: any) => {
    if (activeSectionId) return m.section_id === activeSectionId;
    return !m.section_id;
  });

  // Determine Cover Image
  const coverImage = useMemo(() => {
      if (!memory) return null;
      // Try to find the specific cover media
      if (activeSection?.cover_media_id) {
          return media.find((m: any) => m.id === activeSection.cover_media_id);
      }
      if (memory.cover_media_id) {
          return media.find((m: any) => m.id === memory.cover_media_id);
      }
      // Fallback to first image
      return media.find((m: any) => m.file_type === 'image') || media[0];
  }, [memory, media, activeSection]);

  const groupedMedia = React.useMemo(() => {
    if (!currentMedia) return {};
    const groups: { [key: string]: any[] } = {};
    
    // Sort by date descending
    const sortedMedia = [...currentMedia].sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sortedMedia.forEach((media: any) => {
      const d = new Date(media.created_at);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(media);
    });
    return groups;
  }, [currentMedia]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    
    // Empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square bg-transparent"></div>);
    }
    
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const mediaForDay = groupedMedia[dateStr];
      const hasMedia = mediaForDay && mediaForDay.length > 0;
      
      days.push(
        <div 
          key={d} 
          onClick={() => hasMedia && setSelectedDay({ date: dateStr, media: mediaForDay })}
          className={cn(
            "aspect-square relative transition-all duration-300 group rounded-xl border",
            hasMedia 
              ? "cursor-pointer hover:scale-105 hover:z-10 border-white/50 bg-white/30 shadow-sm" 
              : "border-transparent flex items-center justify-center text-muted-foreground/20"
          )}
        >
          {hasMedia ? (
             <>
               {mediaForDay[0].file_type === 'video' ? (
                 <video src={mediaForDay[0].file_url} className="w-full h-full object-cover rounded-xl" muted />
               ) : (
                 <img src={mediaForDay[0].file_url} className="w-full h-full object-cover rounded-xl" />
               )}
               <div className="absolute top-1 right-1 bg-black/40 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                  <span className="text-white font-bold text-[10px]">{d}</span>
               </div>
             </>
          ) : (
             <span className="font-medium text-sm">{d}</span>
          )}
        </div>
      );
    }
    return days;
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.content.trim() || !sharedData?.memory?.id) return;
    
    setIsSubmittingComment(true);
    try {
        const { error } = await supabase.from('memory_comments').insert([{
            memory_id: sharedData.memory.id,
            author_name: commentForm.name.trim(),
            content: commentForm.content.trim()
        }]);
        if (error) throw error;
        setCommentForm({ name: '', content: '' });
        refetchComments();
        alert('Comment posted!');
    } catch (error) { console.error("Error posting comment:", error); alert("Failed to post comment."); } 
    finally { setIsSubmittingComment(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string | null) => {
    if (!e.target.files || !e.target.files[0] || !token) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
        let uploadFile = file;
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const isVideo = ['mp4', 'mov', 'webm'].includes(fileExt || '');
        const fileType = isVideo ? 'video' : 'image';

        if (fileType === 'image') {
            try { uploadFile = await compressImage(file); } catch (err) { console.warn("Compression failed", err); }
        }

        const fileName = `guest_uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage.from('memories').upload(filePath, uploadFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(filePath);

        const { error: rpcError } = await supabase.rpc('add_media_via_token', {
            p_token: token,
            p_file_url: publicUrl,
            p_file_type: fileType,
            p_storage_path: filePath,
            p_section_id: sectionId
        });
        if (rpcError) throw rpcError;

        await queryClient.invalidateQueries({ queryKey: ['shared_memory', token] });
        alert("Photo uploaded successfully!");
    } catch (error: any) { console.error("Guest upload failed:", error); alert(`Upload failed: ${error.message}`); } 
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleDownloadAll = async () => {
    if (!currentMedia || currentMedia.length === 0) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folderName = activeSection ? activeSection.title : memory.title;
      const folder = zip.folder(folderName);
      if (!folder) throw new Error("Failed to create zip folder");

      const downloadPromises = currentMedia.map(async (media: any, index: number) => {
        try {
          const response = await fetch(media.file_url);
          const blob = await response.blob();
          const filename = `photo-${index + 1}.jpg`;
          folder.file(filename, blob);
        } catch (err) { console.error(`Failed to download ${media.file_url}`, err); }
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
    } catch (error) { console.error("Error creating zip:", error); alert("Failed to download all photos."); } 
    finally { setIsDownloading(false); }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) { console.error('Download failed:', error); alert('Error downloading image'); }
  };

  const getSelectedIndex = () => {
     if (!selectedMedia || !currentMedia) return -1;
     return currentMedia.findIndex((m: any) => m.id === selectedMedia.id);
  };

  const handleNextMedia = () => {
     const index = getSelectedIndex();
     if (index === -1 || !currentMedia) return;
     const nextIndex = (index + 1) % currentMedia.length;
     setSelectedMedia(currentMedia[nextIndex]);
  };

  const handlePrevMedia = () => {
     const index = getSelectedIndex();
     if (index === -1 || !currentMedia) return;
     const prevIndex = (index - 1 + currentMedia.length) % currentMedia.length;
     setSelectedMedia(currentMedia[prevIndex]);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-white"><Loader2 className="animate-spin h-8 w-8 text-black" /></div>;
  if (error || !sharedData) return <div className="flex flex-col items-center justify-center h-screen bg-white px-4 text-center"><Globe className="h-12 w-12 text-gray-300 mb-4" /><h1 className="text-xl font-bold mb-2">Memory Not Found</h1><p className="text-gray-500">This link might be expired or invalid.</p></div>;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SEO 
        title={memory.title} 
        description={memory.content?.substring(0, 160) || "Shared Memory"}
        image={coverImage?.file_url}
        type="article"
      />
      {/* Sticky Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${coverImage ? 'bg-transparent text-white' : 'bg-background/80 backdrop-blur-xl border-b border-border text-foreground'}`}>
         <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
               {activeSectionId && (
                   <button 
                     onClick={() => setActiveSectionId(null)}
                     className={`p-2 rounded-full transition-colors ${coverImage ? 'hover:bg-black/20 text-white' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                   >
                      <ArrowLeft className="w-5 h-5" />
                   </button>
               )}
               
               <div className="flex flex-col">
                  <h1 className={`text-xl font-black tracking-tight leading-none ${coverImage ? 'text-white drop-shadow-md' : 'text-foreground'}`}>
                     {activeSection ? activeSection.title : memory.title}
                  </h1>
                  <span className={`text-xs font-medium uppercase tracking-widest ${coverImage ? 'text-white/80 drop-shadow-md' : 'text-muted-foreground'}`}>
                      {t('shared_memory')}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div className={`hidden sm:flex items-center gap-3 text-xs font-bold tracking-widest px-4 py-2 rounded-full backdrop-blur-md ${coverImage ? 'bg-black/20 text-white border border-white/10' : 'bg-secondary/50 text-foreground border border-border'}`}>
                    <button onClick={() => setLanguage('en')} className={language === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}>EN</button>
                    <button onClick={() => setLanguage('es')} className={language === 'es' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}>ES</button>
                </div>

                <div className={`hidden md:flex rounded-lg p-1 mr-2 border backdrop-blur-md ${coverImage ? 'bg-black/20 border-white/20' : 'bg-secondary/50 border-border/50'}`}>
                    <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? (coverImage ? 'bg-white/20 text-white' : 'bg-background shadow-sm text-foreground') : (coverImage ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'))}>
                        <Grid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('calendar')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'calendar' ? (coverImage ? 'bg-white/20 text-white' : 'bg-background shadow-sm text-foreground') : (coverImage ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'))}>
                        <CalendarIcon className="w-4 h-4" />
                    </button>
                </div>

                {can_upload && (
                    <label className={cn("cursor-pointer px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95", isUploading && "opacity-50 cursor-not-allowed", coverImage ? 'bg-white text-black hover:bg-white/90 shadow-black/20' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20')}>
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span className="hidden sm:inline">{t('add_photo')}</span>
                        <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={(e) => handleFileUpload(e, activeSectionId)} disabled={isUploading} />
                    </label>
                )}
            </div>
         </div>
      </nav>

      {/* Hero Cover Image */}
      {coverImage && (
          <div className="w-full h-[70vh] relative animate-in fade-in duration-700">
              <img src={coverImage.file_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 pb-32 max-w-7xl mx-auto">
                 <div className="max-w-2xl animate-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center gap-3 mb-4 text-white/80">
                         {profile?.avatar_url && (
                             <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-full border border-white/20" />
                         )}
                         <span className="text-sm font-medium">@{profile?.username}</span>
                         <span className="text-white/40">•</span>
                         <span className="text-sm">{new Date(memory.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed line-clamp-3">
                        {memory.content}
                    </p>
                 </div>
              </div>
          </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 pb-32 ${coverImage ? '-mt-20 relative z-10' : 'pt-24'}`}>
        
        {/* Albums / Sections */}
        {!activeSectionId && sections.length > 0 && (
            <div className="mb-12">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">{t('albums')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {sections.map((section: any) => (
                        <div key={section.id} className="group cursor-pointer" onClick={() => setActiveSectionId(section.id)}>
                            <div className="aspect-[4/3] bg-secondary/30 rounded-2xl overflow-hidden relative mb-3 border border-border/50 transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                                {(() => {
                                    // Try to find cover for section
                                    let previewUrl = null;
                                    if (section.cover_media_id) {
                                        const cover = media.find((m: any) => m.id === section.cover_media_id);
                                        if (cover) previewUrl = cover.file_url;
                                    }
                                    if (!previewUrl) {
                                        const first = media.find((m: any) => m.section_id === section.id);
                                        if (first) previewUrl = first.file_url;
                                    }
                                    
                                    return previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                            <Folder className="w-12 h-12" />
                                        </div>
                                    );
                                })()}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{section.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{media.filter((m: any) => m.section_id === section.id).length} photos</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Media Grid */}
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {activeSectionId ? 'Photos' : t('unsorted_photos')}
                </h3>
                {currentMedia.length > 0 && (
                    <button
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    className="text-sm font-bold text-foreground hover:text-primary flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {isDownloading ? 'Zipping...' : 'Download All'}
                    </button>
                )}
             </div>

             {currentMedia.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {currentMedia.map((m: any) => (
                            <div 
                                key={m.id} 
                                className="break-inside-avoid rounded-xl overflow-hidden bg-secondary/20 relative group cursor-zoom-in mb-4" 
                                onClick={() => setSelectedMedia(m)}
                            >
                                {m.file_type === 'video' ? (
                                    <div className="relative w-full h-auto">
                                        <video src={m.file_url} className="w-full h-auto rounded-xl" muted playsInline />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <Play className="h-12 w-12 text-white fill-white opacity-80" />
                                        </div>
                                    </div>
                                ) : (
                                    <img src={m.file_url} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                       <div className="flex items-center justify-between mb-8">
                          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-secondary rounded-full transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                          <h2 className="text-2xl font-black">{currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
                          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-secondary rounded-full transition-colors"><ChevronRight className="w-6 h-6" /></button>
                       </div>
                       <div className="grid grid-cols-7 gap-2">
                          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>)}
                          {renderCalendar()}
                       </div>
                    </div>
                )
             ) : (
                <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-secondary/10">
                   <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                   <p className="text-muted-foreground font-medium">{t('empty_album')}</p>
                </div>
             )}
        </div>
      </div>

      {/* Floating Comments Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button 
            onClick={() => setShowComments(!showComments)}
            className="bg-foreground text-background p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
        >
            <MessageSquare className="h-6 w-6" />
            {comments && comments.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full absolute -top-1 -right-1">
                    {comments.length}
                </span>
            )}
        </button>
      </div>

      {/* Comments Sidebar */}
      {showComments && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background shadow-2xl z-50 p-6 flex flex-col border-l border-border animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Guest Book</h2>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-secondary rounded-full">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                {comments?.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No comments yet. Be the first!</p>
                    </div>
                ) : (
                    comments?.map((comment: any) => (
                        <div key={comment.id} className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm">{comment.author_name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-foreground text-sm leading-relaxed">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handlePostComment} className="mt-auto pt-4 border-t border-border">
                <input 
                    type="text" 
                    placeholder={t('your_name')}
                    className="w-full mb-3 px-4 py-3 bg-secondary/50 rounded-xl border-transparent focus:bg-background focus:border-foreground focus:ring-0 transition-colors text-sm font-medium"
                    value={commentForm.name}
                    onChange={e => setCommentForm({...commentForm, name: e.target.value})}
                    required
                />
                <div className="relative">
                    <textarea 
                        placeholder={t('leave_message')}
                        className="w-full px-4 py-3 bg-secondary/50 rounded-xl border-transparent focus:bg-background focus:border-foreground focus:ring-0 transition-colors text-sm resize-none pr-12 min-h-[100px]"
                        value={commentForm.content}
                        onChange={e => setCommentForm({...commentForm, content: e.target.value})}
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmittingComment}
                        className="absolute bottom-3 right-3 p-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
      {selectedMedia && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setSelectedMedia(null)}
        >
            <button 
               className="fixed top-6 right-6 z-[60] p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-all shadow-xl" 
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
                   const verticalSwipe = offset.y;

                   // Vertical Swipe Down to Close
                   if (verticalSwipe > 100) {
                       setSelectedMedia(null);
                       return;
                   }

                   // Horizontal Swipe for Navigation
                   if (swipe < -50) {
                       handleNextMedia();
                   } else if (swipe > 50) {
                       handlePrevMedia();
                   }
               }}
            >
               {selectedMedia.file_type === 'video' ? (
                   <video 
                     src={selectedMedia.file_url} 
                     controls 
                     autoPlay 
                     className="max-w-full max-h-[85vh] rounded-lg shadow-2xl pointer-events-auto" 
                   />
               ) : (
                   <motion.img 
                     key={selectedMedia.id}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.2 }}
                     src={selectedMedia.file_url} 
                     className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-none select-none" 
                   />
               )}
               
               <div className="absolute bottom-8 flex gap-4 pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
                  <button 
                     onClick={() => handleDownload(selectedMedia.file_url, `photo-${selectedMedia.id}.jpg`)}
                     className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                     <Download className="w-4 h-4" /> {t('download')}
                  </button>
               </div>
            </motion.div>

             {/* Navigation Arrows */}
             <button 
                 className="fixed left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[60] hidden md:block"
                 onClick={(e) => { e.stopPropagation(); handlePrevMedia(); }}
             >
                 <ChevronLeft className="w-8 h-8" />
             </button>
             <button 
                 className="fixed right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[60] hidden md:block"
                 onClick={(e) => { e.stopPropagation(); handleNextMedia(); }}
             >
                 <ChevronRight className="w-8 h-8" />
             </button>

         </motion.div>
      )}
      </AnimatePresence>

      {/* Viral Loop / Marketing Footer */}
      <footer className="py-12 border-t border-border mt-20 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center space-y-6">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Sparkles className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">Create your own shared album</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Loved viewing this memory? Start your own free secure album and share moments with friends and family.
                </p>
            </div>
            <Link 
                to="/signup" 
                className="bg-foreground text-background px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg hover:scale-105"
            >
                Get Started for Free
            </Link>
            <p className="text-xs text-muted-foreground pt-4">
                Powered by <span className="font-bold text-foreground">Lumina</span>
            </p>
        </div>
      </footer>
    </div>
  );
}
