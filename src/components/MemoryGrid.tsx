'use client';

import React, { useState, useMemo, useEffect } from 'react';
import MemoryCard from './MemoryCard';
import FilterBar, { FilterState } from './FilterBar';
import EmptyState from './EmptyState';
import { Loader2 } from 'lucide-react';

interface MemoryGridProps {
  memories: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export default function MemoryGrid({ memories, isLoading, onDelete }: MemoryGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    visibility: 'all',
    dateFrom: null,
    dateTo: null,
    showFavorites: false
  });

  // Local favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dots_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('dots_favorites', JSON.stringify(newFavorites));
  };

  const filteredMemories = useMemo(() => {
    if (!memories) return [];
    
    return memories.filter(memory => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = memory.title?.toLowerCase().includes(searchLower);
        const matchesContent = memory.content?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesContent) return false;
      }

      // Visibility filter
      if (filters.visibility !== 'all') {
        if (memory.status !== filters.visibility) return false;
      }

      // Date filter
      if (filters.dateFrom) {
        if (new Date(memory.created_at) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        // End of day for dateTo
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        if (new Date(memory.created_at) > dateTo) return false;
      }

      // Favorites filter
      if (filters.showFavorites) {
        if (!favorites.includes(memory.id)) return false;
      }

      return true;
    });
  }, [memories, filters, favorites]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <FilterBar 
        filters={filters} 
        onFiltersChange={setFilters} 
        totalCount={memories?.length || 0}
        filteredCount={filteredMemories.length}
      />

      {filteredMemories.length === 0 ? (
        <EmptyState 
          title={filters.search || filters.visibility !== 'all' ? "No matching memories" : "No memories yet"}
          description={filters.search || filters.visibility !== 'all' ? "Try adjusting your filters to find what you're looking for." : "Start documenting your journey. Every moment counts."}
          actionLabel={filters.search || filters.visibility !== 'all' ? "Clear filters" : "Create Memory"}
          actionLink={filters.search || filters.visibility !== 'all' ? undefined : "/app/memories/new"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredMemories.map((memory, index) => (
            <MemoryCard 
              key={memory.id} 
              memory={memory} 
              index={index}
              onDelete={onDelete}
              onFavorite={toggleFavorite}
              isFavorite={favorites.includes(memory.id)}
              onShare={() => {
                // This could open a share modal or navigate to detail
                // Ideally use a proper router link or modal, but for now simple navigation or the card's internal link works
                // The card itself wraps content in a Link, so this is for the quick action button
                window.location.href = `/app/memories/${memory.id}`;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
