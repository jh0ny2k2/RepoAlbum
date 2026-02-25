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
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search your memories..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => handleVisibilityChange('all')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
              filters.visibility === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => handleVisibilityChange('private')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
              filters.visibility === 'private'
                ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Private
          </button>
          
          <button
            onClick={() => handleVisibilityChange('public_link')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
              filters.visibility === 'public_link'
                ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Public
          </button>

          <button
            onClick={toggleFavorites}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
              filters.showFavorites
                ? 'bg-pink-100 text-pink-700 ring-1 ring-pink-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" fill={filters.showFavorites ? "currentColor" : "none"} />
            Favorites
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center gap-2 text-sm transition-colors ${showAdvanced ? 'bg-gray-200' : ''}`}
            title="More filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <span className="text-gray-400 text-sm">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count & Clear */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing <strong className="text-gray-900">{filteredCount}</strong> of {totalCount} memories
        </span>
        
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
