import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  accentColor: string;
  trend?: string;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtext,
  icon,
  accentColor,
  trend,
  onClick,
}) => {
  return (
    <div
      className={`stats-card glass-panel ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ '--card-accent': accentColor } as React.CSSProperties}
    >
      <div className="stats-card-top">
        <div className="stats-icon-box" style={{ color: accentColor, backgroundColor: `${accentColor}18` }}>
          {icon}
        </div>
        {trend && <span className="stats-trend-badge">{trend}</span>}
      </div>

      <div className="stats-card-body">
        <div className="stats-value">{value}</div>
        <div className="stats-title">{title}</div>
        <div className="stats-subtext">{subtext}</div>
      </div>
    </div>
  );
};
