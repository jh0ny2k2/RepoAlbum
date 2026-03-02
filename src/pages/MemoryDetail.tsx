import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Calendar as CalendarIcon, MapPin, Lock, Globe, Users, Tag, Trash2, Plus, FolderPlus, Image as ImageIcon, Folder, Upload, X, Download, Edit, Save, MoreVertical, Pencil, Play, LayoutGrid, List, ChevronLeft, ChevronRight, Grid, Layout, Share2, Check, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { compressImage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';

export default function MemoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const queryClient = useQueryClient();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [showQR, setShowQR] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Edit Mode State (Memory)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    location: '',
    status: 'private',
    date: ''
  });

  // Edit Mode State (Section)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');

  const { data: memory, isLoading, error } = useQuery({
    queryKey: ['memory', id],
    queryFn: async () => {
      if (!id) throw new Error('Memory ID is required');

      const { data: memoryData, error: memoryError } = await supabase
        .from('memories')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          ),
          memory_tags (
            tags (
              name
            )
          ),
          memory_sections (
            id,
            title,
            created_at,
            cover_media_id
          )
        `)
        .eq('id', id)
        .order('created_at', { foreignTable: 'memory_sections', ascending: true })
        .single();

      if (memoryError) throw memoryError;

      const { data: mediaData, error: mediaError } = await supabase
        .from('memory_media')
        .select('*')
        .eq('memory_id', id);

      if (mediaError) throw mediaError;

      return {
        ...memoryData,
        memory_media: mediaData
      };
    },
    enabled: !!id,
  });

  const isOwner = user?.id === memory?.user_id;
  const activeSection = memory?.memory_sections?.find((s: any) => s.id === activeSectionId);
  
  const currentCoverMedia = useMemo(() => {
     if (activeSection?.cover_media_id) {
         return memory?.memory_media?.find((m: any) => m.id === activeSection.cover_media_id);
     }
     if (memory?.cover_media_id) {
         return memory?.memory_media?.find((m: any) => m.id === memory.cover_media_id);
     }
     return null;
  }, [memory, activeSection]);

  // Filter media based on current view (Root vs Section)
  const currentMedia = useMemo(() => {
    return memory?.memory_media?.filter((m: any) => {
      if (activeSectionId) return m.section_id === activeSectionId;
      return !m.section_id;
    }) || [];
  }, [memory, activeSectionId]);

  // Group media for calendar view
  const groupedMedia = useMemo(() => {
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

  // Calendar Render Logic
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
          onClick={() => hasMedia && setSelectedMedia(mediaForDay[0])}
          className={cn(
            "aspect-square relative transition-all duration-300 group rounded-xl border",
            hasMedia 
              ? "cursor-pointer hover:scale-105 hover:z-10 border-border/50 bg-secondary/30 shadow-sm" 
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
               {mediaForDay.length > 1 && (
                 <div className="absolute bottom-1 right-1 bg-primary/80 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                    <span className="text-primary-foreground font-bold text-[10px]">+{mediaForDay.length - 1}</span>
                 </div>
               )}
             </>
          ) : (
             <span className="font-medium text-sm">{d}</span>
          )}
        </div>
      );
    }
    return days;
  };

  // Populate edit form
  useEffect(() => {
    if (memory) {
      setEditForm({
        title: memory.title || '',
        content: memory.content || '',
        location: memory.location || '',
        status: memory.status || 'private',
        date: memory.created_at ? new Date(memory.created_at).toISOString().split('T')[0] : ''
      });
    }
  }, [memory]);

  // Mutations
  const updateMemoryMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      if (!id) throw new Error("No ID");
      const { date, ...rest } = updatedData;
      const payload: any = { ...rest };
      if (date) payload.created_at = date; 

      const { error } = await supabase.from('memories').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] });
      setIsEditing(false);
    }
  });

  const createSectionMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!id) throw new Error('No memory ID');
      const { error } = await supabase.from('memory_sections').insert([{ memory_id: id, title }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] });
      setNewSectionTitle('');
      setIsCreatingSection(false);
    },
  });

  const renameSectionMutation = useMutation({
    mutationFn: async ({ sectionId, title }: { sectionId: string, title: string }) => {
      const { error } = await supabase.from('memory_sections').update({ title }).eq('id', sectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] });
      setEditingSectionId(null);
      setEditSectionTitle('');
    },
  });

  const setCoverMutation = useMutation({
    mutationFn: async ({ memoryId, sectionId, mediaId }: { memoryId?: string, sectionId?: string, mediaId: string }) => {
      if (sectionId) {
        const { error } = await supabase.from('memory_sections').update({ cover_media_id: mediaId }).eq('id', sectionId);
        if (error) throw error;
      } else if (memoryId) {
        const { error } = await supabase.from('memories').update({ cover_media_id: mediaId }).eq('id', memoryId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] });
      alert("Cover updated!");
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const { error: moveError } = await supabase.from('memory_media').update({ section_id: null }).eq('section_id', sectionId);
      if (moveError) throw moveError;
      const { error } = await supabase.from('memory_sections').delete().eq('id', sectionId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memory', id] }),
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (media: any) => {
      if (media.storage_path) {
        await supabase.storage.from('memories').remove([media.storage_path]);
      }
      const { error } = await supabase.from('memory_media').delete().eq('id', media.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] });
      setSelectedMedia(null);
    },
  });

  // Handlers
  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;
    if (confirm('Are you sure you want to delete this photo? This cannot be undone.')) {
        try { await deleteMediaMutation.mutateAsync(selectedMedia); } 
        catch (error) { console.error('Failed to delete media:', error); alert('Failed to delete photo'); }
    }
  };

  const handleSaveEdit = () => updateMemoryMutation.mutate(editForm);
  
  const handleRenameSection = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingSectionId && editSectionTitle.trim()) {
          renameSectionMutation.mutate({ sectionId: editingSectionId, title: editSectionTitle.trim() });
      }
  };

  const handleDeleteSection = (sectionId: string) => {
      if (confirm('Are you sure you want to delete this album? Photos will be moved to "Unsorted".')) {
          deleteSectionMutation.mutate(sectionId);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string | null) => {
    if (!e.target.files || e.target.files.length === 0 || !id || !user?.id) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            try {
                let uploadFile = file;
                const fileExt = file.name.split('.').pop()?.toLowerCase();
                const isVideo = ['mp4', 'mov', 'webm'].includes(fileExt || '');
                const fileType = isVideo ? 'video' : 'image';
                if (fileType === 'image') {
                    try { uploadFile = await compressImage(file); } catch (err) { console.warn("Compression failed", err); }
                }
                const filePath = `${user.id}/${id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('memories').upload(filePath, uploadFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(filePath);
                const { error: dbError } = await supabase.from('memory_media').insert([{
                    memory_id: id, section_id: sectionId, file_url: publicUrl, file_type: fileType, storage_path: filePath
                }]);
                if (dbError) throw dbError;
                successCount++;
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                failCount++;
            }
        }
        await queryClient.invalidateQueries({ queryKey: ['memory', id] });
        if (failCount > 0) {
            alert(`Uploaded ${successCount} files. Failed to upload ${failCount} files.`);
        }
    } catch (error: any) {
        console.error("Upload failed:", error);
        alert(`Upload failed: ${error.message}`);
    } finally {
        setIsUploading(false);
        e.target.value = '';
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionTitle.trim()) createSectionMutation.mutate(newSectionTitle.trim());
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this memory?')) return;
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
      navigate('/app');
    } catch (error) { console.error('Error deleting memory:', error); alert('Error deleting memory'); }
  };

  const handleShare = async () => {
     if (!memory || !id) return;
     try {
       const { data: token, error } = await supabase.rpc('generate_share_token', { p_memory_id: id });
       if (error) throw error;
       const url = `${window.location.origin}/share/${token}`;
       navigator.clipboard.writeText(url);
       alert('Public link copied to clipboard!');
     } catch (err: any) { console.error("Error generating token:", err); alert("Failed to generate share link"); }
  };

  const handleShowQR = async () => {
    if (!memory || !id) return;
    try {
      const { data: token, error } = await supabase.rpc('generate_share_token', { p_memory_id: id });
      if (error) throw error;
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
      setShowQR(true);
    } catch (err: any) { console.error("Error generating token:", err); alert("Failed to generate QR code"); }
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

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error || !memory) return <div className="text-center py-20 bg-background h-screen"><p className="text-muted-foreground">Unable to load memory.</p><Link to="/app" className="text-primary hover:underline mt-4 inline-block">Return to Dashboard</Link></div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEO 
        title={memory.title} 
        description={memory.content?.substring(0, 160) || "View this memory"}
        image={currentCoverMedia?.file_url}
        type="article"
      />
      {/* Sticky Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${currentCoverMedia ? 'bg-transparent text-white' : 'bg-background/80 backdrop-blur-xl border-b border-border text-foreground'}`}>
         <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => activeSectionId ? setActiveSectionId(null) : navigate('/app')}
                 className={`p-2 -ml-2 rounded-full transition-colors ${currentCoverMedia ? 'hover:bg-black/20 text-white' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
               >
                  <ArrowLeft className="w-5 h-5" />
               </button>
               
               <div className="flex flex-col">
                  <h1 className={`text-lg font-bold leading-tight truncate max-w-[200px] md:max-w-md ${currentCoverMedia ? 'text-white drop-shadow-md' : 'text-foreground'}`}>
                     {activeSection ? activeSection.title : memory.title}
                  </h1>
                  {activeSection && (
                     <span className={`text-xs ${currentCoverMedia ? 'text-white/90 drop-shadow-md' : 'text-muted-foreground'}`}>in {memory.title}</span>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-2">
               {activeSectionId ? (
                  // Inside Album Actions
                  <>
                     <div className={`hidden md:flex rounded-lg p-1 mr-2 border ${currentCoverMedia ? 'bg-black/20 border-white/20 backdrop-blur-md' : 'bg-secondary/50 border-border/50'}`}>
                        <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? (currentCoverMedia ? 'bg-white/20 text-white' : 'bg-background shadow-sm text-foreground') : (currentCoverMedia ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'))}>
                           <Grid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('calendar')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'calendar' ? (currentCoverMedia ? 'bg-white/20 text-white' : 'bg-background shadow-sm text-foreground') : (currentCoverMedia ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'))}>
                           <CalendarIcon className="w-4 h-4" />
                        </button>
                     </div>
                     {isOwner && (
                        <label className={cn("cursor-pointer px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg", isUploading && "opacity-50 cursor-not-allowed", currentCoverMedia ? 'bg-white text-black hover:bg-white/90 shadow-black/20' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20')}>
                           {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                           <span className="hidden sm:inline">{t('upload_photo')}</span>
                           <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={(e) => handleFileUpload(e, activeSectionId)} disabled={isUploading} />
                        </label>
                     )}
                  </>
               ) : (
                  // Root Actions
                  <>
                     {isOwner && (
                        <div className="flex items-center gap-1">
                           <button onClick={() => setIsEditing(!isEditing)} className={cn("p-2 rounded-full transition-colors", isEditing ? (currentCoverMedia ? "bg-white text-black" : "bg-primary text-primary-foreground") : (currentCoverMedia ? "text-white hover:bg-white/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary"))}>
                              {isEditing ? <Check className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                           </button>
                           <button onClick={handleShowQR} className={`p-2 rounded-full transition-colors ${currentCoverMedia ? 'text-white hover:bg-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`} title="Print QR Code">
                              <QrCode className="w-5 h-5" />
                           </button>
                           <button onClick={handleShare} className={`p-2 rounded-full transition-colors ${currentCoverMedia ? 'text-white hover:bg-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                              <Share2 className="w-5 h-5" />
                           </button>
                           <button onClick={handleDelete} className={`p-2 rounded-full transition-colors ${currentCoverMedia ? 'text-white hover:bg-white/20 hover:text-red-400' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}>
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
      </nav>

      {/* Hero Cover Image */}
      {currentCoverMedia && (
          <div className="w-full h-[60vh] relative animate-in fade-in duration-700">
              <img src={currentCoverMedia.file_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
          </div>
      )}

      <div className={`max-w-5xl mx-auto px-4 pb-32 ${currentCoverMedia ? '-mt-20 relative z-10' : 'pt-24'}`}>
        {/* Content Area */}
        {!activeSectionId ? (
           /* ROOT VIEW */
           <div className="space-y-12 animate-in fade-in duration-500">
              
              {/* Memory Header & Details */}
              <div className="space-y-6">
                 {!isEditing ? (
                    <div className="space-y-4">
                       <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/30 border border-border/50 rounded-full">
                             <CalendarIcon className="w-3.5 h-3.5" />
                             {new Date(memory.created_at).toLocaleDateString()}
                          </div>
                          {memory.location && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-secondary/30 border border-border/50 rounded-full">
                                <MapPin className="w-3.5 h-3.5" />
                                {memory.location}
                             </div>
                          )}
                          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/30 border border-border/50 rounded-full capitalize">
                             {memory.status === 'private' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                             {t(memory.status as any)}
                          </div>
                       </div>
                       
                       <p className="text-lg md:text-xl text-foreground/90 leading-relaxed whitespace-pre-wrap font-light">
                          {memory.content}
                       </p>
                    </div>
                 ) : (
                    /* EDIT FORM */
                    <div className="bg-card border border-border p-6 rounded-2xl space-y-6 shadow-sm">
                       <div className="space-y-2">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('title_placeholder')}</label>
                           <input 
                               type="text" 
                               value={editForm.title} 
                               onChange={e => setEditForm({...editForm, title: e.target.value})}
                               className="text-2xl font-bold bg-transparent border-b border-border w-full pb-2 focus:border-primary focus:ring-0 px-0 placeholder:text-muted-foreground/50"
                               placeholder={t('title_placeholder')}
                           />
                       </div>
                       <div className="space-y-2">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('story_placeholder')}</label>
                           <textarea 
                               value={editForm.content}
                               onChange={e => setEditForm({...editForm, content: e.target.value})}
                               className="w-full bg-secondary/30 rounded-xl border-none p-4 min-h-[150px] resize-none focus:ring-1 focus:ring-border placeholder:text-muted-foreground/50"
                               placeholder={t('story_placeholder')}
                           />
                       </div>
                       <div className="flex justify-end gap-3 pt-2">
                           <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">{t('back')}</button>
                           <button onClick={handleSaveEdit} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">{t('publish')}</button>
                       </div>
                    </div>
                 )}
              </div>

              <div className="h-px bg-border/50" />

              {/* Albums Grid */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('albums')}</h3>
                    {isOwner && !isCreatingSection && (
                       <button onClick={() => setIsCreatingSection(true)} className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                          <Plus className="w-4 h-4" /> {t('new_album')}
                       </button>
                    )}
                 </div>

                 {isCreatingSection && (
                    <form onSubmit={handleCreateSection} className="flex gap-2 max-w-md animate-in fade-in slide-in-from-left-4 mb-6">
                       <input
                          autoFocus
                          type="text"
                          placeholder={t('album_name_placeholder')}
                          className="flex-1 bg-secondary/50 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                       />
                       <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold">{t('create')}</button>
                       <button type="button" onClick={() => setIsCreatingSection(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
                    </form>
                 )}

                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {memory.memory_sections?.map((section: any) => (
                       <div key={section.id} className="group cursor-pointer" onClick={() => setActiveSectionId(section.id)}>
                          <div className="aspect-[4/3] bg-secondary/30 rounded-2xl overflow-hidden relative mb-3 border border-border/50 transition-all duration-500 group-hover:shadow-xl group-hover:border-primary/20 group-hover:-translate-y-1">
                             {/* Dynamic Cover Image Logic */}
                             {(() => {
                                 let previewUrl = null;
                                 if (section.cover_media_id) {
                                    const cover = memory.memory_media?.find((m: any) => m.id === section.cover_media_id);
                                    if (cover) previewUrl = cover.file_url;
                                 } else {
                                    const first = memory.memory_media?.find((m: any) => m.section_id === section.id);
                                    if (first) previewUrl = first.file_url;
                                 }
                                 
                                 return previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 group-hover:text-primary/50 transition-colors">
                                       <Folder className="w-12 h-12" />
                                    </div>
                                 );
                             })()}
                             
                             {/* Overlay */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             
                             {/* Hover Actions */}
                             {isOwner && (
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                      className="p-1.5 bg-black/40 text-white backdrop-blur-md rounded-full hover:bg-destructive transition-colors"
                                   >
                                      <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                             )}
                          </div>
                          <div className="flex justify-between items-start">
                              <div>
                                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm md:text-base leading-tight">{section.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {memory.memory_media?.filter((m: any) => m.section_id === section.id).length || 0} items
                                  </p>
                              </div>
                          </div>
                       </div>
                    ))}
                    
                    {/* Empty State for Albums */}
                    {(!memory.memory_sections || memory.memory_sections.length === 0) && !isCreatingSection && (
                        <button 
                            onClick={() => setIsCreatingSection(true)}
                            className="aspect-[4/3] flex flex-col items-center justify-center gap-3 bg-secondary/20 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-secondary/40 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{t('new_album')}</span>
                        </button>
                    )}
                 </div>
              </div>

              {/* Unsorted Photos */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('unsorted_photos')}</h3>
                    {isOwner && (
                       <label className="text-sm font-bold text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1 transition-colors">
                          <Upload className="w-4 h-4" /> {t('upload_photo')}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, null)} />
                       </label>
                    )}
                 </div>
                 
                 {/* Photo Grid (Unsorted) */}
                 <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {currentMedia?.map((media: any) => (
                       <div key={media.id} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in" onClick={() => setSelectedMedia(media)}>
                          <img src={media.file_url} className="w-full h-auto transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                       </div>
                    ))}
                 </div>
                 {(!currentMedia || currentMedia.length === 0) && (
                    <div className="py-12 text-center border border-dashed border-border/50 rounded-2xl bg-secondary/10">
                       <p className="text-muted-foreground text-sm">No unsorted photos</p>
                    </div>
                 )}
              </div>
           </div>
        ) : (
           /* ALBUM VIEW */
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentMedia && currentMedia.length > 0 ? (
                 viewMode === 'grid' ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                       {currentMedia.map((media: any) => (
                          <div key={media.id} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in shadow-sm" onClick={() => setSelectedMedia(media)}>
                             <img src={media.file_url} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                             {media.file_type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                   <Play className="w-12 h-12 text-white fill-white opacity-80 drop-shadow-lg" />
                                </div>
                             )}
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
                 <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="bg-secondary/50 p-6 rounded-full mb-6">
                       <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{t('empty_album')}</h3>
                    <p className="text-muted-foreground mb-8">{t('upload_photos_msg')}</p>
                    {isOwner && (
                       <label className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold cursor-pointer hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {t('upload_photo')}
                          <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={(e) => handleFileUpload(e, activeSectionId)} />
                       </label>
                    )}
                 </div>
              )}
           </div>
        )}
      </div>

      {/* Lightbox - Minimal & Cinematic */}
      <AnimatePresence>
      {showQR && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
            <div className="bg-white text-black p-8 rounded-3xl max-w-sm w-full text-center space-y-6" onClick={e => e.stopPropagation()}>
                <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold">Share this Memory</h3>
                    <p className="text-gray-500 text-sm">Scan to upload photos & view album</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 inline-block">
                    <QRCode value={shareUrl} size={200} />
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => window.print()}
                        className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        Print Poster
                    </button>
                    <button 
                        onClick={() => setShowQR(false)}
                        className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
            
            {/* Printable Area (Hidden by default, shown on print) */}
            <div className="hidden print:flex fixed inset-0 z-[100] bg-white flex-col items-center justify-center text-center p-12">
                <h1 className="text-6xl font-serif font-bold mb-4">Capture the Moment</h1>
                <p className="text-2xl text-gray-500 mb-12">Scan to upload your photos to our shared album</p>
                <QRCode value={shareUrl} size={400} />
                <p className="mt-12 text-xl font-medium text-gray-400">Powered by Lumina</p>
            </div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:flex, .print\\:flex * {
                        visibility: visible;
                    }
                }
            `}</style>
        </div>
      )}

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
                  {isOwner && selectedMedia.file_type !== 'video' && (
                     <button 
                        onClick={() => setCoverMutation.mutate({ 
                            memoryId: !activeSectionId ? id : undefined,
                            sectionId: activeSectionId || undefined, 
                            mediaId: selectedMedia.id 
                        })}
                        className="bg-white/10 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10"
                     >
                        {t('add_cover_image') || "Set Cover"}
                     </button>
                  )}
                  <button 
                     onClick={() => handleDownload(selectedMedia.file_url, `photo-${selectedMedia.id}.jpg`)}
                     className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                     <Download className="w-4 h-4" /> {t('download')}
                  </button>
                  {isOwner && (
                     <button 
                        onClick={handleDeleteMedia}
                        className="bg-red-500/20 text-red-400 px-6 py-2 rounded-full text-sm font-medium hover:bg-red-500/30 transition-colors border border-red-500/20"
                     >
                        {t('delete')}
                     </button>
                  )}
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
    </div>
  );
}
