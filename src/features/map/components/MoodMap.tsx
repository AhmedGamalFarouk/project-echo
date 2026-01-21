"use client";

import * as React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function MoodMap() {
  const cityActivity = useQuery(api.map.getMoods);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [isLiveUpdate, setIsLiveUpdate] = React.useState(false);
  const prevCityCountRef = React.useRef<number>(0);
  const [newCities, setNewCities] = React.useState<Set<string>>(new Set());
  
  // Default view: World
  const [viewState, setViewState] = React.useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5
  });

  // Detect live updates and new cities
  React.useEffect(() => {
    if (cityActivity) {
      const currentCount = cityActivity.length;
      const currentCityKeys = new Set(cityActivity.map(c => c.city));
      
      // Check if data changed (not initial load)
      if (prevCityCountRef.current > 0 && currentCount !== prevCityCountRef.current) {
        setIsLiveUpdate(true);
        
        // Identify new cities
        const prevCities = new Set(
          cityActivity
            .slice(0, prevCityCountRef.current)
            .map(c => c.city)
        );
        
        const newlyAdded = new Set(
          [...currentCityKeys].filter(city => !prevCities.has(city))
        );
        
        setNewCities(newlyAdded);
        
        // Reset indicators after animation
        setTimeout(() => {
          setIsLiveUpdate(false);
          setNewCities(new Set());
        }, 3000);
      }
      
      prevCityCountRef.current = currentCount;
    }
  }, [cityActivity]);

  if (!mapboxToken) {
    return (
        <div className="w-full h-150 border-y border-white/10 relative overflow-hidden flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center space-y-2 p-8 border border-red-500/20 bg-red-950/10">
                <h3 className="font-mono text-red-500 text-lg font-bold tracking-widest">:: SYSTEM ALERT ::</h3>
                <p className="font-mono text-xs text-red-400/80">MAP_VISUALIZATION_MODULE_OFFLINE</p>
                <div className="text-[10px] font-mono text-muted-foreground mt-4 max-w-md">
                    To activate global tracking, insert a valid Mapbox Public Token into 
                    <span className="bg-white/10 px-1 mx-1 text-white">.env.local</span> 
                    as <span className="text-primary">NEXT_PUBLIC_MAPBOX_TOKEN</span>.
                </div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>
    );
  }

  return (
    <div className="w-full h-full border-y border-white/10 relative overflow-hidden group">
        <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2 rounded-none flex items-center gap-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white">Global_Activity_Map</h3>
            {isLiveUpdate && (
              <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary uppercase tracking-wider">Live</span>
              </div>
            )}
            {!isLiveUpdate && cityActivity && cityActivity.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500/50" />
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  {cityActivity.length} {cityActivity.length === 1 ? 'City' : 'Cities'}
                </span>
              </div>
            )}
        </div>

        <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            style={{width: '100%', height: '100%'}}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={mapboxToken}
            attributionControl={false}
        >
            {cityActivity?.map((city) => {
                const isNew = newCities.has(city.city);
                // Activity intensity based on post count
                const intensity = Math.min(city.count / 10, 1);
                const size = 8 + (intensity * 8); // 8-16px
                
                return (
                <Marker 
                    key={city.city} 
                    longitude={city.lon} 
                    latitude={city.lat} 
                    anchor="bottom"
                >
                    <div className={`relative flex flex-col items-center group/marker cursor-pointer ${isNew ? 'animate-in zoom-in-50 fade-in duration-700' : ''}`}>
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover/marker:block bg-black/90 border border-white/20 px-2 py-1 text-[10px] font-mono whitespace-nowrap z-50">
                            {city.city} :: {city.count} {city.count === 1 ? 'post' : 'posts'}
                        </div>

                        {/* Glowing Pulse - Extra intense for new cities */}
                        <div 
                            className={`absolute -inset-4 rounded-full opacity-50 blur-md ${isNew ? 'animate-ping' : 'animate-pulse'}`}
                            style={{ 
                                backgroundColor: `rgba(255, 255, 255, ${intensity})`,
                            }}
                        />
                        
                        {/* The Core Dot */}
                        <div 
                            className={`rounded-full border border-white/50 relative z-10 transition-transform ${isNew ? 'scale-125' : ''}`}
                            style={{ 
                                backgroundColor: '#fff',
                                width: `${size}px`,
                                height: `${size}px`,
                                opacity: 0.8 + (intensity * 0.2)
                            }}
                        />
                    </div>
                </Marker>
            )})}
        </Map>

        {/* Overlay Grid / Scanlines */}
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
    </div>
  );
}
