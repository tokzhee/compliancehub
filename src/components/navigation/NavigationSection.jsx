import React, { useState } from 'react';
import Icon from '../AppIcon';
import NavigationItem from './NavigationItem';

const NavigationSection = ({ 
  id,
  label, 
  icon,
  items = [],
  onNavigate,
  defaultExpanded = true,
  isExpanded = true
}) => {
  const [isSectionExpanded, setIsSectionExpanded] = useState(defaultExpanded);

  const toggleSection = () => {
    if (isExpanded) {
      setIsSectionExpanded(!isSectionExpanded);
    }
  };

  return (
    <div className="mb-2">
      {/* Section Header - Parent Menu Item */}
      {isExpanded && (
        <button
          onClick={toggleSection}
          className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted/70 transition-all duration-200 rounded-lg group"
        >
          <div className="flex items-center gap-3">
            <Icon name={icon} size={18} className="flex-shrink-0 text-primary" />
            <span className="tracking-wide">{label}</span>
          </div>
          <Icon 
            name="ChevronDown" 
            size={16}
            className={`transition-transform duration-200 text-muted-foreground group-hover:text-foreground ${
              isSectionExpanded ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </button>
      )}
      
      {/* Divider for collapsed mode */}
      {!isExpanded && (
        <div className="flex items-center justify-center py-2">
          <div className="w-8 h-px bg-border" />
        </div>
      )}

      {/* Navigation Items - Children with indentation and connecting lines */}
      <div className={`
        relative transition-all duration-300
        ${
          isExpanded ? 'mt-1 ml-3 pl-3 border-l-2 border-border/50' : 'mt-0'
        }
        ${
          isExpanded && !isSectionExpanded ? 'hidden' : ''
        }
      `}>
        <div className="space-y-0.5">
          {items?.map((item, index) => (
            <NavigationItem
              key={index}
              path={item?.path}
              label={item?.label}
              icon={item?.icon}
              badge={item?.badge}
              onClick={() => onNavigate?.(item?.path)}
              isExpanded={isExpanded}
              isChild={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationSection;