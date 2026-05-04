// API service for fetching pages from backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8103/api';

export interface ComponentInstance {
    id: string;
    type: string;
    props: Record<string, any>;
    children?: ComponentInstance[];
}

export interface Page {
    id: string;
    title: string;
    slug: string;
    layout: ComponentInstance[];
    seoMeta: {
        title: string;
        description: string;
        keywords: string[];
    };
    status: 'draft' | 'published';
    views: number;
    createdAt: string;
    updatedAt: string;
}

export class PageAPI {
    static async getBySlug(slug: string): Promise<Page | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/pages/slug/${slug}`, {
                cache: 'no-store', // Always get fresh data
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to fetch page: ${response.statusText}`);
            }

            const page = await response.json();
            return page;
        } catch (error) {
            console.error('Error fetching page by slug:', error);
            return null;
        }
    }

    static async getAll(): Promise<Page[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/pages`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch pages: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching pages:', error);
            return [];
        }
    }
}
