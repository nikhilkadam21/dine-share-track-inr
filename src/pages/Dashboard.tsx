
import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Layout from '@/components/Layout';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseSummary from '@/components/ExpenseSummary';
import SharedExpense from '@/components/SharedExpense';
import { Expense } from '@/data/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Dashboard: React.FC = () => {
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  
  return (
    <Layout>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-2">
          <h1 className="text-2xl font-bold tracking-tight mb-4">Dashboard</h1>
          <div className="space-y-6">
            <ExpenseSummary />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {expenses.length > 0 ? (
                    <div className="space-y-2">
                      {expenses.slice().reverse().map((expense) => {
                        const date = new Date(expense.date);
                        return (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 food-icon-bg">
                                {expense.category.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium capitalize">
                                  {expense.category}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {expense.description || 'No description'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                ₹{expense.amount.toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {date.toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-muted-foreground mb-2">No expenses yet</p>
                      <p className="text-sm text-muted-foreground">
                        Add your first expense using the form on the right
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          <ExpenseForm />
          <SharedExpense expenses={expenses} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
