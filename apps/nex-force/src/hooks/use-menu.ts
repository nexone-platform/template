import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface PermissionDto {
    canView: boolean;
    canEdit: boolean;
    canAdd: boolean;
    canDelete: boolean;
    canImport: boolean;
    canExport: boolean;
}

export interface SubMenuDto {
    menusId: number;
    menuValue: string;
    route: string;
    base?: string;
    base2?: string;
    base3?: string;
    base4?: string;
    base5?: string;
    base6?: string;
    base7?: string;
    base8?: string;
    currentActive: boolean;
    hasSubRoute: boolean;
    showSubRoute: boolean;
    icon: string;
    materialIcons: string;
    subMenus: SubMenuDto[]; // Nested SubMenus
    permissions: PermissionDto;
    dot?: boolean;
    count?: number;
    showMyTab?: boolean;
    changeLogVersion?: boolean;
    hasSubRouteTwo?: boolean;
    pageKey?: string;
    last1?: string;
    last?: string;
    last2?: string;
    page?: string;
    page1?: string;
    page2?: string;
    subMenusTwo?: SubMenuDto[];
    customSubmenuTwo?: boolean;
}

export interface Menu {
    menusId: number;
    tittle: string;
    icon: string;
    showAsTab: boolean;
    separateRoute: boolean;
    menu: SubMenuDto[]; // Array of submenus
    permissions: PermissionDto;
    hasSubRoute?: boolean;
    showMyTab?: boolean;
    materialicons?: string;
    pageKey?: string;
}

/**
 * Get the current language from localStorage.
 * Used by useUserMenu to make menu labels bilingual.
 */
function getCurrentLang(): string {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("lang") || "en";
}

/**
 * Fetch the user's menu tree for the sidebar.
 * Angular equivalent: SideBarService.getMenuByEmpIdLang(empId, lang)
 * API: GET /menu/{username}/{lang}
 *
 * The queryKey includes the language code so React Query automatically
 * refetches when the sidebar invalidates the query on language change.
 */
export function useUserMenu() {
    const lang = getCurrentLang();

    return useQuery({
        queryKey: ["userMenu", lang],
        queryFn: async () => {
            const username = localStorage.getItem("username");
            if (!username) return [];

            const currentLang = getCurrentLang();
            const { data } = await apiClient.get<Menu[]>(`/menu/${username}/${currentLang}`);
            return data;
        },
        retry: 2,
        staleTime: 5 * 60_000, // 5 minutes
    });
}

/**
 * Fetch pending approval counts for sidebar badges.
 * Angular equivalent: SideBarService.getOvertimeCount(), getResignationCount(), etc.
 */
export function useSidebarCounts() {
    const overtimeQuery = useQuery({
        queryKey: ["sidebar", "overtimeCount"],
        queryFn: async () => {
            const { data } = await apiClient.get<number>("overtime/pendingApprovalCount");
            return data;
        },
        staleTime: 60_000, // Refresh every 60s
    });

    const resignationQuery = useQuery({
        queryKey: ["sidebar", "resignationCount"],
        queryFn: async () => {
            const { data } = await apiClient.get<number>("resignations/pendingApprovalCount");
            return data;
        },
        staleTime: 60_000,
    });

    const leaveQuery = useQuery({
        queryKey: ["sidebar", "leaveCount"],
        queryFn: async () => {
            const { data } = await apiClient.get<number>("leaveRequest/pendingApprovalCount");
            return data;
        },
        staleTime: 60_000,
    });

    const promotionQuery = useQuery({
        queryKey: ["sidebar", "promotionCount"],
        queryFn: async () => {
            const { data } = await apiClient.get<number>("promotion/pendingApprovalCount");
            return data;
        },
        staleTime: 60_000,
    });

    return {
        overtimeCount: overtimeQuery.data ?? 0,
        resignationCount: resignationQuery.data ?? 0,
        leaveCount: leaveQuery.data ?? 0,
        promotionCount: promotionQuery.data ?? 0,
    };
}

/**
 * Fetch permission for a specific menu item.
 * Angular equivalent: SideBarService.getPermission(empId, menuId)
 * API: GET /role/getPermission/{empId}/{menuId}
 */
export async function fetchMenuPermission(menuId: number): Promise<PermissionDto | null> {
    const username = localStorage.getItem("username");
    if (!username || !menuId) return null;

    try {
        const { data } = await apiClient.get<PermissionDto>(
            `role/getPermission/${username}/${menuId}`
        );
        localStorage.setItem("permissionsSubject", JSON.stringify(data));
        return data;
    } catch {
        return null;
    }
}

/**
 * Helper: find the menusId for a given route path from the menu tree.
 * Angular equivalent: SideMenuOneComponent.getMenuIdFromRoute()
 */
export function getMenuIdFromRoute(currentUrl: string, menus: Menu[]): number | null {
    for (const menu of menus) {
        if (menu.menu && menu.menu.length > 0) {
            for (const sub of menu.menu) {
                if (sub.route === currentUrl) {
                    return sub.menusId;
                }
                if (sub.subMenus && sub.subMenus.length > 0) {
                    for (const child of sub.subMenus) {
                        if (child.route === currentUrl) {
                            return child.menusId;
                        }
                    }
                }
            }
        }
    }
    return null;
}
