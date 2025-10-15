import React from 'react';
import * as Icons from 'lucide-react';
import { Agent, Wizard } from '../types';

interface SidebarItemProps {
  item: Agent | Wizard;
  isSelected: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isSelected,
  onClick,
  collapsed = false
}) => {
  const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ size?: number }>;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg transition-all duration-200
        ${isSelected 
          ? 'bg-l1-accent/20 text-l1-accent border border-l1-accent/30' 
          : 'hover:bg-l1-primary text-l1-text-primary'
        }
        ${collapsed ? 'flex justify-center' : 'flex items-start space-x-3'}
      `}
      title={collapsed ? item.name : undefined}
    >
      <div className="flex-shrink-0">
        <IconComponent size={20} />
      </div>
      
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{item.name}</div>
          <div className="text-xs text-l1-text-secondary mt-1 line-clamp-2">
            {item.description}
          </div>
        </div>
      )}
    </button>
  );
};