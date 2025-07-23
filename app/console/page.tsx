'use client';

import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Import logo
import logoImage from '@/public/assets/images/logo.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Download, FileText, Users, DollarSign, TrendingUp, Calendar, FileSpreadsheet } from 'lucide-react';
import { SkeletonTable, SkeletonStats } from "@/components/ui/skeleton-table";
import { adminApi } from '@/lib/api';

interface LoanApplication {
  id: string;
  loanType: string;
  loanId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  loanAmount: number;
  tenure: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  approvedAmount?: number;
  interestRate?: number;
  approvedTenure?: number;
  rejectionReason?: string;
  
  // Personal Information
  middleName?: string;
  phoneNumber?: string;
  bvn?: string;
  nin?: string;
  addressNumber?: string;
  streetName?: string;
  nearestBusStop?: string;
  state?: string;
  localGovernment?: string;
  homeOwnership?: string;
  yearsInAddress?: number;
  maritalStatus?: string;
  educationLevel?: string;
  
  // Vehicle Information (for car loans)
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleAmount?: number;
  
  // Employment/Business Information
  employerName?: string;
  employerAddress?: string;
  jobTitle?: string;
  workEmail?: string;
  employmentStartDate?: string;
  salaryPaymentDate?: string;
  netSalary?: number;
  businessName?: string;
  businessDescription?: string;
  industry?: string;
  businessAddress?: string;
  
  // Next of Kin
  nokFirstName?: string;
  nokLastName?: string;
  nokMiddleName?: string;
  nokRelationship?: string;
  nokPhone?: string;
  nokEmail?: string;
  
