import React from 'react';

// ── Badge ─────────────────────────────────────────────────────────────────────
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  style?: React.CSSProperties;
}

const badgeStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: '#f1f5f9', color: '#64748b' },
  primary: { background: '#dbeafe', color: '#1d4ed8' },
  success: { background: '#dcfce7', color: '#15803d' },
  warning: { background: '#fef3c7', color: '#b45309' },
  danger:  { background: '#fee2e2', color: '#b91c1c' },
  info:    { background: '#e0f2fe', color: '#0369a1' },
  purple:  { background: '#ede9fe', color: '#6d28d9' },
};

export const Badge = ({ children, variant = 'default', dot, style }: BadgeProps) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '2px 8px', borderRadius: '20px',
    fontSize: '11px', fontWeight: 600, lineHeight: '18px',
    whiteSpace: 'nowrap',
    ...badgeStyles[variant],
    ...style,
  }}>
    {dot && (
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: 'currentColor', flexShrink: 0,
      }} />
    )}
    {children}
  </span>
);

// ── StatusBadge ───────────────────────────────────────────────────────────────
// Preset status map common to NexOne apps
export type StatusType =
  | 'active' | 'inactive' | 'pending' | 'cancelled' | 'completed'
  | 'in_progress' | 'approved' | 'rejected' | 'draft' | 'suspended';

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant }> = {
  active:      { label: 'ใช้งาน',       variant: 'success' },
  inactive:    { label: 'ไม่ใช้งาน',    variant: 'default' },
  pending:     { label: 'รอดำเนินการ',  variant: 'warning' },
  cancelled:   { label: 'ยกเลิก',       variant: 'danger'  },
  completed:   { label: 'เสร็จสิ้น',    variant: 'primary' },
  in_progress: { label: 'กำลังดำเนินการ', variant: 'info'  },
  approved:    { label: 'อนุมัติ',      variant: 'success' },
  rejected:    { label: 'ไม่อนุมัติ',   variant: 'danger'  },
  draft:       { label: 'แบบร่าง',      variant: 'default' },
  suspended:   { label: 'ระงับ',        variant: 'purple'  },
};

export interface StatusBadgeProps {
  status: StatusType | string;
  customLabel?: string;
  style?: React.CSSProperties;
}

export const StatusBadge = ({ status, customLabel, style }: StatusBadgeProps) => {
  const config = statusConfig[status as StatusType] ?? { label: status, variant: 'default' as BadgeVariant };
  return (
    <Badge variant={config.variant} dot style={style}>
      {customLabel ?? config.label}
    </Badge>
  );
};

// ── CountBadge ────────────────────────────────────────────────────────────────
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

export const CountBadge = ({ count, max = 99, variant = 'danger', style }: CountBadgeProps) => {
  if (count <= 0) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: '18px', height: '18px', padding: '0 5px',
      borderRadius: '10px', fontSize: '10px', fontWeight: 700,
      ...badgeStyles[variant],
      ...style,
    }}>
      {count > max ? `${max}+` : count}
    </span>
  );
};

// ── EmptyState ────────────────────────────────────────────────────────────────
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export const EmptyState = ({
  icon,
  title = 'ไม่มีข้อมูล',
  description,
  action,
  style,
}: EmptyStateProps) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
    gap: '12px', ...style,
  }}>
    {icon && (
      <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>
        {React.cloneElement(icon as React.ReactElement, { size: 48 } as any)}
      </div>
    )}
    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#94a3b8' }}>{title}</h3>
    {description && <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', maxWidth: '320px', lineHeight: 1.6 }}>{description}</p>}
    {action && <div style={{ marginTop: '8px' }}>{action}</div>}
  </div>
);
