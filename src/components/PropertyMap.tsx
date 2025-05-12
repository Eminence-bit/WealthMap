import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../lib/supabase';
import { Property, SearchFilters, MOCK_PROPERTIES } from '../lib/types';
import { PropertyCard } from './PropertyCard';
import { SearchBar } from './SearchBar';
import PropertyMarker from './PropertyMarker';
import ClusterMarker from './ClusterMarker';
import { ErrorAlert } from './ErrorAlert';

export function PropertyMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Store references to markers for cleanup
  const markersRef = useRef<PropertyMarker[]>([]);
  const clustersRef = useRef<ClusterMarker[]>([]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Map initialization
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 13,
    });
    
    // Add navigation controls (zoom +/-, compass)
    map.current.addControl(new maplibregl.NavigationControl({}), 'top-right');
    
    // Add a scale control
    map.current.addControl(new maplibregl.ScaleControl({}), 'bottom-left');
    
    // Load properties when map has finished loading
    map.current.on('load', () => {
      fetchProperties();
    });
    
    // Update properties when map moves (debounced)
    let timeoutId: number;
    map.current.on('moveend', () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        fetchProperties();
      }, 300) as unknown as number;
    });
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      map.current?.remove();
      cleanupMarkers();
    };
  }, []); // Empty dependencies - only run on mount

  // Clean up existing markers
  const cleanupMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    clustersRef.current.forEach(cluster => cluster.remove());
    clustersRef.current = [];
  };

  // Create markers from properties
  const createMarkers = (properties: Property[]) => {
    if (!map.current) return;
    
    // Clean up existing markers first
    cleanupMarkers();
    
    // Basic clustering implementation
    // In a real app, we'd use a proper spatial clustering algorithm
    if (properties.length > 50) {
      // Simple grid-based clustering
      const gridSize = 0.01; // Grid size in degrees - would need tuning
      const clusters: { [key: string]: Property[] } = {};
      
      properties.forEach(property => {
        const lat = Math.floor(property.coordinates.lat / gridSize) * gridSize;
        const lng = Math.floor(property.coordinates.lng / gridSize) * gridSize;
        const key = `${lat},${lng}`;
        
        if (!clusters[key]) {
          clusters[key] = [];
        }
        clusters[key].push(property);
      });
      
      // Create markers for each cluster
      Object.entries(clusters).forEach(([key, clusterProperties]) => {
        if (clusterProperties.length === 1) {
          // Single property - create property marker
          const property = clusterProperties[0];
          const marker = new PropertyMarker({
            property,
            map: map.current!,
            onClick: handlePropertySelect,
          });
          markersRef.current.push(marker);
        } else {
          // Multiple properties - create cluster marker
          const [latStr, lngStr] = key.split(',');
          const centerLat = parseFloat(latStr) + gridSize / 2;
          const centerLng = parseFloat(lngStr) + gridSize / 2;
          
          const cluster = new ClusterMarker({
            count: clusterProperties.length,
            coordinates: [centerLng, centerLat],
            map: map.current!,
            onClick: () => {
              // Zoom in when cluster is clicked
              map.current?.flyTo({
                center: [centerLng, centerLat],
                zoom: map.current.getZoom() + 2,
                essential: true,
              });
            },
          });
          clustersRef.current.push(cluster);
        }
      });
    } else {
      // If fewer than 50 properties, show them all as individual markers
      properties.forEach(property => {
        const marker = new PropertyMarker({
          property,
          map: map.current!,
          onClick: handlePropertySelect,
        });
        markersRef.current.push(marker);
      });
    }
  };

  // Fetch properties from Supabase based on current map bounds
  const fetchProperties = async () => {
    if (!map.current) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const bounds = map.current.getBounds();
      
      // In a real app, we'd fetch from Supabase with PostGIS:
      // const { data, error } = await supabase
      //   .from('properties')
      //   .select('*, zip_codes(median_income)')
      //   .filter(
      //     'coordinates',
      //     'st_within',
      //     `POLYGON((${bounds.getWest()} ${bounds.getSouth()}, ${bounds.getEast()} ${bounds.getSouth()}, ${bounds.getEast()} ${bounds.getNorth()}, ${bounds.getWest()} ${bounds.getNorth()}, ${bounds.getWest()} ${bounds.getSouth()}))`
      //   )
      //   .limit(100);
      //
      // if (error) throw new Error(error.message);
      // setProperties(data);
      
      // For now, we'll use mock data
      // Filter mock properties to those within current bounds
      const filteredProperties = MOCK_PROPERTIES.filter(property => {
        const { lng, lat } = property.coordinates;
        return lng >= bounds.getWest() &&
               lng <= bounds.getEast() &&
               lat >= bounds.getSouth() &&
               lat <= bounds.getNorth();
      });
      
      setProperties(filteredProperties);
      createMarkers(filteredProperties);
      
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with filters
  const handleSearch = async (query: string, filters: SearchFilters) => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, we'd call an API:
      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query, filters }),
      // });
      // if (!response.ok) throw new Error('Search failed');
      // const results = await response.json();
      // setProperties(results);
      
      // For now, we'll filter the mock data
      let filteredProperties = [...MOCK_PROPERTIES];
      
      // Apply filters
      if (query) {
        filteredProperties = filteredProperties.filter(property => 
          property.address.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (filters.min_value_usd) {
        filteredProperties = filteredProperties.filter(property => 
          property.value_usd !== undefined && 
          property.value_usd >= Number(filters.min_value_usd)
        );
      }
      
      if (filters.max_value_usd) {
        filteredProperties = filteredProperties.filter(property => 
          property.value_usd !== undefined && 
          property.value_usd <= Number(filters.max_value_usd)
        );
      }
      
      if (filters.min_size_sqft) {
        filteredProperties = filteredProperties.filter(property => 
          property.size_sqft !== undefined && 
          property.size_sqft >= Number(filters.min_size_sqft)
        );
      }
      
      if (filters.max_size_sqft) {
        filteredProperties = filteredProperties.filter(property => 
          property.size_sqft !== undefined && 
          property.size_sqft <= Number(filters.max_size_sqft)
        );
      }
      
      if (filters.zip_code) {
        filteredProperties = filteredProperties.filter(property => 
          property.zip_code === filters.zip_code
        );
      }
      
      setProperties(filteredProperties);
      createMarkers(filteredProperties);
      
      // If we have results, fit map to show them all
      if (filteredProperties.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        
        filteredProperties.forEach(property => {
          bounds.extend([property.coordinates.lng, property.coordinates.lat]);
        });
        
        map.current?.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
        });
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle property selection
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    
    // Fly to the selected property
    map.current?.flyTo({
      center: [property.coordinates.lng, property.coordinates.lat],
      zoom: 16,
      essential: true,
      speed: 0.8,
    });
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map container */}
      <div
        ref={mapContainer}
        className="absolute inset-0"
        aria-label="Interactive property map"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-wealthmap-primary text-white px-4 py-2 rounded-full shadow-md z-10 flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading properties...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
          <ErrorAlert message={error} />
        </div>
      )}
      
      {/* Search bar */}
      <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
        <SearchBar 
          onSearch={handleSearch} 
          onFilterToggle={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />
      </div>
      
      {/* Selected property card */}
      {selectedProperty && (
        <PropertyCard
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
