"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import logoImage from "@/public/assets/images/logo.png";
import { Car, DollarSign, Building2, UserCheck, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoanApplication {
  id: string;
  loanType: string;
  amount: string;
  status: string;
  appliedDate: string;
  expectedResponse: string;
  applicantName?: string;
  phoneNumber?: string;
  email?: string;
  employmentStatus?: string;
  monthlyIncome?: string;
  loanPurpose?: string;
  repaymentTerm?: string;
  interestRate?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [appliedLoans, setAppliedLoans] = useState<LoanApplication[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // Sample loan applications data - in real app, this would come from API
  const sampleAppliedLoans: LoanApplication[] = [
    {
      id: "LA001",
      loanType: "Salary Earner Cash Loan",
      amount: "₦500,000",
      status: "Under Review",
      appliedDate: "2025-01-15",
      expectedResponse: "2025-01-20",
      applicantName: "John Doe",
      phoneNumber: "+234 801 234 5678",
      email: "john.doe@example.com",
      employmentStatus: "Full-time Employee",
      monthlyIncome: "₦150,000",
      loanPurpose: "Personal use",
      repaymentTerm: "12 months",
      interestRate: "15% p.a."
    },
    {
      id: "LA002",
      loanType: "Business Cash Loan",
      amount: "₦2,000,000",
      status: "Approved",
      appliedDate: "2025-01-10",
      expectedResponse: "2025-01-18",
      applicantName: "Jane Smith",
      phoneNumber: "+234 802 345 6789",
      email: "jane.smith@company.com",
      employmentStatus: "Business Owner",
      monthlyIncome: "₦400,000",
      loanPurpose: "Business expansion",
      repaymentTerm: "24 months",
      interestRate: "12% p.a."
    },
    {
      id: "LA003",
      loanType: "Salary Earner Car Loan",
      amount: "₦800,000",
      status: "Pending Documents",
      appliedDate: "2025-01-12",
      expectedResponse: "2025-01-22",
      applicantName: "Mike Johnson",
      phoneNumber: "+234 803 456 7890",
      email: "mike.johnson@example.com",
      employmentStatus: "Full-time Employee",
      monthlyIncome: "₦200,000",
      loanPurpose: "Vehicle purchase",
      repaymentTerm: "36 months",
      interestRate: "18% p.a."
    }
  ];

  useEffect(() => {
    // Load applied loans from localStorage or API
    const savedLoans = localStorage.getItem('appliedLoans');
    if (savedLoans) {
      setAppliedLoans(JSON.parse(savedLoans));
    } else {
      // Use sample data for demonstration
      setAppliedLoans(sampleAppliedLoans);
    }
  }, []);

  const handleViewLoan = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const handleLoanSelect = (loanId: string) => {
    // Route to the specific loan application form
    router.push(`/loan-application/${loanId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "Under Review":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>;
      case "Pending Documents":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending Documents</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
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
        {/* Applied Loans Table */}
        {appliedLoans.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Loan Applications</h2>
            <Card>
              <CardHeader>
                <CardTitle>Applied Loans</CardTitle>
                <CardDescription>Track the status of your loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Expected Response</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appliedLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.id}</TableCell>
                        <TableCell>{loan.loanType}</TableCell>
                        <TableCell>{loan.amount}</TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>{new Date(loan.appliedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(loan.expectedResponse).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleViewLoan(loan)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

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

        {/* Loan Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Loan Application Details</DialogTitle>
            </DialogHeader>
            {selectedLoan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Application ID</p>
                    <p className="text-sm font-semibold">{selectedLoan.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loan Type</p>
                    <p className="text-sm font-semibold">{selectedLoan.loanType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-sm font-semibold">{selectedLoan.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div>{getStatusBadge(selectedLoan.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Applied Date</p>
                    <p className="text-sm font-semibold">{new Date(selectedLoan.appliedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expected Response</p>
                    <p className="text-sm font-semibold">{new Date(selectedLoan.expectedResponse).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Applicant Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm font-semibold">{selectedLoan.applicantName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm font-semibold">{selectedLoan.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm font-semibold">{selectedLoan.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employment Status</p>
                      <p className="text-sm font-semibold">{selectedLoan.employmentStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                      <p className="text-sm font-semibold">{selectedLoan.monthlyIncome}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Loan Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Purpose</p>
                      <p className="text-sm font-semibold">{selectedLoan.loanPurpose}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Repayment Term</p>
                      <p className="text-sm font-semibold">{selectedLoan.repaymentTerm}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                      <p className="text-sm font-semibold">{selectedLoan.interestRate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
