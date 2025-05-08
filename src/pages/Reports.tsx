
import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, DateRange } from '@/data/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Reports: React.FC = () => {
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = expense.date.split('T')[0];
      return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
    });
  }, [expenses, dateRange]);
  
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);
  
  const averageDaily = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return totalAmount / daysDiff;
  }, [filteredExpenses, dateRange, totalAmount]);
  
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      amount: value,
    }));
  }, [filteredExpenses]);
  
  const trendsData = useMemo(() => {
    const data: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      const date = expense.date.split('T')[0];
      if (!data[date]) {
        data[date] = 0;
      }
      data[date] += expense.amount;
    });
    
    return Object.entries(data)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        amount,
      }));
  }, [filteredExpenses]);
  
  const generateReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Expense Report', 14, 22);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(`Period: ${new Date(dateRange.startDate).toLocaleDateString('en-IN')} to ${new Date(dateRange.endDate).toLocaleDateString('en-IN')}`, 14, 32);
    
    // Add summary
    doc.text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`, 14, 42);
    doc.text(`Average Daily Expense: ₹${averageDaily.toFixed(2)}`, 14, 52);
    
    // Create table
    const tableColumn = ["Date", "Category", "Amount (₹)", "Description"];
    const tableRows: any[] = [];
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString('en-IN');
      const tableRow = [
        date,
        expense.category,
        expense.amount.toLocaleString('en-IN'),
        expense.description || '-',
      ];
      tableRows.push(tableRow);
    });
    
    // @ts-ignore - jsPDF-AutoTable extension
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'striped',
      headStyles: { fillColor: [255, 126, 69] },
    });
    
    // Save the PDF
    doc.save('expense-report.pdf');
  };
  
  return (
    <Layout>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Reports & Analytics</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
            <CardDescription>Customize the report period and grouping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-by">Group By</Label>
                <Select value={groupBy} onValueChange={(value: 'day' | 'week' | 'month') => setGroupBy(value)}>
                  <SelectTrigger id="group-by">
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={generateReport} 
              className="mt-4 bg-food-blue hover:bg-food-blue/90"
            >
              Generate PDF Report
            </Button>
          </CardContent>
        </Card>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Spend</div>
                    <div className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Average Daily</div>
                    <div className="text-2xl font-bold">₹{averageDaily.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Number of Expenses</div>
                    <div className="text-2xl font-bold">{filteredExpenses.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Tabs defaultValue="categories">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="categories">By Category</TabsTrigger>
                <TabsTrigger value="trend">Spending Trend</TabsTrigger>
              </TabsList>
              <TabsContent value="categories" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    {categoryData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={categoryData}
                            layout="vertical"
                            margin={{
                              top: 5,
                              right: 30,
                              left: 60,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip formatter={(value) => `₹${value}`} />
                            <Bar dataKey="amount" fill="#FF7E45" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">No expense data in this period</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="trend" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    {trendsData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trendsData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value}`} />
                            <Line type="monotone" dataKey="amount" stroke="#4CAF50" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">No expense data in this period</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Detailed Expenses</CardTitle>
            <CardDescription>All expenses within the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <div className="border rounded-md">
                <div className="grid grid-cols-4 font-medium p-3 border-b">
                  <div>Date</div>
                  <div>Category</div>
                  <div>Description</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="divide-y">
                  {filteredExpenses
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <div key={expense.id} className="grid grid-cols-4 p-3">
                        <div>{new Date(expense.date).toLocaleDateString('en-IN')}</div>
                        <div className="capitalize">{expense.category}</div>
                        <div>{expense.description || '—'}</div>
                        <div className="text-right">₹{expense.amount.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expenses found in the selected date range</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
