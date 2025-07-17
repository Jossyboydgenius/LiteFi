"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import logoImage from "@/public/assets/images/logo.png";
import { formatAmount } from "@/lib/formatters";

// Define loan form configurations according to the workflow
const loanConfigs = {
  "salary-cash": {
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
          { name: "state", label: "State", type: "text", required: true },
          { name: "localGovernment", label: "Local Government", type: "text", required: true },
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
  },
  "business-cash": {
    title: "Business / Corporate Cash Loan Application",
    description: "Working capital loans for businesses and corporations",
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
          { name: "state", label: "State", type: "text", required: true },
          { name: "localGovernment", label: "Local Government", type: "text", required: true },
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family House", "Other"], required: true },
          { name: "yearsInCurrentAddress", label: "Years in Current Address", type: "select", options: ["Less than 1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"], required: true },
          { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"], required: true },
          { name: "highestEducation", label: "Highest Level of Education", type: "select", options: ["Primary", "Secondary", "OND/NCE", "HND/Bachelor's", "Master's", "PhD", "Other"], required: true }
        ]
      },
      {
        title: "Business Information",
        fields: [
          { name: "businessName", label: "Business Name", type: "text", required: true },
          { name: "businessDescription", label: "Description of Business", type: "textarea", required: true },
          { name: "industry", label: "Industry", type: "text", required: true },
          { name: "businessAddress", label: "Business Address", type: "textarea", required: true },
          { name: "workEmail", label: "Work Email", type: "email", required: true }
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
          "Work ID",
          "CAC Certificate",
          "CAC 2 and 7 or Memart or CAC Application Status"
        ]
      }
    ]
  },
  "salary-car": {
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
          { name: "state", label: "State", type: "text", required: true },
          { name: "localGovernment", label: "Local Government", type: "text", required: true },
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
  },
  "business-car": {
    title: "Business / Corporate Car Loan Application",
    description: "Commercial vehicle loans for business and corporate clients",
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
          { name: "state", label: "State", type: "text", required: true },
          { name: "localGovernment", label: "Local Government", type: "text", required: true },
          { name: "homeOwnership", label: "Home Ownership", type: "select", options: ["Owned", "Rented", "Family House", "Other"], required: true },
          { name: "yearsInCurrentAddress", label: "Years in Current Address", type: "select", options: ["Less than 1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"], required: true },
          { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"], required: true },
          { name: "highestEducation", label: "Highest Level of Education", type: "select", options: ["Primary", "Secondary", "OND/NCE", "HND/Bachelor's", "Master's", "PhD", "Other"], required: true }
        ]
      },
      {
        title: "Business Information",
        fields: [
          { name: "businessName", label: "Business Name", type: "text", required: true },
          { name: "businessDescription", label: "Description of Business", type: "textarea", required: true },
          { name: "industry", label: "Industry", type: "text", required: true },
          { name: "businessAddress", label: "Business Address", type: "textarea", required: true },
          { name: "workEmail", label: "Work Email", type: "email", required: true }
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
          "Work ID",
          "CAC Certificate",
          "CAC 2 and 7 or Memart or CAC Application Status"
        ]
      }
    ]
  }
};

interface LoanApplicationFormProps {
  loanType: string;
}

export default function LoanApplicationForm({ loanType }: LoanApplicationFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = loanConfigs[loanType as keyof typeof loanConfigs];

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-red-600 mb-4">Invalid loan type selected.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string, fieldType?: string) => {
    // For number fields (amount fields), format the value with commas
    if (fieldType === "number" && (field.includes('Amount') || field.includes('Salary') || field.includes('Vehicle'))) {
      const formattedValue = formatAmount(value);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFileUpload = (docName: string) => {
    // Simulate file upload
    setUploadedDocs(prev => ({ ...prev, [docName]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert("Loan application submitted successfully! We'll review your application and get back to you within 24-48 hours.");
    router.push('/dashboard');
  };

  const isFormValid = () => {
    const requiredFields = config.sections
      .filter(section => section.fields)
      .flatMap(section => section.fields!)
      .filter(field => field.required);
    
    const allFieldsFilled = requiredFields.every(field => formData[field.name]);
    
    return allFieldsFilled;
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "date":
        return (
          <Input
            id={field.name}
            type={field.type}
            value={formData[field.name] || ""}
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
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
            className="text-black placeholder:text-gray-500"
            required={field.required}
            placeholder="e.g., 500,000"
          />
        );
      
      case "select":
        return (
          <Select 
            value={formData[field.name] || ""} 
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
            value={formData[field.name] || ""}
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
              variant={uploadedDocs[field.name] ? "default" : "outline"}
              size="sm"
              onClick={() => handleFileUpload(field.name)}
            >
              {field.name === "selfie" ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploadedDocs[field.name] ? "Uploaded ✓" : "Upload"}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Image 
                src={logoImage} 
                alt="LiteFi Logo" 
                width={100}
                height={30}
              />
            </div>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              window.location.href = '/';
            }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-black">{config.title}</CardTitle>
              <p className="text-gray-600 text-center">{config.description}</p>
            </CardHeader>
            <CardContent>
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
                              variant={uploadedDocs[doc] ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFileUpload(doc)}
                              className="w-full"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadedDocs[doc] ? "Uploaded ✓" : "Upload File"}
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
                  {isSubmitting ? "Submitting Application..." : "Submit Loan Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}