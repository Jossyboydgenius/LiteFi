"use client";

import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';

interface CloudinaryUploadWidgetProps {
  onUploadAction: (result: any) => void;
  onError?: (error: any) => void;
  documentType: string;
  isUploading?: boolean;
  uploadedFile?: any;
  className?: string;
  disabled?: boolean;
  onWidgetReady?: (widget: any) => void;
}

export default function CloudinaryUploadWidget({
  onUploadAction,
  onError,
  documentType,
  isUploading = false,
  uploadedFile,
  className = '',
  disabled = false,
  onWidgetReady
}: CloudinaryUploadWidgetProps) {
  const isSelfie = documentType === 'SELFIE';
  
  // Create a unique identifier for this widget instance with timestamp for better uniqueness
  const widgetId = React.useMemo(() => `${documentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, [documentType]);
  
  // Store widget reference for proper cleanup
  const widgetRef = React.useRef<any>(null);
  
  // Configure upload options based on document type
  const uploadOptions = React.useMemo(() => ({
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxbizi45p',
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '576182982358129',
    // Remove uploadPreset when using signed uploads with signatureEndpoint
    folder: isSelfie ? 'litefi/profiles' : 'litefi/documents',
    resourceType: 'auto' as const,
    maxFileSize: 10000000, // 10MB
    clientAllowedFormats: isSelfie 
      ? ['jpg', 'jpeg', 'png', 'webp']
      : ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
    sources: ['local', 'camera'] as ('local' | 'camera')[],
    multiple: false,
    cropping: false,
    showAdvancedOptions: false,
    showCompletedButton: true,
    showUploadMoreButton: false,
    // Add unique public_id to prevent conflicts between uploads
    publicId: widgetId,
    // Ensure widget instances are independent
    destroyWidget: false,

    styles: {
      palette: {
        window: '#FFFFFF',
        windowBorder: '#90A0B3',
        tabIcon: '#0078FF',
        menuIcons: '#5A616A',
        textDark: '#000000',
        textLight: '#FFFFFF',
        link: '#0078FF',
        action: '#FF620C',
        inactiveTabIcon: '#0E2F5A',
        error: '#F44235',
        inProgress: '#0078FF',
        complete: '#20B832',
        sourceBg: '#E4EBF1'
      },
      fonts: {
        default: null,
        '"Fira Sans", sans-serif': {
          url: 'https://fonts.googleapis.com/css?family=Fira+Sans',
          active: true
        }
      }
    }
  }), [isSelfie, widgetId]);
  
  // Cleanup widget on unmount
  React.useEffect(() => {
    return () => {
      if (widgetRef.current && typeof widgetRef.current.destroy === 'function') {
        widgetRef.current.destroy({ removeThumbnails: true });
      }
    };
  }, []);

  return (
    <CldUploadWidget
      key={widgetId}
      signatureEndpoint="/api/sign-cloudinary-params"
      options={uploadOptions}
      onSuccess={(result) => {
        console.log('Upload successful for', documentType, ':', result);
        onUploadAction(result);
      }}
      onError={(error) => {
        console.error('Upload error for', documentType, ':', error);
        if (onError) {
          onError(error);
        }
      }}
      onOpen={(widget) => {
        // Store widget reference for cleanup
        widgetRef.current = widget;
        // Notify parent component about widget instance
        if (onWidgetReady) {
          onWidgetReady(widget);
        }
      }}
    >
      {({ open }) => {
        return (
          <div className="relative group">
            <Button
              type="button"
              variant={uploadedFile ? "default" : "outline"}
              size="sm"
              onClick={() => open()}
              className={`w-full transition-all duration-200 ${className}`}
              disabled={disabled || isUploading}
            >
              {isSelfie ? (
                <Camera className="h-4 w-4 mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              <span className="group-hover:hidden">
                {isUploading
                  ? "Uploading..."
                  : uploadedFile
                  ? "Uploaded ✓"
                  : "Upload File"}
              </span>
              <span className="hidden group-hover:inline">
                {uploadedFile ? "Replace File" : "Click to Upload"}
              </span>
            </Button>
            
            {/* Hover overlay for better UX */}
            <div className="absolute inset-0 bg-blue-50 border border-blue-200 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <span className="text-blue-600 text-sm font-medium">
                {uploadedFile ? "Click to Replace" : "Click to Upload"}
              </span>
            </div>
          </div>
        );
      }}
    </CldUploadWidget>
  );
}