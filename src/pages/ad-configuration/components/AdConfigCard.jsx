import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AdConfigCard = ({ config, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'inactive':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'CheckCircle';
      case 'inactive':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const formatLastSync = (lastSyncAt) => {
    if (!lastSyncAt) return 'Never';
    const date = new Date(lastSyncAt);
    return date?.toLocaleString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Server" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{config?.configName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(config?.status)}`}>
                <Icon name={getStatusIcon(config?.status)} size={12} />
                {config?.status?.charAt(0)?.toUpperCase() + config?.status?.slice(1)}
              </span>
              {config?.syncEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Icon name="RefreshCw" size={12} />
                  Auto Sync: {config?.syncFrequency}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit"
            onClick={() => onEdit(config)}
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={() => onDelete(config?.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">LDAP Server</p>
          <p className="text-sm text-foreground font-mono break-all">
            {config?.ldapHost || 'N/A'}:{config?.ldapPort || 389}
            {config?.useSsl && <span className="ml-2 text-xs text-green-600">(SSL)</span>}
            {config?.useTls && <span className="ml-2 text-xs text-blue-600">(TLS)</span>}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">Base DN</p>
          <p className="text-sm text-foreground font-mono break-all">{config?.baseDn}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">User Search Base</p>
          <p className="text-sm text-foreground font-mono break-all">{config?.userSearchBase}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">User Search Filter</p>
          <p className="text-sm text-foreground font-mono break-all">{config?.userSearchFilter}</p>
        </div>

        {config?.groupSearchBase && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Group Search Base</p>
            <p className="text-sm text-foreground font-mono break-all">{config?.groupSearchBase}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-1">Attribute Mappings</p>
          <p className="text-sm text-foreground">
            Email: <span className="font-mono">{config?.attrEmail || 'mail'}</span>, 
            Username: <span className="font-mono">{config?.attrUsername || 'uid'}</span>, 
            Name: <span className="font-mono">{config?.attrFullName || 'cn'}</span>
          </p>
        </div>

        {config?.syncEnabled && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
            <p className="text-sm text-foreground">{formatLastSync(config?.lastSyncAt)}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-1">Connection Timeout</p>
          <p className="text-sm text-foreground">{config?.connectionTimeoutSeconds || 30} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default AdConfigCard;