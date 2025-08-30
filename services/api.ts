interface ApiResult {
  id: number;
  position: number;
  name: string;
  time: string;
  ansTime: string;
  change: number;
  date: string;
  track: string;
  category: string;
  geslachten: string;
  level: string;
  distance: number;
}

interface ApiFilters {
  distance?: string;
  season?: string;
  gender?: string;
  level?: string;
  category?: string;
  track?: string;
  search?: string;
}

const API_BASE_URL = 'https://knsb-example-api-cmg8eabdcwejh7ee.westeurope-01.azurewebsites.net';

export class SkatingAPI {
  static async getResults(filters: ApiFilters = {}): Promise<ApiResult[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      if (filters.distance && filters.distance !== 'all') {
        params.append('distance', filters.distance);
      }
      if (filters.season && filters.season !== 'all') {
        params.append('season', filters.season);
      }
      if (filters.gender && filters.gender !== 'all') {
        params.append('gender', filters.gender);
      }
      if (filters.level && filters.level !== 'all') {
        params.append('level', filters.level);
      }
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.track && filters.track !== 'all') {
        params.append('track', filters.track);
      }
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }

      const url = `${API_BASE_URL}/results${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data || [];
    } catch (error) {
      console.error('Error fetching results from API:', error);
      // Return empty array on error - component will handle fallback
      return [];
    }
  }

  static async getSkaterDetails(skaterId: number): Promise<ApiResult | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/skaters/${skaterId}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching skater details:', error);
      return null;
    }
  }

  static async getSeasonBest(skaterId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/skaters/${skaterId}/season-best`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching season best:', error);
      return null;
    }
  }

  static async getRaces(skaterId: number): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/skaters/${skaterId}/races`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.races || data || [];
    } catch (error) {
      console.error('Error fetching races:', error);
      return [];
    }
  }
}