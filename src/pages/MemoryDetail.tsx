import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Calendar, MapPin, Lock, Globe, Users, Tag, Trash2, Plus, FolderPlus, Image as ImageIcon, Folder, Upload, X, Download, Edit, Save } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';

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
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    location: '',
    status: 'private',
    date: ''
  });

  const { data: memory, isLoading, error } = useQuery({
    queryKey: ['memory', id],
    queryFn: async () => {
      if (!id) throw new Error('Memory ID is required');

      const { data, error } = await supabase
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
          memory_media (
            id,
            file_url,
            file_type,
            section_id
          ),
          memory_sections (
            id,
            title,
            created_at
          )
        `)
        .eq('id', id)
        .order('created_at', { foreignTable: 'memory_sections', ascending: true })
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Populate edit form when memory data loads
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

  const updateMemoryMutation = useMutation({
    mutationFn: async (updatedData: any) => {
        if (!id) throw new Error("No ID");
        
        // Prepare data for update
        // If date is changed, we update created_at. 
        // We try to preserve the time if possible, or just set to noon UTC to be safe?
        // Let's just use the date string, Supabase/Postgres will treat 'YYYY-MM-DD' as midnight.
        const { date, ...rest } = updatedData;
        
        const payload: any = { ...rest };
        if (date) {
            payload.created_at = date; 
        }

        const { error } = await supabase
            .from('memories')
            .update(payload)
            .eq('id', id);
        
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
      const { error } = await supabase
        .from('memory_sections')
        .insert([{ memory_id: id, title }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] });
      setNewSectionTitle('');
      setIsCreatingSection(false);
    },
  });

  const handleSaveEdit = () => {
      updateMemoryMutation.mutate(editForm);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string | null) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!id || !user?.id) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from('memories')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('memory_media')
            .insert([{
                memory_id: id,
                section_id: sectionId,
                file_url: publicUrl,
                file_type: 'image',
                storage_path: filePath
            }]);

        if (dbError) throw dbError;

        await queryClient.invalidateQueries({ queryKey: ['memory', id] });
        
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
    if (newSectionTitle.trim()) {
      createSectionMutation.mutate(newSectionTitle.trim());
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this memory?')) return;
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
      navigate('/app');
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Error deleting memory');
    }
  };

  const handleShare = async () => {
     if (!memory || !id) return;
     try {
       const { data: token, error } = await supabase.rpc('generate_share_token', { p_memory_id: id });
       if (error) throw error;
       
       const url = `${window.location.origin}/share/${token}`;
       navigator.clipboard.writeText(url);
       alert('Public link copied to clipboard!');
     } catch (err: any) {
       console.error("Error generating token:", err);
       alert("Failed to generate share link");
     }
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
    } catch (error) {
      console.error('Download failed:', error);
      alert('Error downloading image');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Error loading memory details.</p>
        <Link to="/app" className="text-black underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === memory.user_id;
  const activeSection = memory.memory_sections?.find((s: any) => s.id === activeSectionId);
  const currentMedia = memory.memory_media?.filter((m: any) => {
    if (activeSectionId) return m.section_id === activeSectionId;
    return !m.section_id;
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center mb-8 text-sm text-gray-500">
        <button onClick={() => navigate('/app')} className="hover:text-black transition-colors">
          {t('feed')}
        </button>
        <span className="mx-2">/</span>
        <button 
          onClick={() => setActiveSectionId(null)} 
          className={`hover:text-black transition-colors ${!activeSectionId ? 'font-bold text-black' : ''}`}
        >
          {memory.title}
        </button>
        {activeSection && (
          <>
            <span className="mx-2">/</span>
            <span className="font-bold text-black">{activeSection.title}</span>
          </>
        )}
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        
        {/* Header - Only show in Root View */}
        {!activeSectionId && (
          <div className="px-6 py-8 md:px-10 md:py-10 border-b border-gray-100">
            {isEditing ? (
                 /* EDIT MODE */
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title</label>
                        <input 
                            type="text" 
                            value={editForm.title} 
                            onChange={e => setEditForm({...editForm, title: e.target.value})}
                            className="text-4xl font-extrabold text-gray-900 border-b-2 border-gray-100 focus:border-black focus:ring-0 p-0 pb-2 transition-colors placeholder-gray-300"
                            placeholder="Memory Title"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-6">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date</label>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-black transition-colors">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <input 
                                    type="date" 
                                    value={editForm.date}
                                    onChange={e => setEditForm({...editForm, date: e.target.value})}
                                    className="border-none focus:ring-0 p-0 text-sm font-medium w-full text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Location</label>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-black transition-colors">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={editForm.location}
                                    onChange={e => setEditForm({...editForm, location: e.target.value})}
                                    placeholder="Add location"
                                    className="border-none focus:ring-0 p-0 text-sm font-medium w-full text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>
                         <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Privacy</label>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setEditForm({...editForm, status: 'private'})}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${editForm.status === 'private' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                                >
                                    Private
                                </button>
                                <button 
                                    onClick={() => setEditForm({...editForm, status: 'public_link'})}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${editForm.status === 'public_link' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                                >
                                    Public
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Story</label>
                         <textarea 
                            rows={6}
                            value={editForm.content}
                            onChange={e => setEditForm({...editForm, content: e.target.value})}
                            className="w-full text-lg text-gray-700 leading-relaxed border border-gray-200 rounded-xl p-4 focus:border-black focus:ring-0 transition-colors resize-none placeholder-gray-300"
                            placeholder="Tell your story..."
                         />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button 
                            onClick={handleSaveEdit} 
                            disabled={updateMemoryMutation.isPending}
                            className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            {updateMemoryMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </button>
                         <button 
                            onClick={() => setIsEditing(false)} 
                            className="bg-white text-gray-600 border border-gray-200 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                 </div>
            ) : (
                /* VIEW MODE */
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 animate-in fade-in duration-300">
                <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">{memory.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(memory.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                    {memory.location && (
                        <div className="flex items-center">
                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-2"></div>
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {memory.location}
                        </div>
                    )}
                    <div className="flex items-center">
                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-2"></div>
                        {memory.status === 'private' && <Lock className="h-4 w-4 mr-2" />}
                        {memory.status === 'public_link' && <Globe className="h-4 w-4 mr-2" />}
                        {memory.status === 'circle' && <Users className="h-4 w-4 mr-2" />}
                        <span className="capitalize">{t(memory.status as any)}</span>
                    </div>
                    </div>

                    <p className="text-gray-600 text-lg leading-relaxed max-w-3xl whitespace-pre-wrap">
                        {memory.content}
                    </p>

                    {memory.memory_tags && memory.memory_tags.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2">
                        {memory.memory_tags.map((tagObj: any, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            #{tagObj.tags.name}
                        </span>
                        ))}
                    </div>
                    )}
                </div>
                
                {isOwner && (
                    <div className="flex gap-2">
                    <button onClick={() => setIsEditing(true)} className="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-200" title="Edit Info">
                        <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={handleShare} className="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-200" title={t('share_link')}>
                        <Globe className="h-5 w-5" />
                    </button>
                    <button onClick={handleDelete} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100" title={t('delete')}>
                        <Trash2 className="h-5 w-5" />
                    </button>
                    </div>
                )}
                </div>
            )}
          </div>
        )}

        {/* Header - Folder View */}
        {activeSectionId && activeSection && (
          <div className="px-6 py-6 md:px-10 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setActiveSectionId(null)}
                 className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-100 text-gray-900 transition-colors"
               >
                 <ArrowLeft className="h-5 w-5" />
               </button>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   {activeSection.title}
                 </h2>
               </div>
            </div>
            
            {isOwner && (
               <label className={`cursor-pointer inline-flex items-center px-4 py-2 text-sm font-bold rounded-full text-white bg-black hover:bg-gray-800 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isUploading ? t('uploading') : t('upload_photo')}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, activeSectionId)} 
                    disabled={isUploading}
                  />
               </label>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="px-6 py-8 md:px-10 min-h-[400px] bg-white">
          
          {/* Root View: Show Folders + Loose Photos */}
          {!activeSectionId && (
            <div className="space-y-12">
              
              {/* Folders Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    {t('albums')}
                  </h3>
                  {isOwner && !isCreatingSection && (
                    <button 
                      onClick={() => setIsCreatingSection(true)}
                      className="text-sm font-bold text-black hover:text-gray-600 flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> {t('new_album')}
                    </button>
                  )}
                </div>

                {isCreatingSection && (
                  <form onSubmit={handleCreateSection} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3 max-w-md">
                    <FolderPlus className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('album_name_placeholder')}
                      className="flex-1 border-none focus:ring-0 text-gray-900 placeholder-gray-400 bg-transparent font-medium"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={createSectionMutation.isPending} className="text-black font-bold hover:bg-gray-200 px-3 py-1 rounded transition-colors">{t('create')}</button>
                      <button type="button" onClick={() => setIsCreatingSection(false)} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {memory.memory_sections?.map((section: any) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      className="group flex flex-col text-left cursor-pointer"
                    >
                      <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl mb-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors relative overflow-hidden border border-gray-100">
                        {(() => {
                          const previewImage = memory.memory_media?.find((m: any) => m.section_id === section.id);
                          if (previewImage) {
                            return <img src={previewImage.file_url} className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105" />;
                          }
                          return <Folder className="h-8 w-8 text-gray-300" />;
                        })()}
                      </div>
                      <span className="font-bold text-gray-900 truncate w-full group-hover:text-gray-600 transition-colors">{section.title}</span>
                      <span className="text-xs text-gray-500">
                        {memory.memory_media?.filter((m: any) => m.section_id === section.id).length || 0} items
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Loose Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    {t('unsorted_photos')}
                  </h3>
                  {isOwner && (
                     <label className={`cursor-pointer text-sm font-bold text-black hover:text-gray-600 flex items-center gap-1 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                        {isUploading ? t('uploading') : t('upload_photo')}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, null)} 
                          disabled={isUploading}
                        />
                     </label>
                  )}
                </div>
                
                {currentMedia && currentMedia.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentMedia.map((media: any) => (
                      <div 
                        key={media.id} 
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer"
                        onClick={() => setSelectedMedia(media)}
                      >
                        <img src={media.file_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl">
                      <p className="text-sm text-gray-400 italic">No unsorted photos.</p>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Folder View: Photos Only */}
          {activeSectionId && (
            <div>
               {currentMedia && currentMedia.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentMedia.map((media: any) => (
                      <div 
                        key={media.id} 
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer"
                        onClick={() => setSelectedMedia(media)}
                      >
                        <img src={media.file_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                       <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{t('empty_album')}</h3>
                    <p className="text-gray-500 mb-6 mt-2">{t('upload_photos_msg')}</p>
                    {isOwner && (
                      <label className={`cursor-pointer inline-flex items-center px-6 py-3 text-sm font-bold rounded-full text-white bg-black hover:bg-gray-800 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                          {isUploading ? t('uploading') : t('upload_first')}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, activeSectionId)} 
                            disabled={isUploading}
                          />
                      </label>
                    )}
                  </div>
                )}
            </div>
          )}

        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl p-4" onClick={() => setSelectedMedia(null)}>
          <button 
            className="absolute top-4 right-4 text-gray-500 hover:text-black p-2 bg-gray-100 rounded-full"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
             <img 
               src={selectedMedia.file_url} 
               alt="Full view" 
               className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
             />
             
             <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => handleDownload(selectedMedia.file_url, `memory-${id}-${selectedMedia.id}.jpg`)}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all shadow-xl hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  {t('download')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
