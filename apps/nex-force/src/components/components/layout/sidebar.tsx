"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { SettingsSidebarContent } from "@/app/(dashboard)/settings/layout";
import {
    useUserMenu,
    useSidebarCounts,
    fetchMenuPermission,
    Menu as ApiMenu,
    SubMenuDto,
} from "@/hooks/use-menu";
import {
    LayoutDashboard, Users, Calendar, Briefcase, FolderKanban,
    Settings, ChevronDown, Menu, X,
    CreditCard, BarChart2, Package, List, BadgeCheck, UserMinus,
    GraduationCap, TrendingUp, Landmark, Clock,
    Award, LogOut, UserCheck, Grip, ClipboardCheck, CalendarClock,
    FileText,
} from "lucide-react";

import { useLanguage } from "@/lib/language";
import { useCompanyContext } from "@/lib/company-context";

// ---------------------------------------------------------------------------
// Lucide icon mapper
// ---------------------------------------------------------------------------
function parseIcon(iconName: string): React.ReactNode {
    if (!iconName) return <List className="w-5 h-5" />;
    const normalized = iconName.toLowerCase();

    if (normalized.includes("dashboard"))                                        return <LayoutDashboard className="w-5 h-5" />;
    if (normalized.includes("apps") || normalized.includes("grid"))              return <Grip className="w-5 h-5" />;
    if (normalized.includes("employees") || normalized.includes("people"))       return <Users className="w-5 h-5" />;
    if (normalized.includes("client"))                                           return <UserCheck className="w-5 h-5" />;
    if (normalized.includes("project") || normalized.includes("kanban"))         return <FolderKanban className="w-5 h-5" />;
    if (normalized.includes("recruit") || normalized.includes("job") || normalized.includes("briefcase")) return <Briefcase className="w-5 h-5" />;
    if (normalized.includes("payroll") || normalized.includes("money") || normalized.includes("salary")) return <CreditCard className="w-5 h-5" />;
    if (normalized.includes("report"))                                           return <BarChart2 className="w-5 h-5" />;
    if (normalized.includes("tax"))                                              return <Landmark className="w-5 h-5" />;
    if (normalized.includes("performance") || normalized.includes("indicator"))  return <TrendingUp className="w-5 h-5" />;
    if (normalized.includes("training") || normalized.includes("education"))     return <GraduationCap className="w-5 h-5" />;
    if (normalized.includes("promotion") || normalized.includes("award"))        return <Award className="w-5 h-5" />;
    if (normalized.includes("resignation") || normalized.includes("logout"))     return <LogOut className="w-5 h-5" />;
    if (normalized.includes("termination") || normalized.includes("exit"))       return <UserMinus className="w-5 h-5" />;
    if (normalized.includes("asset"))                                            return <Package className="w-5 h-5" />;
    if (normalized.includes("users"))                                            return <Users className="w-5 h-5" />;
    if (normalized.includes("approve"))                                          return <BadgeCheck className="w-5 h-5" />;
    if (normalized.includes("setting"))                                          return <Settings className="w-5 h-5" />;
    if (normalized.includes("menu") || normalized.includes("navigation"))        return <Menu className="w-5 h-5" />;
    if (normalized.includes("leave") || normalized.includes("calendar"))         return <Calendar className="w-5 h-5" />;
    if (normalized.includes("overtime") || normalized.includes("clock"))         return <Clock className="w-5 h-5" />;
    if (normalized.includes("attendance") || normalized.includes("clipboard"))   return <ClipboardCheck className="w-5 h-5" />;
    if (normalized.includes("shift") || normalized.includes("schedule"))         return <CalendarClock className="w-5 h-5" />;
    if (normalized.includes("document") || normalized.includes("file"))          return <FileText className="w-5 h-5" />;
    if (normalized.includes("user"))                                             return <Users className="w-5 h-5" />;
    return <List className="w-5 h-5" />;
}

