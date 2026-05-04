import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon, 
  iconColor, 
  linkTo, 
  linkText 
}) => {
  const isPositiveTrend = trend === 'up';
  
  return (
    <div className="bg-card rounded-lg p-4 md:p-6 shadow-elevation-sm border border-border transition-all duration-200 hover:shadow-elevation-lg hover:scale-102 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
            {value?.toLocaleString('en-US')}
          </h3>
        </div>
        <div 
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={20} color={iconColor} />
        </div>
      </div>
      {trendValue && (
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            isPositiveTrend 
              ? 'bg-success/10 text-success' :'bg-error/10 text-error'
          }`}>
            <Icon 
              name={isPositiveTrend ? 'TrendingUp' : 'TrendingDown'} 
              size={14} 
            />
            <span>{trendValue}</span>
          </div>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
      {linkTo && (
        <Link 
          to={linkTo}
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-base font-medium"
        >
          {linkText}
          <Icon name="ArrowRight" size={14} />
        </Link>
      )}
    </div>
  );
};

export default MetricCard;