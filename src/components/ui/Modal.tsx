import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md' 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div
          className={cn(
            'relative w-full rounded-lg bg-white dark:bg-primary-900 shadow-xl',
            {
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md',
              'max-w-lg': size === 'lg',
              'max-w-xl': size === 'xl',
            }
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-primary-200 dark:border-primary-800">
              <h2 className="text-lg font-semibold text-primary-900 dark:text-neutral-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}