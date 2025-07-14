// Utility functions for formatting numbers
export const formatCurrency = (value: string | number): string => {
  // Remove all non-digit characters
  const numericValue = value.toString().replace(/\D/g, "");

  // Return empty string if no digits
  if (!numericValue) return "";

  // Convert to number and format with commas
  return parseInt(numericValue, 10).toLocaleString();
};

export const unformatCurrency = (value: string): string => {
  // Remove all non-digit characters
  return value.replace(/\D/g, "");
};

export const formatAmount = (value: string): string => {
  return formatCurrency(value);
};

export const parseAmount = (value: string): number => {
  const numericValue = unformatCurrency(value);
  return numericValue ? parseInt(numericValue, 10) : 0;
};
