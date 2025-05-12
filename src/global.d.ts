
declare module 'maplibre-gl' {
  export * from 'maplibre-gl';
  export default maplibregl;
}

declare namespace maplibregl {
  export class Map {
    constructor(options: any);
    on(event: string, listener: Function): void;
    remove(): void;
    addControl(control: any, position?: string): void;
    getBounds(): LngLatBounds;
    getZoom(): number;
    flyTo(options: any): void;
    fitBounds(bounds: LngLatBounds, options?: any): void;
  }

  export class Marker {
    constructor(options?: any);
    setLngLat(lngLat: [number, number]): this;
    addTo(map: Map): this;
    remove(): void;
  }

  export class NavigationControl {
    constructor(options?: {});
  }

  export class ScaleControl {
    constructor(options?: {});
  }

  export class LngLatBounds {
    extend(lngLat: [number, number]): this;
    getWest(): number;
    getEast(): number;
    getNorth(): number;
    getSouth(): number;
  }
}
