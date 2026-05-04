import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import RuleStatusBadge from './RuleStatusBadge';

const RuleTable = ({ rules, onEdit, onActivate, onViewHistory, onSimulate }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Rule Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Version</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Effective Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Created By</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Active</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules?.map((rule) => {
            const isActive = rule?.status === 'active';
            const canActivate = rule?.status === 'pending_approval';

            return (
              <tr key={rule?.id} className="border-b border-border hover:bg-muted/50 transition-base">
                <td className="py-3 px-4">
                  <div className="font-medium text-foreground">{rule?.ruleName}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{rule?.ruleType}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{rule?.version}</span>
                </td>
                <td className="py-3 px-4">
                  <RuleStatusBadge status={rule?.status} />
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{rule?.effectiveDate}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{rule?.createdBy}</span>
                </td>
                <td className="py-3 px-4">
                  {isActive ? (
                    <Icon name="CheckCircle2" size={20} className="text-success" />
                  ) : (
                    <Icon name="Circle" size={20} className="text-muted-foreground" />
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Edit"
                      onClick={() => onEdit(rule)}
                    />
                    {canActivate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        iconName="Power"
                        onClick={() => onActivate(rule)}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="History"
                      onClick={() => onViewHistory(rule)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Play"
                      onClick={() => onSimulate(rule)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RuleTable;