
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ErrorAlert } from './ErrorAlert';
import { Bookmark, Property } from '../lib/types';
import { toast } from '@/components/ui/use-toast';

export function BookmarksList({ onSelectProperty }: { onSelectProperty?: (propertyId: string) => void }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          setError('Error fetching user data');
          return;
        }
        
        if (!userData || !userData.user) {
          setError('Please log in to view bookmarks');
          return;
        }
        
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id, property_id, created_at, properties(id, address, value_usd, size_sqft)')
          .eq('user_id', userData.user.id);
        
        if (error) {
          console.error('Error fetching bookmarks:', error);
          throw error;
        }
        
        if (data) {
          // Transform data to match our Bookmark type
          const typedBookmarks: Bookmark[] = data.map(bookmark => ({
            id: bookmark.id,
            user_id: userData.user.id,
            property_id: bookmark.property_id,
            created_at: bookmark.created_at,
            properties: bookmark.properties as unknown as Property
          }));
          
          setBookmarks(typedBookmarks);
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError('Failed to load bookmarks');
      } finally {
        setIsLoading(false);
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
      
      toast({
        title: "Bookmark removed",
        description: "The bookmark was successfully removed.",
      });
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      setError('Failed to remove bookmark');
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Bookmarks</h2>
      {error && <ErrorAlert message={error} />}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-wealthmap-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {bookmarks.length === 0 && !isLoading && <p className="text-gray-600">No bookmarks yet.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="p-4 bg-white rounded-lg shadow">
                <p className="text-gray-800">{bookmark.properties?.address}</p>
                <p className="text-gray-600">
                  Value: ${bookmark.properties?.value_usd?.toLocaleString() ?? 'N/A'}
                </p>
                <button
                  onClick={() => handleRemove(bookmark.id)}
                  className="mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700 w-full"
                  aria-label="Remove Bookmark"
                >
                  Remove
                </button>
                {onSelectProperty && (
                  <button
                    onClick={() => onSelectProperty(bookmark.property_id)}
                    className="mt-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full"
                    aria-label="View Property"
                  >
                    View on Map
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
