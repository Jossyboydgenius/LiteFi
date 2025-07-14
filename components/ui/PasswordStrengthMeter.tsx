import React from 'react';
import { validatePassword } from '@/lib/passwordValidator';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const validation = validatePassword(password);
  
  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded ${
              level <= validation.strength
                ? getStrengthColor(validation.strength)
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${
        validation.strength <= 2 ? 'text-red-500' : 
        validation.strength <= 3 ? 'text-yellow-600' : 
        'text-green-600'
      }`}>
        Password strength: {getStrengthText(validation.strength)}
      </p>
    </div>
  );
}
