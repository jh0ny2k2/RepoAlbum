import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Sparkles, Image as ImageIcon, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import MemoryGrid from '@/components/MemoryGrid';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const queryClient = useQueryClient();

  const { data: memories, isLoading, error } = useQuery({
    queryKey: ['memories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('memories')
        .select(`
          id,
          title,
          content,
          status,
          location,
          created_at,
          user_id,
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
            file_url,
            file_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  // Derived stats
  const stats = useMemo(() => {
    if (!memories) return { total: 0, favorites: 0, shared: 0 };
    return {
      total: memories.length,
      shared: memories.filter(m => m.status !== 'private').length,
      photos: memories.reduce((acc, m) => acc + (m.memory_media?.length || 0), 0)
    };
  }, [memories]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Oops, something went wrong</h3>
        <p className="text-gray-500 max-w-md mt-2">{(error as any).message}</p>
        <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['memories'] })}
            className="mt-6 text-indigo-600 font-medium hover:text-indigo-800"
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Minimal Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-8 pb-6">
        <div>
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
             {t('dashboard_title')}
           </h1>
           <p className="text-gray-500 mt-2 text-lg">
             {t('dashboard_subtitle')}
           </p>
        </div>

        <div className="flex items-center gap-4">
            {/* Simple Stats Pills */}
            <div className="hidden md:flex items-center gap-3 mr-4">
                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {stats.total} Memories
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {stats.photos} Photos
                </div>
            </div>

            <Link
                to="/app/memories/new"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all bg-black rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard_create')}
            </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
         <MemoryGrid 
            memories={memories || []} 
            isLoading={isLoading} 
            onDelete={(id) => deleteMutation.mutate(id)}
         />
      </div>
    </div>
  );
}
