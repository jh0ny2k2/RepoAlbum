import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Image as ImageIcon, MapPin, Lock, Globe, X, ArrowLeft, Upload, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';

export default function CreateMemory() {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();
  const { t } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'private',
    location: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("No active session. Please log in again.");
      navigate('/login');
      return;
    }

    const userId = user?.id || session.user.id;
    if (!userId) return;
    
    setLoading(true);

    try {
      const insertData: any = {
        user_id: userId,
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      if (formData.location) {
        insertData.location = formData.location;
      }

      const { data: memoryData, error } = await supabase
        .from('memories')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      if (selectedFile && memoryData) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${userId}/${memoryData.id}/${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('memories')
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);

          await supabase
            .from('memory_media')
            .insert([{
              memory_id: memoryData.id,
              file_url: publicUrl,
              file_type: 'image',
              storage_path: filePath
            }]);
        }
      }

      navigate('/app');
    } catch (error: any) {
      console.error('Error creating memory:', error);
      alert('Error creating memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
       {/* Top Navigation Bar - Sticky */}
       <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
             <button 
               onClick={() => navigate('/app')}
               className="p-2 -ml-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
               title={t('back' as any) || "Back"}
             >
                <ArrowLeft className="w-5 h-5" />
             </button>
             
             <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                {t('new_memory')}
             </div>

             <button
               onClick={handleSubmit}
               disabled={loading || !formData.title}
               className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
             >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('publish' as any) || 'Publish')}
             </button>
          </div>
       </nav>

       {/* Main Editor Area */}
       <div className="max-w-3xl mx-auto px-4 py-8 pb-32 space-y-8 animate-in fade-in duration-500">
          
          {/* Cover Image - Wide & Cinematic */}
          <div 
            className={`relative group rounded-2xl overflow-hidden transition-all duration-300 ${
              previewUrl ? 'aspect-video shadow-lg' : 'h-48 bg-secondary/30 border-2 border-dashed border-border hover:border-foreground/20'
            } ${isDragOver ? 'border-primary bg-primary/5' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {previewUrl ? (
               <>
                 <img src={previewUrl} alt="Cover" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                       onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                       className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                       <X className="w-4 h-4" /> {t('remove' as any) || 'Remove'}
                    </button>
                 </div>
               </>
            ) : (
               <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  <div className="bg-background p-4 rounded-full shadow-sm mb-3">
                     <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">{t('add_cover_image' as any) || 'Add a cover image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
               </label>
            )}
          </div>

          {/* Title Input - Large & Bold */}
          <input
            type="text"
            placeholder={t('title_placeholder' as any) || "Title your memory..."}
            className="w-full bg-transparent text-5xl font-black placeholder-muted-foreground/30 border-none focus:ring-0 p-0 leading-tight"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
          />

          {/* Metadata Bar - Compact & Clean */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
             {/* Location Pill */}
             <div className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg text-muted-foreground transition-colors group focus-within:ring-1 focus-within:ring-border">
                <MapPin className="w-4 h-4" />
                <input 
                   type="text" 
                   placeholder={t('add_location' as any) || "Add location"}
                   className="bg-transparent border-none focus:ring-0 p-0 w-32 placeholder-muted-foreground/50 text-foreground text-sm"
                   value={formData.location}
                   onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
             </div>

             {/* Privacy Pill */}
             <div className="flex bg-secondary/50 rounded-lg p-1 border border-transparent hover:border-border transition-colors">
                <button
                   onClick={() => setFormData({ ...formData, status: 'private' })}
                   className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                      formData.status === 'private' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                   }`}
                >
                   <Lock className="w-3 h-3" /> {t('private')}
                </button>
                <button
                   onClick={() => setFormData({ ...formData, status: 'public_link' })}
                   className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                      formData.status === 'public_link' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                   }`}
                >
                   <Globe className="w-3 h-3" /> {t('public')}
                </button>
             </div>
             
             {/* Date Display (Auto) */}
             <div className="ml-auto text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border w-full" />

          {/* Content Area - Focus Mode */}
          <textarea
             placeholder={t('story_placeholder' as any) || "Tell your story... What made this moment special?"}
             className="w-full min-h-[400px] bg-transparent text-lg leading-relaxed text-foreground placeholder-muted-foreground/40 border-none focus:ring-0 p-0 resize-none"
             value={formData.content}
             onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
       </div>
    </div>
  );
}
