import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Calendar, Lock, Globe, Share2, Trash2, Users, MoreHorizontal } from 'lucide-react';
import { useLanguageStore } from '@/store/language';

interface Memory {
  id: string;
  title: string;
  content: string;
  created_at: string;
  location?: string;
  status: 'private' | 'public_link' | 'circle';
  memory_media?: { file_url: string; file_type: string }[];
  memory_tags?: { tags: { name: string } }[];
}

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (id: string) => void;
  onShare?: (memory: Memory) => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  index?: number; 
}

export default function MemoryCard({ memory, onDelete, onShare, onFavorite, isFavorite, index = 0 }: MemoryCardProps) {
  const { t } = useLanguageStore();
  const hasMedia = memory.memory_media && memory.memory_media.length > 0;
  const coverImage = hasMedia ? memory.memory_media![0].file_url : null;
  const animationDelay = `${index * 50}ms`;

  return (
    <div 
      className="group relative flex flex-col break-inside-avoid mb-6"
      style={{ animationDelay }}
    >
      <Link to={`/app/memories/${memory.id}`} className="block relative rounded-2xl overflow-hidden bg-secondary/20">
        {/* Image Area */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={memory.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-secondary/10">
              <Calendar className="w-8 h-8 text-muted-foreground/30 mb-2" />
            </div>
          )}
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top Right Status Icon */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <div className="bg-black/20 backdrop-blur-md p-1.5 rounded-full text-white/90">
                {memory.status === 'private' && <Lock className="w-3.5 h-3.5" />}
                {memory.status === 'public_link' && <Globe className="w-3.5 h-3.5" />}
                {memory.status === 'circle' && <Users className="w-3.5 h-3.5" />}
             </div>
          </div>

          {/* Bottom Info on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <div className="flex items-center justify-between text-white/90">
                <span className="text-xs font-medium bg-black/20 backdrop-blur-md px-2 py-1 rounded-md">
                   {new Date(memory.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                   <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onFavorite && onFavorite(memory.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors bg-black/20 backdrop-blur-md hover:bg-white hover:text-black ${isFavorite ? 'text-red-500 bg-white' : 'text-white'}`}
                  >
                    <Heart className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(memory.id);
                      }}
                      className="p-1.5 rounded-full transition-colors bg-black/20 backdrop-blur-md hover:bg-red-500 hover:text-white text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
             </div>
          </div>
        </div>
      </Link>

      {/* Minimal Title Below */}
      <div className="mt-3 px-1">
        <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors">
          {memory.title}
        </h3>
        {memory.location && (
           <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {memory.location}
           </p>
        )}
      </div>
    </div>
  );
}
