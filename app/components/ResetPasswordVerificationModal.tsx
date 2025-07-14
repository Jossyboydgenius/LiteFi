"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ResetPasswordVerificationModalProps {
  email: string;
  onCloseAction: () => void;
  onVerifyAction: (otp: string) => void;
  onResendOtpAction: () => void;
  onChangeEmailAction: () => void;
  isLoading: boolean;
}

export default function ResetPasswordVerificationModal({
  email,
  onCloseAction,
  onVerifyAction,
  onResendOtpAction,
  onChangeEmailAction,
  isLoading
}: ResetPasswordVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerifyAction(otp);
    }
  };

  const handleResend = () => {
    onResendOtpAction();
    setCountdown(60);
    setCanResend(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onCloseAction}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <Label htmlFor="otp" className="text-gray-800 font-medium">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest text-black placeholder:text-gray-500"
              maxLength={6}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Didn't receive the code?
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="text-red-600 hover:text-red-700"
            >
              {canResend ? "Resend Code" : `Resend in ${countdown}s`}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onChangeEmailAction}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-700"
            >
              Change Email Address
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
