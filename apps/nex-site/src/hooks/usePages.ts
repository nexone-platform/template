import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesApi } from '../services/api';
import type { CreatePageDto, UpdatePageDto } from '../services/api';
import { usePageBuilderStore } from '../store/pageBuilderStore';

// Query Keys
export const pageKeys = {
    all: ['pages'] as const,
    detail: (id: string) => ['pages', id] as const,
    bySlug: (slug: string) => ['pages', 'slug', slug] as const,
};

// Get all pages
export const usePages = () => {
    return useQuery({
        queryKey: pageKeys.all,
        queryFn: pagesApi.getAll,
    });
};

// Get single page by ID
export const usePage = (id: string) => {
    return useQuery({
        queryKey: pageKeys.detail(id),
        queryFn: () => pagesApi.getById(id),
        enabled: !!id,
    });
};

// Get page by slug
export const usePageBySlug = (slug: string) => {
    return useQuery({
        queryKey: pageKeys.bySlug(slug),
        queryFn: () => pagesApi.getBySlug(slug),
        enabled: !!slug,
    });
};

// Create page mutation
export const useCreatePage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePageDto) => pagesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
        },
    });
};

// Update page mutation
export const useUpdatePage = () => {
    const queryClient = useQueryClient();
    const { currentPage, setCurrentPage } = usePageBuilderStore();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePageDto }) =>
            pagesApi.update(id, data),
        onSuccess: (updatedPage) => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
            queryClient.invalidateQueries({ queryKey: pageKeys.detail(updatedPage.id) });

            // Update current page in store if it's the same page
            if (currentPage?.id === updatedPage.id) {
                setCurrentPage(updatedPage);
            }
        },
    });
};

// Delete page mutation
export const useDeletePage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pagesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
        },
    });
};

// Publish page mutation
export const usePublishPage = () => {
    const queryClient = useQueryClient();
    const { currentPage, setCurrentPage } = usePageBuilderStore();

    return useMutation({
        mutationFn: (id: string) => pagesApi.publish(id),
        onSuccess: (updatedPage) => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
            queryClient.invalidateQueries({ queryKey: pageKeys.detail(updatedPage.id) });

            if (currentPage?.id === updatedPage.id) {
                setCurrentPage(updatedPage);
            }
        },
    });
};

// Unpublish page mutation
export const useUnpublishPage = () => {
    const queryClient = useQueryClient();
    const { currentPage, setCurrentPage } = usePageBuilderStore();

    return useMutation({
        mutationFn: (id: string) => pagesApi.unpublish(id),
        onSuccess: (updatedPage) => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
            queryClient.invalidateQueries({ queryKey: pageKeys.detail(updatedPage.id) });

            if (currentPage?.id === updatedPage.id) {
                setCurrentPage(updatedPage);
            }
        },
    });
};

// Toggle nav visibility mutation
export const useToggleNavVisibility = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => pagesApi.toggleNavVisibility(id),
        onSuccess: (updatedPage) => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
            queryClient.invalidateQueries({ queryKey: pageKeys.detail(updatedPage.id) });
        },
    });
};

