import React from 'react';
import Icon from '../AppIcon';

const AccessRestricted = ({ 
  title = 'Access Restricted',
  reason = 'You don\'t have permission to view this content',
  icon = 'Lock',
  className = ''
}) => {
  return (
    <div className={`bg-muted/30 border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center min-h-[200px] ${className}`}>
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon name={icon} size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{reason}</p>
    </div>
  );
};

export default AccessRestricted;