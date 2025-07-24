"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Progress } from "@/components/ui/progress";
import { Upload, Camera } from "lucide-react";
import { formatAmount } from "@/lib/formatters";
import { states, getLGAsForState } from "@/lib/data/states";
import { toast } from "sonner";
import { useAutoSave, useCloudinaryAutoSave } from "@/hooks/useAutoSave";
import { uploadDocument } from "@/lib/api";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

interface SalaryLoanFormProps {
  loanType: "salary-cash" | "salary-car";
}

interface FormData {
  [key: string]: string | File | null;
}

interface UploadedDocs {
  file?: File;
  cloudinaryResult?: any;
  tempFile?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
  };
}

export default function SalaryLoanForm({ loanType }: SalaryLoanFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedDocs | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [selectedState, setSelectedState] = useState<string>("");
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-save hooks
  const { data: autoSavedData, updateData, clearSavedData, hasSavedData } = useAutoSave(formData, {
    key: `salary-loan-${loanType}`,
    debounceMs: 1000
  });
  const { 
    uploadedFiles: cloudinaryFiles, 
    isLoading: isCloudinaryLoading, 
    handleCloudinaryUpload: handleCloudinaryResult, 
    registerWidget, 
    removeFile, 
    clearAllFiles, 
    getFileByType 
  } = useCloudinaryAutoSave(`salary-loan-${loanType}`);

  const [hasRestoredData, setHasRestoredData] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    if (hasSavedData && Object.keys(autoSavedData).length > 0 && !hasRestoredData) {
      setFormData(autoSavedData);
      if (autoSavedData.state) {
        setSelectedState(autoSavedData.state);
      }
      setHasRestoredData(true);
      toast.info('Previous form data restored');
    }
    
    // Convert Cloudinary files to the expected format for backward compatibility
    if (cloudinaryFiles.length > 0) {
      const convertedFiles = cloudinaryFiles.reduce((acc, file) => {
        acc[file.type] = {
          cloudinaryResult: {
            public_id: file.publicId,
            secure_url: file.url,
            original_filename: file.name,
            bytes: file.size,
            format: file.format,
            resource_type: file.resourceType
          },
          tempFile: {
            fileName: file.name,
            filePath: file.url,
            fileSize: file.size,
            mimeType: file.format ? `image/${file.format}` : 'application/octet-stream',
            documentType: file.type
          }
        };
        return acc;
      }, {} as Record<string, UploadedDocs | null>);
      setUploadedFiles(convertedFiles);
    }
  }, [hasSavedData, autoSavedData, hasRestoredData, cloudinaryFiles]);

  // Update available LGAs when selected state changes
  useEffect(() => {
    if (selectedState) {
      const lgas = getLGAsForState(selectedState);
      setAvailableLGAs(lgas);
    } else {
      setAvailableLGAs([]);
    }
  }, [selectedState]);

  // Update selectedState when formData.state changes
  useEffect(() => {
    if (formData.state && formData.state !== selectedState) {
      setSelectedState(formData.state);
    }
  }, [formData.state, selectedState]);

  const validateField = (field: string, value: string): string => {
    // Clear previous error for this field
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    
    if (field === 'bvn' && value.length > 0 && value.length !== 11) {
      return `BVN must be exactly 11 digits. You entered ${value.length} digits.`;
    }
    
    if (field === 'nin' && value.length > 0 && value.length !== 11) {
      return `NIN must be exactly 11 digits. You entered ${value.length} digits.`;
    }
    
    if (field === 'accountNumber' && value.length > 0 && value.length !== 10) {
      return `Account number must be exactly 10 digits. You entered ${value.length} digits.`;
    }
    
    if ((field === 'phoneNumber' || field === 'kinPhoneNumber') && value.length > 0 && value.length !== 11) {
      return `Phone number must be exactly 11 digits. You entered ${value.length} digits.`;
    }
    
    return '';
  };

  const handleInputChange = (field: string, value: string, fieldType?: string) => {
    let processedValue = value;
    
    // For number fields (amount fields), format the value with commas
    if (fieldType === "number" && (field.includes('Amount') || field.includes('Salary') || field.includes('Vehicle'))) {
      processedValue = formatAmount(value);
    } 
    // For phone number, BVN, NIN, account number - only allow numbers and limit length
    else if (field === 'phoneNumber' || field === 'bvn' || field === 'nin' || field === 'accountNumber' || field === 'kinPhoneNumber') {
      // Remove non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      
      // Apply length limits
      if (field === 'bvn' || field === 'nin') {
        processedValue = numericValue.slice(0, 11); // 11 digits max for BVN and NIN
      } else if (field === 'phoneNumber' || field === 'kinPhoneNumber') {
        processedValue = numericValue.slice(0, 11); // 11 digits max for phone numbers
      } else if (field === 'accountNumber') {
        processedValue = numericValue.slice(0, 10); // 10 digits max for account number
      }
      
      // Validate and set error message
      const errorMessage = validateField(field, processedValue);
      if (errorMessage) {
        setFieldErrors(prev => ({ ...prev, [field]: errorMessage }));
      }
    }
    // For years in current address - only allow numbers, max 2 digits
    else if (field === 'yearsInCurrentAddress') {
      const numericValue = value.replace(/\D/g, '');
      processedValue = numericValue.slice(0, 2); // Max 2 digits (0-99 years)
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    updateData(field, processedValue);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setFormData(prev => ({ ...prev, state: value, localGovernment: "" }));
    updateData('state', value);
    updateData('localGovernment', '');
  };

  const handleCloudinaryUpload = (docName: string, result: any) => {
    console.log('Cloudinary upload result:', result);
    
    // Clear any previous errors for this field
    setFieldErrors(prev => ({ ...prev, [docName]: '' }));
    
    // Use the new Cloudinary auto-save hook
    handleCloudinaryResult(result, docName);
    
    if (result.event === 'success') {
      // Update the local state for backward compatibility
      const updatedFiles = {
        ...uploadedFiles,
        [docName]: {
          cloudinaryResult: result.info,
          tempFile: {
            fileName: result.info.original_filename || result.info.public_id,
            filePath: result.info.secure_url,
            fileSize: result.info.bytes,
            mimeType: result.info.format ? `image/${result.info.format}` : 'application/octet-stream',
            documentType: getDocumentType(docName)
          }
        }
      };
      
      setUploadedFiles(updatedFiles);
      toast.success(`${docName} uploaded successfully`);
    }
  };

  const handleCloudinaryError = (docName: string, error: any) => {
    console.error('Cloudinary upload error:', error);
    setFieldErrors(prev => ({ ...prev, [docName]: 'Upload failed. Please try again.' }));
    toast.error(`Failed to upload ${docName}`);
  };

  const handleFileUpload = async (docName: string, file?: File) => {
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        setFieldErrors(prev => ({ ...prev, [docName]: 'File size exceeds 10MB limit. Please select a smaller file.' }));
        return;
      }

      // Validate file type for documents
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      // Validate file type for selfie
    if (docName === 'selfie' && !file.type.startsWith('image/')) {
      setFieldErrors(prev => ({ ...prev, [docName]: 'Selfie must be an image file (JPG, PNG, etc.)' }));
      return;
    }

    if (docName !== 'selfie' && !allowedTypes.includes(file.type)) {
        setFieldErrors(prev => ({ ...prev, [docName]: 'Please upload a valid file type (JPG, PNG, PDF, DOC, DOCX)' }));
        return;
      }
      
      // Clear any previous errors for this field
      setFieldErrors(prev => ({ ...prev, [docName]: '' }));

      setIsUploading(prev => ({ ...prev, [docName]: true }));
      setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
      
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[docName] || 0;
            if (currentProgress < 90) {
              return { ...prev, [docName]: currentProgress + 10 };
            }
            return prev;
          });
        }, 100);
        
        // Upload to Cloudinary via API
        const documentType = getDocumentType(docName);
        const uploadResult = await uploadDocument(file, documentType);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [docName]: 100 }));
        
        if (uploadResult.success) {
          // Store both the file and the temporary upload result
          const updatedFiles = {
            ...uploadedFiles,
            [docName]: {
              file,
              tempFile: uploadResult.tempFile
            }
          };
          
          setUploadedFiles(updatedFiles);
          
          setTimeout(() => {
            setIsUploading(prev => ({ ...prev, [docName]: false }));
            setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
          }, 500);
          
          toast.success(`${docName} uploaded successfully`);
        } else {
          const errorMessage = uploadResult.error || uploadResult.message || 'Upload failed';
          throw new Error(errorMessage);
        }
        
      } catch (error: any) {
        console.error('Upload failed:', error);
        setIsUploading(prev => ({ ...prev, [docName]: false }));
        setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
        
        // More specific error handling with user-friendly messages
        const errorMessage = error.message || 'Unknown error occurred';
        
        if (errorMessage.includes('file size') || errorMessage.includes('10MB')) {
          setFieldErrors(prev => ({ ...prev, [docName]: 'File size is too large. Please select a file smaller than 10MB.' }));
        } else if (errorMessage.includes('file type') || errorMessage.includes('format') || errorMessage.includes('invalid')) {
          setFieldErrors(prev => ({ ...prev, [docName]: 'Invalid file format. Please upload JPG, PNG, PDF, DOC, or DOCX files only.' }));
        } else if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('fetch')) {
          setFieldErrors(prev => ({ ...prev, [docName]: 'Network error. Please check your internet connection and try again.' }));
        } else if (errorMessage.includes('timeout')) {
          setFieldErrors(prev => ({ ...prev, [docName]: 'Upload timed out. Please try again with a smaller file.' }));
        } else if (errorMessage.includes('service') || errorMessage.includes('server') || errorMessage.includes('configured')) {
          setFieldErrors(prev => ({ ...prev, [docName]: 'Upload service is temporarily unavailable. Please try again later or contact support.' }));
        } else if (errorMessage.includes('ENOENT') || errorMessage.includes('mkdir')) {
          setFieldErrors(prev => ({ ...prev, [docName]: 'Server configuration error. Please contact support.' }));
        } else if (errorMessage.includes('unknown error')) {
          setFieldErrors(prev => ({ ...prev, [docName]: 'Upload failed due to a server error. Please try again or contact support.' }));
        } else {
          setFieldErrors(prev => ({ ...prev, [docName]: `Failed to upload ${docName}. ${errorMessage}` }));
        }
      }
    } else {
      // Create file input for user to select file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = docName === 'selfie' ? 'image/*' : 'image/*,.pdf,.doc,.docx';
      input.onchange = async (e) => {
        const selectedFile = (e.target as HTMLInputElement).files?.[0];
        if (selectedFile) {
          await handleFileUpload(docName, selectedFile);
        }
      };
      input.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert yearsInCurrentAddress to number
      const getYearsInAddress = (value: string): number => {
        if (!value) return 1;
        const numericValue = parseInt(value);
        return isNaN(numericValue) || numericValue < 1 ? 1 : numericValue;
      };

      // Prepare loan application data matching API schema
      const loanData = {
        loanAmount: parseFloat(formData.loanAmount?.replace(/,/g, '') || '0'),
        ...(loanType === "salary-car" && {
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
          vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : undefined,
          vehicleAmount: formData.vehicleAmount ? parseFloat(formData.vehicleAmount.replace(/,/g, '')) : undefined,
          tenure: parseInt(formData.tenure?.split(' ')[0] || '0'),
        }),
        phoneNumber: formData.phoneNumber,
        bvn: formData.bvn,
        nin: formData.nin || undefined,
        addressNumber: formData.addressNo,
        streetName: formData.streetName,
        nearestBusStop: formData.nearestBusStop || undefined,
        state: formData.state,
        localGovernment: formData.localGovernment,
        homeOwnership: formData.homeOwnership?.toUpperCase() as 'OWNED' | 'RENTED' | 'FAMILY',
        yearsInAddress: getYearsInAddress(formData.yearsInCurrentAddress),
        maritalStatus: formData.maritalStatus?.toUpperCase() as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED',
        educationLevel: formData.highestEducation,
        employerName: formData.employerName,
        employerAddress: formData.employerAddress,
        jobTitle: formData.jobTitle,
        workEmail: formData.workEmail,
        employmentStartDate: formData.employmentStartDate,
        salaryPaymentDate: formData.salaryPaymentDate,
        netSalary: parseFloat(formData.netSalary?.replace(/,/g, '') || '0'),
        nokFirstName: formData.kinFirstName,
        nokLastName: formData.kinLastName,
        nokMiddleName: formData.kinMiddleName || undefined,
        nokRelationship: formData.kinRelationship,
        nokPhone: formData.kinPhoneNumber,
        nokEmail: formData.kinEmail,
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber
      };

      // Submit loan application
       const response = await fetch(`/api/loan-applications/${loanType}`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
         body: JSON.stringify(loanData)
       });

       if (!response.ok) {
         const errorData = await response.json();
         
         // Handle validation errors with specific field messages
         if (errorData.error === 'Validation failed' && errorData.details) {
           const validationErrors: Record<string, string> = {};
           
           errorData.details.forEach((detail: any) => {
             const fieldPath = detail.path?.[0];
             if (fieldPath) {
               let fieldName = fieldPath;
               let errorMessage = detail.message;
               
               // Map API field names to form field names
               const fieldMapping: Record<string, string> = {
                 'accountNumber': 'accountNumber',
                 'bvn': 'bvn',
                 'nin': 'nin',
                 'phoneNumber': 'phoneNumber',
                 'nokPhone': 'kinPhoneNumber'
               };
               
               if (fieldMapping[fieldPath]) {
                 fieldName = fieldMapping[fieldPath];
               }
               
               // Provide user-friendly error messages
               if (detail.code === 'too_small' && detail.type === 'string') {
                 if (fieldPath === 'accountNumber') {
                   errorMessage = `Account number must be exactly 10 digits. You entered ${detail.received || 0} digits.`;
                 } else if (fieldPath === 'bvn') {
                   errorMessage = `BVN must be exactly 11 digits. You entered ${detail.received || 0} digits.`;
                 } else if (fieldPath === 'nin') {
                   errorMessage = `NIN must be exactly 11 digits. You entered ${detail.received || 0} digits.`;
                 } else if (fieldPath === 'phoneNumber' || fieldPath === 'nokPhone') {
                   errorMessage = `Phone number must be exactly 11 digits. You entered ${detail.received || 0} digits.`;
                 }
               }
               
               validationErrors[fieldName] = errorMessage;
             }
           });
           
           // Set field errors and show a general toast
           setFieldErrors(validationErrors);
           toast.error('Please correct the highlighted fields and try again.');
           return;
         }
         
         throw new Error(errorData.error || 'Failed to submit loan application');
       }

       const result = await response.json();
       const applicationId = result.loanApplication.applicationId;

       // Associate uploaded documents with the application
       const documentAssociations = [];
       for (const [docName, fileData] of Object.entries(uploadedFiles)) {
         if (fileData && (fileData.cloudinaryResult || fileData.tempFile)) {
           documentAssociations.push(associateDocument(applicationId, docName, fileData));
         }
       }

       if (documentAssociations.length > 0) {
         await Promise.all(documentAssociations);
       }

       // Clear saved form data after successful submission
       clearSavedData();
       clearAllFiles();
       
       toast.success("Loan application submitted successfully! We'll review your application and get back to you within 24-48 hours.");
       
       // Add delay before redirecting to allow user to see the toast
       setTimeout(() => {
         router.push('/dashboard');
       }, 2000);
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast.error(error.message || 'Failed to submit loan application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocumentType = (fieldName: string): string => {
    const docTypeMap: Record<string, string> = {
      'selfie': 'SELFIE',
      'Valid Government ID': 'GOVERNMENT_ID',
      'Utility Bill': 'UTILITY_BILL',
      'Work ID': 'WORK_ID'
    };
    return docTypeMap[fieldName] || 'GOVERNMENT_ID';
  };

  const associateDocument = async (applicationId: string, docName: string, fileData: any) => {
    try {
      const documentType = getDocumentType(docName);
      
      if (fileData.cloudinaryResult) {
        // Handle Cloudinary upload
        const response = await fetch('/api/documents/associate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            applicationId,
            documentType,
            cloudinaryUrl: fileData.cloudinaryResult.secure_url,
            cloudinaryPublicId: fileData.cloudinaryResult.public_id,
            fileName: fileData.cloudinaryResult.original_filename,
            fileSize: fileData.cloudinaryResult.bytes,
            mimeType: `${fileData.cloudinaryResult.resource_type}/${fileData.cloudinaryResult.format}`
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to associate document');
        }
        
        const result = await response.json();
        console.log(`Document ${docName} associated successfully with application ${applicationId}`);
        return result;
      } else if (fileData.tempFile && fileData.file) {
        // Handle legacy file upload
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('applicationId', applicationId);
        formData.append('documentType', documentType);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to associate document');
        }
        
        const result = await response.json();
        console.log(`Document ${docName} associated successfully with application ${applicationId}`);
        return result;
      } else {
        throw new Error('No valid file data found');
      }
    } catch (error) {
      console.error(`Failed to associate document ${docName}:`, error);
      throw error;
    }
  };

  const isFormValid = () => {
    const requiredFields = loanType === "salary-cash" 
      ? ['loanAmount', 'tenure', 'firstName', 'lastName', 'phoneNumber', 'email', 'bvn', 'addressNo', 'streetName', 'state', 'localGovernment', 'homeOwnership', 'yearsInCurrentAddress', 'maritalStatus', 'highestEducation', 'employerName', 'employerAddress', 'jobTitle', 'workEmail', 'employmentStartDate', 'salaryPaymentDate', 'netSalary', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinPhoneNumber', 'kinEmail', 'bankName', 'accountName', 'accountNumber']
      : ['loanAmount', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleAmount', 'tenure', 'firstName', 'lastName', 'phoneNumber', 'email', 'bvn', 'addressNo', 'streetName', 'state', 'localGovernment', 'homeOwnership', 'yearsInCurrentAddress', 'maritalStatus', 'highestEducation', 'employerName', 'employerAddress', 'jobTitle', 'workEmail', 'employmentStartDate', 'salaryPaymentDate', 'netSalary', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinPhoneNumber', 'kinEmail', 'bankName', 'accountName', 'accountNumber'];
    
    // Only check if all required form fields are filled
    // Documents are optional and don't prevent form submission
    return requiredFields.every(field => formData[field]);
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <div className="space-y-1">
            <Input
              id={field.name}
              type={field.type}
              value={(formData[field.name] as string) || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
              className={`text-black placeholder:text-gray-500 ${fieldErrors[field.name] ? 'border-red-500 focus:border-red-500' : ''}`}
              required={field.required}
            />
            {fieldErrors[field.name] && (
              <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>
            )}
          </div>
        );
      
      case "date":
        return (
          <div className="relative">
            <Input
              id={field.name}
              type={field.type}
              value={(formData[field.name] as string) || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
              className="text-black placeholder:text-gray-500 pr-10"
              required={field.required}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            </div>
          </div>
        );
      
      case "number":
        // Special handling for yearsInCurrentAddress - should be a number input
        if (field.name === "yearsInCurrentAddress") {
          return (
            <div className="space-y-1">
              <Input
                id={field.name}
                type="number"
                value={(formData[field.name] as string) || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                className={`text-black placeholder:text-gray-500 ${fieldErrors[field.name] ? 'border-red-500 focus:border-red-500' : ''}`}
                required={field.required}
                placeholder="Enter number of years"
                min="1"
                max="99"
              />
              {fieldErrors[field.name] && (
                <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>
              )}
            </div>
          );
        }
        // For other number fields like loan amount, keep as text with formatting
        return (
          <div className="space-y-1">
            <Input
              id={field.name}
              type="text"
              value={(formData[field.name] as string) || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
              className={`text-black placeholder:text-gray-500 ${fieldErrors[field.name] ? 'border-red-500 focus:border-red-500' : ''}`}
              required={field.required}
              placeholder="e.g., 500,000"
            />
            {fieldErrors[field.name] && (
              <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>
            )}
          </div>
        );
      
      case "select":
        // Special handling for state field
        if (field.name === "state") {
          return (
            <Select 
              value={(formData[field.name] as string) || ""} 
              onValueChange={handleStateChange}
            >
              <SelectTrigger className="text-black">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.alias} value={state.state}>{state.state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        // Special handling for local government field
        else if (field.name === "localGovernment") {
          return (
            <Select 
              value={(formData[field.name] as string) || ""} 
              onValueChange={(value: string) => handleInputChange(field.name, value)}
              disabled={!selectedState}
            >
              <SelectTrigger className="text-black">
                <SelectValue placeholder={selectedState ? "Select local government" : "Select state first"} />
              </SelectTrigger>
              <SelectContent>
                {availableLGAs.map((lga) => (
                  <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        // Default handling for other select fields
        return (
          <Select 
            value={(formData[field.name] as string) || ""} 
            onValueChange={(value: string) => handleInputChange(field.name, value)}
          >
            <SelectTrigger className="text-black">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "textarea":
        return (
          <Textarea
            id={field.name}
            value={(formData[field.name] as string) || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="text-black placeholder:text-gray-500"
            rows={3}
            required={field.required}
          />
        );
      
      case "file":
        return (
          <div className="space-y-2">
            <CloudinaryUploadWidget
              onUploadAction={(result) => handleCloudinaryUpload(field.name, result)}
              onError={(error) => handleCloudinaryError(field.name, error)}
              documentType={field.name === 'selfie' ? 'SELFIE' : 'DOCUMENT'}
              isUploading={isUploading[field.name] || isCloudinaryLoading}
              uploadedFile={uploadedFiles[field.name]}
              disabled={isUploading[field.name] || isCloudinaryLoading}
              onWidgetReady={(widget) => registerWidget(field.name, widget)}
            />
            {field.accept && (
              <span className="text-sm text-gray-500">
                Image files only
              </span>
            )}
            {fieldErrors[field.name] && (
              <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const config = loanType === "salary-cash" ? {
    title: "Salary Earner Cash Loan Application",
    description: "Quick cash loans for salary earners with flexible repayment terms",
    sections: [
      {
        title: "Loan Amount",
        fields: [
          { name: "loanAmount", label: "Loan Amount (₦)", type: "number", required: true },
          { name: "tenure", label: "Tenure", type: "select", options: Array.from({length: 22}, (_, i) => `${i + 3} months`), required: true }
        ]
      },
      {
        title: "Personal Information",
        fields: [
          { name: "selfie", label: "Selfie", type: "file", accept: "image/*", required: true },
          { name: "firstName", label: "First Name", type: "text", required: true },
          { name: "lastName", label: "Last Name", type: "text", required: true },
          { name: "middleName", label: "Middle Name", type: "text", required: false },
          { name: "phoneNumber", label: "Phone Number", type: "tel", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "bvn", label: "BVN", type: "text", required: true },
          { name: "nin", label: "NIN", type: "text", required: true },
          { name: "addressNo", label: "Address No", type: "text", required: true },
          { name: "streetName", label: "Street Name", type: "text", required: true },
          { name: "nearestBusStop", label: "Nearest Bus Stop", type: "text", required: true },
          { name: "state", label: "State", type: "select", required: true },
          { name: "localGovernment", label: "Local Government", type: "select", required: true },
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family"], required: true },
          { name: "yearsInCurrentAddress", label: "Years in Current Address", type: "number", required: true },
          { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"], required: true },
          { name: "highestEducation", label: "Highest Level of Education", type: "select", options: ["Primary", "Secondary", "OND/NCE", "HND/Bachelor's", "Master's", "PhD", "Other"], required: true }
        ]
      },
      {
        title: "Employment Information",
        fields: [
          { name: "employerName", label: "Employer Name", type: "text", required: true },
          { name: "employerAddress", label: "Employer Address", type: "textarea", required: true },
          { name: "jobTitle", label: "Title / Position", type: "text", required: true },
          { name: "workEmail", label: "Work Email", type: "email", required: true },
          { name: "employmentStartDate", label: "Employment Start Date", type: "date", required: true },
          { name: "salaryPaymentDate", label: "Salary Payment Date", type: "select", options: Array.from({length: 30}, (_, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`), required: true },
          { name: "netSalary", label: "Net Salary (₦)", type: "number", required: true }
        ]
      },
      {
        title: "Next of Kin",
        fields: [
          { name: "kinFirstName", label: "First Name", type: "text", required: true },
          { name: "kinLastName", label: "Last Name", type: "text", required: true },
          { name: "kinMiddleName", label: "Middle Name", type: "text", required: false },
          { name: "kinRelationship", label: "Relationship", type: "select", options: ["Spouse", "Parent", "Sibling", "Child", "Friend", "Other"], required: true },
          { name: "kinPhoneNumber", label: "Phone Number", type: "tel", required: true },
          { name: "kinEmail", label: "Email Address", type: "email", required: true }
        ]
      },
      {
        title: "Salary Bank Account Details",
        fields: [
          { name: "bankName", label: "Bank Name", type: "text", required: true },
          { name: "accountName", label: "Account Name", type: "text", required: true },
          { name: "accountNumber", label: "Account Number", type: "text", required: true }
        ]
      },
      {
        title: "Documents",
        documents: [
          "Valid Government ID",
          "Utility Bill",
          "Work ID"
        ]
      }
    ]
  } : {
    title: "Salary Earner Car Loan Application",
    description: "Car loans for salary earners with your vehicle as collateral",
    sections: [
      {
        title: "Loan Amount / Vehicle Details",
        fields: [
          { name: "loanAmount", label: "Loan Amount (₦)", type: "number", required: true },
          { name: "vehicleMake", label: "Make", type: "text", required: true },
          { name: "vehicleModel", label: "Model", type: "text", required: true },
          { name: "vehicleYear", label: "Year of Vehicle", type: "select", options: Array.from({length: 25}, (_, i) => (2025 - i).toString()), required: true },
          { name: "vehicleAmount", label: "Vehicle Amount (₦)", type: "number", required: true },
          { name: "tenure", label: "Tenure", type: "select", options: Array.from({length: 22}, (_, i) => `${i + 3} months`), required: true }
        ]
      },
      {
        title: "Personal Information",
        fields: [
          { name: "selfie", label: "Selfie", type: "file", accept: "image/*", required: true },
          { name: "firstName", label: "First Name", type: "text", required: true },
          { name: "lastName", label: "Last Name", type: "text", required: true },
          { name: "middleName", label: "Middle Name", type: "text", required: false },
          { name: "phoneNumber", label: "Phone Number", type: "tel", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "bvn", label: "BVN", type: "text", required: true },
          { name: "nin", label: "NIN", type: "text", required: true },
          { name: "addressNo", label: "Address No", type: "text", required: true },
          { name: "streetName", label: "Street Name", type: "text", required: true },
          { name: "nearestBusStop", label: "Nearest Bus Stop", type: "text", required: true },
          { name: "state", label: "State", type: "select", required: true },
          { name: "localGovernment", label: "Local Government", type: "select", required: true },
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family"], required: true },
          { name: "yearsInCurrentAddress", label: "Years in Current Address", type: "number", required: true },
          { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"], required: true },
          { name: "highestEducation", label: "Highest Level of Education", type: "select", options: ["Primary", "Secondary", "OND/NCE", "HND/Bachelor's", "Master's", "PhD", "Other"], required: true }
        ]
      },
      {
        title: "Employment Information",
        fields: [
          { name: "employerName", label: "Employer Name", type: "text", required: true },
          { name: "employerAddress", label: "Employer Address", type: "textarea", required: true },
          { name: "jobTitle", label: "Title / Position", type: "text", required: true },
          { name: "workEmail", label: "Work Email", type: "email", required: true },
          { name: "employmentStartDate", label: "Employment Start Date", type: "date", required: true },
          { name: "salaryPaymentDate", label: "Salary Payment Date", type: "select", options: Array.from({length: 30}, (_, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`), required: true },
          { name: "netSalary", label: "Net Salary (₦)", type: "number", required: true }
        ]
      },
      {
        title: "Next of Kin",
        fields: [
          { name: "kinFirstName", label: "First Name", type: "text", required: true },
          { name: "kinLastName", label: "Last Name", type: "text", required: true },
          { name: "kinMiddleName", label: "Middle Name", type: "text", required: false },
          { name: "kinRelationship", label: "Relationship", type: "select", options: ["Spouse", "Parent", "Sibling", "Child", "Friend", "Other"], required: true },
          { name: "kinPhoneNumber", label: "Phone Number", type: "tel", required: true },
          { name: "kinEmail", label: "Email Address", type: "email", required: true }
        ]
      },
      {
        title: "Salary Bank Account Details",
        fields: [
          { name: "bankName", label: "Bank Name", type: "text", required: true },
          { name: "accountName", label: "Account Name", type: "text", required: true },
          { name: "accountNumber", label: "Account Number", type: "text", required: true }
        ]
      },
      {
        title: "Documents",
        documents: [
          "Valid Government ID",
          "Utility Bill",
          "Work ID"
        ]
      }
    ]
  };



  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600 mt-2">{config.description}</p>
            {Object.keys(formData).length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 mb-3">
                  📝 Your progress is automatically saved. You can safely close this page and return later.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearSavedData();
                    clearAllFiles();
                    setFormData({});
                    setUploadedFiles({});
                    setSelectedState("");
                    setHasRestoredData(false);
                    toast.success('Form data cleared');
                  }}
                  className="border-blue-300 text-blue-600 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700"
                >
                  Clear saved data
                </Button>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
      {config.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-6">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                {sectionIndex + 1}
              </span>
              {section.title}
            </h3>
          </div>

          {section.fields && (
            <div className="grid md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-gray-800 font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {section.documents && (
            <div className="grid md:grid-cols-2 gap-4">
              {section.documents.map((doc) => {
                const documentType = getDocumentType(doc);
                return (
                  <div key={doc} className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">{doc}</p>
                    <div className="space-y-2">
                      <CloudinaryUploadWidget
                        onUploadAction={(result) => handleCloudinaryUpload(doc, result)}
                        onError={(error) => handleCloudinaryError(doc, error)}
                        documentType={documentType}
                        isUploading={isUploading[doc] || isCloudinaryLoading}
                        uploadedFile={uploadedFiles[doc]}
                        disabled={isUploading[doc] || isCloudinaryLoading}
                        onWidgetReady={(widget) => registerWidget(doc, widget)}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                         Accepted: jpg, png, webp, pdf, doc, docx
                       </div>
                      {uploadedFiles[doc] && !isUploading[doc] && (
                        <div className="text-xs text-gray-500">
                          <p>File: {uploadedFiles[doc]?.tempFile?.fileName || 'Unknown'}</p>
                          <p>Size: {uploadedFiles[doc]?.tempFile ? (uploadedFiles[doc]!.tempFile!.fileSize / 1024).toFixed(1) : '0'} KB</p>
                          <p>Type: {uploadedFiles[doc]?.tempFile?.mimeType || 'Unknown'}</p>
                        </div>
                      )}
                      {fieldErrors[doc] && (
                        <p className="text-sm text-red-600">{fieldErrors[doc]}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting Application...</span>
              </div>
            ) : (
              "Submit Loan Application"
            )}
          </Button>
          </form>
        </div>
      </div>
    </main>
  );
}