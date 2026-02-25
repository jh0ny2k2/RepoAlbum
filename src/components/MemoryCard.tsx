import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Calendar, Lock, Globe, Share2, Trash2, Users, ArrowRight } from 'lucide-react';
import { getSeasonColor, getMoodColor } from '@/utils/visuals';
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
  index?: number; // Added for animation delay
}

export default function MemoryCard({ memory, onDelete, onShare, onFavorite, isFavorite, index = 0 }: MemoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguageStore();
  
  const seasonGradient = getSeasonColor(memory.created_at);
  const moodBorder = getMoodColor(memory.content); // Kept for logic but used subtly

  const hasMedia = memory.memory_media && memory.memory_media.length > 0;
  const coverImage = hasMedia ? memory.memory_media![0].file_url : null;

  // Stagger animation delay based on index
  const animationDelay = `${index * 100}ms`;

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg"
      style={{ animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/app/memories/${memory.id}`} className="flex-1 flex flex-col h-full">
        {/* Image / Header Section */}
        <div className={`relative aspect-[4/3] w-full overflow-hidden ${coverImage ? 'bg-gray-100' : 'bg-gray-50'}`}>
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={memory.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                 <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-gray-500 font-medium text-sm">
                 {new Date(memory.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
             <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-semibold text-gray-600 shadow-sm border border-gray-100 flex items-center gap-1.5">
                {memory.status === 'private' && <Lock className="w-3 h-3 text-gray-400" />}
                {memory.status === 'public_link' && <Globe className="w-3 h-3 text-blue-400" />}
                {memory.status === 'circle' && <Users className="w-3 h-3 text-purple-400" />}
                <span className="uppercase tracking-wide">{t(memory.status as any)}</span>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1 relative">
           <div className="mb-2">
              <time className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                 {new Date(memory.created_at).getFullYear()}
              </time>
           </div>

           <h3 className="font-sans text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-black transition-colors">
             {memory.title}
           </h3>
           
           <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
             {memory.content}
           </p>

           {/* Tags */}
           {memory.memory_tags && memory.memory_tags.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mb-4">
               {memory.memory_tags.slice(0, 3).map((tagObj: any, idx: number) => (
                 <span key={idx} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                   #{tagObj.tags.name}
                 </span>
               ))}
             </div>
           )}

           {/* Footer Actions */}
           <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50">
              <div className="flex items-center text-gray-400 text-xs font-medium">
                 {memory.location ? (
                   <div className="flex items-center gap-1.5 max-w-[140px]">
                     <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" />
                     <span className="truncate">{memory.location}</span>
                   </div>
                 ) : (
                    <span className="opacity-0">No location</span>
                 )}
              </div>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 translate-y-2 sm:group-hover:translate-y-0 transform">
                 <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavorite && onFavorite(memory.id);
                  }}
                  className={`p-2 rounded-full transition-all ${isFavorite ? 'text-pink-500 bg-pink-50' : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'}`}
                  title="Favorite"
                >
                  <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onShare && onShare(memory);
                  }}
                  className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  title={t('share_link')}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
           </div>
        </div>
      </Link>
      
      {/* Delete Button (Absolute positioned) */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this memory?')) {
              onDelete(memory.id);
            }
          }}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-gray-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 translate-x-4 group-hover:translate-x-0"
          title={t('delete')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
