import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Calendar, MapPin, Tag, Image as ImageIcon, Folder, Upload, Globe, ArrowLeft, X, Download, Play, MessageSquare, Send } from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { compressImage } from '@/lib/utils';

export default function PublicMemory() {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useLanguageStore();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

  // Comments State
  const [commentForm, setCommentForm] = useState({ name: '', content: '' });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

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

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.content.trim() || !sharedData?.memory?.id) return;
    
    setIsSubmittingComment(true);
    try {
        const { error } = await supabase
            .from('memory_comments')
            .insert([{
                memory_id: sharedData.memory.id,
                author_name: commentForm.name.trim(),
                content: commentForm.content.trim()
            }]);
        
        if (error) throw error;
        
        setCommentForm({ name: '', content: '' });
        refetchComments();
        alert('Comment posted!');
    } catch (error) {
        console.error("Error posting comment:", error);
        alert("Failed to post comment.");
    } finally {
        setIsSubmittingComment(false);
    }
  };

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
        let uploadFile = file;
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const isVideo = ['mp4', 'mov', 'webm'].includes(fileExt || '');
        const fileType = isVideo ? 'video' : 'image';

        // Compress if it's an image
        if (fileType === 'image') {
            try {
                uploadFile = await compressImage(file);
            } catch (err) {
                console.warn("Compression failed, using original file", err);
            }
        }

        const fileName = `guest_uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from('memories')
            .upload(filePath, uploadFile);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);

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
        
    } catch (error: any) {
        console.error("Guest upload failed:", error);
        alert(`Upload failed: ${error.message}`);
    } finally {
        setIsUploading(false);
        e.target.value = '';
    }
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
        } catch (err) {
          console.error(`Failed to download ${media.file_url}`, err);
        }
      });

      await Promise.all(downloadPromises);
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
      
    } catch (error) {
      console.error("Error creating zip:", error);
      alert("Failed to download all photos.");
    } finally {
      setIsDownloading(false);
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
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <div className="text-center">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Memory Not Found</h1>
            <p className="text-gray-500 max-w-md">
                This link might be expired or invalid.
            </p>
        </div>
      </div>
    );
  }

  const { memory, media, sections, tags, profile, can_upload } = sharedData;

  const activeSection = sections.find((s: any) => s.id === activeSectionId);
  const currentMedia = media.filter((m: any) => {
    if (activeSectionId) return m.section_id === activeSectionId;
    return !m.section_id;
  });

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Language Switcher for Guest */}
      <div className="absolute top-4 right-4 z-50 flex gap-4 text-xs font-bold tracking-widest bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-gray-100">
         <button 
           onClick={() => setLanguage('en')}
           className={`transition-colors hover:text-black ${language === 'en' ? 'text-black underline decoration-2 underline-offset-4' : 'text-gray-400'}`}
         >
           EN
         </button>
         <button 
           onClick={() => setLanguage('es')}
           className={`transition-colors hover:text-black ${language === 'es' ? 'text-black underline decoration-2 underline-offset-4' : 'text-gray-400'}`}
         >
           ES
         </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        
        {/* Header / Banner */}
        {!activeSectionId && (
            <div className="px-6 py-10 md:px-12 bg-white border-b border-gray-100">
                <div className="flex flex-col items-center text-center">
                    {profile?.avatar_url && (
                        <img src={profile.avatar_url} alt={profile.username} className="w-16 h-16 rounded-full border-2 border-gray-100 mb-6" />
                    )}
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('shared_memory')}</div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">{memory.title}</h1>
                    
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-8">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(memory.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                        {memory.location && (
                            <div className="flex items-center">
                                <div className="w-1 h-1 bg-gray-300 rounded-full mx-3"></div>
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                {memory.location}
                            </div>
                        )}
                        <div className="flex items-center">
                            <div className="w-1 h-1 bg-gray-300 rounded-full mx-3"></div>
                            <span className="text-gray-400 mr-1">{t('by')}</span>
                            <span className="font-bold text-gray-900">@{profile?.username || 'Unknown'}</span>
                        </div>
                    </div>

                    <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap">
                        {memory.content}
                    </p>

                    {tags && tags.length > 0 && (
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {tags.map((tagObj: any, index: number) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                    #{tagObj.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Section Header */}
        {activeSectionId && activeSection && (
          <div className="px-6 py-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setActiveSectionId(null)}
                 className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-100 text-gray-900 transition-colors"
               >
                 <ArrowLeft className="h-5 w-5" />
               </button>
               <div>
                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   {activeSection.title}
                 </h2>
               </div>
            </div>
            
            {can_upload && (
               <label className={`cursor-pointer inline-flex items-center px-4 py-2 text-sm font-bold rounded-full text-white bg-black hover:bg-gray-800 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isUploading ? t('uploading') : t('add_photo')}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*" 
                    onChange={(e) => handleFileUpload(e, activeSectionId)} 
                    disabled={isUploading}
                    />
               </label>
            )}
          </div>
        )}

        {/* Content Grid */}
        <div className="p-6 md:p-10 bg-white min-h-[400px]">
            
            {/* Root View */}
            {!activeSectionId && (
                <div className="space-y-12">
                    {/* Albums */}
                    {sections.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                {t('albums')}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {sections.map((section: any) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSectionId(section.id)}
                                        className="group flex flex-col text-left cursor-pointer"
                                    >
                                        <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl mb-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors relative overflow-hidden border border-gray-100">
                                            {(() => {
                                                const previewImage = media.find((m: any) => m.section_id === section.id);
                                                if (previewImage) {
                                                    return <img src={previewImage.file_url} className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105" />;
                                                }
                                                return <Folder className="h-8 w-8 text-gray-300" />;
                                            })()}
                                        </div>
                                        <span className="font-bold text-gray-900 truncate w-full group-hover:text-gray-600 transition-colors">{section.title}</span>
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
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                {t('unsorted_photos')}
                            </h3>
                            <div className="flex items-center gap-3">
                                {currentMedia.length > 0 && (
                                    <button
                                    onClick={handleDownloadAll}
                                    disabled={isDownloading}
                                    className="text-sm font-bold text-black hover:text-gray-600 flex items-center gap-1 disabled:opacity-50"
                                    >
                                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    {isDownloading ? 'Zipping...' : 'Download All'}
                                    </button>
                                )}
                                {can_upload && (
                                    <label className={`cursor-pointer text-sm font-bold text-black hover:text-gray-600 flex items-center gap-1 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                        </div>

                        {currentMedia.length > 0 ? (
                            <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 block">
                                {currentMedia.map((m: any) => (
                                    <div 
                                      key={m.id} 
                                      className="break-inside-avoid rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer mb-4" 
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
                                          <img src={m.file_url} alt="" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                                        )}
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
                        <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 block">
                                {currentMedia.map((m: any) => (
                                    <div 
                                      key={m.id} 
                                      className="break-inside-avoid rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer mb-4" 
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
                                          <img src={m.file_url} alt="" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                    ) : (
                        <div className="text-center py-20">
                            <ImageIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">{t('empty_album')}</p>
                            <p className="text-gray-400 text-sm mb-6 mt-2">{t('upload_photos_msg')}</p>
                            {can_upload && (
                                <label className={`mt-4 cursor-pointer inline-flex items-center px-6 py-3 text-sm font-bold rounded-full text-white bg-black hover:bg-gray-800 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

        {/* Floating Comments Button */}
        <div className="fixed bottom-6 right-6 z-40">
            <button 
                onClick={() => setShowComments(!showComments)}
                className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
            >
                <MessageSquare className="h-6 w-6" />
                {comments && comments.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full absolute -top-1 -right-1">
                        {comments.length}
                    </span>
                )}
            </button>
        </div>

        {/* Comments Sidebar/Drawer */}
        {showComments && (
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 p-6 flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Guest Book</h2>
                    <button onClick={() => setShowComments(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                    {comments?.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>No comments yet. Be the first!</p>
                        </div>
                    ) : (
                        comments?.map((comment: any) => (
                            <div key={comment.id} className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm">{comment.author_name}</span>
                                    <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handlePostComment} className="mt-auto pt-4 border-t border-gray-100">
                    <input 
                        type="text" 
                        placeholder={t('your_name')}
                        className="w-full mb-3 px-4 py-2 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:border-black focus:ring-0 transition-colors text-sm font-medium"
                        value={commentForm.name}
                        onChange={e => setCommentForm({...commentForm, name: e.target.value})}
                        required
                    />
                    <div className="relative">
                        <textarea 
                            placeholder={t('leave_message')}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-black focus:ring-0 transition-colors text-sm resize-none pr-12"
                            rows={3}
                            value={commentForm.content}
                            onChange={e => setCommentForm({...commentForm, content: e.target.value})}
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={isSubmittingComment}
                            className="absolute bottom-3 right-3 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </form>
            </div>
        )}

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
             {selectedMedia.file_type === 'video' ? (
               <video 
                 src={selectedMedia.file_url} 
                 controls 
                 autoPlay 
                 className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
               />
             ) : (
               <img 
                 src={selectedMedia.file_url} 
                 alt="Full view" 
                 className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
               />
             )}
             
             <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => handleDownload(selectedMedia.file_url, `memory-${token}-${selectedMedia.id}.jpg`)}
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
