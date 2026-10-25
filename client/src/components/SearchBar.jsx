import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search by job title, company, or skills...',
  showFilterToggle = false,
  isFilterOpen = false,
  onToggleFilter,
  className = '',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition shadow-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showFilterToggle && (
        <button
          type="button"
          onClick={onToggleFilter}
          className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm font-medium transition shadow-sm ${
            isFilterOpen
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      )}
    </form>
  );
};

export default SearchBar;
