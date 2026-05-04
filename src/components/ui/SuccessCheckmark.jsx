import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessCheckmark = ({ size = 64, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-scale-bounce">
        <CheckCircle
          size={size}
          className="text-green-500 drop-shadow-lg"
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
};

export default SuccessCheckmark;