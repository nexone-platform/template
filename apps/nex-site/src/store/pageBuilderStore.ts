import { create } from 'zustand';

// Types for our page structure
export interface ComponentInstance {
    id: string;
    type: string;
    props: Record<string, any>;
    children?: ComponentInstance[];
}

export interface PageData {
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
    updatedAt: string;
}

interface PageBuilderState {
    // Current page being edited
    currentPage: PageData | null;

    // Selected component in canvas
    selectedComponentId: string | null;

    // Canvas view mode
    viewportMode: 'desktop' | 'tablet' | 'mobile';

    // Panel visibility
    showLeftPanel: boolean;
    showRightPanel: boolean;

    // History for undo/redo
    history: ComponentInstance[][];
    historyIndex: number;

    // Actions
    setCurrentPage: (page: PageData) => void;
    updatePageLayout: (layout: ComponentInstance[]) => void;
    selectComponent: (id: string | null) => void;
    setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
    toggleLeftPanel: () => void;
    toggleRightPanel: () => void;
    addComponent: (component: ComponentInstance, parentId?: string) => void;
    updateComponent: (id: string, props: Record<string, any>) => void;
    deleteComponent: (id: string) => void;
    reorderComponents: (fromIndex: number, toIndex: number) => void;
    findComponentById: (id: string) => ComponentInstance | null;
    undo: () => void;
    redo: () => void;
    saveHistory: () => void;
}

export const usePageBuilderStore = create<PageBuilderState>((set, get) => ({
    currentPage: null,
    selectedComponentId: null,
    viewportMode: 'desktop',
    showLeftPanel: true,
    showRightPanel: true,
    history: [],
    historyIndex: -1,

    setCurrentPage: (page) => set({ currentPage: page }),

    updatePageLayout: (layout) => {
        const { currentPage } = get();
        if (currentPage) {
            set({
                currentPage: {
                    ...currentPage,
                    layout,
                    updatedAt: new Date().toISOString(),
                },
            });
            get().saveHistory();
        }
    },

    selectComponent: (id) => set({ selectedComponentId: id }),

    setViewportMode: (mode) => set({ viewportMode: mode }),

    toggleLeftPanel: () => set((state) => ({ showLeftPanel: !state.showLeftPanel })),

    toggleRightPanel: () => set((state) => ({ showRightPanel: !state.showRightPanel })),

    addComponent: (component, parentId) => {
        const { currentPage } = get();
        if (!currentPage) return;

        const addToLayout = (items: ComponentInstance[]): ComponentInstance[] => {
            if (!parentId) {
                return [...items, component];
            }

            return items.map((item) => {
                if (item.id === parentId) {
                    return {
                        ...item,
                        children: [...(item.children || []), component],
                    };
                }
                if (item.children) {
                    return {
                        ...item,
                        children: addToLayout(item.children),
                    };
                }
                return item;
            });
        };

        const newLayout = addToLayout(currentPage.layout);
        get().updatePageLayout(newLayout);
    },

    updateComponent: (id, props) => {
        const { currentPage } = get();
        if (!currentPage) return;

        // Deep update: searches top-level, children, AND columns containers
        const updateInLayout = (items: ComponentInstance[]): ComponentInstance[] => {
            return items.map((item) => {
                // Direct match
                if (item.id === id) {
                    return { ...item, props: { ...item.props, ...props } };
                }
                // Search in children (standard nesting)
                if (item.children) {
                    return { ...item, children: updateInLayout(item.children) };
                }
                // Search inside columns container (props.columns[n].components)
                if (item.type === 'columns' && item.props.columns) {
                    const updatedCols = item.props.columns.map((col: any) => ({
                        ...col,
                        components: updateInLayout(col.components || []),
                    }));
                    return { ...item, props: { ...item.props, columns: updatedCols } };
                }
                return item;
            });
        };

        const newLayout = updateInLayout(currentPage.layout);
        get().updatePageLayout(newLayout);
    },

    deleteComponent: (id) => {
        const { currentPage } = get();
        if (!currentPage) return;

        const deleteFromLayout = (items: ComponentInstance[]): ComponentInstance[] => {
            return items
                .filter((item) => item.id !== id)
                .map((item) => {
                    if (item.children) {
                        return { ...item, children: deleteFromLayout(item.children) };
                    }
                    // Delete inside columns container
                    if (item.type === 'columns' && item.props.columns) {
                        const updatedCols = item.props.columns.map((col: any) => ({
                            ...col,
                            components: deleteFromLayout(col.components || []),
                        }));
                        return { ...item, props: { ...item.props, columns: updatedCols } };
                    }
                    return item;
                });
        };

        const newLayout = deleteFromLayout(currentPage.layout);
        get().updatePageLayout(newLayout);
        get().selectComponent(null);
    },

    reorderComponents: (fromIndex, toIndex) => {
        const { currentPage } = get();
        if (!currentPage) return;
        const layout = [...currentPage.layout];
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= layout.length || toIndex >= layout.length) return;
        const [moved] = layout.splice(fromIndex, 1);
        layout.splice(toIndex, 0, moved);
        get().updatePageLayout(layout);
    },

    findComponentById: (id) => {
        const { currentPage } = get();
        if (!currentPage) return null;

        const search = (items: ComponentInstance[]): ComponentInstance | null => {
            for (const item of items) {
                if (item.id === id) return item;
                if (item.children) {
                    const found = search(item.children);
                    if (found) return found;
                }
                if (item.type === 'columns' && item.props.columns) {
                    for (const col of item.props.columns) {
                        const found = search(col.components || []);
                        if (found) return found;
                    }
                }
            }
            return null;
        };

        return search(currentPage.layout);
    },

    saveHistory: () => {
        const { currentPage, history, historyIndex } = get();
        if (!currentPage) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(currentPage.layout)));

        set({
            history: newHistory.slice(-50), // Keep last 50 states
            historyIndex: Math.min(newHistory.length - 1, 49),
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const layout = history[newIndex];
            set({ historyIndex: newIndex });
            get().updatePageLayout(JSON.parse(JSON.stringify(layout)));
        }
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const layout = history[newIndex];
            set({ historyIndex: newIndex });
            get().updatePageLayout(JSON.parse(JSON.stringify(layout)));
        }
    },
}));
