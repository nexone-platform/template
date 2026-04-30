// Utilities
export * from "./lib/utils";

// Layouts
export { default as Sidebar, navSections } from "./layouts/Sidebar";
export { default as Topbar } from "./layouts/Topbar";
export { default as MasterTemplate } from "./layouts/MasterTemplate";
export { default as AppLauncherModal } from "./layouts/AppLauncherModal";

// Templates
export { GridTemplate } from './templates/GridTemplate';
export { FormTemplate } from './templates/FormTemplate';
export { DashboardTemplate } from './templates/DashboardTemplate';

// Contexts
export { LanguageProvider, useLanguage } from './contexts/LanguageContext';
export { ThemeProvider, useTheme, applyThemeToCSS } from './contexts/ThemeContext';
export { ToastProvider, useToast } from './contexts/ToastContext';

// ── Component Library ──────────────────────────────────────────────────────────

// Button
export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

// Card Family
export { Card, CardHeader, CardBody, CardFooter, KpiCard } from "./components/Card";
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps, KpiCardProps } from "./components/Card";

// DataTable
export { DataTable } from "./components/DataTable";
export type { DataTableProps, Column, SortDirection } from "./components/DataTable";

// Modal
export { Modal, ConfirmModal } from "./components/Modal";
export type { ModalProps, ConfirmModalProps } from "./components/Modal";

// Form
export { FormGroup, Input, PasswordInput, Textarea, Select, Checkbox } from "./components/Form";
export type { FormGroupProps, InputProps, TextareaProps, SelectProps, CheckboxProps } from "./components/Form";

// Badge & Status
export { Badge, StatusBadge, CountBadge, EmptyState } from "./components/Badge";
export type { BadgeProps, BadgeVariant, StatusBadgeProps, CountBadgeProps, EmptyStateProps, StatusType } from "./components/Badge";
