import { useState, useEffect, useCallback } from 'react';

interface AutoSaveOptions {
  key: string;
  debounceMs?: number;
  excludeFields?: string[];
}

interface AutoSaveReturn<T> {
  data: T;
  updateData: (field: string, value: any) => void;
  clearSavedData: () => void;
  hasSavedData: boolean;
}

export function useAutoSave<T extends Record<string, any>>(
  initialData: T,
  options: AutoSaveOptions
): AutoSaveReturn<T> {
  const { key, debounceMs = 1000, excludeFields = [] } = options;
  const [data, setData] = useState<T>(initialData);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load saved data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setData(prev => ({ ...prev, ...parsedData }));
          setHasSavedData(true);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [key]);

  // Save data to localStorage with debouncing
  const saveToStorage = useCallback((dataToSave: T) => {
    if (typeof window !== 'undefined') {
      try {
        // Filter out excluded fields and empty values
        const filteredData = Object.entries(dataToSave).reduce((acc, [field, value]) => {
          if (!excludeFields.includes(field) && value !== '' && value !== null && value !== undefined) {
            acc[field] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        // Only save if there's meaningful data
        if (Object.keys(filteredData).length > 0) {
          localStorage.setItem(key, JSON.stringify(filteredData));
        }
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  }, [key, excludeFields]);

  // Update data with debounced saving
  const updateData = useCallback((field: string, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // Set new timeout for saving
      const newTimeout = setTimeout(() => {
        saveToStorage(newData);
      }, debounceMs);
      
      setSaveTimeout(newTimeout);
      
      return newData;
    });
  }, [saveToStorage, debounceMs, saveTimeout]);

  // Clear saved data from localStorage
  const clearSavedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
        setHasSavedData(false);
      } catch (error) {
        console.error('Error clearing saved form data:', error);
      }
    }
  }, [key]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    data,
    updateData,
    clearSavedData,
    hasSavedData
  };
}

// Hook specifically for file uploads auto-save
export function useFileAutoSave(key: string) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, any>>({});
  const [hasSavedFiles, setHasSavedFiles] = useState(false);

  // Load saved files on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFiles = localStorage.getItem(`${key}_files`);
        if (savedFiles) {
          const parsedFiles = JSON.parse(savedFiles);
          // Only restore file metadata, not the actual File objects
          const restoredFiles = Object.entries(parsedFiles).reduce((acc, [docName, fileData]: [string, any]) => {
            if (fileData && fileData.tempFile) {
              acc[docName] = {
                file: null, // File objects can't be serialized
                tempFile: fileData.tempFile
              };
            }
            return acc;
          }, {} as Record<string, any>);
          
          setUploadedFiles(restoredFiles);
          setHasSavedFiles(Object.keys(restoredFiles).length > 0);
        }
      } catch (error) {
        console.error('Error loading saved file data:', error);
      }
    }
  }, [key]);

  // Save files to localStorage
  const saveFiles = useCallback((files: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      try {
        // Only save file metadata, not the actual File objects
        const filesToSave = Object.entries(files).reduce((acc, [docName, fileData]) => {
          if (fileData && fileData.tempFile) {
            acc[docName] = {
              tempFile: fileData.tempFile
            };
          }
          return acc;
        }, {} as Record<string, any>);
        
        if (Object.keys(filesToSave).length > 0) {
          localStorage.setItem(`${key}_files`, JSON.stringify(filesToSave));
        }
      } catch (error) {
        console.error('Error saving file data:', error);
      }
    }
  }, [key]);

  // Update files and save
  const updateFiles = useCallback((newFiles: Record<string, any>) => {
    setUploadedFiles(newFiles);
    saveFiles(newFiles);
  }, [saveFiles]);

  // Clear saved files
  const clearSavedFiles = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${key}_files`);
        setHasSavedFiles(false);
      } catch (error) {
        console.error('Error clearing saved file data:', error);
      }
    }
  }, [key]);

  return {
    uploadedFiles,
    updateFiles,
    clearSavedFiles,
    hasSavedFiles
  };
}