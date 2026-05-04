import React from 'react';
import Icon from '../../../components/AppIcon';

const AccordionSection = ({ section, isExpanded, onToggle, searchQuery }) => {
  const highlightText = (text) => {
    if (!searchQuery || !text) return text;
    
    const parts = text?.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts?.map((part, index) => 
      part?.toLowerCase() === searchQuery?.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
        : part
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-colors">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name={section?.icon || 'FileText'} size={24} className="text-primary" />
          </div>
          <div className="text-left flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">
                {highlightText(section?.title)}
              </h2>
              {section?.category && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded">
                  {section?.category}
                </span>
              )}
            </div>
            {section?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {section?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <Icon 
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
          size={24} 
          className="text-muted-foreground flex-shrink-0 ml-4" 
        />
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-border">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert mt-4"
            dangerouslySetInnerHTML={{ __html: section?.content?.html || '' }}
          />
        </div>
      )}
    </div>
  );
};

export default AccordionSection;