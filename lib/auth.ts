import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  return !!(token && userId);
};

// Get current user data
export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

// Hook to redirect if already authenticated
export const useRedirectIfAuthenticated = () => {
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      const targetPath = user?.role === 'ADMIN' ? '/console' : '/dashboard';
      router.replace(targetPath);
    }
  }, [router]);
};

// Set authentication token and user data
export const setAuthToken = (token: string, userId: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    
    // Set cookie for middleware compatibility
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict${isSecure ? '; secure' : ''}`;
  }
};

// Clear authentication data
export const clearAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    
    // Clear auth cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

// Handle successful authentication
export const handleAuthSuccess = () => {
  // This function can be used for any post-authentication logic
  return;
};
