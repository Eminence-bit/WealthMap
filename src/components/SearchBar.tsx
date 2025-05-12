
import React, { useState } from 'react';
import { SearchFilters } from '../lib/types';
import { ErrorAlert } from './ErrorAlert';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => Promise<void>;
  onFilterToggle?: () => void;
  showFilters: boolean;
}

export function SearchBar({ onSearch, onFilterToggle, showFilters }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    min_value_usd: '',
    max_value_usd: '',
    min_size_sqft: '',
    max_size_sqft: '',
    zip_code: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await onSearch(query, filters);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      min_value_usd: '',
      max_value_usd: '',
      min_size_sqft: '',
      max_size_sqft: '',
      zip_code: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      {error && <ErrorAlert message={error} />}
      
      <form onSubmit={handleSubmit}>
        <div className="flex mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by address..."
            className="flex-grow p-2.5 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-wealthmap-primary text-sm"
            aria-label="Search address"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-wealthmap-primary hover:bg-blue-600 text-white p-2.5 rounded-r-md transition-colors"
            aria-label="Search"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <button 
            type="button"
            onClick={onFilterToggle}
            className="text-sm text-wealthmap-primary hover:text-blue-700 flex items-center transition-colors"
          >
            <span>
              {showFilters ? 'Hide filters' : 'Show filters'}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="min_value_usd" className="block text-xs text-gray-600 mb-1">Min Value ($)</label>
              <input
                id="min_value_usd"
                type="number"
                name="min_value_usd"
                value={filters.min_value_usd}
                onChange={handleFilterChange}
                placeholder="Min"
                min="0"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-wealthmap-primary"
              />
            </div>
            
            <div>
              <label htmlFor="max_value_usd" className="block text-xs text-gray-600 mb-1">Max Value ($)</label>
              <input
                id="max_value_usd"
                type="number"
                name="max_value_usd"
                value={filters.max_value_usd}
                onChange={handleFilterChange}
                placeholder="Max"
                min="0"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-wealthmap-primary"
              />
            </div>
            
            <div>
              <label htmlFor="min_size_sqft" className="block text-xs text-gray-600 mb-1">Min Size (sq ft)</label>
              <input
                id="min_size_sqft"
                type="number"
                name="min_size_sqft"
                value={filters.min_size_sqft}
                onChange={handleFilterChange}
                placeholder="Min"
                min="0"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-wealthmap-primary"
              />
            </div>
            
            <div>
              <label htmlFor="max_size_sqft" className="block text-xs text-gray-600 mb-1">Max Size (sq ft)</label>
              <input
                id="max_size_sqft"
                type="number"
                name="max_size_sqft"
                value={filters.max_size_sqft}
                onChange={handleFilterChange}
                placeholder="Max"
                min="0"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-wealthmap-primary"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="zip_code" className="block text-xs text-gray-600 mb-1">ZIP Code</label>
              <input
                id="zip_code"
                type="text"
                name="zip_code"
                value={filters.zip_code}
                onChange={handleFilterChange}
                placeholder="e.g. 94105"
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-wealthmap-primary"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="col-span-2 bg-wealthmap-primary hover:bg-blue-600 text-white p-2 rounded-md transition-colors mt-2 text-sm"
            >
              {isLoading ? 'Searching...' : 'Apply Filters'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
