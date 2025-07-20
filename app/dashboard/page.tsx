"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import logoImage from "@/public/assets/images/logo.png";
import { Car, DollarSign, Building2, UserCheck, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserLoanApplications, LoanApplication } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Remove local interface since we're importing from lib/api
// interface LoanApplication is now imported from @/lib/api

export default function Dashboard() {
  const router = useRouter();
  const [appliedLoans, setAppliedLoans] = useState<LoanApplication[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed showLoanForm and selectedLoanType states as we're using navigation
  
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



  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user data from localStorage (middleware handles authentication via cookies)
        const userData = localStorage.getItem('user') || localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
        
        // Fetch loan applications from API
        const response = await getUserLoanApplications();
        
        if (response.success && response.applications) {
          setAppliedLoans(response.applications);
        } else if (response.error) {
          // Don't redirect on API errors - let middleware handle authentication
          // Just show the error to the user
          setError(response.error);
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError('Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    initializeDashboard();
  }, [router]);

  const handleViewLoan = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const handleLoanSelect = (loanId: string) => {
    router.push(`/loan-application/${loanId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const formatLoanType = (type: string) => {
    switch (type) {
      case "SALARY_CASH":
        return "Salary Earner Cash Loan";
      case "SALARY_CAR":
        return "Salary Earner Car Loan";
      case "BUSINESS_CASH":
        return "Business Cash Loan";
      case "BUSINESS_CAR":
        return "Business Car Loan";
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
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
              <span className="text-gray-600">
                Welcome back{user ? `, ${user.firstName || user.name || 'User'}` : ''}!
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  const { clearAuth } = await import('@/lib/auth');
                  clearAuth();
                  router.push('/login');
                }}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {/* Loan Applications Table Skeleton */}
            <div className="mb-12">
              <Skeleton className="h-8 w-64 mb-6 mx-auto" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Loan Type Selection Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-600">
                  <X className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applied Loans Table - Show first when user has loans */}
        {!loading && appliedLoans.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {appliedLoans.length === 1 ? 'Your Loan Application' : 'Your Loan Applications'}
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>
                  {appliedLoans.length === 1 ? 'Applied Loan' : 'Applied Loans'}
                </CardTitle>
                <CardDescription>
                  {appliedLoans.length === 1 
                    ? 'Track the status of your loan application' 
                    : 'Track the status of your loan applications'
                  }
                </CardDescription>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appliedLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.id}</TableCell>
                        <TableCell>{formatLoanType(loan.type)}</TableCell>
                        <TableCell>{formatCurrency(loan.loanAmount)}</TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
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

        {/* Loan Type Selection - Only show when not loading */}
        {!loading && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Loan Type</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the loan product that best fits your needs. Each loan type has been designed 
              with specific requirements and benefits tailored to different customer profiles.
            </p>
          </div>
        )}

         {/* Loan Type Cards */}
         {!loading && (
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
         )}



        {/* Loan Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
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
                    <p className="text-sm font-semibold">{formatLoanType(selectedLoan.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Requested Amount</p>
                    <p className="text-sm font-semibold">{formatCurrency(selectedLoan.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div>{getStatusBadge(selectedLoan.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Applied Date</p>
                    <p className="text-sm font-semibold">{new Date(selectedLoan.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tenure</p>
                    <p className="text-sm font-semibold">{selectedLoan.tenure} months</p>
                  </div>
                  {selectedLoan.approvedAmount && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Approved Amount</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(selectedLoan.approvedAmount)}</p>
                    </div>
                  )}
                  {selectedLoan.interestRate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                      <p className="text-sm font-semibold">{selectedLoan.interestRate}%</p>
                    </div>
                  )}
                  {selectedLoan.loanId && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Loan ID</p>
                      <p className="text-sm font-semibold text-green-600">{selectedLoan.loanId}</p>
                    </div>
                  )}
                  {selectedLoan.rejectionReason && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                      <p className="text-sm text-red-600">{selectedLoan.rejectionReason}</p>
                    </div>
                  )}
                  {selectedLoan.purpose && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Purpose</p>
                      <p className="text-sm">{selectedLoan.purpose}</p>
                    </div>
                  )}
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

        {/* Empty State for Loan Applications - Show when no loans */}
        {!loading && appliedLoans.length === 0 && (
          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Loan Applications</h2>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Applied Loans</CardTitle>
                <CardDescription>Track the status of your loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No loan applications found</p>
                  <p className="text-sm text-gray-400">Apply for a loan above to get started</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
