const BASE_URL = "https://knsb-example-api-cmg8eabdcwejh7ee.westeurope-01.azurewebsites.net";

type FetchOpts = { 
  path: string; 
  query?: Record<string, string | number | undefined> 
};

function toQS(query?: Record<string, string | number | undefined>) {
  if (!query) return "";
  const p = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) p.append(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function doFetch({ path, query }: FetchOpts) {
  const url = `${BASE_URL}${path}${toQS(query)}`;
  console.log('Attempting API call to:', url);
  
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    });
    
    console.log('API response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('API response data:', data);
    return data;
  } catch (err: any) {
    console.warn("Direct fetch failed:", err?.message || err);
    
    // If CORS blocks, try local proxy fallback
    try {
      const proxyUrl = `/api/proxy${path}${toQS(query)}`;
      console.log('Trying proxy URL:', proxyUrl);
      
      const res = await fetch(proxyUrl, { 
        headers: { "Accept": "application/json" } 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Proxy HTTP ${res.status}: ${errorText}`);
      }
      
      return await res.json();
    } catch (proxyErr: any) {
      console.error('Both direct and proxy fetch failed:', proxyErr?.message || proxyErr);
      throw new Error(`API unavailable: ${err?.message || err}`);
    }
  }
}

export const SkatingAPI = {
  async getResults(filters: {
    distance?: string;
    season?: string;
    gender?: string;
    level?: string;
    category?: string;
    track?: string;
    search?: string;
  } = {}) {
    try {
      const queryParams: Record<string, string | undefined> = {};
      
      if (filters.distance && filters.distance !== 'all') {
        queryParams.distance = filters.distance;
      }
      if (filters.season && filters.season !== 'all') {
        queryParams.season = filters.season;
      }
      if (filters.gender && filters.gender !== 'all') {
        queryParams.gender = filters.gender;
      }
      if (filters.level && filters.level !== 'all') {
        queryParams.level = filters.level;
      }
      if (filters.category && filters.category !== 'all') {
        queryParams.category = filters.category;
      }
      if (filters.track && filters.track !== 'all') {
        queryParams.track = filters.track;
      }
      if (filters.search && filters.search.trim()) {
        queryParams.search = filters.search.trim();
      }

      const data = await doFetch({ path: "/results", query: queryParams });
      return data.results || data || [];
    } catch (error) {
      console.error('Error in getResults:', error);
      return [];
    }
  },

  async getSkaterDetails(skaterId: number) {
    try {
      const data = await doFetch({ path: `/skaters/${skaterId}` });
      return data;
    } catch (error) {
      console.error('Error in getSkaterDetails:', error);
      return null;
    }
  },

  async getSeasonBest(params: { 
    skaterId?: string; 
    name?: string; 
    season?: string; 
    distance?: string 
  }) {
    try {
      const data = await doFetch({ path: "/getSeasonBest", query: params });
      return data;
    } catch (error) {
      console.error('Error in getSeasonBest:', error);
      return null;
    }
  },

  async getRaces(params: { 
    skaterId?: string; 
    name?: string; 
    season?: string; 
    distance?: string 
  }) {
    try {
      const data = await doFetch({ path: "/getRaces", query: params });
      return data.races || data || [];
    } catch (error) {
      console.error('Error in getRaces:', error);
      return [];
    }
  }
};