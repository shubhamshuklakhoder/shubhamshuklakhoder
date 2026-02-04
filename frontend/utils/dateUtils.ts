import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const formatExpenseDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Today';
    }
    
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
