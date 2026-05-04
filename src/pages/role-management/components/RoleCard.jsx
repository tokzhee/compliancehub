import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RoleCard = ({ 
  role, 
  onEdit, 
  onViewPermissions, 
  onManagePermissions,
  onDelete,
  isSelected,
  hasEditPermission,
  hasDeletePermission
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      className={`
        bg-card border rounded-lg p-4 md:p-6 transition-all duration-200 hover:shadow-elevation-lg hover:scale-102 hover:-translate-y-1
        ${isSelected ? 'border-primary shadow-elevation-sm' : 'border-border'}
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Shield" size={20} className="text-primary flex-shrink-0" />
            <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
              {role?.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {role?.description}
          </p>
        </div>
        <span
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
            ${getStatusColor(role?.status)}
            flex-shrink-0
          `}
        >
          {role?.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Users Assigned</p>
          <p className="text-lg md:text-xl font-semibold text-foreground">
            {role?.userCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Permissions</p>
          <p className="text-lg md:text-xl font-semibold text-foreground">
            {role?.permissionCount}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconPosition="left"
            onClick={() => onViewPermissions(role)}
            fullWidth
          >
            View Permissions
          </Button>
          {hasEditPermission && (
            <Button
              variant="outline"
              size="sm"
              iconName="Lock"
              iconPosition="left"
              onClick={() => onManagePermissions(role)}
              fullWidth
            >
              Manage Permissions
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {hasEditPermission && (
            <Button
              variant="default"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => onEdit(role)}
              fullWidth
            >
              Edit Role
            </Button>
          )}
          {hasDeletePermission && (
            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={() => onDelete(role)}
              fullWidth
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleCard;