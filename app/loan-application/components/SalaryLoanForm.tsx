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
import { useAutoSave, useFileAutoSave } from "@/hooks/useAutoSave";

interface SalaryLoanFormProps {
  loanType: "salary-cash" | "salary-car";
}

interface FormData {
  [key: string]: string | File | null;
}

interface UploadedDocs {
  file: File;
  tempFile: {
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

  // Auto-save hooks
  const { data: autoSavedData, updateData, clearSavedData, hasSavedData } = useAutoSave(formData, {
    key: `salary-loan-${loanType}`,
    debounceMs: 1000
  });
  const { uploadedFiles: autoSavedFiles, updateFiles, clearSavedFiles, hasSavedFiles } = useFileAutoSave(`salary-loan-${loanType}`);

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
    
    if (hasSavedFiles && Object.keys(autoSavedFiles).length > 0) {
      setUploadedFiles(autoSavedFiles);
    }
  }, [hasSavedData, autoSavedData, hasSavedFiles, autoSavedFiles, hasRestoredData]);

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

  const handleFileUpload = async (docName: string, file?: File) => {
    if (file) {
      setIsUploading(prev => ({ ...prev, [docName]: true }));
      setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
      
      try {
        // Mock upload with progress simulation
        const mockUpload = () => {
          return new Promise<void>((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 30;
              if (progress >= 100) {
                progress = 100;
                setUploadProgress(prev => ({ ...prev, [docName]: progress }));
                clearInterval(interval);
                resolve();
              } else {
                setUploadProgress(prev => ({ ...prev, [docName]: progress }));
              }
            }, 200);
          });
        };

        await mockUpload();
        
        // Mock successful upload result
        const mockTempFile = {
          fileName: file.name,
          filePath: `temp/${Date.now()}-${file.name}`,
          fileSize: file.size,
          mimeType: file.type,
          documentType: getDocumentType(docName)
        };
        
        // Store both the file and the temporary upload result
        const updatedFiles: Record<string, UploadedDocs | null> = {
          ...uploadedFiles,
          [docName]: {
            file,
            tempFile: mockTempFile
          }
        };
        
        setUploadedFiles(updatedFiles);
        updateFiles(updatedFiles);
        
        setTimeout(() => {
          setIsUploading(prev => ({ ...prev, [docName]: false }));
          setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
        }, 500);
        
        toast.success(`${docName} uploaded successfully`);
        
      } catch (error: any) {
        console.error('Upload failed:', error);
        setIsUploading(prev => ({ ...prev, [docName]: false }));
        setUploadProgress(prev => ({ ...prev, [docName]: 0 }));
        toast.error(error.message || `Failed to upload ${docName}`);
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
         throw new Error(errorData.error || 'Failed to submit loan application');
       }

       const result = await response.json();
       const applicationId = result.applicationId;

       // Associate uploaded documents with the application
       const documentAssociations = [];
       for (const [docName, fileData] of Object.entries(uploadedFiles)) {
         if (fileData && fileData.tempFile) {
           documentAssociations.push(associateDocument(applicationId, docName, fileData.tempFile));
         }
       }

       if (documentAssociations.length > 0) {
         await Promise.all(documentAssociations);
       }

       // Clear saved form data after successful submission
       clearSavedData();
       clearSavedFiles();
       
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

  const associateDocument = async (applicationId: string, docName: string, tempFile: any) => {
    // Mock document association - simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Mock: Document ${docName} associated successfully with application ${applicationId}`);
    console.log('Mock association data:', {
      applicationId,
      tempFilePath: tempFile.filePath,
      documentType: tempFile.documentType,
      fileName: tempFile.fileName,
      fileSize: tempFile.fileSize,
      mimeType: tempFile.mimeType
    });

    return {
      success: true,
      documentId: `mock-doc-${Date.now()}`,
      message: `Document ${docName} associated successfully`
    };
  };

  const isFormValid = () => {
    const requiredFields = loanType === "salary-cash" 
      ? ['loanAmount', 'tenure', 'firstName', 'lastName', 'phoneNumber', 'email', 'bvn', 'addressNo', 'streetName', 'state', 'localGovernment', 'homeOwnership', 'yearsInCurrentAddress', 'maritalStatus', 'highestEducation', 'employerName', 'employerAddress', 'jobTitle', 'workEmail', 'employmentStartDate', 'salaryPaymentDate', 'netSalary', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinPhoneNumber', 'kinEmail', 'bankName', 'accountName', 'accountNumber']
      : ['loanAmount', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleAmount', 'tenure', 'firstName', 'lastName', 'phoneNumber', 'email', 'bvn', 'addressNo', 'streetName', 'state', 'localGovernment', 'homeOwnership', 'yearsInCurrentAddress', 'maritalStatus', 'highestEducation', 'employerName', 'employerAddress', 'jobTitle', 'workEmail', 'employmentStartDate', 'salaryPaymentDate', 'netSalary', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinPhoneNumber', 'kinEmail', 'bankName', 'accountName', 'accountNumber'];
    
    // Only check if all required form fields are filled
    // Documents (including selfie) are optional and don't prevent form submission
    return requiredFields.every(field => formData[field]);
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <Input
            id={field.name}
            type={field.type}
            value={(formData[field.name] as string) || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
            className="text-black placeholder:text-gray-500"
            required={field.required}
          />
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
            <Input
              id={field.name}
              type="number"
              value={(formData[field.name] as string) || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
              className="text-black placeholder:text-gray-500"
              required={field.required}
              placeholder="Enter number of years"
              min="1"
              max="99"
            />
          );
        }
        // For other number fields like loan amount, keep as text with formatting
        return (
          <Input
            id={field.name}
            type="text"
            value={(formData[field.name] as string) || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
            className="text-black placeholder:text-gray-500"
            required={field.required}
            placeholder="e.g., 500,000"
          />
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
              onValueChange={(value) => handleInputChange(field.name, value)}
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
            onValueChange={(value) => handleInputChange(field.name, value)}
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
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={uploadedFiles[field.name] ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = field.name === 'selfie' ? 'image/*' : 'image/*,.pdf,.doc,.docx';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      await handleFileUpload(field.name, file);
                    }
                  };
                  input.click();
                }}
                disabled={isUploading[field.name]}
              >
                {field.name === "selfie" ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {isUploading[field.name] ? "Uploading..." : uploadedFiles[field.name] ? "Uploaded ✓" : "Upload"}
              </Button>
              {field.accept && (
                <span className="text-sm text-gray-500">
                  {field.accept.includes('image') ? 'Image files only' : 'All files'}
                </span>
              )}
            </div>
            {isUploading[field.name] && (
              <div className="space-y-1">
                <Progress value={uploadProgress[field.name] || 0} className="h-2" />
                <p className="text-xs text-gray-500">{uploadProgress[field.name] || 0}% uploaded</p>
              </div>
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
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family", "Other"], required: true },
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
          { name: "vehicleYear", label: "Year of Vehicle", type: "select", options: Array.from({length: 20}, (_, i) => (2024 - i).toString()), required: true },
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
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family", "Other"], required: true },
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
                    clearSavedFiles();
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
              {section.documents.map((doc) => (
                <div key={doc} className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">{doc}</p>
                  <div className="space-y-2">
                    <div className="relative group">
                      <Button
                        type="button"
                        variant={uploadedFiles[doc] ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          // Set proper accept attribute based on document type
                          const documentType = getDocumentType(doc);
                          if (documentType === 'SELFIE') {
                            input.accept = 'image/jpeg,image/png,image/webp,image/jpg';
                          } else {
                            input.accept = 'image/jpeg,image/png,image/webp,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                          }
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              await handleFileUpload(doc, file);
                            }
                          };
                          input.click();
                        }}
                        className="w-full transition-all duration-200"
                        disabled={isUploading[doc]}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        <span className="group-hover:hidden">
                          {isUploading[doc] ? "Uploading..." : uploadedFiles[doc] ? "Uploaded ✓" : "Upload File"}
                        </span>
                        {uploadedFiles[doc] && (
                          <span className="hidden group-hover:inline">
                            Replace File
                          </span>
                        )}
                      </Button>
                      {uploadedFiles[doc] && (
                        <div className="absolute inset-0 bg-blue-50 border border-blue-200 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                          <span className="text-blue-600 text-sm font-medium">Click to Replace</span>
                        </div>
                      )}
                    </div>
                    {isUploading[doc] && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress[doc] || 0} className="h-2" />
                        <p className="text-xs text-gray-500">{uploadProgress[doc] || 0}% uploaded</p>
                      </div>
                    )}
                    {uploadedFiles[doc] && !isUploading[doc] && (
                      <div className="text-xs text-gray-500">
                        <p>File: {uploadedFiles[doc]?.tempFile?.fileName}</p>
                        <p>Size: {uploadedFiles[doc]?.tempFile ? (uploadedFiles[doc]!.tempFile.fileSize / 1024).toFixed(1) : '0'} KB</p>
                        <p>Type: {uploadedFiles[doc]?.tempFile?.mimeType}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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