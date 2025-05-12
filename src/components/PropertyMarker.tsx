
import React from 'react';
import { Marker } from 'maplibre-gl';
import { Property } from '../lib/types';

interface PropertyMarkerProps {
  property: Property;
  map: maplibregl.Map;
  onClick: (property: Property) => void;
}

class PropertyMarker {
  private marker: maplibregl.Marker;
  private property: Property;

  constructor({ property, map, onClick }: PropertyMarkerProps) {
    this.property = property;
    
    // Create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'property-marker';
    el.setAttribute('aria-label', `Property at ${property.address}`);
    
    // Add tooltip
    el.title = property.address;
    
    // Set up marker with custom element
    this.marker = new Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat([property.coordinates.lng, property.coordinates.lat])
      .addTo(map);
    
    // Add click event
    el.addEventListener('click', () => {
      onClick(property);
    });
  }

  // Method to remove marker from map
  remove() {
    this.marker.remove();
  }

  // Method to update marker position
  updatePosition(lng: number, lat: number) {
    this.marker.setLngLat([lng, lat]);
    return this;
  }
}

export default PropertyMarker;
