
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { Property } from '../lib/types';
import { ErrorAlert } from './ErrorAlert';

interface PropertyCardProps {
  property: Property;
  onClose: () => void;
}

export function PropertyCard({ property, onClose }: PropertyCardProps) {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Format values for display
  const formattedValue = property.value_usd?.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }) || 'N/A';
  
  const formattedSize = property.size_sqft?.toLocaleString('en-US') || 'N/A';
  
  const formattedWealthEstimate = property.wealth_estimate_usd?.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }) || 'N/A';
  
  const confidencePercentage = property.wealth_confidence 
    ? Math.round(property.wealth_confidence * 100) 
    : null;

  // Check if this property is bookmarked when component mounts
  useEffect(() => {
    if (!user?.id || !property?.id) return;
    
    const checkBookmark = async () => {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', property.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking bookmark status:', error);
          return;
        }
        
        setIsBookmarked(!!data);
      } catch (err) {
        console.error('Error in bookmark check:', err);
      }
    };
    
    checkBookmark();
  }, [user?.id, property?.id]);

  // Toggle bookmark status
  const handleBookmarkToggle = async () => {
    if (!user?.id) {
      setError('You must be logged in to bookmark properties');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);
        
        if (error) throw error;
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            property_id: property.id
          });
        
        if (error) throw error;
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to update bookmark. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4 md:p-0">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto animate-fade-in overflow-hidden"
        aria-label="Property details"
      >
        <div className="bg-wealthmap-primary h-2" />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-wealthmap-dark break-words pr-6">
              {property.address}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
              aria-label="Close property details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && <ErrorAlert message={error} />}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Property Value</p>
                <p className="font-medium text-wealthmap-dark">{formattedValue}</p>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Size</p>
                <p className="font-medium text-wealthmap-dark">{formattedSize} sq ft</p>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Owner</p>
                <p className="font-medium text-wealthmap-dark truncate" title={property.owner_name || 'N/A'}>
                  {property.owner_name || 'N/A'}
                </p>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">ZIP Code</p>
                <p className="font-medium text-wealthmap-dark">{property.zip_code || 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-blue-900">Wealth Estimate</p>
                {confidencePercentage && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    {confidencePercentage}% confidence
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-wealthmap-primary">{formattedWealthEstimate}</p>
            </div>
            
            <button
              onClick={handleBookmarkToggle}
              disabled={isLoading}
              className={`w-full p-3 rounded-md flex items-center justify-center transition-colors ${
                isBookmarked 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-wealthmap-primary text-white hover:bg-blue-600'
              }`}
              aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {isBookmarked ? (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M6.72 5.66l4.28 4.28 4.28-4.28a.75.75 0 111.06 1.06l-4.28 4.28 4.28 4.28a.75.75 0 11-1.06 1.06l-4.28-4.28-4.28 4.28a.75.75 0 01-1.06-1.06l4.28-4.28-4.28-4.28a.75.75 0 011.06-1.06z" clipRule="evenodd" />
                      </svg>
                      Remove Bookmark
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                      </svg>
                      Add Bookmark
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
