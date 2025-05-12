
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { Bookmark } from '../lib/types';
import { ErrorAlert } from './ErrorAlert';

export function BookmarksList({ onSelectProperty }: { onSelectProperty: (propertyId: string) => void }) {
  const { user } = useUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch bookmarks for the current user
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchBookmarks = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select(`
            id,
            property_id,
            created_at,
            properties (
              id,
              address,
              value_usd,
              size_sqft
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setBookmarks(data || []);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError('Failed to load your bookmarks');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [user?.id]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);
      
      if (error) throw error;
      
      // Remove from local state
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== bookmarkId));
      
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-wealthmap-dark">Your Bookmarks</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (bookmarks.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-wealthmap-dark">Your Bookmarks</h2>
        </div>
        {error ? (
          <ErrorAlert message={error} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500">
              Start exploring the map and bookmark properties you're interested in
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-wealthmap-dark">Your Bookmarks</h2>
        <span className="bg-wealthmap-primary text-white text-xs py-1 px-2 rounded-full">
          {bookmarks.length} {bookmarks.length === 1 ? 'property' : 'properties'}
        </span>
      </div>
      
      {error && <ErrorAlert message={error} />}
      
      <div className="space-y-3">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between">
              <div className="cursor-pointer" onClick={() => onSelectProperty(bookmark.property_id)}>
                <h3 className="font-medium text-wealthmap-dark mb-2 hover:text-wealthmap-primary transition-colors">
                  {bookmark.properties?.address || 'Unknown address'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {bookmark.properties?.value_usd && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Value:</span>{' '}
                      {bookmark.properties.value_usd.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      })}
                    </p>
                  )}
                  
                  {bookmark.properties?.size_sqft && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Size:</span>{' '}
                      {bookmark.properties.size_sqft.toLocaleString()} sq ft
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveBookmark(bookmark.id)}
                className="text-gray-400 hover:text-red-500 transition-colors self-start"
                aria-label="Remove bookmark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
