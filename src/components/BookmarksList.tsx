
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ErrorAlert } from './ErrorAlert';

// Define proper types for bookmarks
interface Bookmark {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  properties: {
    id: string;
    address: string;
    value_usd?: number;
    size_sqft?: number;
  };
}

export function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id, property_id, created_at, properties(id, address, value_usd, size_sqft)')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          // Transform data to match our Bookmark type
          const typedBookmarks: Bookmark[] = data.map(bookmark => ({
            id: bookmark.id,
            user_id: user.id,
            property_id: bookmark.property_id,
            created_at: bookmark.created_at,
            properties: bookmark.properties
          }));
          
          setBookmarks(typedBookmarks);
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError('Failed to load bookmarks');
      }
    };
    
    fetchBookmarks();
  }, []);

  const handleRemove = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);
        
      if (error) throw error;
      
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      setError('Failed to remove bookmark');
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Bookmarks</h2>
      {error && <ErrorAlert message={error} />}
      {bookmarks.length === 0 && <p className="text-gray-600">No bookmarks yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="p-4 bg-white rounded-lg shadow">
            <p className="text-gray-800">{bookmark.properties.address}</p>
            <p className="text-gray-600">
              Value: ${bookmark.properties.value_usd?.toLocaleString() ?? 'N/A'}
            </p>
            <button
              onClick={() => handleRemove(bookmark.id)}
              className="mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700 w-full"
              aria-label="Remove Bookmark"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
