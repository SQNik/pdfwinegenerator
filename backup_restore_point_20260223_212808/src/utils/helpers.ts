import { v4 as uuidv4 } from 'uuid';

export const generateId = (prefix: string): string => {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  return `${prefix}_${timestamp}_${uuid}`;
};

export const sanitizeString = (str: string): string => {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const parseNumericValue = (value: string | number): number | null => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

export const formatCurrency = (value: string | number, currency = 'PLN'): string => {
  const numValue = parseNumericValue(value);
  if (numValue === null) return '';
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(numValue);
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};