// ---------------------------------------------------------------------------
// Route mapper — Angular paths → Next.js App Router paths
// ---------------------------------------------------------------------------
/**
 * Map API route to Next.js page path.
 *
 * Based on the actual menu API response and existing Next.js pages under
 * src/app/(dashboard)/. Most API routes already match Next.js paths exactly
 * and just fall through to `return path`. Only routes where the API path
 * differs from the Next.js page path need explicit mapping.
 *
 * Mappings:
 *   /dashboard/employee    -> pass through (sub-page exists)
 *   /dashboard/admin       -> pass through (sub-page exists)
 *   /employees/employee-page -> pass through (sub-page exists)
 *   /employees/all-employees -> /employees/employee-page
 *   /projects/project-page -> pass through (page now exists)
 *   /clients/client-page   -> pass through (page now exists)
 *   /jobs/manage-jobs-page -> /jobs/manage-jobs
 *   /menus/menus-page      -> /menus/menu-view
 *   /settings/*-page       -> /settings/*  (strips -page suffix)
 *   everything else        -> pass through as-is
 */
function mapRoute(route: string | undefined): string {
    if (!route) return "/dashboard/employee";
    const path = route.startsWith("/") ? route : `/${route}`;

    // ── Dashboard sub-pages ── (pages now exist under /dashboard/admin and /dashboard/employee)

    // ── Employees ──
    if (path === "/employees/all-employees") return "/employees/employee-page";

    // ── Clients (page now exists) ──

    // ── Projects (page now exists at /projects/project-page) ──

    // ── Jobs ──
    if (path === "/jobs/manage-jobs-page") return "/jobs/manage-jobs";

    // ── Payroll: dynamic salary-view route ──
    if (path.startsWith("/payroll/salary-view/")) {
        // /payroll/salary-view/:payrollId → keep as-is (Next.js [payrollId] handles it)
        return path;
    }

    // ── Menus ──
    if (path === "/menus/menus-page") return "/menus/menu-view";

    // ── Approve ──
    if (path === "/approve/approve-view" || path === "/approve/approvals-page") return "/approve/approve-page";

    // ── Settings: strip "-page" suffix (API sends /settings/*-page) ──
    if (path === "/settings/company-settings-page") return "/settings/company-settings";
    if (path === "/settings/email-settings-page") return "/settings/email-settings";
    if (path === "/settings/email-template-page") return "/settings/email-template";
    if (path === "/settings/notifications-page") return "/settings/notifications";
    if (path === "/settings/performance-settings-page") return "/settings/performance-settings";
    if (path === "/settings/approval-settings-page") return "/settings/approval-settings";
    if (path === "/settings/document-running-page") return "/settings/document-running";
    if (path === "/settings/prefixes-page") return "/settings/prefixes";
    if (path === "/settings/notification-page") return "/settings/notification";
    if (path === "/settings/approval-step-page") return "/settings/approval-step";
    if (path === "/settings/initial-data-page") return "/settings/initial-data";
    if (path === "/settings/role-page") return "/settings/role";
    if (path === "/settings/branch-settings-page") return "/settings/branch-settings";

    // ── All other routes: pass through as-is ──
    // Routes like /employees/leave-admin, /jobs/manage-jobs, /tax/tax-main,
    // /training/lists, /promotion/admin, etc. already match Next.js pages exactly.
    return path;
}

