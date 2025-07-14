"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logoImage from "@/public/assets/images/logo.png";
import { Car, DollarSign, Building2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  
  const loanTypes = [
    {
      id: "salary-cash",
      title: "Salary Earner Cash Loan",
      description: "Quick cash loans for salary earners with flexible repayment terms",
      icon: <DollarSign className="h-8 w-8 text-red-600" />,
      features: ["Fast approval", "Flexible tenure", "Competitive rates"]
    },
    {
      id: "business-cash", 
      title: "Business / Corporate Cash Loan",
      description: "Working capital loans for businesses and corporations",
      icon: <Building2 className="h-8 w-8 text-red-600" />,
      features: ["Business expansion", "Working capital", "Corporate rates"]
    },
    {
      id: "salary-car",
      title: "Salary Earner Car Loan", 
      description: "Car loans for salary earners with your vehicle as collateral",
      icon: <Car className="h-8 w-8 text-red-600" />,
      features: ["Keep driving", "Vehicle collateral", "Quick processing"]
    },
    {
      id: "business-car",
      title: "Business / Corporate Car Loan",
      description: "Commercial vehicle loans for business and corporate clients",
      icon: <UserCheck className="h-8 w-8 text-red-600" />,
      features: ["Commercial vehicles", "Fleet financing", "Business rates"]
    }
  ];

  const handleLoanSelect = (loanId: string) => {
    // Route to the specific loan application form
    router.push(`/loan-application/${loanId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Image 
              src={logoImage} 
              alt="LiteFi Logo" 
              width={100}
              height={30}
            />
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome back!</span>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = '/';
              }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Loan Type</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the loan product that best fits your needs. Each loan type has been designed 
            with specific requirements and benefits tailored to different customer profiles.
          </p>
        </div>

        {/* Loan Type Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {loanTypes.map((loan) => (
            <Card key={loan.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleLoanSelect(loan.id)}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    {loan.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{loan.title}</CardTitle>
                    <CardDescription className="mt-1">{loan.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {loan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                  Apply for This Loan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-white rounded-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-4">What happens next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Fill Application Form</h3>
              <p className="text-sm text-gray-600">Complete the required forms with your personal and financial information</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Submit & Review</h3>
              <p className="text-sm text-gray-600">Submit your application for review by our loan specialists</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Get Approved</h3>
              <p className="text-sm text-gray-600">Receive approval and get your funds disbursed quickly</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
