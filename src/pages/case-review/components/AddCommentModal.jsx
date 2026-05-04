import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const AddCommentModal = ({ isOpen, onClose, onSubmit, caseData }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!comment?.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({
      caseId: caseData?.id,
      comment: comment?.trim(),
      timestamp: new Date()?.toISOString()
    });

    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-card rounded-lg shadow-elevation-xl w-full max-w-2xl transition-colors">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card transition-colors">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground transition-colors">Add Comment</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 transition-colors">
              Case: {caseData?.accountNumber}
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

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2 transition-colors">
              Comment <span className="text-error">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e?.target?.value)}
              placeholder="Enter your review comments, observations, or recommendations..."
              required
              rows={6}
              className="w-full px-3 py-2 text-sm md:text-base border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
            />
            <p className="text-xs text-muted-foreground mt-2 transition-colors">
              Minimum 10 characters required. This comment will be logged in the audit trail.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
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
              disabled={!comment?.trim() || comment?.trim()?.length < 10}
              iconName="Send"
              iconPosition="left"
              className="flex-1"
            >
              Submit Comment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCommentModal;