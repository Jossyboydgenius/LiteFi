"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ResetPasswordVerificationModal from "@/app/components/ResetPasswordVerificationModal";
import { ToastProvider, useToastContext } from "@/app/components/ToastProvider";
import { Toaster } from "@/components/ui/toaster";
import { authApi } from "@/lib/api";

import logoImage from "@/public/assets/images/logo.png";

// More comprehensive email validation regex
const EMAIL_REGEX = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function ResetPasswordContent() {
  const [email, setEmail] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const router = useRouter();
  const { success, error } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) {
      setEmailTouched(true);
      return;
    }

    setIsLoading(true);
    try {
      // Request password reset
      const response = await authApi.requestPasswordReset({ email });
      
      // Store email for the verification step
      sessionStorage.setItem('resetPasswordEmail', email);
      
      // Show success message and verification modal
      success("Reset email sent", "Please check your email for the verification code");
      setShowVerificationModal(true);
    } catch (err: any) {
      // Extract error message
      let errorMessage = "An unexpected error occurred";
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      error("Reset password failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true);
    try {
      // Store OTP for create new password page
      sessionStorage.setItem('resetPasswordOtp', otp);
      
      // Close modal and redirect to create new password page
      setShowVerificationModal(false);
      router.push(`/reset-password/create-new-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      let errorMessage = err?.message || "Failed to verify OTP";
      error("Verification failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Request new password reset
      await authApi.requestPasswordReset({ email });
      success("OTP Resent", "A new verification code has been sent to your email");
    } catch (err: any) {
      let errorMessage = err?.message || "Failed to resend OTP";
      error("Resend failed", errorMessage);
    }
  };

  const handleChangeEmail = () => {
    setShowVerificationModal(false);
  };

  const isEmailValid = EMAIL_REGEX.test(email);
  const showEmailError = emailTouched && !isEmailValid;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image 
            src={logoImage} 
            alt="LiteFi Logo" 
            width={100}
            height={30}
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-black">Forgot Password</h1>
          <p className="text-gray-500">Provide the following details to reset your password</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800 font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                className={`bg-gray-50 h-12 text-black placeholder:text-gray-500 ${showEmailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                required
                disabled={isLoading}
              />
              {showEmailError && (
                <p className="text-xs text-red-500">Please enter a valid email address</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 h-12 mt-6 text-white"
              disabled={!isEmailValid || isLoading}
            >
              {isLoading ? "Sending Reset Email..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-red-600 hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Reset Password Verification Modal */}
      {showVerificationModal && (
        <ResetPasswordVerificationModal
          email={email}
          onCloseAction={() => setShowVerificationModal(false)}
          onVerifyAction={handleVerifyOtp}
          onResendOtpAction={handleResendOtp}
          onChangeEmailAction={handleChangeEmail}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <ToastProvider>
      <ResetPasswordContent />
      <Toaster />
    </ToastProvider>
  );
}
