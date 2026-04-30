import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API Response Types
export interface Page {
    id: string;
    title: string;
    slug: string;
    layout: any;
    seoMeta: {
        title: string;
        description: string;
        keywords: string[];
    };
    status: 'draft' | 'published';
    isNavVisible: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePageDto {
    title: string;
    slug: string;
    layout?: any;
    seoMeta?: {
        title: string;
        description: string;
        keywords: string[];
    };
    status?: 'draft' | 'published';
}

export interface UpdatePageDto {
    title?: string;
    slug?: string;
    layout?: any;
    seoMeta?: {
        title: string;
        description: string;
        keywords: string[];
    };
    status?: 'draft' | 'published';
}

// Pages API
export const pagesApi = {
    // Get all pages
    getAll: async (): Promise<Page[]> => {
        const response = await api.get('/pages');
        return response.data;
    },

    // Get a single page by ID
    getById: async (id: string): Promise<Page> => {
        const response = await api.get(`/pages/${id}`);
        return response.data;
    },

    // Get a page by slug
    getBySlug: async (slug: string): Promise<Page> => {
        const response = await api.get(`/pages/slug/${slug}`);
        return response.data;
    },

    // Create a new page
    create: async (data: CreatePageDto): Promise<Page> => {
        const response = await api.post('/pages', data);
        return response.data;
    },

    // Update a page
    update: async (id: string, data: UpdatePageDto): Promise<Page> => {
        const response = await api.put(`/pages/${id}`, data);
        return response.data;
    },

    // Delete a page
    delete: async (id: string): Promise<void> => {
        await api.delete(`/pages/${id}`);
    },

    // Publish a page
    publish: async (id: string): Promise<Page> => {
        const response = await api.put(`/pages/${id}/publish`);
        return response.data;
    },

    // Unpublish a page
    unpublish: async (id: string): Promise<Page> => {
        const response = await api.put(`/pages/${id}/unpublish`);
        return response.data;
    },

    // Toggle navbar visibility
    toggleNavVisibility: async (id: string): Promise<Page> => {
        const response = await api.put(`/pages/${id}/toggle-nav`);
        return response.data;
    },
};

export default api;
