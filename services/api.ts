const BASE_URL = "https://knsb-example-api-cmg8eabdcwejh7ee.westeurope-01.azurewebsites.net";
const DEV_PROXY = process.env.EXPO_PUBLIC_PROXY_URL || "http://127.0.0.1:8088";

type FetchOpts = { 
  path: string; 
  query?: Record<string, string | number | undefined>;
  method?: 'GET' | 'POST';
  body?: any;
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

function cleanFilters(filters: Record<string, any>) {
  const cleaned: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all' && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
}

async function checkContentTypeAndParseJson(response: Response, url: string) {
  const contentType = response.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    const bodyText = await response.text();
    const truncatedBody = bodyText.substring(0, 300);
    console.error(`Non-JSON response from ${url}:`, {
      status: response.status,
      contentType,
      bodyPreview: truncatedBody
    });
    throw new Error(`Expected JSON but got ${contentType}. Status: ${response.status}`);
  }
  
  return await response.json();
}

async function doFetch({ path, query, method = 'GET', body }: FetchOpts) {
  const url = `${BASE_URL}${path}${method === 'GET' ? toQS(query) : ''}`;
  console.log('Attempting API call to:', url, 'Method:', method);
  
  try {
    const fetchOptions: RequestInit = {
      method,
      mode: "cors",
      headers: { 
        "Accept": "application/json",
        ...(method === 'POST' && { "Content-Type": "application/json" })
      },
    };
    
    if (method === 'POST' && body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const res = await fetch(url, fetchOptions);
    
    console.log('API response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await checkContentTypeAndParseJson(res, url);
    console.log('API response data:', data);
    return data;
  } catch (err: any) {
    console.warn("Direct fetch failed:", err?.message || err);
    
    // If CORS blocks, try local proxy fallback
    try {
      const proxyUrl = `${DEV_PROXY}/proxy${path}${method === 'GET' ? toQS(query) : ''}`;
      console.log('Trying proxy URL:', proxyUrl);
      
      const proxyOptions: RequestInit = {
        method,
        headers: { 
          "Accept": "application/json",
          ...(method === 'POST' && { "Content-Type": "application/json" })
        },
      };
      
      if (method === 'POST' && body) {
        proxyOptions.body = JSON.stringify(body);
      }
      
      const res = await fetch(proxyUrl, proxyOptions);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Proxy HTTP ${res.status}: ${errorText}`);
      }
      
      return await checkContentTypeAndParseJson(res, proxyUrl);
    } catch (proxyErr: any) {
      console.error('Both direct and proxy fetch failed:', proxyErr?.message || proxyErr);
      throw new Error(`API unavailable: ${err?.message || err}`);
    }
  }
}

async function httpGet(path: string, query?: Record<string, string | number | undefined>) {
  return doFetch({ path, query, method: 'GET' });
}

async function httpPost(path: string, body?: any) {
  return doFetch({ path, method: 'POST', body });
}

export const SkatingAPI = {
  async health() {
    try {
      return await httpGet('/health');
    } catch (error) {
      console.error('Error in health check:', error);
      return null;
    }
  },

  async getRaces(filters: {
    distance?: string;
    season?: string;
    gender?: string;
    level?: string;
    category?: string;
    track?: string;
    search?: string;
    name?: string;
    skaterId?: string;
  } = {}) {
    try {
      const requestBody = cleanFilters({
        name: filters.search || filters.name,
        skaterId: filters.skaterId,
        season: filters.season,
        distance: filters.distance,
        gender: filters.gender,
        level: filters.level,
        category: filters.category,
        track: filters.track
      });

      console.log('getRaces request body:', requestBody);
      const data = await httpPost('/getRaces', requestBody);
      console.log('Raw API response:', data);
      
      // Handle different response formats
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.races)) return data.races;
        if (Array.isArray(data.results)) return data.results;
        if (data.data && Array.isArray(data.data)) return data.data;
      }
      
      console.warn('Unexpected API response format:', data);
      return [];
    } catch (error) {
      console.error('Error in getRaces:', error);
      return [];
    }
  },

  async getSeasonBest(params: { 
    skaterId?: string; 
    name?: string; 
    season?: string; 
    distance?: string 
  }) {
    try {
      const requestBody = cleanFilters(params);
      console.log('getSeasonBest request body:', requestBody);
      const data = await httpPost('/getSeasonBest', requestBody);
      return data;
    } catch (error) {
      console.error('Error in getSeasonBest:', error);
      return null;
    }
  },

  async getSeasonBestPoints(params: { 
    person_id?: number[];
    season?: number[];
    distance?: number[];
  }) {
    try {
      const requestBody = {
        person_id: params.person_id || [],
        season: params.season || [],
        distance: params.distance || []
      };
      console.log('getSeasonBestPoints request body:', requestBody);
      const data = await httpPost('/getSeasonBestPoints', requestBody);
      return data;
    } catch (error) {
      console.error('Error in getSeasonBestPoints:', error);
      return null;
    }
  },

  // Keep this for backward compatibility, but it now calls getRaces
  async getResults(filters: {
    distance?: string;
    season?: string;
    gender?: string;
    level?: string;
    category?: string;
    track?: string;
    search?: string;
  } = {}) {
    return this.getRaces(filters);
  },

  async getSkaterDetails(skaterId: number) {
    try {
      const data = await httpGet(`/skaters/${skaterId}`);
      return data;
    } catch (error) {
      console.error('Error in getSkaterDetails:', error);
      return null;
    }
  }
};