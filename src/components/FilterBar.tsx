import React, { useState } from 'react';
import { Search, Filter, Calendar, Heart, Globe, Lock, X } from 'lucide-react';

export interface FilterState {
  search: string;
  visibility: 'all' | 'private' | 'public_link' | 'circle';
  dateFrom: string | null;
  dateTo: string | null;
  showFavorites: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterBar({ filters, onFiltersChange, totalCount, filteredCount }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (val: string) => onFiltersChange({ ...filters, search: val });
  const handleVisibilityChange = (val: FilterState['visibility']) => onFiltersChange({ ...filters, visibility: val });
  const toggleFavorites = () => onFiltersChange({ ...filters, showFavorites: !filters.showFavorites });
  
  const clearFilters = () => {
    onFiltersChange({
      search: '',
      visibility: 'all',
      dateFrom: null,
      dateTo: null,
      showFavorites: false
    });
  };

  const hasActiveFilters = filters.search || filters.visibility !== 'all' || filters.dateFrom || filters.showFavorites;

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm border border-border mb-10 transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search your memories..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground text-sm transition-all placeholder:text-muted-foreground/50 text-foreground"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide items-center">
          <button
            onClick={() => handleVisibilityChange('all')}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              filters.visibility === 'all'
                ? 'bg-foreground text-background shadow-md'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => handleVisibilityChange('private')}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              filters.visibility === 'private'
                ? 'bg-background text-foreground ring-1 ring-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Private
          </button>
          
          <button
            onClick={() => handleVisibilityChange('public_link')}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              filters.visibility === 'public_link'
                ? 'bg-background text-foreground ring-1 ring-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Public
          </button>

          <button
            onClick={toggleFavorites}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              filters.showFavorites
                ? 'bg-background text-foreground ring-1 ring-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            <Heart className="w-3.5 h-3.5" fill={filters.showFavorites ? "currentColor" : "none"} />
            Favorites
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground flex items-center gap-2 text-sm transition-colors ${showAdvanced ? 'bg-secondary/80 text-foreground' : ''}`}
            title="More filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row gap-6 items-end">
            <div className="flex-1 w-full sm:max-w-md">
              <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                Date Range
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-1 focus:ring-foreground focus:border-foreground transition-all text-foreground"
                  />
                </div>
                <span className="text-muted-foreground text-sm font-medium">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-1 focus:ring-foreground focus:border-foreground transition-all text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count & Clear */}
      <div className="mt-6 flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border pt-4">
        <span>
          Showing <strong className="text-foreground">{filteredCount}</strong> of {totalCount} memories
        </span>
        
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-foreground hover:underline underline-offset-4 transition-all"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
