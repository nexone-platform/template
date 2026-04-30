/**
 * useRowSelection — reusable hook for table row selection (checkbox).
 *
 * Usage:
 *   const { selectedIds, isSelected, toggle, toggleAll, allSelected, selectedCount, clearSelection } =
 *       useRowSelection(paginatedData, row => row.id);
 *
 *   // In header: <SelectAllCheckbox checked={allSelected} indeterminate={...} onChange={toggleAll} />
 *   // In row:    <RowCheckbox checked={isSelected(row.id)} onChange={() => toggle(row.id)} />
 */

import { useState, useCallback, useMemo } from "react";

export function useRowSelection<T>(
    /** Currently visible (paginated) data */
    visibleData: T[],
    /** Extract a unique ID from a row */
    getRowId: (row: T) => string | number
) {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    const visibleIds = useMemo(
        () => visibleData.map(getRowId),
        [visibleData, getRowId]
    );

    const selectedCount = selectedIds.size;

    /** Number of currently visible rows that are selected */
    const visibleSelectedCount = useMemo(
        () => visibleIds.filter((id) => selectedIds.has(id)).length,
        [visibleIds, selectedIds]
    );

    /** All visible rows are selected */
    const allSelected = visibleData.length > 0 && visibleSelectedCount === visibleData.length;

    /** Some (but not all) visible rows are selected */
    const indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < visibleData.length;

    const isSelected = useCallback(
        (id: string | number) => selectedIds.has(id),
        [selectedIds]
    );

    const toggle = useCallback((id: string | number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    /** Toggle all visible rows */
    const toggleAll = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (visibleIds.every((id) => prev.has(id))) {
                // Un-select all visible
                visibleIds.forEach((id) => next.delete(id));
            } else {
                // Select all visible
                visibleIds.forEach((id) => next.add(id));
            }
            return next;
        });
    }, [visibleIds]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    /** Get selected rows from a full dataset  */
    const getSelectedRows = useCallback(
        (allData: T[]): T[] => {
            if (selectedIds.size === 0) return [];
            return allData.filter((row) => selectedIds.has(getRowId(row)));
        },
        [selectedIds, getRowId]
    );

    return {
        selectedIds,
        selectedCount,
        visibleSelectedCount,
        allSelected,
        indeterminate,
        isSelected,
        toggle,
        toggleAll,
        clearSelection,
        getSelectedRows,
    };
}
