import { useState, useMemo } from "react";

interface UsePaginationOptions {
    pageSize?: number;
}

/**
 * Shared pagination hook — replaces the copy-pasted pagination logic
 * that existed in every Angular component (calculateTotalPages, getMoreData, etc.)
 */
export function usePagination<T>(
    data: T[] | undefined,
    options: UsePaginationOptions = {}
) {
    const { pageSize: defaultPageSize = 10 } = options;
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const totalData = data?.length ?? 0;
    const totalPages = Math.ceil(totalData / pageSize);

    const paginatedData = useMemo(() => {
        if (!data) return [];
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    const pageNumbers = useMemo(() => {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }

    function nextPage() {
        goToPage(currentPage + 1);
    }

    function prevPage() {
        goToPage(currentPage - 1);
    }

    function changePageSize(size: number) {
        setPageSize(size);
        setCurrentPage(1);
    }

    return {
        paginatedData,
        currentPage,
        pageSize,
        totalData,
        totalPages,
        pageNumbers,
        goToPage,
        nextPage,
        prevPage,
        changePageSize,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === totalPages || totalPages === 0,
    };
}
