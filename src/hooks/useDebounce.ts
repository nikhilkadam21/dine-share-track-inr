
import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper function to check if a string contains a substring (case insensitive)
export function containsText(text: string, searchQuery: string): boolean {
  return text.toLowerCase().includes(searchQuery.toLowerCase());
}

// Helper function to filter expenses by search term
export function filterExpensesBySearchTerm(expenses: any[], searchTerm: string): any[] {
  if (!searchTerm.trim()) return [];
  
  return expenses.filter(expense => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
      (expense.category && expense.category.toLowerCase().includes(searchLower)) ||
      (expense.amount && expense.amount.toString().includes(searchTerm)) ||
      (expense.groupId && expense.groupId.toLowerCase().includes(searchLower))
    );
  }).slice(0, 5); // Limit to 5 results
}
