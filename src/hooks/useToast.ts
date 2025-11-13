import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, message };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((opts: { title: string; description?: string; variant?: Toast['type'] }) => {
    const { title, description, variant = 'info' } = opts;
    const message = description ? `${title} — ${description}` : title;
    addToast(variant, message);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
    showToast,
  };
}