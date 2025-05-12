
export interface Property {
  id: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  size_sqft?: number;
  value_usd?: number;
  owner_name?: string;
  zip_code: string;
  wealth_estimate_usd?: number;
  wealth_confidence?: number;
  zip_codes?: {
    median_income: number;
  };
  created_at?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  property_id: string;
  properties?: Property;
  created_at?: string;
}

export interface SearchFilters {
  min_value_usd?: number | string;
  max_value_usd?: number | string;
  min_size_sqft?: number | string;
  max_size_sqft?: number | string;
  zip_code?: string;
}

export interface User {
  id: string;
  email?: string;
  company_id?: string;
}

export interface PropertyFeatureCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
    properties: Property;
  }[];
}

// Mock data for development and testing
export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    address: '123 Main St, San Francisco, CA 94105',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    size_sqft: 2000,
    value_usd: 1500000,
    owner_name: 'John Doe LLC',
    zip_code: '94105',
    wealth_estimate_usd: 5000000,
    wealth_confidence: 0.8,
  },
  {
    id: '2',
    address: '456 Market St, San Francisco, CA 94105',
    coordinates: { lat: 37.7895, lng: -122.3999 },
    size_sqft: 1800,
    value_usd: 1300000,
    owner_name: 'Jane Smith Trust',
    zip_code: '94105',
    wealth_estimate_usd: 4200000,
    wealth_confidence: 0.75,
  },
  {
    id: '3',
    address: '789 Howard St, San Francisco, CA 94103',
    coordinates: { lat: 37.7835, lng: -122.3957 },
    size_sqft: 2200,
    value_usd: 1700000,
    owner_name: 'Mission Bay Ventures',
    zip_code: '94103',
    wealth_estimate_usd: 6500000,
    wealth_confidence: 0.85,
  },
  {
    id: '4',
    address: '101 California St, San Francisco, CA 94111',
    coordinates: { lat: 37.7932, lng: -122.3984 },
    size_sqft: 3000,
    value_usd: 2500000,
    owner_name: 'Financial District Partners',
    zip_code: '94111',
    wealth_estimate_usd: 9000000,
    wealth_confidence: 0.9,
  },
  {
    id: '5',
    address: '1 Market St, San Francisco, CA 94105',
    coordinates: { lat: 37.7938, lng: -122.3949 },
    size_sqft: 2500,
    value_usd: 2100000,
    owner_name: 'Embarcadero Holdings',
    zip_code: '94105',
    wealth_estimate_usd: 7500000,
    wealth_confidence: 0.82,
  }
];
