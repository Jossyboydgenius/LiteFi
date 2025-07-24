import { useState, useEffect, useCallback, useRef } from 'react';

// Interface for Cloudinary uploaded files
interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  publicId: string;
  format: string;
  resourceType: string;
}

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
            if (fileData && (fileData.tempFile || fileData.cloudinaryResult)) {
              acc[docName] = {
                file: null, // File objects can't be serialized
                tempFile: fileData.tempFile || null,
                cloudinaryResult: fileData.cloudinaryResult || null
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
          if (fileData && (fileData.tempFile || fileData.cloudinaryResult)) {
            acc[docName] = {
              tempFile: fileData.tempFile || null,
              cloudinaryResult: fileData.cloudinaryResult || null
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
  const clearAllFiles = useCallback(() => {
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
    clearAllFiles,
    hasSavedFiles
  };
}

// Hook specifically for Cloudinary file uploads with widget management
export function useCloudinaryAutoSave(key: string, initialFiles: UploadedFile[] = []) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(false);
  const widgetInstancesRef = useRef<Map<string, any>>(new Map());

  // Load saved files from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`cloudinaryAutoSave_${key}`);
        if (saved) {
          const parsedFiles = JSON.parse(saved);
          // Only restore if we have valid file data and no initial files
          if (Array.isArray(parsedFiles) && parsedFiles.length > 0 && initialFiles.length === 0) {
            setUploadedFiles(parsedFiles);
          }
        }
      } catch (error) {
        console.error('Error loading saved Cloudinary files:', error);
      }
    }
  }, [key, initialFiles.length]);

  // Handle Cloudinary upload events
  const handleCloudinaryUpload = useCallback((result: any, documentType: string) => {
    console.log('handleCloudinaryUpload called:', { event: result.event, documentType, result });
    
    if (result.event === 'success') {
      setIsLoading(false);
      const newFile: UploadedFile = {
        id: result.info.public_id,
        name: result.info.original_filename || `${documentType}_upload`,
        url: result.info.secure_url,
        type: documentType,
        size: result.info.bytes,
        uploadedAt: new Date().toISOString(),
        publicId: result.info.public_id,
        format: result.info.format,
        resourceType: result.info.resource_type
      };

      setUploadedFiles(prev => {
        // Remove any existing file of the same type to prevent duplicates
        const filtered = prev.filter(file => file.type !== documentType);
        // Add the new file
        const updated = [...filtered, newFile];
        
        console.log('Updating Cloudinary files state:', { prev, filtered, newFile, updated });
        
        // Save to localStorage
        try {
          localStorage.setItem(`cloudinaryAutoSave_${key}`, JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving Cloudinary files to localStorage:', error);
        }
        
        return updated;
      });
    } else if (result.event === 'queues-start') {
      setIsLoading(true);
    } else if (result.event === 'abort' || result.event === 'close') {
      setIsLoading(false);
    }
  }, [key]);

  // Register widget instance for cleanup
  const registerWidget = useCallback((documentType: string, widget: any) => {
    if (widget) {
      widgetInstancesRef.current.set(documentType, widget);
    }
  }, []);

  // Remove file by ID
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(file => file.id !== fileId);
      
      // Update localStorage
      try {
        localStorage.setItem(`cloudinaryAutoSave_${key}`, JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating localStorage after Cloudinary file removal:', error);
      }
      
      return updated;
    });
  }, [key]);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
    try {
      localStorage.removeItem(`cloudinaryAutoSave_${key}`);
    } catch (error) {
      console.error('Error clearing Cloudinary localStorage:', error);
    }
  }, [key]);

  // Get file by document type
  const getFileByType = useCallback((documentType: string) => {
    return uploadedFiles.find(file => file.type === documentType) || null;
  }, [uploadedFiles]);

  // Cleanup widget instances on unmount
  useEffect(() => {
    return () => {
      const instances = widgetInstancesRef.current;
      instances.forEach((widget, documentType) => {
        if (widget && typeof widget.destroy === 'function') {
          try {
            widget.destroy({ removeThumbnails: true });
            console.log(`Widget destroyed for ${documentType}`);
          } catch (error) {
            console.error(`Error destroying widget for ${documentType}:`, error);
          }
        }
      });
      instances.clear();
    };
  }, []);

  return {
    uploadedFiles,
    isLoading,
    handleCloudinaryUpload,
    registerWidget,
    removeFile,
    clearAllFiles,
    getFileByType
  };
}