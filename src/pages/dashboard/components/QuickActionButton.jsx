import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionButton = ({ 
  icon, 
  label, 
  description, 
  linkTo, 
  onClick,
  variant = 'default' 
}) => {
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90'
  };

  const content = (
    <>
      <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-background/20 mb-3">
        <Icon name={icon} size={20} />
      </div>
      <h4 className="font-semibold text-sm md:text-base mb-1">{label}</h4>
      <p className="text-xs opacity-90 line-clamp-2">{description}</p>
    </>
  );

  const baseClasses = `flex flex-col items-center text-center p-4 md:p-6 rounded-lg transition-base shadow-elevation-sm hover:shadow-elevation-md ${variantStyles?.[variant]}`;

  if (linkTo) {
    return (
      <Link to={linkTo} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
};

export default QuickActionButton;