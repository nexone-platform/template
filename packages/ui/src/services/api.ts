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
      // Fetch from nex-core-api (port 8101) - central system-apps endpoint shared by all apps
      const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
        ? `http://${window.location.hostname}:8101/api/v1/system-apps` 
        : 'http://localhost:8101/api/v1/system-apps';
        
      const res = await fetch(API_URL, { credentials: 'include' });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const json = await res.json();
      return (json && json.data !== undefined) ? json.data as SystemApp[] : json as SystemApp[];
    } catch (error) {
      console.error('Failed to fetch system apps in ui package:', error);
      throw error;
    }
  }
};

export const systemConfigService = {
  getByKey: async (key: string): Promise<string | null> => {
    try {
      const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
        ? `http://${window.location.hostname}:8101/api/system-configs/key/${key}` 
        : `http://localhost:8101/api/system-configs/key/${key}`;
        
      const res = await fetch(API_URL, { credentials: 'include' });
      if (!res.ok) return null;
      const json = await res.json();
      // It returns the config value as string, or object with configValue/systemValue
      return typeof json === 'string' ? json : (json?.systemValue || json?.configValue || json?.config_value || json?.system_value || json?.value || null);
    } catch (error) {
      console.error(`Failed to fetch config ${key}:`, error);
      return null;
    }
  }
};
