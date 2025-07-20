"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SalaryLoanForm from "./SalaryLoanForm";
import BusinessLoanForm from "./BusinessLoanForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import logoImage from "@/public/assets/images/logo.png";



interface LoanApplicationFormProps {
  loanType: string;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ loanType }) => {
  const router = useRouter();

  // Route to appropriate form component based on loan type
  const renderLoanForm = () => {
    switch (loanType) {
      case "salary-cash":
      case "salary-car":
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </Button>
                      <div className="h-6 w-px bg-gray-300" />
                      <Image
                        src={logoImage}
                        alt="Logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/login');
                      }}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <SalaryLoanForm loanType={loanType} />
          </div>
        );
      
      case "business-cash":
      case "business-car":
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </Button>
                      <div className="h-6 w-px bg-gray-300" />
                      <Image
                        src={logoImage}
                        alt="Logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/login');
                      }}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <BusinessLoanForm loanType={loanType} />
          </div>
        );
      
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Invalid Loan Type</h2>
                <p className="text-gray-600 mb-4">The requested loan type is not available.</p>
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return renderLoanForm();
};

export default LoanApplicationForm;