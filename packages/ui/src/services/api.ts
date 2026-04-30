export interface SystemApp {
  id: number;
  app_name: string;
  desc_en: string;
  desc_th: string;
  icon_path: string;
  theme_color: string;
  status: string;
  seq_no: number;
  created_at? : string;
  is_active?: boolean;
  app_group?: string;
  icon_url?: string;
  route_path?: string;
  api_path?: string;
  app_url?: string;
  url?: string;
}

export const systemAppService = {
  getAll: async (): Promise<SystemApp[]> => {
    try {
      // Fetch from nex-core-api (port 8001) - central system-apps endpoint shared by all apps
      const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
        ? `http://${window.location.hostname}:8001/api/v1/system-apps` 
        : 'http://localhost:8001/api/v1/system-apps';
        
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const json = await res.json();
      return (json && json.data !== undefined) ? json.data as SystemApp[] : json as SystemApp[];
    } catch (error) {
      console.error('Failed to fetch system apps in ui package:', error);
      throw error;
    }
  }
};
