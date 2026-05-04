import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import RuleStatusBadge from './RuleStatusBadge';

const RuleCard = ({ rule, onEdit, onActivate, onViewHistory, onSimulate }) => {
  const isActive = rule?.status === 'active';
  const canActivate = rule?.status === 'pending_approval';

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-elevation-md transition-base">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 truncate">
            {rule?.ruleName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {rule?.ruleType} • Version {rule?.version}
          </p>
        </div>
        <RuleStatusBadge status={rule?.status} />
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} className="mr-2 flex-shrink-0" />
          <span>Effective: {rule?.effectiveDate}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="User" size={16} className="mr-2 flex-shrink-0" />
          <span>Created by: {rule?.createdBy}</span>
        </div>
        {isActive && (
          <div className="flex items-center text-sm text-success">
            <Icon name="CheckCircle2" size={16} className="mr-2 flex-shrink-0" />
            <span>Currently Active</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Edit"
          iconPosition="left"
          onClick={() => onEdit(rule)}
        >
          Edit
        </Button>
        {canActivate && (
          <Button
            variant="default"
            size="sm"
            iconName="Power"
            iconPosition="left"
            onClick={() => onActivate(rule)}
          >
            Activate
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          iconName="History"
          iconPosition="left"
          onClick={() => onViewHistory(rule)}
        >
          History
        </Button>
        <Button
          variant="secondary"
          size="sm"
          iconName="Play"
          iconPosition="left"
          onClick={() => onSimulate(rule)}
        >
          Simulate
        </Button>
      </div>
    </div>
  );
};

export default RuleCard;