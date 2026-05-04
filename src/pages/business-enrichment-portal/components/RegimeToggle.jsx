import React from 'react';
import Icon from '../../../components/AppIcon';

const RegimeToggle = ({ selectedRegime, onRegimeChange }) => {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <button
        onClick={() => onRegimeChange('FATCA')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          selectedRegime === 'FATCA' ?'bg-primary text-white shadow-sm' :'text-muted-foreground hover:text-foreground'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon name="Flag" className="w-4 h-4" />
          FATCA (IRS)
        </div>
      </button>
      <button
        onClick={() => onRegimeChange('CRS')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          selectedRegime === 'CRS' ?'bg-primary text-white shadow-sm' :'text-muted-foreground hover:text-foreground'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon name="Globe" className="w-4 h-4" />
          CRS (OECD)
        </div>
      </button>
    </div>
  );
};

export default RegimeToggle;