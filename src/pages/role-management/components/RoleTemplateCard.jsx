import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RoleTemplateCard = ({ template, onUse }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation-md transition-base">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon name={template?.icon} size={24} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base md:text-lg font-semibold text-foreground mb-1">
            {template?.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template?.description}
          </p>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Included Permissions
          </p>
          <div className="flex flex-wrap gap-2">
            {template?.permissions?.slice(0, 4)?.map((permission, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
              >
                {permission}
              </span>
            ))}
            {template?.permissions?.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                +{template?.permissions?.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Icon name="Users" size={16} />
            <span>{template?.userCount} users</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Icon name="Shield" size={16} />
            <span>{template?.permissions?.length} permissions</span>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        iconName="Copy"
        iconPosition="left"
        onClick={() => onUse(template)}
        fullWidth
      >
        Use Template
      </Button>
    </div>
  );
};

export default RoleTemplateCard;