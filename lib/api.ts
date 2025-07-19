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

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
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

// Loan application functions
export async function submitLoanApplication(data: any, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/loan-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

export async function uploadDocument(file: File, documentType: string, loanApplicationId?: string, token?: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (loanApplicationId) {
      formData.append('loanApplicationId', loanApplicationId);
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
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
