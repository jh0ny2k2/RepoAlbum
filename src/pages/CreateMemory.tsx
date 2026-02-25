import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Image as ImageIcon, MapPin, Lock, Globe, X, Calendar, Type, AlignLeft, ArrowLeft } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 py-8">
        <button 
          onClick={() => navigate('/app')}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{t('new_memory')}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Inputs Group */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
          
          {/* Title Input */}
          <div className="group">
            <label htmlFor="title" className="sr-only">Title</label>
            <input
              type="text"
              id="title"
              required
              className="block w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 transition-colors bg-transparent"
              placeholder="Give it a title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Location Input (Subtle) */}
          <div className="flex items-center text-gray-400 group focus-within:text-indigo-600 transition-colors">
            <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
            <input
              type="text"
              id="location"
              className="block w-full text-sm font-medium text-gray-600 placeholder-gray-400 border-none focus:ring-0 p-0 bg-transparent"
              placeholder="Add a location (e.g. Paris, France)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Content Textarea */}
          <div className="flex items-start text-gray-400 group focus-within:text-gray-900 transition-colors min-h-[150px]">
             <AlignLeft className="w-5 h-5 mr-3 mt-1 flex-shrink-0 group-focus-within:text-indigo-600" />
            <textarea
              id="content"
              required
              rows={6}
              className="block w-full text-base text-gray-600 placeholder-gray-300 border-none focus:ring-0 p-0 resize-none bg-transparent leading-relaxed"
              placeholder="Write your story here... How did you feel? What happened?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </div>

        {/* Media & Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Media Upload Area */}
          <div 
            className={`relative group border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden aspect-video md:aspect-auto ${
              isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            } ${previewUrl ? 'border-none p-0' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                     type="button"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setSelectedFile(null);
                       setPreviewUrl(null);
                     }}
                     className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors flex items-center gap-2"
                   >
                     <X className="w-4 h-4" /> Remove
                   </button>
                </div>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-8 w-8 text-indigo-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">Add a cover photo</p>
                <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center space-y-4">
             <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Privacy</label>
             
             <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'private' })}
                  className={`w-full flex items-center p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.status === 'private' 
                      ? 'border-gray-900 bg-gray-50' 
                      : 'border-transparent bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full mr-4 ${formData.status === 'private' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`block font-bold ${formData.status === 'private' ? 'text-gray-900' : 'text-gray-600'}`}>Private</span>
                    <span className="text-xs text-gray-400">Visible only to you</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'public_link' })}
                  className={`w-full flex items-center p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.status === 'public_link' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full mr-4 ${formData.status === 'public_link' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`block font-bold ${formData.status === 'public_link' ? 'text-gray-900' : 'text-gray-600'}`}>Public Link</span>
                    <span className="text-xs text-gray-400">Anyone with the link can view</span>
                  </div>
                </button>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white transition-all bg-gray-900 rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            {t('dashboard_create')}
          </button>
        </div>
      </form>
    </div>
  );
}
