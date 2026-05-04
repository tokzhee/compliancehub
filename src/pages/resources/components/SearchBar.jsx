import React from 'react';
import Icon from '../../../components/AppIcon';

const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <Icon 
          name="Search" 
          size={20} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
        />
        <input
          type="text"
          placeholder="Search resources, guides, templates, FAQs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="w-full pl-10 pr-10 py-3 bg-card border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="text-sm text-muted-foreground mt-2">
          Searching for: <span className="font-medium text-foreground">"{searchQuery}"</span>
        </p>
      )}
    </div>
  );
};

export default SearchBar;