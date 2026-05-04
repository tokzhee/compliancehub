import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  // Add this block - helper function for status colors
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (statusLower === 'inactive') return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  };

  // Add this block - detail sections data
  const detailSections = [
    {
      icon: 'User',
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: user?.name || 'N/A' },
        { label: 'Email', value: user?.email || 'N/A' },
        { label: 'Phone', value: user?.phone || 'N/A' },
        { label: 'Status', value: user?.status || 'N/A', statusBadge: true },
      ],
    },
    {
      icon: 'Briefcase',
      title: 'Account Information',
      items: [
        { label: 'User ID', value: user?.id || 'N/A' },
        { label: 'Role', value: user?.role || 'N/A', badge: true },
        { label: 'Created At', value: user?.createdAt || 'N/A' },
        { label: 'Last Login', value: user?.lastLogin || 'N/A' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">User Details</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              {user?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-all"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {detailSections?.map((section, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Icon name={section?.icon} size={18} className="text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  {section?.title}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section?.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-1">
                    <p className="text-xs md:text-sm text-muted-foreground">{item?.label}</p>
                    {item?.statusBadge ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs md:text-sm font-medium ${getStatusColor(item?.value)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item?.value}
                      </span>
                    ) : item?.badge ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/10 text-secondary text-xs md:text-sm font-medium">
                        <Icon name="Shield" size={12} />
                        {item?.value}
                      </span>
                    ) : (
                      <p className="text-sm md:text-base font-medium text-foreground break-words">
                        {item?.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border sticky bottom-0 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;