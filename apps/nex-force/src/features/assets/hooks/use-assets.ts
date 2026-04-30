/**
 * React Query hooks for Assets — replaces Angular's RxJS subscribe() calls.
 *
 * Conversion:
 *   this.assetsService.getAllAssets().subscribe(...)  → useAssets()
 *   this.assetsService.update(formData).subscribe(...) → useUpdateAsset()
 *   this.assetsService.deleteData(id).subscribe(...)   → useDeleteAsset()
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assetsService } from "@/services/assets.service";
import { employeeService } from "@/services/employee.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

const QUERY_KEY = ["assets"] as const;

/** Fetch all assets — replaces getTableData() + subscribe() */
export function useAssets() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: assetsService.getAll,
    });
}

/** Fetch single asset by ID */
export function useAssetById(id: number) {
    return useQuery({
        queryKey: [...QUERY_KEY, id],
        queryFn: () => assetsService.getById(id),
        enabled: id > 0,
    });
}

/** Create or update asset — replaces onSubmit() + subscribe() */
export function useUpdateAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assetsService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            toast.success("Asset saved successfully.");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Error saving asset."));
        },
    });
}

/** Delete asset — replaces onDelete() + subscribe() */
export function useDeleteAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assetsService.delete,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            toast.success(res.message || "Asset deleted successfully.");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Error deleting asset."));
        },
    });
}

/** Fetch employees for autocomplete — replaces getData() employee part */
export function useEmployeeAutocomplete() {
    return useQuery({
        queryKey: ["employees", "autocomplete"],
        queryFn: employeeService.getForAutocomplete,
    });
}
