"use client";

import * as React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const MOOD_COLORS: Record<string, string> = {
  Serene: '#4ade80',    // Mint
  Energetic: '#facc15', // Yellow
  Melancholy: '#3b82f6',// Blue
  Anxious: '#a855f7',   // Purple
  Furious: '#ef4444',   // Red
};

export default function MoodMap() {
  const cityMoods = useQuery(api.map.getMoods);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  // Default view: World
  const [viewState, setViewState] = React.useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5
  });

  if (!mapboxToken) {
    return (
        <div className="w-full h-[600px] border-y border-white/10 relative overflow-hidden flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
        <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2 rounded-none">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white">Global_Emotive_State</h3>
        </div>

        <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            style={{width: '100%', height: '100%'}}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={mapboxToken}
            attributionControl={false}
        >
            {cityMoods?.map((city) => (
                <Marker 
                    key={city.city} 
                    longitude={city.lon} 
                    latitude={city.lat} 
                    anchor="bottom"
                >
                    <div className="relative flex flex-col items-center group/marker cursor-pointer">
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover/marker:block bg-black/90 border border-white/20 px-2 py-1 text-[10px] font-mono whitespace-nowrap z-50">
                            {city.city} :: {city.mood} ({city.count})
                        </div>

                        {/* Glowing Pulse */}
                        <div 
                            className="absolute -inset-4 rounded-full opacity-50 blur-md animate-pulse"
                            style={{ backgroundColor: MOOD_COLORS[city.mood] || '#fff' }}
                        />
                        
                        {/* The Core Dot */}
                        <div 
                            className="h-3 w-3 rounded-full border border-white/50 relative z-10"
                            style={{ backgroundColor: MOOD_COLORS[city.mood] || '#fff' }}
                        />
                    </div>
                </Marker>
            ))}
        </Map>

        {/* Overlay Grid / Scanlines */}
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
    </div>
  );
}