// ---------------------------------------------------------------------------
// Badge count label mapping
// Angular matches menuValue like "Overtime (Admin)" → overtimeCount
// ---------------------------------------------------------------------------
function getBadgeCount(
    menuValue: string,
    counts: { overtimeCount: number; resignationCount: number; leaveCount: number; promotionCount: number }
): number {
    const v = menuValue.toLowerCase();
    if (v.includes("overtime") && v.includes("admin")) return counts.overtimeCount;
    if (v.includes("resignation") && v.includes("admin")) return counts.resignationCount;
    if (v.includes("leave") && v.includes("admin")) return counts.leaveCount;
    if (v.includes("promotion") && v.includes("admin")) return counts.promotionCount;
    return 0;
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------
export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { currentLang, t } = useLanguage();
    const { logoUrl } = useCompanyContext();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // When on /settings/* pages, replace sidebar content with settings menu
    const isSettingsPage = pathname.startsWith('/settings');

    // Data from API — same endpoint as Angular's SideBarService.getMenuByEmpIdLang()
    const { data: menuData, isLoading, isError, refetch } = useUserMenu();

    // Badge counts — same endpoints as Angular's fetchCounts()
    const counts = useSidebarCounts();

    // Refetch menus when language changes (so labels switch between EN/TH)
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["userMenu"] });
    }, [currentLang, queryClient]);

    function toggleMenu(label: string) {
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    }

    /**
     * Determine if a CHILD menu item (leaf item / submenu item) is active.
     *
     * Angular logic (side-menu-one.component.html line 93-101):
     *   [class.active]="page === subMenus.base || page === subMenus.base2 || ... || page === subMenus.base8"
     *
     * Angular splits URL: /employees/leave-admin → base='employees', page='leave-admin'
     * Then compares `page` (2nd segment) against each submenu's base fields.
     */
    function isMenuActive(item: SubMenuDto): boolean {
        const urlSegments = pathname.split('/').filter(Boolean);
        const urlPage = urlSegments[1] || '';   // 2nd segment (Angular's 'page')
        const urlLast = urlSegments[2] || '';   // 3rd segment

        // 1) Exact route match — highest priority, always reliable
        const itemRoute = item.route?.startsWith('/') ? item.route : `/${item.route || ''}`;
        const mappedRoute = mapRoute(itemRoute);
        if (pathname === mappedRoute) return true;

        // 2) Base-field matching (Angular's primary check)
        //    Only use when the item's own route doesn't exactly match any other sibling,
        //    i.e. the route's last segment differs from the URL's page segment.
        //    This avoids false positives when multiple siblings share the same base value.
        const routeSegments = mappedRoute.split('/').filter(Boolean);
        const routePage = routeSegments[routeSegments.length - 1] || '';

        // If the item's route page-segment equals the URL page-segment, the exact-match
        // above would have caught it. Skip base matching to avoid false positives.
        if (routePage && routePage !== urlPage && routePage !== urlLast) {
            // Route clearly doesn't target this URL — skip base matching
            return false;
        }

        const bases = [
            item.base, item.base2, item.base3, item.base4,
            item.base5, item.base6, item.base7, item.base8,
        ].filter((b): b is string => !!b && b.trim() !== '');

        // Angular: page === subMenus.base || page === subMenus.base2 || ...
        if (urlPage && bases.some(b => urlPage === b)) return true;

        // Also check 3rd segment for deeper routes (e.g. /projects/project-view/123)
        if (urlLast && bases.some(b => urlLast === b)) return true;

        return false;
    }

    /**
     * Determine if a PARENT menu (with children) should be highlighted.
     *
     * Angular logic (side-menu-one.component.html line 67):
     *   [class.active]="base === menu.base || page === menu.base"
     *
     * This checks the parent's OWN `base` field against the URL segments.
     * e.g. Dashboard parent has base="dashboard", so when URL is /dashboard → highlighted.
     */
    function isParentSelfActive(item: SubMenuDto): boolean {
        const urlSegments = pathname.split('/').filter(Boolean);
        const urlBase = urlSegments[0] || '';
        const urlPage = urlSegments[1] || '';

        const parentBase = item.base;
        if (!parentBase) return false;

        // Angular: base === menu.base || page === menu.base
        return urlBase === parentBase || urlPage === parentBase;
    }

    /** Check if parent should be highlighted: either self-match or any child is active */
    function shouldHighlightParent(sub: SubMenuDto): boolean {
        // Angular: [class.active]="base === menu.base || page === menu.base"
        if (isParentSelfActive(sub)) return true;
        // Also highlight if any child is active
        if (sub.subMenus && sub.subMenus.length > 0) {
            return sub.subMenus.some(child => isMenuActive(child));
        }
        return false;
    }

    /**
     * Navigate with permission fetch — mirrors Angular's navigate() method.
     * Fetches role/getPermission/{empId}/{menuId} before routing.
     * Also sets pageKey for translations (Angular: translationService.setPageKey).
     */
    const handleNavigate = useCallback(
        (route: string | undefined, menuId: number, pageKey?: string) => {
            if (!route) return;
            const targetPath = mapRoute(route);

            // Set pageKey for translation API (mirrors Angular sidebar)
            if (pageKey) {
                localStorage.setItem('pageKey', pageKey);
            }

            // Fire permission fetch in background — don't block navigation
            fetchMenuPermission(menuId).catch(() => {});

            router.push(targetPath);
            setMobileOpen(false);
        },
        [router]
    );

    // -----------------------------------------------------------------------
    // Build menu tree with badge counts applied
    // -----------------------------------------------------------------------
    const enrichedMenuData = menuData?.map((mainMenu: ApiMenu) => ({
        ...mainMenu,
        menu: mainMenu.menu?.map((sub: SubMenuDto) => {
            // Check if any child should show a badge
            const enrichedChildren = sub.subMenus?.map((child) => {
                const badgeCount = getBadgeCount(child.menuValue, counts);
                return {
                    ...child,
                    count: badgeCount > 0 ? badgeCount : child.count,
                    currentActive: badgeCount > 0 ? true : child.currentActive,
                };
            });

            // If any child has a badge, set dot on parent
            const hasBadge = enrichedChildren?.some((c) => c.count && c.count > 0);

            return {
                ...sub,
                subMenus: enrichedChildren || sub.subMenus,
                dot: hasBadge || sub.dot,
            };
        }),
    }));

    // -----------------------------------------------------------------------
    // Sidebar content
    // -----------------------------------------------------------------------
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo / Brand */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.06]">
                {!collapsed && (
                    <Link href={ROUTES.dashboard} className="flex items-center gap-2.5 group">
                        <img
                            src={logoUrl}
                            alt="NEXT-FORCE"
                            className="w-9 h-9 drop-shadow-lg group-hover:scale-105 transition-transform rounded-lg object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
                        />
                        <span className="text-white font-bold text-lg tracking-tight">NEXT<span className="text-nv-violet">-FORCE</span></span>
                    </Link>
                )}
                <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all hidden lg:block">
                    <Menu className="w-5 h-5" />
                </button>
                <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all lg:hidden">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 sidebar-scroll" suppressHydrationWarning>
                {isLoading ? (
                    <div className="text-center p-4 text-gray-500 text-sm" suppressHydrationWarning>{t('Loading menus...', 'Loading menus...')}</div>
                ) : isError ? (
                    <div className="text-center p-4 space-y-2">
                        <div className="text-gray-500 text-sm" suppressHydrationWarning>{t('Failed to load menus', 'Failed to load menus')}</div>
                        <button
                            onClick={() => refetch()}
                            className="text-xs text-nv-violet hover:text-blue-300 underline"
                        >
                            <span suppressHydrationWarning>{t('Retry', 'Retry')}</span>
                        </button>
                    </div>
                ) : (
                    enrichedMenuData?.map((mainMenu, index: number) => {
                        return (
                            <div key={`main-${index}`} className="mb-4">
                                {/* Section title */}
                                {!collapsed && mainMenu.tittle && (
                                    <div className="text-[10px] font-bold text-nv-violet/50 uppercase tracking-[0.15em] mb-2 mt-3 px-3 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-gradient-to-r from-nv-violet/15 to-transparent" />
                                        <span>{mainMenu.tittle}</span>
                                        <span className="h-px flex-1 bg-gradient-to-l from-nv-violet/15 to-transparent" />
                                    </div>
                                )}

                                {mainMenu.menu?.map((sub: SubMenuDto, subIdx: number) => {
                                    const hasChildren = sub.subMenus && sub.subMenus.length > 0;
                                    const isOpen = openMenus[sub.menuValue] || sub.showSubRoute;

                                    // Angular: [class.active]="base === menu.base || page === menu.base"
                                    const isChildActive = hasChildren ? shouldHighlightParent(sub) : false;
                                    const isSelfActive = !hasChildren && isMenuActive(sub);

                                    if (hasChildren) {
                                        return (
                                            <div key={sub.menusId ?? `sub-${subIdx}`}>
                                                <button
                                                    onClick={() => toggleMenu(sub.menuValue)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${isChildActive
                                                        ? "text-white bg-nv-violet/15 shadow-sm shadow-nv-violet/10"
                                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                                                        }`}
                                                >
                                                    <span className={`transition-colors ${isChildActive ? "text-nv-violet" : ""}`}>
                                                        {parseIcon(sub.icon || sub.materialIcons)}
                                                    </span>
                                                    {!collapsed && (
                                                        <>
                                                            <span className="flex-1 text-left">{sub.menuValue}</span>
                                                            {/* Notification dot on parent when child has badge */}
                                                            {sub.dot && (
                                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-1" />
                                                            )}
                                                            <span className={`transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}>
                                                                <ChevronDown className="w-4 h-4" />
                                                            </span>
                                                        </>
                                                    )}
                                                </button>

                                                {isOpen && !collapsed && (
                                                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-white/[0.06] pl-3">
                                                        {sub.subMenus.map((child: SubMenuDto, childIdx: number) => {
                                                            const childActive = isMenuActive(child);
                                                            return (
                                                                <button
                                                                    key={child.menusId ?? `child-${childIdx}`}
                                                                    onClick={() => handleNavigate(child.route, child.menusId, child.pageKey)}
                                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all duration-200 text-left ${childActive
                                                                        ? "text-nv-violet bg-nv-violet/10 font-medium border-l-2 border-nv-violet -ml-[calc(0.75rem+2px)] pl-[calc(0.75rem)]"
                                                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                                                                        }`}
                                                                >
                                                                    <span>{child.menuValue}</span>
                                                                    {/* Badge count — mirrors Angular's count display */}
                                                                    {child.currentActive && child.count && child.count > 0 ? (
                                                                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-nv-violet text-white text-[10px] font-bold shadow-sm shadow-nv-violet/30">
                                                                            {child.count}
                                                                        </span>
                                                                    ) : child.dot ? (
                                                                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                                    ) : null}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Direct link (no children)
                                    return (
                                        <button
                                            key={sub.menusId ?? `sub-${subIdx}`}
                                            onClick={() => handleNavigate(sub.route, sub.menusId, sub.pageKey)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 text-left ${isSelfActive
                                                ? "text-white bg-nv-violet/15 shadow-sm shadow-nv-violet/10"
                                                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                                                }`}
                                        >
                                            <span className={`transition-colors ${isSelfActive ? "text-nv-violet" : ""}`}>
                                                {parseIcon(sub.icon || sub.materialIcons)}
                                            </span>
                                            {!collapsed && <span>{sub.menuValue}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </nav>

        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 transition-all duration-200 border border-white/[0.06]">
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setMobileOpen(false)} />}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
                style={{
                    width: collapsed ? "70px" : "var(--nv-sidebar-width, 260px)",
                    backgroundColor: "var(--nv-sidebar, #111113)",
                    color: "var(--nv-sidebar-text, #FFFFFF)",
                }}
            >
                {isSettingsPage ? <SettingsSidebarContent /> : sidebarContent}
            </aside>
        </>
    );
}
