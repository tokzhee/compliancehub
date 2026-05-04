import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useNavigationContext } from '../../contexts/NavigationContext';

const NavigationItem = ({ 
  path, 
  label, 
  icon, 
  badge = null,
  onClick,
  isExpanded = true,
  isChild = false
}) => {
  const location = useLocation();
  const { setMobileSidebarOpen } = useNavigationContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const isActive = location?.pathname === path;

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    setMobileSidebarOpen(false);
  };

  return (
    <div className="relative">
      <Link
        to={path}
        onClick={handleClick}
        onMouseEnter={() => !isExpanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          flex items-center gap-3 rounded-lg transition-all duration-200
          hover:scale-102 hover:shadow-md
          ${
            isChild 
              ? 'px-3 py-2 text-sm font-normal' :'px-3 py-2.5 text-sm font-medium'
          }
          ${
            isActive 
              ? isChild
                ? 'bg-primary text-white font-semibold shadow-sm'
                : 'bg-primary text-white font-bold shadow-md'
              : isChild
                ? 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                : 'text-foreground hover:bg-muted hover:text-foreground'
          }
          ${
            !isExpanded ? 'justify-center' : ''
          }
        `}
      >
        <Icon 
          name={icon} 
          size={isChild ? 16 : 20} 
          className="flex-shrink-0"
        />
        {isExpanded && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {badge && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                {badge}
              </span>
            )}
          </>
        )}
      </Link>

      {/* Tooltip for collapsed mode */}
      {!isExpanded && showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border border-border whitespace-nowrap text-sm font-medium">
            {label}
            {badge && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                {badge}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationItem;