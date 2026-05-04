import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { createResourceContent, updateResourceContent, getResourceById, getResourceHistory, restoreResourceVersion } from '../../../services/resourcesService';
import { useToast } from '../../../contexts/ToastContext';
import SuccessCheckmark from '../../../components/ui/SuccessCheckmark';

const ResourcesEditorModal = ({ isOpen, onClose, resourceId = null, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: [],
    icon: 'FileText',
    contentType: 'markdown',
    content: '',
    status: 'draft',
    displayOrder: 0
  });
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const { addToast } = useToast();

  // Predefined category options
  const categoryOptions = [
    { value: '', label: 'Select Category' },
    { value: 'FATCA', label: 'FATCA' },
    { value: 'CRS', label: 'CRS' },
    { value: 'Portal Usage', label: 'Portal Usage' },
    { value: 'Templates', label: 'Templates' },
    { value: 'FAQ', label: 'FAQ' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Regulatory Timeline', label: 'Regulatory Timeline' },
    { value: 'General', label: 'General' }
  ];

  // Load existing resource data if editing
  useEffect(() => {
    if (isOpen && resourceId) {
      loadResourceData();
    } else if (isOpen) {
      // Reset form for new resource
      setFormData({
        title: '',
        category: '',
        tags: [],
        icon: 'FileText',
        contentType: 'markdown',
        content: '',
        status: 'draft',
        displayOrder: 0
      });
      setErrors({});
      setTagInput('');
    }
  }, [isOpen, resourceId]);

  const loadResourceData = async () => {
    try {
      setLoading(true);
      const data = await getResourceById(resourceId);
      setFormData({
        title: data?.title || '',
        category: data?.category || '',
        tags: data?.tags || [],
        icon: data?.icon || 'FileText',
        contentType: data?.contentType || 'markdown',
        content: data?.content || '',
        status: data?.status || 'draft',
        displayOrder: data?.displayOrder || 0
      });
    } catch (error) {
      console.error('Error loading resource:', error);
      addToast('Failed to load resource data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!resourceId) return;
    
    try {
      setHistoryLoading(true);
      const historyData = await getResourceHistory(resourceId);
      setHistory(historyData);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading history:', error);
      addToast('Failed to load revision history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestore = async (historyId) => {
    if (!window.confirm('Are you sure you want to restore this version? Current content will be saved to history.')) {
      return;
    }

    try {
      setLoading(true);
      await restoreResourceVersion(resourceId, historyId);
      await loadResourceData();
      await loadHistory();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      addToast('Version restored successfully', 'success');
    } catch (error) {
      console.error('Error restoring version:', error);
      addToast('Failed to restore version', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData?.content?.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData?.category?.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      addToast('Please fix validation errors', 'error');
      return;
    }

    try {
      setLoading(true);
      
      if (resourceId) {
        await updateResourceContent(resourceId, formData);
        addToast('Resource updated successfully', 'success');
      } else {
        await createResourceContent({
          ...formData,
          sectionId: `section-${Date.now()}`
        });
        addToast('Resource created successfully', 'success');
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave?.();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving resource:', error);
      addToast(error?.message || 'Failed to save resource', 'error');
      
      // Add shake animation to form
      const formElement = document.querySelector('.resources-editor-form');
      if (formElement) {
        formElement?.classList?.add('animate-shake');
        setTimeout(() => formElement?.classList?.remove('animate-shake'), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddTag = (e) => {
    if (e?.key === 'Enter' && tagInput?.trim()) {
      e?.preventDefault();
      const newTag = tagInput?.trim();
      if (!formData?.tags?.includes(newTag)) {
        handleInputChange('tags', [...formData?.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleInputChange('tags', formData?.tags?.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col resources-editor-form">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="FileEdit" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {resourceId ? 'Edit Resource' : 'Create New Resource'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {formData?.contentType === 'markdown' ? 'Markdown' : 'HTML'} content editor with live preview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {resourceId && (
              <Button
                variant="outline"
                onClick={loadHistory}
                disabled={historyLoading}
              >
                <Icon name="History" className="w-4 h-4 mr-2" />
                {historyLoading ? 'Loading...' : 'View History'}
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 border-b border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Title"
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                placeholder="Enter resource title"
                error={errors?.title}
                required
              />
            </div>
            <div>
              <Select
                label="Category"
                value={formData?.category}
                onChange={(e) => handleInputChange('category', e?.target?.value)}
                options={categoryOptions}
                error={errors?.category}
                required
              />
            </div>
            <div>
              <Select
                label="Status"
                value={formData?.status}
                onChange={(e) => handleInputChange('status', e?.target?.value)}
                options={[
                  { value: 'draft', label: 'Draft (Admin Only)' },
                  { value: 'published', label: 'Published (All Users)' }
                ]}
              />
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags <span className="text-muted-foreground">(Press Enter to add)</span>
            </label>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e?.target?.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
            />
            {formData?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <Icon name="X" className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Content Type"
                value={formData?.contentType}
                onChange={(e) => handleInputChange('contentType', e?.target?.value)}
                options={[
                  { value: 'markdown', label: 'Markdown' },
                  { value: 'html', label: 'HTML' }
                ]}
              />
            </div>
            <div>
              <Input
                label="Icon"
                value={formData?.icon}
                onChange={(e) => handleInputChange('icon', e?.target?.value)}
                placeholder="Icon name (e.g., FileText)"
              />
            </div>
            <div>
              <Input
                label="Display Order"
                type="number"
                value={formData?.displayOrder}
                onChange={(e) => handleInputChange('displayOrder', parseInt(e?.target?.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Split Pane Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Editor */}
          <div className="flex-1 flex flex-col border-r border-border">
            <div className="px-6 py-3 bg-muted/30 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="Edit" className="w-4 h-4" />
                {formData?.contentType === 'markdown' ? 'Markdown' : 'HTML'} Editor
              </h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={formData?.content}
                onChange={(e) => handleInputChange('content', e?.target?.value)}
                placeholder={formData?.contentType === 'markdown' ?'# Enter Markdown content here...\n\n## Supports:\n- Headers\n- **Bold** and *italic*\n- Lists\n- Code blocks\n- Tables\n- And more!' :'<div>Enter HTML content here...</div>'
                }
                className={`w-full h-full p-4 bg-background border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors?.content ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                }`}
              />
              {errors?.content && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <Icon name="AlertCircle" className="w-4 h-4" />
                  {errors?.content}
                </p>
              )}
            </div>
          </div>

          {/* Right: Live Preview or History */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name={showHistory ? 'History' : 'Eye'} className="w-4 h-4" />
                {showHistory ? 'Revision History' : 'Live Preview'}
              </h3>
              {showHistory && (
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Icon name="Eye" className="w-3 h-3" />
                  Back to Preview
                </button>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {showHistory ? (
                <div className="space-y-4">
                  {history?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="History" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No revision history available</p>
                    </div>
                  ) : (
                    history?.map((item) => (
                      <div
                        key={item?.id}
                        className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item?.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item?.changedByName} • {new Date(item?.changedAt)?.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item?.changeType === 'created' ? 'bg-green-500/10 text-green-500' :
                              item?.changeType === 'status_changed'? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {item?.changeType}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestore(item?.id)}
                              disabled={loading}
                            >
                              <Icon name="RotateCcw" className="w-3 h-3 mr-1" />
                              Restore
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded border border-border max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono">
                            {item?.content?.substring(0, 200)}{item?.content?.length > 200 ? '...' : ''}
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {formData?.contentType === 'markdown' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/?.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match?.[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children)?.replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {formData?.content || '*Preview will appear here as you type...*'}
                    </ReactMarkdown>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: formData?.content || '<p class="text-muted-foreground">Preview will appear here as you type...</p>' }} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Info" className="w-4 h-4" />
            <span>
              {formData?.status === 'draft' ?'Draft content is only visible to System Administrators' :'Published content is visible to all authenticated users'
              }
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="Save" className="w-4 h-4 mr-2" />
                  {resourceId ? 'Update' : 'Create'} Resource
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <SuccessCheckmark />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesEditorModal;