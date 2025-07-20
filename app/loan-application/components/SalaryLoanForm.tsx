"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Camera } from "lucide-react";
import { formatAmount } from "@/lib/formatters";
import { states, getLGAsForState } from "@/lib/data/states";
import { nanoid } from "nanoid";
import { toast } from "sonner";

interface SalaryLoanFormProps {
  loanType: "salary-cash" | "salary-car";
}

interface FormData {
  [key: string]: string | File | null;
}

interface UploadedDocs {
  [key: string]: boolean;
}

export default function SalaryLoanForm({ loanType }: SalaryLoanFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [selectedState, setSelectedState] = useState<string>("");
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update available LGAs when selected state changes
  useEffect(() => {
    if (selectedState) {
      const lgas = getLGAsForState(selectedState);
      setAvailableLGAs(lgas);
    } else {
      setAvailableLGAs([]);
    }
  }, [selectedState]);

  const handleInputChange = (field: string, value: string, fieldType?: string) => {
    // For number fields (amount fields), format the value with commas
    if (fieldType === "number" && (field.includes('Amount') || field.includes('Salary') || field.includes('Vehicle'))) {
      const formattedValue = formatAmount(value);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setFormData(prev => ({ ...prev, state: value, localGovernment: "" }));
  };

  const handleFileUpload = (docName: string, file?: File) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [docName]: file }));
    } else {
      // Create file input for user to select file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = docName === 'selfie' ? 'image/*' : '*';
      input.onchange = (e) => {
        const selectedFile = (e.target as HTMLInputElement).files?.[0];
        if (selectedFile) {
          setUploadedFiles(prev => ({ ...prev, [docName]: selectedFile }));
        }
      };
      input.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare loan application data
      const loanData = {
        loanType: loanType === 'salary-cash' ? 'SALARY_CASH' : 'SALARY_CAR',
        loanAmount: parseFloat(formData.loanAmount?.replace(/,/g, '') || '0'),
        tenure: parseInt(formData.tenure?.split(' ')[0] || '0'),
        vehicleMake: formData.vehicleMake || undefined,
        vehicleModel: formData.vehicleModel || undefined,
        vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : undefined,
        vehicleAmount: formData.vehicleAmount ? parseFloat(formData.vehicleAmount.replace(/,/g, '')) : undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        bvn: formData.bvn,
        nin: formData.nin,
        addressNo: formData.addressNo,
        streetName: formData.streetName,
        nearestBusStop: formData.nearestBusStop,
        state: formData.state,
        localGovernment: formData.localGovernment,
        homeOwnership: formData.homeOwnership as any,
        yearsInCurrentAddress: formData.yearsInCurrentAddress,
        maritalStatus: formData.maritalStatus as any,
        highestEducation: formData.highestEducation,
        employerName: formData.employerName,
        employerAddress: formData.employerAddress,
        jobTitle: formData.jobTitle,
        workEmail: formData.workEmail,
        employmentStartDate: formData.employmentStartDate,
        salaryPaymentDate: formData.salaryPaymentDate,
        netSalary: parseFloat(formData.netSalary?.replace(/,/g, '') || '0'),
        kinFirstName: formData.kinFirstName,
        kinLastName: formData.kinLastName,
        kinMiddleName: formData.kinMiddleName || undefined,
        kinRelationship: formData.kinRelationship,
        kinPhoneNumber: formData.kinPhoneNumber,
        kinEmail: formData.kinEmail,
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber
      };

      // Submit loan application
       const response = await fetch('/api/loan-applications', {
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

       // Upload documents if any
       const documentUploads = [];
       for (const [docName, file] of Object.entries(uploadedFiles)) {
         if (file) {
           documentUploads.push(uploadDocument(applicationId, docName, file));
         }
       }

       if (documentUploads.length > 0) {
         await Promise.all(documentUploads);
       }

       toast.success("Loan application submitted successfully! We'll review your application and get back to you within 24-48 hours.");
       router.push('/dashboard');
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast.error(error.message || 'Failed to submit loan application. Please try again.');
    }
  };

  const getDocumentType = (fieldName: string): string => {
    const docTypeMap: Record<string, string> = {
      'selfie': 'SELFIE',
      'Valid Government ID': 'GOVERNMENT_ID',
      'Utility Bill': 'UTILITY_BILL',
      'Work ID': 'WORK_ID'
    };
    return docTypeMap[fieldName] || 'OTHER';
  };

  const uploadDocument = async (applicationId: string, docName: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', applicationId);
    formData.append('documentType', getDocumentType(docName));

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to upload ${docName}`);
    }

    return response.json();
  };

  const isFormValid = () => {
    const requiredFields = loanType === "salary-cash" 
      ? ['loanAmount', 'tenure', 'firstName', 'lastName', 'phoneNumber', 'email', 'bvn', 'nin', 'addressNo', 'streetName', 'nearestBusStop', 'state', 'localGovernment', 'homeOwnership', 'yearsInCurrentAddress', 'maritalStatus', 'highestEducation', 'employerName', 'employerAddress', 'jobTitle', 'workEmail', 'employmentStartDate', 'salaryPaymentDate', 'netSalary', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinPhoneNumber', 'kinEmail', 'bankName', 'accountName', 'accountNumber']
      : ['vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleAmount', 'tenure', 'firstName', 'lastName', 'phoneNumber', 'email', 'bvn', 'nin', 'addressNo', 'streetName', 'nearestBusStop', 'state', 'localGovernment', 'homeOwnership', 'yearsInCurrentAddress', 'maritalStatus', 'highestEducation', 'employerName', 'employerAddress', 'jobTitle', 'workEmail', 'employmentStartDate', 'salaryPaymentDate', 'netSalary', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinPhoneNumber', 'kinEmail', 'bankName', 'accountName', 'accountNumber'];
    
    return requiredFields.every(field => formData[field]);
  };

  const renderField = (field: any) => {
    if (isLoading) {
      return <Skeleton className="h-10 w-full" />;
    }

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "date":
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
      
      case "number":
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
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={uploadedFiles[field.name] ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = field.accept || '*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    handleFileUpload(field.name, file);
                  }
                };
                input.click();
              }}
            >
              {field.name === "selfie" ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploadedFiles[field.name] ? "Uploaded ✓" : "Upload"}
            </Button>
            {field.accept && (
              <span className="text-sm text-gray-500">
                {field.accept.includes('image') ? 'Image files only' : 'All files'}
              </span>
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
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family House", "Other"], required: true },
          { name: "yearsInCurrentAddress", label: "Years in Current Address", type: "select", options: ["Less than 1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"], required: true },
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
        title: "Vehicle Details",
        fields: [
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
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family House", "Other"], required: true },
          { name: "yearsInCurrentAddress", label: "Years in Current Address", type: "select", options: ["Less than 1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"], required: true },
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="space-y-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-6">
                <div className="border-b pb-2">
                  <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600 mt-2">{config.description}</p>
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
                  <Button
                    type="button"
                    variant={uploadedFiles[doc] ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleFileUpload(doc, file);
                        }
                      };
                      input.click();
                    }}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadedFiles[doc] ? "Uploaded ✓" : "Upload File"}
                  </Button>
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