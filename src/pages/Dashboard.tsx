import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Sparkles, Image as ImageIcon, Heart, Share2, Layers, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import MemoryGrid from '@/components/MemoryGrid';
import SEO from '@/components/SEO';

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
          memory_media:memory_media!memory_media_memory_id_fkey (
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
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
        <div className="bg-destructive/5 p-6 rounded-3xl mb-6 border border-destructive/10">
            <Sparkles className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-2xl font-bold text-foreground tracking-tight">Something went wrong</h3>
        <p className="text-muted-foreground max-w-md mt-2 mb-8">{(error as any).message}</p>
        <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['memories'] })}
            className="px-6 py-2 rounded-full bg-foreground text-background font-bold hover:opacity-90 transition-opacity"
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO 
        title={t('dashboard_title')} 
        description="Your personal memory dashboard." 
      />
      {/* Modern Minimal Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 pt-12 pb-8 border-b border-border/20">
        <div className="space-y-4">
           <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-none">
             {t('dashboard_title')}
           </h1>
           <p className="text-muted-foreground text-xl font-light tracking-wide">
             {t('dashboard_subtitle')}
           </p>
        </div>

        <div className="flex flex-col items-end gap-6">
            <Link
                to="/app/memories/new"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-background bg-foreground rounded-full hover:opacity-90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
            >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                {t('dashboard_create')}
            </Link>
            
            {/* Stats Pills - Minimalist */}
            <div className="hidden md:flex items-center gap-3">
                <div className="px-4 py-1.5 bg-secondary/30 rounded-full border border-border/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {stats.total} Memories
                </div>
                <div className="px-4 py-1.5 bg-secondary/30 rounded-full border border-border/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {stats.photos} Photos
                </div>
                <div className="px-4 py-1.5 bg-secondary/30 rounded-full border border-border/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {stats.shared} Shared
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
         <MemoryGrid 
            memories={memories || []} 
            isLoading={isLoading} 
            onDelete={(id) => deleteMutation.mutate(id)}
         />
      </div>
    </div>
  );
}
