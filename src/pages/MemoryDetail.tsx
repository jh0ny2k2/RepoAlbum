import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Calendar, MapPin, Lock, Globe, Users, Tag, Trash2, Plus, FolderPlus, Image as ImageIcon, Folder, Upload, X, Download } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';

export default function MemoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const queryClient = useQueryClient();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null); // null = root view
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Track upload state manually
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null); // For Lightbox

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string | null) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!id || !user?.id) {
        alert("Authentication error or missing memory ID");
        return;
    }

    const file = e.target.files[0];
    setIsUploading(true);

    try {
        console.log("Starting upload...", file.name);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`;
        const filePath = fileName;

        // 1. Upload to Storage
        const { error: uploadError, data: uploadData } = await supabase.storage
            .from('memories')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            throw uploadError;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);

        console.log("File uploaded, public URL:", publicUrl);

        // 3. Insert record into DB
        const { error: dbError } = await supabase
            .from('memory_media')
            .insert([{
                memory_id: id,
                section_id: sectionId,
                file_url: publicUrl,
                file_type: 'image',
                storage_path: filePath
                // uploaded_by column removed as it doesn't exist in schema yet
            }]);

        if (dbError) {
            console.error("DB Insert Error:", dbError);
            throw dbError;
        }

        console.log("Upload complete!");
        // Force refresh
        await queryClient.invalidateQueries({ queryKey: ['memory', id] });
        
    } catch (error: any) {
        console.error("Upload failed:", error);
        alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
        setIsUploading(false);
        // Reset file input
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
       setShareUrl(url); 
       alert('Public link copied to clipboard! Anyone with this link can view and upload photos.');
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
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading memory details.</p>
        <Link to="/app" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === memory.user_id;

  // Derived state
  const activeSection = memory.memory_sections?.find((s: any) => s.id === activeSectionId);
  
  // Filter media for current view
  const currentMedia = memory.memory_media?.filter((m: any) => {
    if (activeSectionId) {
      return m.section_id === activeSectionId;
    }
    // Root view: show media that has NO section
    return !m.section_id;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Navigation Breadcrumb-ish */}
      <div className="flex items-center mb-6 text-sm text-gray-500">
        <button onClick={() => navigate('/app')} className="hover:text-indigo-600 transition-colors">
          {t('feed')}
        </button>
        <span className="mx-2">/</span>
        <button 
          onClick={() => setActiveSectionId(null)} 
          className={`hover:text-indigo-600 transition-colors ${!activeSectionId ? 'font-bold text-gray-900' : ''}`}
        >
          {memory.title}
        </button>
        {activeSection && (
          <>
            <span className="mx-2">/</span>
            <span className="font-bold text-gray-900">{activeSection.title}</span>
          </>
        )}
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        
        {/* Header - Only show in Root View */}
        {!activeSectionId && (
          <div className="px-8 py-8 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{memory.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(memory.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                  {memory.location && (
                    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {memory.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    {memory.status === 'private' && <Lock className="h-4 w-4 mr-1" />}
                    {memory.status === 'public_link' && <Globe className="h-4 w-4 mr-1" />}
                    {memory.status === 'circle' && <Users className="h-4 w-4 mr-1" />}
                    <span className="capitalize">{t(memory.status as any) || memory.status}</span>
                  </div>
                </div>
              </div>
              
              {isOwner && (
                <div className="flex gap-2">
                  <button onClick={handleShare} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title={t('share_link')}>
                    <Globe className="h-5 w-5" />
                  </button>
                  <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title={t('delete')}>
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            
            <p className="mt-6 text-gray-700 leading-relaxed text-lg max-w-3xl">
              {memory.content}
            </p>

            {memory.memory_tags && memory.memory_tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {memory.memory_tags.map((tagObj: any, index: number) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Tag className="h-3 w-3 mr-1" />
                    {tagObj.tags.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header - Folder View */}
        {activeSectionId && activeSection && (
          <div className="px-8 py-6 border-b border-gray-100 bg-indigo-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setActiveSectionId(null)}
                 className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
               >
                 <ArrowLeft className="h-5 w-5" />
               </button>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   <Folder className="h-6 w-6 text-indigo-500" fill="currentColor" fillOpacity={0.2} />
                   {activeSection.title}
                 </h2>
                 <p className="text-sm text-gray-500">
                   Album inside "{memory.title}"
                 </p>
               </div>
            </div>
            
            {isOwner && (
               <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
        <div className="px-8 py-8 min-h-[400px] bg-gray-50/30">
          
          {/* Root View: Show Folders + Loose Photos */}
          {!activeSectionId && (
            <div className="space-y-10">
              
              {/* Folders Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Folder className="h-5 w-5 text-indigo-500" />
                    {t('albums')}
                  </h3>
                  {isOwner && !isCreatingSection && (
                    <button 
                      onClick={() => setIsCreatingSection(true)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> {t('new_album')}
                    </button>
                  )}
                </div>

                {isCreatingSection && (
                  <form onSubmit={handleCreateSection} className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex items-center gap-3 max-w-md">
                    <FolderPlus className="h-5 w-5 text-indigo-400" />
                    <input
                      type="text"
                      placeholder={t('album_name_placeholder')}
                      className="flex-1 border-none focus:ring-0 text-gray-900 placeholder-gray-400 bg-transparent"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={createSectionMutation.isPending} className="text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1 rounded">{t('create')}</button>
                      <button type="button" onClick={() => setIsCreatingSection(false)} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {memory.memory_sections?.map((section: any) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      className="group flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="w-full aspect-[4/3] bg-indigo-50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-indigo-100 transition-colors relative overflow-hidden">
                        {/* Try to show a preview image if available in this section */}
                        {(() => {
                          const previewImage = memory.memory_media?.find((m: any) => m.section_id === section.id);
                          if (previewImage) {
                            return <img src={previewImage.file_url} className="w-full h-full object-cover absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity" />;
                          }
                          return <Folder className="h-10 w-10 text-indigo-300" fill="currentColor" fillOpacity={0.2} />;
                        })()}
                      </div>
                      <span className="font-medium text-gray-900 truncate w-full group-hover:text-indigo-700">{section.title}</span>
                      <span className="text-xs text-gray-500">
                        {memory.memory_media?.filter((m: any) => m.section_id === section.id).length || 0} items
                      </span>
                    </button>
                  ))}
                  
                  {(!memory.memory_sections || memory.memory_sections.length === 0) && !isCreatingSection && (
                    <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No albums yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loose Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                    {t('unsorted_photos')}
                  </h3>
                  {isOwner && (
                     <label className={`cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedMedia(media)}
                      >
                        <img src={media.file_url} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm text-gray-400 italic">No unsorted photos.</p>
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
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedMedia(media)}
                      >
                        <img src={media.file_url} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                       <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{t('empty_album')}</h3>
                    <p className="text-gray-500 mb-6">{t('upload_photos_msg')}</p>
                    {isOwner && (
                      <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedMedia(null)}>
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
             <img 
               src={selectedMedia.file_url} 
               alt="Full view" 
               className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
             />
             
             <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleDownload(selectedMedia.file_url, `memory-${id}-${selectedMedia.id}.jpg`)}
                  className="flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  {t('download')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