  // Bank Details
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  
  documents?: any[];
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const generateId = () => nanoid(10);

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalApplication, setApprovalApplication] = useState<LoanApplication | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  // Using sonner toast instead of useToast

  // Fetch applications from API
  const fetchApplications = async (page = 1, status?: string) => {
    try {
      setLoading(true);
      const params: any = { page, limit: pagination.limit };
      if (status && status !== 'all') {
        params.status = status.toUpperCase();
      }
      
      const response = await adminApi.getAdminLoanApplications(params);
      
      if (response.success) {
        setApplications(response.loanApplications || []);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0
        });
      } else {
        toast.error(response.error || "Failed to fetch applications");
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    // Initialize user data
    const userData = localStorage.getItem('user') || localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch applications
    fetchApplications();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchApplications(1, filterStatus);
    }
  }, [filterStatus]);

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus.toUpperCase();
    const matchesType = filterType === 'all' || app.loanType === filterType;
    const matchesSearch = searchTerm === '' || 
      app.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.loanId && app.loanId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    approved: applications.filter(app => app.status === 'APPROVED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
    totalAmount: applications
      .filter(app => app.status === 'APPROVED' && app.approvedAmount)
      .reduce((sum, app) => {
        const amount = typeof app.approvedAmount === 'string' ? 
          parseFloat(app.approvedAmount) : 
          Number(app.approvedAmount) || 0;
        return sum + amount;
      }, 0)
  };

  // Modified to open the approval modal instead of directly approving
  const handleApproveClick = (application: LoanApplication) => {
    setApprovalApplication(application);
    setShowApproveModal(true);
  };

  // New function to handle the actual approval with tenure and amount
  const handleApprove = async (application: LoanApplication, approvedAmount: number, approvedTenure: string, interestRate: number = 15) => {
    try {
      setActionLoading(application.id);
      
      // Convert tenure string to number (extract number from "12 months")
      const tenureNumber = parseInt(approvedTenure.split(' ')[0]);
      
      // Ensure approvedAmount is a number
      const numericApprovedAmount = typeof approvedAmount === 'string' ? 
        parseFloat((approvedAmount as string).replace(/[^0-9.]/g, '')) : 
        Number(approvedAmount);
      
      const response = await adminApi.approveLoanApplication(application.id, {
        approvedAmount: numericApprovedAmount,
        interestRate,
        approvedTenure: tenureNumber,
        notes: `Loan approved. Amount: ₦${numericApprovedAmount.toLocaleString()}, Tenure: ${tenureNumber} months`
      });
      
      if (response.success) {
        setShowApproveModal(false);
        setApprovalApplication(null);
        toast.success(`Application Approved - Loan ID ${response.loanApplication.loanId} has been generated for ${application.user.firstName} ${application.user.lastName}`);
        // Refresh applications
        fetchApplications(pagination.page, filterStatus);
      } else {
        toast.error(response.error || "Failed to approve application");
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error("Failed to approve application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (application: LoanApplication, reason: string) => {
    try {
      setActionLoading(application.id);
      
      const response = await adminApi.rejectLoanApplication(application.id, {
        reason,
        notes: reason
      });
      
      if (response.success) {
        toast.success(`Application for ${application.user.firstName} ${application.user.lastName} has been rejected`);
        // Refresh applications
        fetchApplications(pagination.page, filterStatus);
      } else {
        toast.error(response.error || "Failed to reject application");
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error("Failed to reject application");
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number | string | any) => {
    // Handle Decimal values from Prisma
    const numericAmount = typeof amount === 'string' ? 
      parseFloat(amount) : 
      Number(amount) || 0;
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const formatLoanType = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'SALARY_CASH': 'Salary Cash',
      'SALARY_CAR': 'Salary Car', 
      'BUSINESS_CASH': 'Business Cash',
      'BUSINESS_CAR': 'Business Car',
      'salary-cash': 'Salary Cash',
      'salary-car': 'Salary Car',
      'business-cash': 'Business Cash',
      'business-car': 'Business Car'
    };
    return typeLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const exportToCSV = () => {
    const csvData = applications.map(app => ({
      'Application ID': app.id,
      'Loan ID': app.loanId || '',
      'Type': app.loanType,
      'Applicant Name': `${app.user.firstName} ${app.user.lastName}`,
      'Email': app.user.email,
      'Amount': app.loanAmount,
      'Approved Amount': app.approvedAmount || '',
      'Status': app.status,
      'Submitted At': formatDate(app.createdAt),
      'Reviewed At': app.reviewedAt ? formatDate(app.reviewedAt) : '',
      'Reviewed By': app.reviewedBy || '',
      'Notes': app.notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Applications data has been exported to CSV");
    setShowExportModal(false);
  };

  const exportToPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>LiteFi Loan Applications Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .stat-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-approved { color: green; font-weight: bold; }
        .status-pending { color: orange; font-weight: bold; }
        .status-rejected { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LiteFi Loan Applications Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="stats">
        <h2>Summary Statistics</h2>
        <div class="stats-grid">
            <div class="stat-item"><strong>Total Applications:</strong> ${stats.total}</div>
            <div class="stat-item"><strong>Pending:</strong> ${stats.pending}</div>
            <div class="stat-item"><strong>Approved:</strong> ${stats.approved}</div>
            <div class="stat-item"><strong>Rejected:</strong> ${stats.rejected}</div>
            <div class="stat-item" style="grid-column: span 2;"><strong>Total Approved Amount:</strong> ${formatCurrency(stats.totalAmount)}</div>
        </div>
    </div>
    
    <h2>Applications Details</h2>
    <table>
        <thead>
            <tr>
                <th>Application ID</th>
                <th>Loan ID</th>
                <th>Loan Type</th>
                <th>Applicant</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Approved Amount</th>
                <th>Status</th>
                <th>Submitted</th>
            </tr>
        </thead>
        <tbody>
            ${applications.map(app => `
                <tr>
                    <td>${app.id}</td>
                    <td>${app.loanId || 'N/A'}</td>
                    <td>${formatLoanType(app.loanType)}</td>
                    <td>${app.user.firstName} ${app.user.lastName}</td>
                    <td>${app.user.email}</td>
                    <td>${formatCurrency(app.loanAmount)}</td>
                    <td>${app.approvedAmount ? formatCurrency(app.approvedAmount) : 'N/A'}</td>
                    <td class="status-${app.status.toLowerCase()}">${app.status}</td>
                    <td>${formatDate(app.createdAt)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `;

    // Create a new window and print to PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }

    toast.success("PDF export initiated - please save the document when prompted");
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image 
                src={logoImage} 
                alt="LiteFi Logo" 
                width={100}
                height={30}
              />
              {user && (
                <div className="ml-6">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Welcome back, {user.firstName}
                  </h1>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
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
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Console Dashboard</h1>
          </div>
          <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-black">Export Application Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">Choose your preferred export format:</p>
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={exportToCSV}
                    className="flex items-center justify-center gap-3 h-12 bg-green-600 hover:bg-green-700"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    Export as CSV
                  </Button>
                  <Button 
                    onClick={exportToPDF}
                    className="flex items-center justify-center gap-3 h-12 bg-red-600 hover:bg-red-700"
                  >
                    <FileText className="h-5 w-5" />
                    Export as PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{formatCurrency(stats.totalAmount)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or application ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SALARY_CASH">Salary Cash</SelectItem>
                <SelectItem value="SALARY_CAR">Salary Car</SelectItem>
                <SelectItem value="BUSINESS_CASH">Business Cash</SelectItem>
                <SelectItem value="BUSINESS_CAR">Business Car</SelectItem>
              </SelectContent>
            </Select>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <SkeletonTable />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-mono text-sm">{application.id}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {application.user.id || '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                           {application.loanId || application.id}
                         </TableCell>
                        <TableCell>{formatLoanType(application.loanType)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{application.user.firstName} {application.user.lastName}</div>
                            <div className="text-sm text-gray-500">{application.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(application.loanAmount)}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell className="text-sm">{formatDate(application.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
                                <DialogHeader>
                                  <DialogTitle className="text-black">Application Details</DialogTitle>
                                </DialogHeader>
                                {selectedApplication && (
                                  <ApplicationDetailsModal 
                                    application={selectedApplication}
                                    onApprove={handleApproveClick}
                                    onReject={handleReject}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            {application.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveClick(application)}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={actionLoading === application.id}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive" disabled={actionLoading === application.id}>
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-white">
                                    <RejectApplicationModal 
                                      application={application}
                                      onReject={handleReject}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            
            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchApplications(pagination.page - 1, filterStatus)}
                    disabled={pagination.page <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => fetchApplications(pageNum, filterStatus)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchApplications(pagination.page + 1, filterStatus)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="bg-white">
          {approvalApplication && (
            <ApproveApplicationModal 
              application={approvalApplication}
              onApprove={handleApprove}
              onCancel={() => setShowApproveModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Update ApplicationDetailsModal to use handleApproveClick instead of direct approval
interface ApplicationDetailsModalProps {
  application: LoanApplication;
  onApprove: (application: LoanApplication) => void;
  onReject: (application: LoanApplication, reason: string) => void;
}

function ApplicationDetailsModal({ application, onApprove, onReject }: ApplicationDetailsModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const formatLoanType = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'SALARY_CASH': 'Salary Cash',
      'SALARY_CAR': 'Salary Car', 
      'BUSINESS_CASH': 'Business Cash',
      'BUSINESS_CAR': 'Business Car',
      'salary-cash': 'Salary Cash',
      'salary-car': 'Salary Car',
      'business-cash': 'Business Cash',
      'business-car': 'Business Car'
    };
    return typeLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      onReject(application, rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
    }
  };

  const handleDocumentDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/download?documentId=${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success(`Document "${fileName}" downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const downloadApplicationPDF = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>LiteFi Loan Application - ${application.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px; }
        .info-item { padding: 10px; background: #f9f9f9; border-radius: 5px; }
        .info-label { font-weight: bold; color: #555; }
        .info-value { margin-top: 5px; }
        .status-approved { color: green; font-weight: bold; }
        .status-pending { color: orange; font-weight: bold; }
        .status-rejected { color: red; font-weight: bold; }
        .documents-list { list-style: none; padding: 0; }
        .documents-list li { padding: 8px; background: #f5f5f5; margin-bottom: 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LiteFi Loan Application Details</h1>
        <p><strong>Application ID:</strong> ${application.id}</p>
        ${application.loanId ? `<p><strong>Loan ID:</strong> ${application.loanId}</p>` : ''}
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="section">
        <div class="section-title">Application Overview</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Loan Type</div>
                <div class="info-value">${formatLoanType(application.loanType)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value status-${application.status.toLowerCase()}">${application.status}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Requested Amount</div>
                <div class="info-value">${formatCurrency(application.loanAmount)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Tenure</div>
                <div class="info-value">${application.tenure} months</div>
            </div>
            ${application.approvedAmount ? `
            <div class="info-item">
                <div class="info-label">Approved Amount</div>
                <div class="info-value">${formatCurrency(application.approvedAmount)}</div>
            </div>
            ` : ''}
            ${application.approvedTenure ? `
            <div class="info-item">
                <div class="info-label">Approved Tenure</div>
                <div class="info-value">${application.approvedTenure} months</div>
            </div>
            ` : ''}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Applicant Information</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${application.user.firstName} ${application.user.lastName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">${application.user.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${application.phoneNumber || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">BVN</div>
                <div class="info-value">${application.bvn || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">${[application.addressNumber, application.streetName, application.nearestBusStop, application.state, application.localGovernment].filter(Boolean).join(', ') || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Employment/Business</div>
                <div class="info-value">${application.employerName || application.businessName || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Monthly Income/Salary</div>
                <div class="info-value">${application.netSalary ? formatCurrency(Number(application.netSalary)) : 'N/A'}</div>
            </div>
            ${application.purpose ? `
            <div class="info-item">
                <div class="info-label">Loan Purpose</div>
                <div class="info-value">${application.purpose}</div>
            </div>
            ` : ''}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Timeline</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Submitted</div>
                <div class="info-value">${formatDate(application.createdAt)}</div>
            </div>
            ${application.reviewedAt ? `
            <div class="info-item">
                <div class="info-label">Reviewed</div>
                <div class="info-value">${formatDate(application.reviewedAt)}</div>
            </div>
            ` : ''}
            ${application.reviewedBy ? `
            <div class="info-item">
                <div class="info-label">Reviewed By</div>
                <div class="info-value">${application.reviewedBy}</div>
            </div>
            ` : ''}
        </div>
    </div>
    
    ${application.documents && application.documents.length > 0 ? `
    <div class="section">
        <div class="section-title">Documents</div>
        <ul class="documents-list">
            ${application.documents.map((doc, index) => `
                <li>${doc.fileName || doc.documentType || `Document ${index + 1}`}</li>
            `).join('')}
        </ul>
    </div>
    ` : ''}
    
    ${application.notes ? `
    <div class="section">
        <div class="section-title">Notes</div>
        <div class="info-item">
            <div class="info-value">${application.notes}</div>
        </div>
    </div>
    ` : ''}
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }

    toast.success(`Application details for ${application.user.firstName} ${application.user.lastName} downloaded successfully`);
  };

  const downloadApplicationCSV = () => {
    const csvData = {
      'Application ID': application.id,
      'Loan ID': application.loanId || '',
      'Loan Type': formatLoanType(application.loanType),
      'Applicant Name': `${application.user.firstName} ${application.user.lastName}`,
      'Email': application.user.email,
      'Phone': application.phoneNumber || '',
      'BVN': application.bvn || '',
      'Address': [application.addressNumber, application.streetName, application.nearestBusStop, application.state, application.localGovernment].filter(Boolean).join(', ') || '',
      'Requested Amount': application.loanAmount,
      'Approved Amount': application.approvedAmount || '',
      'Tenure': application.tenure,
      'Approved Tenure': application.approvedTenure || '',
      'Status': application.status,
      'Employer/Business': application.employerName || application.businessName || '',
      'Job Title': application.jobTitle || '',
      'Net Salary': application.netSalary || '',
      'Vehicle Make': application.vehicleMake || '',
      'Vehicle Model': application.vehicleModel || '',
      'Vehicle Year': application.vehicleYear || '',
      'Next of Kin': application.nokFirstName ? `${application.nokFirstName} ${application.nokLastName}` : '',
      'NOK Phone': application.nokPhone || '',
      'Bank Name': application.bankName || '',
      'Account Number': application.accountNumber || '',
      'Submitted At': formatDate(application.createdAt),
      'Reviewed At': application.reviewedAt ? formatDate(application.reviewedAt) : '',
      'Reviewed By': application.reviewedBy || '',
      'Notes': application.notes || ''
    };

    const csvContent = [
      Object.keys(csvData).join(','),
      Object.values(csvData).map(value => `"${value}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_application_${application.id}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Application data for ${application.user.firstName} ${application.user.lastName} exported to CSV`);
  };

  return (
    <div className="space-y-6 bg-white text-black">
      {/* Download Actions */}
      <div className="flex justify-end gap-2 pb-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadApplicationPDF}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadApplicationCSV}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Application ID</Label>
          <p className="font-mono text-sm text-black">{application.id}</p>
        </div>
        {application.loanId && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Loan ID</Label>
            <p className="font-mono text-sm text-black">{application.loanId}</p>
          </div>
        )}
        <div>
            <Label className="text-sm font-medium text-gray-700">Type</Label>
            <p className="text-black">{formatLoanType(application.loanType)}</p>
          </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Status</Label>
          <p className="capitalize text-black">{application.status}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Approved Amount</Label>
          <p className="text-black">{application.approvedAmount ? formatCurrency(application.approvedAmount) : '-'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Approved Tenure</Label>
          <p className="text-black">{application.approvedTenure ? application.approvedTenure : '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Applicant Information</Label>
          <div className="mt-2 space-y-2">
            <p className="text-black"><strong>Name:</strong> {application.user.firstName} {application.user.lastName}</p>
            <p className="text-black"><strong>Email:</strong> {application.user.email}</p>
            <p className="text-black"><strong>Phone:</strong> {application.phoneNumber || 'N/A'}</p>
            <p className="text-black"><strong>BVN:</strong> {application.bvn || 'N/A'}</p>
            <p className="text-black"><strong>NIN:</strong> {application.nin || 'N/A'}</p>
            <p className="text-black"><strong>Address:</strong> {[application.addressNumber, application.streetName, application.nearestBusStop, application.state, application.localGovernment].filter(Boolean).join(', ') || 'N/A'}</p>
            <p className="text-black"><strong>Marital Status:</strong> {application.maritalStatus || 'N/A'}</p>
            <p className="text-black"><strong>Home Ownership:</strong> {application.homeOwnership || 'N/A'}</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Employment/Business Information</Label>
          <div className="mt-2 space-y-2">
            {application.employerName && <p className="text-black"><strong>Employer:</strong> {application.employerName}</p>}
            {application.jobTitle && <p className="text-black"><strong>Job Title:</strong> {application.jobTitle}</p>}
            {application.workEmail && <p className="text-black"><strong>Work Email:</strong> {application.workEmail}</p>}
            {application.netSalary && <p className="text-black"><strong>Net Salary:</strong> {formatCurrency(Number(application.netSalary))}</p>}
            {application.businessName && <p className="text-black"><strong>Business Name:</strong> {application.businessName}</p>}
            {application.businessDescription && <p className="text-black"><strong>Business Description:</strong> {application.businessDescription}</p>}
            {application.industry && <p className="text-black"><strong>Industry:</strong> {application.industry}</p>}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Loan Information</Label>
          <div className="mt-2 space-y-2">
            <p className="text-black"><strong>Amount:</strong> {formatCurrency(Number(application.loanAmount))}</p>
            <p className="text-black"><strong>Tenure:</strong> {application.tenure} months</p>
            {(application.loanType === 'salary-car' || application.loanType === 'business-car') && (
              <>
                {application.vehicleMake && <p className="text-black"><strong>Vehicle Make:</strong> {application.vehicleMake}</p>}
                {application.vehicleModel && <p className="text-black"><strong>Vehicle Model:</strong> {application.vehicleModel}</p>}
                {application.vehicleYear && <p className="text-black"><strong>Vehicle Year:</strong> {application.vehicleYear}</p>}
                {application.vehicleAmount && <p className="text-black"><strong>Vehicle Amount:</strong> {formatCurrency(Number(application.vehicleAmount))}</p>}
              </>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Next of Kin Information</Label>
          <div className="mt-2 space-y-2">
            {application.nokFirstName && <p className="text-black"><strong>Name:</strong> {application.nokFirstName} {application.nokLastName}</p>}
            {application.nokRelationship && <p className="text-black"><strong>Relationship:</strong> {application.nokRelationship}</p>}
            {application.nokPhone && <p className="text-black"><strong>Phone:</strong> {application.nokPhone}</p>}
            {application.nokEmail && <p className="text-black"><strong>Email:</strong> {application.nokEmail}</p>}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Bank Account Details</Label>
          <div className="mt-2 space-y-2">
            {application.bankName && <p className="text-black"><strong>Bank Name:</strong> {application.bankName}</p>}
            {application.accountName && <p className="text-black"><strong>Account Name:</strong> {application.accountName}</p>}
            {application.accountNumber && <p className="text-black"><strong>Account Number:</strong> {application.accountNumber}</p>}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Documents</Label>
          <div className="mt-2">
            {application.documents && application.documents.length > 0 ? (
              application.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <span className="text-black">{doc.fileName || doc.documentType || `Document ${index + 1}`}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDocumentDownload(doc.id, doc.fileName)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No documents uploaded</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Timeline</Label>
          <div className="mt-2 space-y-2">
            <p className="text-black"><strong>Submitted:</strong> {formatDate(application.createdAt)}</p>
            {application.reviewedAt && (
              <p className="text-black"><strong>Reviewed:</strong> {formatDate(application.reviewedAt)}</p>
            )}
            {application.reviewedBy && (
              <p className="text-black"><strong>Reviewed By:</strong> {application.reviewedBy}</p>
            )}
          </div>
        </div>

        {application.notes && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Notes</Label>
            <p className="mt-2 p-3 bg-gray-50 rounded text-black">{application.notes}</p>
          </div>
        )}
      </div>

      {application.status === 'PENDING' && (
        <div className="flex gap-4 pt-4 border-t">
          {!showRejectForm ? (
            <>
              <Button 
                onClick={() => onApprove(application)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Application
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Application
              </Button>
            </>
          ) : (
            <div className="w-full space-y-4">
              <div>
                <Label htmlFor="rejectReason" className="text-gray-700">Rejection Reason</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="mt-2 text-black placeholder:text-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRejectSubmit} variant="destructive">
                  Confirm Rejection
                </Button>
                <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface RejectApplicationModalProps {
  application: LoanApplication;
  onReject: (application: LoanApplication, reason: string) => void;
}

function RejectApplicationModal({ application, onReject }: RejectApplicationModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(application, reason);
    }
  };

  return (
    <div className="space-y-4 bg-white text-black">
      <DialogHeader>
        <DialogTitle className="text-black">Reject Application</DialogTitle>
      </DialogHeader>
      <div>
        <p className="text-sm text-gray-600 mb-4">
          You are about to reject the application for <strong className="text-black">{application.user.firstName} {application.user.lastName}</strong>.
          Please provide a reason for the rejection.
        </p>
        <Label htmlFor="reason" className="text-gray-700">Rejection Reason</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a detailed reason for rejection..."
          className="mt-2 text-black placeholder:text-gray-500"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setReason('')}>
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleSubmit}
          disabled={!reason.trim()}
        >
          Confirm Rejection
        </Button>
      </div>
    </div>
  );
}

interface ApproveApplicationModalProps {
  application: LoanApplication;
  onApprove: (application: LoanApplication, approvedAmount: number, approvedTenure: string) => void;
  onCancel: () => void;
}

function ApproveApplicationModal({ application, onApprove, onCancel }: ApproveApplicationModalProps) {
  const [approvedAmount, setApprovedAmount] = useState<number>(application.loanAmount);
  const [formattedAmount, setFormattedAmount] = useState<string>(application.loanAmount.toLocaleString());
  const [approvedTenure, setApprovedTenure] = useState<string>('12 months');

  // Format the initial amount on component mount
  useEffect(() => {
    setFormattedAmount(application.loanAmount.toLocaleString());
  }, [application.loanAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters and parse to number
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    
    // Update the numeric state
    setApprovedAmount(numericValue);
    
    // Format with commas for display
    setFormattedAmount(numericValue.toLocaleString());
  };

  const handleSubmit = () => {
    if (approvedAmount > 0 && approvedTenure) {
      onApprove(application, approvedAmount, approvedTenure);
    }
  };

  return (
    <div className="space-y-4 bg-white text-black">
      <DialogHeader>
        <DialogTitle className="text-black">Approve Application</DialogTitle>
      </DialogHeader>
      <div>
        <p className="text-sm text-gray-600 mb-4">
          You are about to approve the application for <strong className="text-black">{application.user.firstName} {application.user.lastName}</strong>.
          Please specify the approved amount and tenure.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="approvedAmount" className="text-gray-700">Approved Amount (₦)</Label>
            <Input
              id="approvedAmount"
              type="text"
              value={formattedAmount}
              onChange={handleAmountChange}
              className="mt-2 text-black"
              placeholder="Enter amount"
            />
          </div>
          
          <div>
            <Label htmlFor="approvedTenure" className="text-gray-700">Approved Tenure</Label>
            <Select 
              value={approvedTenure} 
              onValueChange={setApprovedTenure}
            >
              <SelectTrigger className="mt-2 text-black">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3 months">3 months</SelectItem>
                <SelectItem value="6 months">6 months</SelectItem>
                <SelectItem value="9 months">9 months</SelectItem>
                <SelectItem value="12 months">12 months</SelectItem>
                <SelectItem value="15 months">15 months</SelectItem>
                <SelectItem value="18 months">18 months</SelectItem>
                <SelectItem value="21 months">21 months</SelectItem>
                <SelectItem value="24 months">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={handleSubmit}
          disabled={approvedAmount <= 0 || !approvedTenure}
        >
          Confirm Approval
        </Button>
      </div>
    </div>
  );
}
