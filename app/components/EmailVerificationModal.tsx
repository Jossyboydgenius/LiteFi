"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmailVerificationModalProps {
  email: string;
  onCloseAction: () => void;
  onVerifyAction: (otp: string) => Promise<void>;
  onResendOtpAction: () => Promise<void>;
  onChangeEmailAction: () => void;
  isLoading: boolean;
}

export default function EmailVerificationModal({
  email,
  onCloseAction,
  onVerifyAction,
  onResendOtpAction,
  onChangeEmailAction,
  isLoading
}: EmailVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleVerify = async () => {
    if (otp.trim()) {
      await onVerifyAction(otp);
    }
  };

  const handleResendOtp = async () => {
    if (canResend && !isLoading) {
      setCanResend(false);
      setCountdown(60);
      await onResendOtpAction();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a verification code to {email}. Please enter the code below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleVerify} 
              disabled={isLoading || otp.length !== 6}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleResendOtp}
              disabled={isLoading || !canResend}
              className="w-full"
            >
              {!canResend ? `Resend Code (${countdown}s)` : 'Resend Code'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onChangeEmailAction}
              disabled={isLoading}
              className="w-full"
            >
              Change Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
