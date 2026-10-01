import React from 'react';
import type { CategoryType } from '../../types/agenda';
import { CATEGORIES } from '../../data/initialData';
import { 
  Briefcase, 
  User, 
  HeartPulse, 
  GraduationCap, 
  DollarSign, 
  Users, 
  AlertCircle,
  Tag
} from 'lucide-react';

interface CategoryBadgeProps {
  category: CategoryType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const cat = CATEGORIES[category] || {
    label: category,
    color: '#8b5cf6',
    bgDark: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    iconName: 'Tag',
  };

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
    switch (category) {
      case 'trabajo':
        return <Briefcase size={iconSize} />;
      case 'personal':
        return <User size={iconSize} />;
      case 'salud':
        return <HeartPulse size={iconSize} />;
      case 'estudio':
        return <GraduationCap size={iconSize} />;
      case 'finanzas':
        return <DollarSign size={iconSize} />;
      case 'reunion':
        return <Users size={iconSize} />;
      case 'urgente':
        return <AlertCircle size={iconSize} />;
      default:
        return <Tag size={iconSize} />;
    }
  };

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  }[size];

  return (
    <span
      className={`category-badge ${sizeClasses} ${className}`}
      style={{
        color: cat.color,
        backgroundColor: cat.bgDark,
        borderColor: cat.borderColor,
      }}
    >
      {showIcon && <span className="badge-icon">{renderIcon()}</span>}
      <span className="badge-label">{cat.label}</span>
    </span>
  );
};
