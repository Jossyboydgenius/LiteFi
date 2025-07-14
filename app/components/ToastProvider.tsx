"use client";

import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastContextType {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  const success = (title: string, description?: string) => {
    toast({ 
      title, 
      description, 
      variant: 'success',
      action: <CheckCircle className="h-5 w-5 text-green-600" />
    });
  };

  const error = (title: string, description?: string) => {
    toast({ 
      title, 
      description, 
      variant: 'destructive',
      action: <XCircle className="h-5 w-5 text-red-600" />
    });
  };

  const info = (title: string, description?: string) => {
    toast({ 
      title, 
      description, 
      variant: 'default',
      action: <Info className="h-5 w-5 text-blue-600" />
    });
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
