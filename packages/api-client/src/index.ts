import axios from "axios";

// Centralized API Client
// All apps in NexOne should use this to ensure consistent headers and interceptors

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Setup interceptors for auth tokens here
api.interceptors.request.use((config) => {
  // const token = getAuthToken(); // From @nexone/auth
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
