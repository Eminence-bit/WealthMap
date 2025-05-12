
import React from 'react';
import maplibregl from 'maplibre-gl';

interface ClusterMarkerProps {
  count: number;
  coordinates: [number, number]; // [lng, lat]
  map: maplibregl.Map;
  onClick: () => void;
}

class ClusterMarker {
  private marker: maplibregl.Marker;

  constructor({ count, coordinates, map, onClick }: ClusterMarkerProps) {
    // Create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'cluster-marker';
    el.setAttribute('aria-label', `Cluster of ${count} properties`);
    
    // Set inner HTML for the element
    el.innerHTML = count.toString();
    
    // Set up marker with custom element
    this.marker = new maplibregl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat(coordinates)
      .addTo(map);
    
    // Add click event
    el.addEventListener('click', onClick);
  }

  // Method to remove marker from map
  remove() {
    this.marker.remove();
  }
}

export default ClusterMarker;
