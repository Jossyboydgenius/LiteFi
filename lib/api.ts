// API utility functions for frontend

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token?: string;
  accessToken?: string;
  error?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  data?: {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  token?: string;
  error?: string;
  message?: string;
}

// Dynamic API base URL detection for all environments
function getApiBaseUrl(): string {
  // Client-side: use current origin to avoid CORS
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side: detect environment
  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Netlify
  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL;
  }
  
  // Fallback to env var or localhost
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

const API_BASE_URL = getApiBaseUrl();

export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include' // Include cookies in the request
    });

    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: data
        }
      };
    }
    
    return data;
  } catch (error: any) {
    // If it's already a structured error, re-throw it
    if (error.response) {
      throw error;
    }
    
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

export async function register(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include' // Include cookies in the request
    });

    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw {
        message: data.error || 'Registration failed',
        error: data.error || 'Registration failed',
        response: {
          status: response.status,
          data: data
        }
      };
    }
    
    return data;
  } catch (error: any) {
    // If it's already a structured error, re-throw it
    if (error.response || error.message) {
      throw error;
    }
    
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

export async function verifyEmail(data: { email: string; code: string }): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Email verification failed' };
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function requestPasswordReset(data: { email: string }): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Password reset request failed' };
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function confirmPasswordReset(data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Password reset failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function resendOtp(data: {
  email: string;
  type: 'email' | 'password_reset';
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to resend OTP' };
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Loan application interfaces
export interface LoanApplication {
  id: string;
  loanType: string;
  status: string;
  loanAmount: number;
  tenure: number;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
  approvedAmount?: number;
  interestRate?: number;
  approvedTenure?: number;
  rejectionReason?: string;
  loanId?: string;
  personalInfo?: any;
  employmentInfo?: any;
  financialInfo?: any;
  businessInfo?: any;
  carInfo?: any;
  documents?: any;
}

export interface LoanApplicationsResponse {
  success: boolean;
  applications?: LoanApplication[];
  error?: string;
  message?: string;
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// API request helper with authentication
async function apiRequest(url: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include' // Include cookies in the request
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: data
        }
      };
    }
    
    return data;
  } catch (error: any) {
    if (error.response) {
      throw error;
    }
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

// Loan application functions
export async function getUserLoanApplications(): Promise<LoanApplicationsResponse> {
  try {
    return await apiRequest('/api/loan-applications');
  } catch (error: any) {
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Authentication required. Please login again.'
      };
    }
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch loan applications'
    };
  }
}

export async function submitLoanApplication(data: any, loanType?: string): Promise<any> {
  try {
    const endpoint = loanType ? `/api/loan-applications/${loanType}` : '/api/loan-applications';
    return await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit loan application'
    };
  }
}

export async function getLoanApplicationByType(type: string): Promise<any> {
  try {
    return await apiRequest(`/api/loan-applications/${type}`);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch loan application'
    };
  }
}

export async function uploadDocument(file: File, documentType: string, loanApplicationId?: string): Promise<any> {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (loanApplicationId) {
      formData.append('loanApplicationId', loanApplicationId);
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData,
      credentials: 'include'
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

// Admin API functions
export async function getAdminLoanApplications(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<any> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const url = `/api/admin/loan-applications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await apiRequest(url);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch loan applications'
    };
  }
}

export async function approveLoanApplication(id: string, data: {
  approvedAmount: number;
  interestRate: number;
  approvedTenure: number;
  notes?: string;
}): Promise<any> {
  try {
    return await apiRequest(`/api/admin/loan-applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to approve loan application'
    };
  }
}

export async function rejectLoanApplication(id: string, data: {
  reason: string;
  notes?: string;
}): Promise<any> {
  try {
    return await apiRequest(`/api/admin/loan-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to reject loan application'
    };
  }
}

// Auth API object for easier imports
export const authApi = {
  login,
  register,
  verifyEmail,
  resendOtp,
  requestPasswordReset,
  confirmPasswordReset,
};

// Admin API object for easier imports
export const adminApi = {
  getAdminLoanApplications,
  approveLoanApplication,
  rejectLoanApplication,
};
