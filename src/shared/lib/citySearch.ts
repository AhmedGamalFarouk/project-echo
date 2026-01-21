// API-based city search using OpenStreetMap Nominatim
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
  };
}

export interface CitySearchResult {
  id: number;
  displayName: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Use Nominatim API for city search
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&limit=10` +
      `&addressdetails=1` +
      `&featuretype=city`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProjectEcho/1.0' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }

    const data: NominatimResult[] = await response.json();

    // Filter and format results to only include cities/towns
    const results = data
      .filter(result => 
        ['city', 'town', 'village', 'administrative'].includes(result.type) ||
        result.address?.city || 
        result.address?.town
      )
      .map(result => {
        const city = result.address?.city || 
                     result.address?.town || 
                     result.address?.village ||
                     result.display_name.split(',')[0];
        
        const country = result.address?.country || 
                       result.display_name.split(',').slice(-1)[0].trim();

        return {
          id: result.place_id,
          displayName: `${city}, ${country}`,
          city: city,
          country: country,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        };
      });

    // Remove duplicates based on displayName (city, country combination)
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex((r) => r.displayName === result.displayName)
    );

    return uniqueResults.slice(0, 8); // Limit to 8 results
  } catch (error) {
    console.error('City search error:', error);
    return [];
  }
}
