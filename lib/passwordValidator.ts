// Password validation utility
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: number;
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  let strength = 0;

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    strength += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    strength += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    strength += 1;
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    strength += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  } else {
    strength += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};
