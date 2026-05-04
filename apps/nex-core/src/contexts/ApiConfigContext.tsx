"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// The only hardcoded bootstrap URL!
// Points to the NexCore backend to retrieve system_apps
const BOOTSTRAP_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || '';

type ApiConfigContextType = {
  endpoints: Record<string, string>;
  isLoaded: boolean;
  getEndpoint: (appName: string, defaultFallback?: string) => string;
};

const ApiConfigContext = createContext<ApiConfigContextType>({
  endpoints: {},
  isLoaded: false,
  getEndpoint: (appName: string, fallback?: string) => fallback || '',
});

export const ApiConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [endpoints, setEndpoints] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchApiConfig = async () => {
      try {
        const res = await fetch(`${BOOTSTRAP_API_URL}/v1/system-apps?all=true`);
        if (res.ok) {
          const json = await res.json();
          // Assume response structure gives array of system_apps
          const apps = json.data || json;
          const newEndpoints: Record<string, string> = {};
          
          if (Array.isArray(apps)) {
            apps.forEach((app: any) => {
              if (app.app_name && app.api_path) {
                // If the app_name is NexCore, the api path from DB is http://localhost:8101/api
                // If it ends with a slash remove it
                let cleanRoute = app.api_path.endsWith('/') ? app.api_path.slice(0, -1) : app.api_path;
                newEndpoints[app.app_name] = cleanRoute;
              }
            });
          }
          setEndpoints(newEndpoints);
        }
      } catch (err) {
        console.error("Failed to load System Apps API config", err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchApiConfig();
  }, []);

  const getEndpoint = (appName: string, fallback?: string) => {
    // If not loaded yet, or not found, return fallback (which will be the hardcoded URL for backwards compat)
    if (!endpoints[appName]) {
      if (appName === 'NexCore' && !fallback) return process.env.NEXT_PUBLIC_CORE_API_URL || '/api';
      return fallback || '';
    }
    return endpoints[appName];
  };

  return (
    <ApiConfigContext.Provider value={{ endpoints, isLoaded, getEndpoint }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => useContext(ApiConfigContext);
