import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onRemove: (id: string) => void;
  duration?: number;
}

export function Toast({ 
  id, 
  type, 
  message, 
  onRemove, 
  duration = 5000 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 transform',
        {
          'bg-green-50 border border-green-200 text-green-800': type === 'success',
          'bg-red-50 border border-red-200 text-red-800': type === 'error',
          'bg-blue-50 border border-blue-200 text-blue-800': type === 'info',
        },
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(id), 300);
        }}
        className="ml-3 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts?: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>;
  onRemove?: (id: string) => void;
}

export function ToastContainer({ toasts = [], onRemove = () => {} }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}