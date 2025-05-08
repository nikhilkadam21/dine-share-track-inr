import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePdfExport } from '@/hooks/usePdfExport';
import Layout from '@/components/Layout';
import { Expense, ExpenseCategory, DateRange } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Loader2, FileDown, Check, FileText } from 'lucide-react';

const Reports: React.FC = () => {
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [userProfile] = useLocalStorage('userProfile', { name: 'User', email: '', phone: '' });
  const { exportToPdf, isExporting } = usePdfExport();
  
  // Filter states
  const [startDate, setStartDate] = useState<string>(
    format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);

  // Predefined time periods
  const timeOptions = [
    { label: 'Last 7 days', value: 'week' },
    { label: 'Last 30 days', value: 'month' },
    { label: 'Last 3 months', value: 'quarter' },
    { label: 'Last year', value: 'year' },
    { label: 'All time', value: 'all' },
    { label: 'Custom range', value: 'custom' },
  ];

  const [timePeriod, setTimePeriod] = useState('month');

  // Category options
  const categories: { value: ExpenseCategory; label: string }[] = [
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'groceries', label: 'Groceries' },
    { value: 'other', label: 'Other' },
  ];

  // Handle time period change
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);

    const today = new Date();
    let newStartDate;

    switch (value) {
      case 'week':
        newStartDate = subDays(today, 7);
        break;
      case 'month':
        newStartDate = subDays(today, 30);
        break;
      case 'quarter':
        newStartDate = subMonths(today, 3);
        break;
      case 'year':
        newStartDate = subYears(today, 1);
        break;
      case 'all':
        // Find the earliest expense date or default to one year ago
        if (expenses.length > 0) {
          const dates = expenses.map(exp => new Date(exp.date).getTime());
          newStartDate = new Date(Math.min(...dates));
        } else {
          newStartDate = subYears(today, 1);
        }
        break;
      default: // 'custom' or fallback
        return; // Don't change the dates for custom
    }

    setStartDate(format(newStartDate, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  // Toggle category selection
  const handleCategoryChange = (category: ExpenseCategory, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  // Handle PDF export with username
  const handleExport = () => {
    const dateRange: DateRange = {
      startDate,
      endDate,
    };

    exportToPdf('Expense Report', {
      dateRange,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      userName: userProfile.name || 'User',
    });
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Reports & Export</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-food-orange/10 to-food-yellow/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-food-orange" />
              Generate Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="time-period">Time Period</Label>
                <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                  <SelectTrigger id="time-period" className="transition-all duration-200 hover:border-food-orange">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {timePeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="transition-all duration-200 hover:border-food-orange"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="transition-all duration-200 hover:border-food-orange"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {categories.map((category) => (
                    <div
                      key={category.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.value, checked === true)
                        }
                        className="data-[state=checked]:bg-food-orange data-[state=checked]:border-food-orange"
                      />
                      <Label
                        htmlFor={`category-${category.value}`}
                        className="text-sm font-normal"
                      >
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave all unchecked to include all categories
                </p>
              </div>

              <Button
                onClick={handleExport}
                className="w-full bg-gradient-to-r from-food-orange to-food-yellow hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 shadow-md"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card-3d">
          <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10 rounded-t-lg">
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">
                Export your expense data in different formats for your records or
                further analysis.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium">PDF Report</span>
                  <div className="bg-green-100 rounded-full p-1">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium">CSV Export</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-muted-foreground">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium">Excel Export</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-muted-foreground">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium">Google Sheets</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-muted-foreground">Coming Soon</span>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-xs text-muted-foreground">
                  Note: PDF Reports include transaction details, summary charts, and daily spending analysis for the selected time period.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
