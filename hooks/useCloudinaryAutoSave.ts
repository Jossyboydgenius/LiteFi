import { useState, useRef } from 'react';

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

interface WidgetRegistry {
  [key: string]: CloudinaryWidget;
}

export function useCloudinaryAutoSave() {
  const [isCloudinaryLoading, setIsCloudinaryLoading] = useState(false);
  const widgetRegistry = useRef<WidgetRegistry>({});

  const registerWidget = (fieldName: string, widget: CloudinaryWidget) => {
    widgetRegistry.current[fieldName] = widget;
  };

  const unregisterWidget = (fieldName: string) => {
    delete widgetRegistry.current[fieldName];
  };

  const getWidget = (fieldName: string): CloudinaryWidget | undefined => {
    return widgetRegistry.current[fieldName];
  };

  const setLoading = (loading: boolean) => {
    setIsCloudinaryLoading(loading);
  };

  const closeAllWidgets = () => {
    Object.values(widgetRegistry.current).forEach(widget => {
      try {
        widget.close();
      } catch (error) {
        console.warn('Error closing Cloudinary widget:', error);
      }
    });
  };

  const destroyAllWidgets = () => {
    Object.values(widgetRegistry.current).forEach(widget => {
      try {
        widget.destroy();
      } catch (error) {
        console.warn('Error destroying Cloudinary widget:', error);
      }
    });
    widgetRegistry.current = {};
  };

  return {
    isCloudinaryLoading,
    registerWidget,
    unregisterWidget,
    getWidget,
    setLoading,
    closeAllWidgets,
    destroyAllWidgets
  };
}