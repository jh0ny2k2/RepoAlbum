import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Calendar, MapPin, Tag, Image as ImageIcon, Folder, Upload, Globe, ArrowLeft, X, Download } from 'lucide-react';
import { useLanguageStore } from '@/store/language';

export default function PublicMemory() {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useLanguageStore();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string | null) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!token) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
        console.log("Starting guest upload...", file.name);
        const fileExt = file.name.split('.').pop();
        const fileName = `guest_uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        // 1. Upload to Storage (allowed by anon policy)
        const { error: uploadError } = await supabase.storage
            .from('memories')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);

        // 3. Link via RPC (validates token)
        const { error: rpcError } = await supabase.rpc('add_media_via_token', {
            p_token: token,
            p_file_url: publicUrl,
            p_file_type: 'image',
            p_storage_path: filePath,
            p_section_id: sectionId
        });

        if (rpcError) throw rpcError;

        console.log("Guest upload complete!");
        await queryClient.invalidateQueries({ queryKey: ['shared_memory', token] });
        alert("Photo uploaded successfully!");
        
    } catch (error: any) {
        console.error("Guest upload failed:", error);
        alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
        setIsUploading(false);
        e.target.value = '';
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
        <div className="text-center">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Memory Not Found</h1>
            <p className="text-gray-500 max-w-md">
                This link might be expired or invalid.
            </p>
        </div>
      </div>
    );
  }

  const { memory, media, sections, tags, profile, can_upload } = sharedData;

  // Derived state
  const activeSection = sections.find((s: any) => s.id === activeSectionId);
  
  // Filter media for current view
  const currentMedia = media.filter((m: any) => {
    if (activeSectionId) {
      return m.section_id === activeSectionId;
    }
    return !m.section_id;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher for Guest */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
         <button 
           onClick={() => setLanguage('en')}
           className={`text-xs font-bold transition-colors ${language === 'en' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
         >
           EN
         </button>
         <span className="text-gray-300">|</span>
         <button 
           onClick={() => setLanguage('es')}
           className={`text-xs font-bold transition-colors ${language === 'es' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
         >
           ES
         </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header / Banner */}
        {!activeSectionId && (
            <div className="px-8 py-10 bg-gradient-to-b from-indigo-50/50 to-white border-b border-gray-100">
                <div className="flex flex-col items-center text-center">
                    {profile?.avatar_url && (
                        <img src={profile.avatar_url} alt={profile.username} className="w-16 h-16 rounded-full border-4 border-white shadow-sm mb-4" />
                    )}
                    <div className="text-sm text-indigo-600 font-medium mb-2 uppercase tracking-wide">{t('shared_memory')}</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{memory.title}</h1>
                    
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-8">
                        <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                            {new Date(memory.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                        {memory.location && (
                            <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                                <MapPin className="h-4 w-4 mr-2 text-indigo-400" />
                                {memory.location}
                            </div>
                        )}
                        <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            <span className="text-gray-400 mr-1">{t('by')}</span>
                            <span className="font-medium text-gray-900">@{profile?.username || 'Unknown'}</span>
                        </div>
                    </div>

                    <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                        {memory.content}
                    </p>

                    {tags && tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {tags.map((tagObj: any, index: number) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tagObj.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Section Header */}
        {activeSectionId && activeSection && (
          <div className="px-8 py-6 border-b border-gray-100 bg-indigo-50/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setActiveSectionId(null)}
                 className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
               >
                 <ArrowLeft className="h-5 w-5" />
               </button>
               <div>
                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <Folder className="h-5 w-5 text-indigo-500" />
                   {activeSection.title}
                 </h2>
               </div>
            </div>
            
            {can_upload && (
               <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isUploading ? t('uploading') : t('add_photo')}
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

        {/* Content Grid */}
        <div className="p-8 bg-gray-50/50 min-h-[400px]">
            
            {/* Root View */}
            {!activeSectionId && (
                <div className="space-y-12">
                    {/* Albums */}
                    {sections.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Folder className="h-5 w-5 text-indigo-500" />
                                {t('albums')}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {sections.map((section: any) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSectionId(section.id)}
                                        className="group flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        <div className="w-full aspect-[4/3] bg-indigo-50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-indigo-100 transition-colors relative overflow-hidden">
                                            {(() => {
                                                const previewImage = media.find((m: any) => m.section_id === section.id);
                                                if (previewImage) {
                                                    return <img src={previewImage.file_url} className="w-full h-full object-cover absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity" />;
                                                }
                                                return <Folder className="h-10 w-10 text-indigo-300" fill="currentColor" fillOpacity={0.2} />;
                                            })()}
                                        </div>
                                        <span className="font-medium text-gray-900 truncate w-full group-hover:text-indigo-700">{section.title}</span>
                                        <span className="text-xs text-gray-500">
                                            {media.filter((m: any) => m.section_id === section.id).length} photos
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loose Photos */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-gray-500" />
                                {t('unsorted_photos')}
                            </h3>
                            {can_upload && (
                                <label className={`cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                                    {isUploading ? t('uploading') : t('add_photo')}
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

                        {currentMedia.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {currentMedia.map((m: any) => (
                                    <div 
                                      key={m.id} 
                                      className="aspect-square rounded-xl overflow-hidden bg-gray-200 relative group shadow-sm hover:shadow-lg transition-all cursor-pointer" 
                                      onClick={() => setSelectedMedia(m)}
                                    >
                                        <img src={m.file_url} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 italic">No loose photos shared.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Folder View Content */}
            {activeSectionId && (
                <div>
                    {currentMedia.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {currentMedia.map((m: any) => (
                                    <div 
                                      key={m.id} 
                                      className="aspect-square rounded-xl overflow-hidden bg-gray-200 relative group shadow-sm hover:shadow-lg transition-all cursor-pointer" 
                                      onClick={() => setSelectedMedia(m)}
                                    >
                                        <img src={m.file_url} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                    ) : (
                        <div className="text-center py-20">
                            <ImageIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500">{t('empty_album')}</p>
                            <p className="text-gray-400 text-sm mb-4">{t('upload_photos_msg')}</p>
                            {can_upload && (
                                <label className={`mt-4 cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                  onClick={() => handleDownload(selectedMedia.file_url, `memory-${token}-${selectedMedia.id}.jpg`)}
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
