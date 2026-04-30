import React from 'react';

// ── Card Container ─────────────────────────────────────────────────────────────
export interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = { none: '0', sm: '12px', md: '20px', lg: '28px' };

export const Card = ({ children, style, className, hoverable, padding = 'md', onClick }: CardProps) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: 'var(--radius, 12px)',
        border: '1px solid var(--border-color, #e2e8f0)',
        padding: paddingMap[padding],
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Card Header ────────────────────────────────────────────────────────────────
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const CardHeader = ({ title, subtitle, action, icon, style }: CardHeaderProps) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    marginBottom: '16px',
    gap: '12px',
    ...style,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
      {icon && (
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#2563eb', flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b', lineHeight: '1.4' }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{subtitle}</p>}
      </div>
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

// ── Card Body ──────────────────────────────────────────────────────────────────
export interface CardBodyProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const CardBody = ({ children, style }: CardBodyProps) => (
  <div style={{ ...style }}>{children}</div>
);

// ── Card Footer ────────────────────────────────────────────────────────────────
export interface CardFooterProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  align?: 'left' | 'right' | 'center' | 'between';
}

const alignMap = {
  left: 'flex-start',
  right: 'flex-end',
  center: 'center',
  between: 'space-between',
};

export const CardFooter = ({ children, style, align = 'right' }: CardFooterProps) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: alignMap[align],
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color, #f1f5f9)',
    marginTop: '16px',
    gap: '8px',
    ...style,
  }}>
    {children}
  </div>
);

// ── KPI Card ───────────────────────────────────────────────────────────────────
export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;       // % change e.g. +12.5 or -3.2
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;       // icon bg color
  style?: React.CSSProperties;
}

export const KpiCard = ({ title, value, change, changeLabel, icon, color = '#2563eb', style }: KpiCardProps) => {
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card style={{ ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
            {value}
          </p>
          {change !== undefined && (
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: isPositive ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span>{isPositive ? '▲' : '▼'}</span>
              <span>{Math.abs(change)}%</span>
              {changeLabel && <span style={{ color: '#94a3b8' }}>{changeLabel}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
