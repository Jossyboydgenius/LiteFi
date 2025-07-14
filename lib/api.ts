// Placeholder API functions for the demo
// These would connect to your actual backend API

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    // Placeholder implementation
    console.log("Login attempt:", credentials);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check for admin credentials
    if (
      credentials.email === "admin@litefi.ng" &&
      credentials.password === "Password1!"
    ) {
      return {
        user: { id: "admin", email: credentials.email, role: "admin" },
        accessToken: "admin-demo-token",
        message: "Admin login successful",
      };
    }

    // For demo purposes, always redirect to a loan selection page
    return {
      user: { id: "1", email: credentials.email, role: "user" },
      accessToken: "demo-token",
      message: "Login successful",
    };
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    country: string;
    referralCode?: string;
  }) => {
    // Placeholder implementation
    console.log("Registration attempt:", userData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      data: { user: { id: "1", email: userData.email } },
      message: "Registration successful",
    };
  },

  verifyEmail: async (data: { email: string; code: string }) => {
    // Placeholder implementation
    console.log("Email verification attempt:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "Email verified successfully",
    };
  },

  resendOtp: async (data: { email: string; type: string }) => {
    // Placeholder implementation
    console.log("Resend OTP attempt:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "OTP sent successfully",
    };
  },

  requestPasswordReset: async (data: { email: string }) => {
    // Placeholder implementation
    console.log("Password reset request:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "Password reset code sent successfully",
    };
  },

  confirmPasswordReset: async (data: {
    email: string;
    code: string;
    newPassword: string;
  }) => {
    // Placeholder implementation
    console.log("Password reset confirmation:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "Password reset successfully",
    };
  },
};
