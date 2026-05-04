import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useTheme } from './ThemeContext';
import Icon from '../components/AppIcon';


const ToastContext = createContext({});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const Toast = ({ id, type, message, onClose, duration }) => {
  const { isDark } = useTheme();
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [id, onClose, duration]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: isDark ? 'bg-green-900/90' : 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: isDark ? 'text-green-100' : 'text-green-800',
      iconColor: 'text-green-500',
      progressColor: 'bg-green-500',
    },
    error: {
      icon: XCircle,
      bgColor: isDark ? 'bg-red-900/90' : 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: isDark ? 'text-red-100' : 'text-red-800',
      iconColor: 'text-red-500',
      progressColor: 'bg-red-500',
    },
    info: {
      icon: Info,
      bgColor: isDark ? 'bg-blue-900/90' : 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: isDark ? 'text-blue-100' : 'text-blue-800',
      iconColor: 'text-blue-500',
      progressColor: 'bg-blue-500',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: isDark ? 'bg-yellow-900/90' : 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: isDark ? 'text-yellow-100' : 'text-yellow-800',
      iconColor: 'text-yellow-500',
      progressColor: 'bg-yellow-500',
    },
  };

  const config = typeConfig?.[type] || typeConfig?.info;
  const Icon = config?.icon;

  return (
    <div
      className={`
        ${config?.bgColor} ${config?.borderColor} ${config?.textColor}
        border-l-4 rounded-lg shadow-lg p-4 mb-3 min-w-[320px] max-w-md
        animate-slide-in-right backdrop-blur-sm
        transition-all duration-300 hover:shadow-xl
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${config?.iconColor} flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`${config?.textColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-2 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${config?.progressColor} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const success = useCallback((message, duration) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message, duration) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message, duration) => showToast(message, 'info', duration), [showToast]);
  const warning = useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev?.filter((toast) => toast?.id !== id));
  }, []);

  const value = {
    showToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <div className="pointer-events-auto">
          {toasts?.map((toast) => (
            <Toast
              key={toast?.id}
              id={toast?.id}
              type={toast?.type}
              message={toast?.message}
              duration={toast?.duration}
              onClose={closeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;