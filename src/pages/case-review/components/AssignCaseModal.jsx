import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AssignCaseModal = ({ isOpen, onClose, onSubmit, selectedCases }) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reviewerOptions = [
    { value: 'reviewer_001', label: 'Sarah Mitchell - Senior Compliance Officer' },
    { value: 'reviewer_002', label: 'Michael Chen - Compliance Analyst' },
    { value: 'reviewer_003', label: 'Emily Rodriguez - Senior Analyst' },
    { value: 'reviewer_004', label: 'David Thompson - Compliance Manager' },
    { value: 'reviewer_005', label: 'Jennifer Lee - Lead Compliance Officer' }
  ];

  const priorityOptions = [
    { value: 'High', label: 'High Priority', description: 'Requires immediate attention' },
    { value: 'Medium', label: 'Medium Priority', description: 'Standard review timeline' },
    { value: 'Low', label: 'Low Priority', description: 'Can be reviewed as capacity allows' }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!assignedTo || !priority) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({
      caseIds: selectedCases?.map(c => c?.id),
      assignedTo,
      priority,
      timestamp: new Date()?.toISOString()
    });

    setAssignedTo('');
    setPriority('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-md transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Assign Cases</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              {selectedCases?.length} case{selectedCases?.length !== 1 ? 's' : ''} selected
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

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Selected Cases</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedCases?.map((caseItem) => (
                <div key={caseItem?.id} className="flex items-center justify-between text-xs md:text-sm p-2 bg-background rounded">
                  <span className="text-foreground">{caseItem?.accountNumber}</span>
                  <span className="text-muted-foreground">{caseItem?.accountHolder}</span>
                </div>
              ))}
            </div>
          </div>

          <Select
            label="Assign To"
            description="Select the reviewer who will handle these cases"
            required
            searchable
            options={reviewerOptions}
            value={assignedTo}
            onChange={setAssignedTo}
            placeholder="Choose a reviewer..."
          />

          <Select
            label="Priority Level"
            description="Set the priority for case review"
            required
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
            placeholder="Select priority..."
          />

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Workload Distribution</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Assignment will update case status and notify the assigned reviewer. Consider current workload when assigning cases.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              disabled={!assignedTo || !priority}
              iconName="UserPlus"
              iconPosition="left"
              className="flex-1"
            >
              Assign Cases
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignCaseModal;