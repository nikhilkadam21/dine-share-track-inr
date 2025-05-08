
import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, ExpenseCategory } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'other', label: 'Other' },
];

interface ExpenseFormProps {
  onExpenseAdded?: (expense: Expense) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseAdded }) => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('lunch');
  const [description, setDescription] = useState<string>('');
  
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    const newExpense: Expense = {
      id: uuidv4(),
      amount: Number(amount),
      category,
      description,
      date: new Date().toISOString(),
    };
    
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    
    // Reset form
    setAmount('');
    setCategory('lunch');
    setDescription('');
    
    toast({
      title: "Expense added",
      description: `₹${amount} added for ${category}`,
    });
    
    if (onExpenseAdded) {
      onExpenseAdded(newExpense);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: ExpenseCategory) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g. Lunch at office canteen"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <Button type="submit" className="w-full bg-food-green hover:bg-food-green/90">
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
