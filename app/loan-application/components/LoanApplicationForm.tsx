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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload } from "lucide-react";
import logoImage from "@/public/assets/images/logo.png";
import { formatAmount, parseAmount } from "@/lib/formatters";

// Define loan form configurations
const loanConfigs = {
  "salary-cash": {
    title: "Salary Earner Cash Loan Application",
    description: "Quick cash loans for salary earners with flexible repayment terms",
    fields: [
      { name: "employerName", label: "Employer Name", type: "text", required: true },
      { name: "monthlyIncome", label: "Monthly Net Income (₦)", type: "number", required: true },
      { name: "employmentDuration", label: "Employment Duration", type: "select", options: ["0-6 months", "6-12 months", "1-2 years", "2-5 years", "5+ years"], required: true },
      { name: "loanAmount", label: "Requested Loan Amount (₦)", type: "number", required: true },
      { name: "loanPurpose", label: "Loan Purpose", type: "textarea", required: true },
      { name: "repaymentPeriod", label: "Preferred Repayment Period", type: "select", options: ["3 months", "6 months", "12 months", "18 months", "24 months"], required: true }
    ],
    documents: [
      "Valid ID Card",
      "Last 3 months salary slips", 
      "Bank statements (6 months)",
      "Employment letter",
      "Passport photograph"
    ]
  },
  "business-cash": {
    title: "Business / Corporate Cash Loan Application", 
    description: "Working capital loans for businesses and corporations",
    fields: [
      { name: "businessName", label: "Business/Company Name", type: "text", required: true },
      { name: "businessType", label: "Business Type", type: "select", options: ["Sole Proprietorship", "Partnership", "Limited Liability Company", "Corporation", "Other"], required: true },
      { name: "registrationNumber", label: "Business Registration Number", type: "text", required: true },
      { name: "monthlyRevenue", label: "Average Monthly Revenue (₦)", type: "number", required: true },
      { name: "businessAge", label: "Years in Business", type: "select", options: ["0-1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"], required: true },
      { name: "loanAmount", label: "Requested Loan Amount (₦)", type: "number", required: true },
      { name: "loanPurpose", label: "Loan Purpose", type: "textarea", required: true },
      { name: "repaymentPeriod", label: "Preferred Repayment Period", type: "select", options: ["6 months", "12 months", "18 months", "24 months", "36 months"], required: true }
    ],
    documents: [
      "CAC Certificate", 
      "Tax Identification Number (TIN)",
      "Bank statements (12 months)",
      "Financial statements",
      "Business permit/license",
      "Directors' ID cards"
    ]
  },
  "salary-car": {
    title: "Salary Earner Car Loan Application",
    description: "Car loans for salary earners with your vehicle as collateral", 
    fields: [
      { name: "employerName", label: "Employer Name", type: "text", required: true },
      { name: "monthlyIncome", label: "Monthly Net Income (₦)", type: "number", required: true },
      { name: "vehicleMake", label: "Vehicle Make", type: "text", required: true },
      { name: "vehicleModel", label: "Vehicle Model", type: "text", required: true },
      { name: "vehicleYear", label: "Vehicle Year", type: "select", options: Array.from({length: 20}, (_, i) => (2024 - i).toString()), required: true },
      { name: "vehicleValue", label: "Estimated Vehicle Value (₦)", type: "number", required: true },
      { name: "loanAmount", label: "Requested Loan Amount (₦)", type: "number", required: true },
      { name: "repaymentPeriod", label: "Preferred Repayment Period", type: "select", options: ["12 months", "18 months", "24 months", "36 months", "48 months"], required: true }
    ],
    documents: [
      "Vehicle documents (Registration, Insurance)",
      "Valid ID Card",
      "Last 3 months salary slips",
      "Bank statements (6 months)", 
      "Employment letter",
      "Vehicle valuation report"
    ]
  },
  "business-car": {
    title: "Business / Corporate Car Loan Application",
    description: "Commercial vehicle loans for business and corporate clients",
    fields: [
      { name: "businessName", label: "Business/Company Name", type: "text", required: true },
      { name: "registrationNumber", label: "Business Registration Number", type: "text", required: true },
      { name: "vehicleType", label: "Vehicle Type", type: "select", options: ["Commercial Van", "Pickup Truck", "Bus", "Heavy Duty Truck", "Fleet Vehicles", "Other"], required: true },
      { name: "vehicleMake", label: "Vehicle Make", type: "text", required: true },
      { name: "vehicleModel", label: "Vehicle Model", type: "text", required: true },
      { name: "vehicleYear", label: "Vehicle Year", type: "select", options: Array.from({length: 15}, (_, i) => (2024 - i).toString()), required: true },
      { name: "vehicleValue", label: "Estimated Vehicle Value (₦)", type: "number", required: true },
      { name: "loanAmount", label: "Requested Loan Amount (₦)", type: "number", required: true },
      { name: "businessPurpose", label: "Business Use Purpose", type: "textarea", required: true },
      { name: "repaymentPeriod", label: "Preferred Repayment Period", type: "select", options: ["12 months", "18 months", "24 months", "36 months", "48 months", "60 months"], required: true }
    ],
    documents: [
      "CAC Certificate",
      "Vehicle documents (Registration, Insurance)", 
      "Business financial statements",
      "Tax returns",
      "Directors' ID cards",
      "Vehicle valuation report"
    ]
  }
};

interface LoanApplicationFormProps {
  loanType: string;
}

export default function LoanApplicationForm({ loanType }: LoanApplicationFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
    if (fieldType === "number" && (field.includes('Amount') || field.includes('Income') || field.includes('Revenue') || field.includes('Value'))) {
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
    const requiredFields = config.fields.filter(field => field.required);
    const allFieldsFilled = requiredFields.every(field => formData[field.name]);
    const allDocsUploaded = config.documents.every(doc => uploadedDocs[doc]);
    return allFieldsFilled && allDocsUploaded && agreedToTerms;
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal/Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
                  {config.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name} className="text-gray-800 font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      
                      {field.type === "text" || field.type === "number" ? (
                        <Input
                          id={field.name}
                          type={field.type === "number" ? "text" : field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                          className="text-black placeholder:text-gray-500"
                          required={field.required}
                          placeholder={field.type === "number" && (field.name.includes('Amount') || field.name.includes('Income') || field.name.includes('Revenue') || field.name.includes('Value')) ? "e.g., 500,000" : ""}
                        />
                      ) : field.type === "select" ? (
                        <Select 
                          value={formData[field.name] || ""} 
                          onValueChange={(value) => handleInputChange(field.name, value)}
                        >
                          <SelectTrigger className="text-black">
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="text-black placeholder:text-gray-500"
                          rows={3}
                          required={field.required}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {config.documents.map((doc) => (
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
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the terms and conditions and confirm that all information provided is accurate and complete.
                  </Label>
                </div>

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
