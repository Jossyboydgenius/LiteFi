'use client';

import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
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
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Download, FileText, Users, DollarSign, TrendingUp, Calendar, FileSpreadsheet } from 'lucide-react';

interface LoanApplication {
  id: string;
  applicationId: string;
  loanId?: string;
  type: 'personal' | 'auto' | 'business';
  applicantName: string;
  email: string;
  phone: string;
  amount: number;
  purpose?: string;
  employmentStatus: string;
  monthlyIncome: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  documents: string[];
}

const generateId = () => nanoid(10);

const mockApplications: LoanApplication[] = [
  {
    id: '1',
    applicationId: generateId(),
    type: 'personal',
    applicantName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+234 801 234 5678',
    amount: 500000,
    purpose: 'Home renovation',
    employmentStatus: 'employed',
    monthlyIncome: 150000,
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
    documents: ['id_card.pdf', 'salary_slip.pdf', 'bank_statement.pdf']
  },
  {
    id: '2',
    applicationId: generateId(),
    loanId: generateId(),
    type: 'auto',
    applicantName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+234 802 345 6789',
    amount: 2500000,
    purpose: 'Toyota Camry 2020',
    employmentStatus: 'employed',
    monthlyIncome: 350000,
    status: 'approved',
    submittedAt: '2024-01-14T14:20:00Z',
    reviewedAt: '2024-01-15T09:45:00Z',
    reviewedBy: 'Admin User',
    notes: 'Good credit history and stable income.',
    documents: ['id_card.pdf', 'driver_license.pdf', 'insurance.pdf', 'vehicle_inspection.pdf']
  },
  {
    id: '3',
    applicationId: generateId(),
    type: 'business',
    applicantName: 'Michael Adebayo',
    email: 'michael.adebayo@business.com',
    phone: '+234 803 456 7890',
    amount: 5000000,
    purpose: 'Equipment purchase for manufacturing',
    employmentStatus: 'business-owner',
    monthlyIncome: 800000,
    status: 'rejected',
    submittedAt: '2024-01-13T16:15:00Z',
    reviewedAt: '2024-01-14T11:30:00Z',
    reviewedBy: 'Admin User',
    notes: 'Insufficient business documentation provided.',
    documents: ['business_registration.pdf', 'tax_certificate.pdf']
  }
];

export default function AdminDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesType = filterType === 'all' || app.type === filterType;
    const matchesSearch = searchTerm === '' || 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    totalAmount: applications
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + app.amount, 0)
  };

  const handleApprove = (application: LoanApplication) => {
    const loanId = generateId();
    const updatedApplications = applications.map(app =>
      app.id === application.id
        ? {
            ...app,
            status: 'approved' as const,
            loanId,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Admin User',
            notes: `Loan approved with ID: ${loanId}`
          }
        : app
    );
    setApplications(updatedApplications);
    toast({
      title: "Application Approved",
      description: `Loan ID ${loanId} has been generated for ${application.applicantName}`,
      variant: "default"
    });
  };

  const handleReject = (application: LoanApplication, reason: string) => {
    const updatedApplications = applications.map(app =>
      app.id === application.id
        ? {
            ...app,
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Admin User',
            notes: reason
          }
        : app
    );
    setApplications(updatedApplications);
    toast({
      title: "Application Rejected",
      description: `Application for ${application.applicantName} has been rejected`,
      variant: "destructive"
    });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      personal: 'Personal',
      auto: 'Auto',
      business: 'Business'
    };
    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels]}</Badge>;
  };

  const exportToCSV = () => {
    const csvData = applications.map(app => ({
      'Application ID': app.applicationId,
      'Loan ID': app.loanId || '',
      'Type': app.type,
      'Applicant Name': app.applicantName,
      'Email': app.email,
      'Phone': app.phone,
      'Amount': app.amount,
      'Status': app.status,
      'Submitted At': formatDate(app.submittedAt),
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

    toast({
      title: "Export Successful",
      description: "Applications data has been exported to CSV",
      variant: "default"
    });
    setShowExportModal(false);
  };

  const exportToPDF = () => {
    // Simulate PDF export
    const pdfContent = `
LiteFi Loan Applications Report
Generated on: ${new Date().toLocaleDateString()}

Total Applications: ${stats.total}
Pending: ${stats.pending}
Approved: ${stats.approved}
Rejected: ${stats.rejected}
Total Approved Amount: ${formatCurrency(stats.totalAmount)}

Applications:
${applications.map(app => `
Application ID: ${app.applicationId}
Loan ID: ${app.loanId || 'N/A'}
Type: ${app.type}
Applicant: ${app.applicantName}
Email: ${app.email}
Amount: ${formatCurrency(app.amount)}
Status: ${app.status}
Submitted: ${formatDate(app.submittedAt)}
${app.reviewedAt ? `Reviewed: ${formatDate(app.reviewedAt)}` : ''}
${app.notes ? `Notes: ${app.notes}` : ''}
---
`).join('')}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_applications_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Applications data has been exported to PDF",
      variant: "default"
    });
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage loan applications and track performance</p>
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
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Type</TableHead>
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
                      <TableCell className="font-mono text-sm">{application.applicationId}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {application.loanId || '-'}
                      </TableCell>
                      <TableCell>{getTypeBadge(application.type)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.applicantName}</div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(application.amount)}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-sm">{formatDate(application.submittedAt)}</TableCell>
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
                                  onApprove={handleApprove}
                                  onReject={handleReject}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          {application.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(application)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ApplicationDetailsModalProps {
  application: LoanApplication;
  onApprove: (application: LoanApplication) => void;
  onReject: (application: LoanApplication, reason: string) => void;
}

function ApplicationDetailsModal({ application, onApprove, onReject }: ApplicationDetailsModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

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

  return (
    <div className="space-y-6 bg-white text-black">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Application ID</Label>
          <p className="font-mono text-sm text-black">{application.applicationId}</p>
        </div>
        {application.loanId && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Loan ID</Label>
            <p className="font-mono text-sm text-black">{application.loanId}</p>
          </div>
        )}
        <div>
          <Label className="text-sm font-medium text-gray-700">Type</Label>
          <p className="capitalize text-black">{application.type}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Status</Label>
          <p className="capitalize text-black">{application.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Applicant Information</Label>
          <div className="mt-2 space-y-2">
            <p className="text-black"><strong>Name:</strong> {application.applicantName}</p>
            <p className="text-black"><strong>Email:</strong> {application.email}</p>
            <p className="text-black"><strong>Phone:</strong> {application.phone}</p>
            <p className="text-black"><strong>Employment:</strong> {application.employmentStatus}</p>
            <p className="text-black"><strong>Monthly Income:</strong> {formatCurrency(application.monthlyIncome)}</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Loan Information</Label>
          <div className="mt-2 space-y-2">
            <p className="text-black"><strong>Amount:</strong> {formatCurrency(application.amount)}</p>
            {application.purpose && <p className="text-black"><strong>Purpose:</strong> {application.purpose}</p>}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Documents</Label>
          <div className="mt-2">
            {application.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <span className="text-black">{doc}</span>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Timeline</Label>
          <div className="mt-2 space-y-2">
            <p className="text-black"><strong>Submitted:</strong> {formatDate(application.submittedAt)}</p>
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

      {application.status === 'pending' && (
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
          You are about to reject the application for <strong className="text-black">{application.applicantName}</strong>.
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
