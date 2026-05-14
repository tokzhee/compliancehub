import React, { useEffect } from 'react';


// Base Skeleton Component with Pulse Animation
export const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => {
  return (
    <div
      className={`${width} ${height} bg-muted rounded animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--color-muted) 25%, var(--color-muted-foreground) 50%, var(--color-muted) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  );
};

// Skeleton Card for Dashboard Metrics
export const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count })?.map((_, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-6 transition-colors"
        >
          {/* Icon placeholder */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton width="w-10" height="h-10" className="rounded-full" />
            <Skeleton width="w-16" height="h-6" className="rounded-full" />
          </div>
          
          {/* Title */}
          <Skeleton width="w-3/4" height="h-4" className="mb-3" />
          
          {/* Value */}
          <Skeleton width="w-1/2" height="h-8" className="mb-2" />
          
          {/* Subtitle */}
          <Skeleton width="w-2/3" height="h-3" />
        </div>
      ))}
    </>
  );
};

// Skeleton Table for Data Tables
export const SkeletonTable = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-colors">
      {/* Table Header */}
      <div className="bg-muted border-b border-border p-4">
        <div className="flex items-center gap-4">
          {Array.from({ length: columns })?.map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              width={index === 0 ? 'w-8' : 'flex-1'}
              height="h-4"
            />
          ))}
        </div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows })?.map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns })?.map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  width={colIndex === 0 ? 'w-8' : 'flex-1'}
                  height="h-4"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton Grid for Card Layouts
export const SkeletonGrid = ({ cards = 6, columns = 3 }) => {
  const gridClass = columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                    columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {Array.from({ length: cards })?.map((_, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-6 transition-colors"
        >
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <Skeleton width="w-12" height="h-12" className="rounded-lg" />
            <Skeleton width="w-20" height="h-6" className="rounded-full" />
          </div>
          
          {/* Title */}
          <Skeleton width="w-full" height="h-5" className="mb-3" />
          
          {/* Description lines */}
          <Skeleton width="w-full" height="h-3" className="mb-2" />
          <Skeleton width="w-4/5" height="h-3" className="mb-4" />
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Skeleton width="w-24" height="h-3" />
            <Skeleton width="w-16" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for Stat Cards (smaller metrics)
export const SkeletonStatCard = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count })?.map((_, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-4 transition-colors"
        >
          <Skeleton width="w-1/2" height="h-3" className="mb-2" />
          <Skeleton width="w-3/4" height="h-6" />
        </div>
      ))}
    </div>
  );
};

// Skeleton for Details Panel
export const SkeletonDetailsPanel = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <Skeleton width="w-1/3" height="h-6" />
        <Skeleton width="w-20" height="h-8" className="rounded-md" />
      </div>
      {/* Content sections */}
      {Array.from({ length: 4 })?.map((_, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <Skeleton width="w-1/4" height="h-5" className="mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 3 })?.map((_, itemIndex) => (
              <div key={itemIndex} className="flex items-center justify-between">
                <Skeleton width="w-1/3" height="h-4" />
                <Skeleton width="w-1/2" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Add shimmer animation to global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head?.appendChild(style);

export default Skeleton;
const GridSkeleton = () => {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('Placeholder: GridSkeleton is not implemented yet.');
  }, []);
  return (
    <div>
      {/* GridSkeleton placeholder */}
    </div>
  );
};

export { GridSkeleton };
const SkeletonLoader = () => {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('Placeholder: SkeletonLoader is not implemented yet.');
  }, []);
  return (
    <div>
      {/* SkeletonLoader placeholder */}
    </div>
  );
};

export { SkeletonLoader };