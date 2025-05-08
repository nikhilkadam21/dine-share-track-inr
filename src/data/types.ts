
export type ExpenseCategory = 
  | 'lunch' 
  | 'dinner' 
  | 'breakfast' 
  | 'snacks' 
  | 'beverages' 
  | 'groceries' 
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  tags?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
