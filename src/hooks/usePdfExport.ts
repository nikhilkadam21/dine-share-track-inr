
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, DateRange, ExpenseCategory } from '@/data/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportOptions {
  dateRange?: DateRange;
  categories?: ExpenseCategory[];
  groupId?: string;
  userName?: string;
}

export const usePdfExport = () => {
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [userProfile] = useLocalStorage('userProfile', { name: 'User', email: '', phone: '' });
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter expenses based on options
  const filterExpenses = (options?: ExportOptions): Expense[] => {
    let filteredExpenses = [...expenses];
    
    // Filter by date range
    if (options?.dateRange) {
      const startDate = new Date(options.dateRange.startDate);
      const endDate = new Date(options.dateRange.endDate);
      
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }
    
    // Filter by categories
    if (options?.categories && options.categories.length > 0) {
      filteredExpenses = filteredExpenses.filter(expense => 
        options.categories!.includes(expense.category)
      );
    }
    
    // Filter by group
    if (options?.groupId) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.groupId === options.groupId
      );
    }
    
    return filteredExpenses;
  };
  
  const exportToPdf = async (title: string = 'Expense Report', options?: ExportOptions) => {
    try {
      setIsExporting(true);
      
      const filteredExpenses = filterExpenses(options);
      
      // If no expenses, show message and return
      if (filteredExpenses.length === 0) {
        toast({
          title: "No expenses to export",
          description: "There are no expenses matching the selected filters",
          variant: "destructive",
        });
        setIsExporting(false);
        return;
      }
      
      // Create PDF document with custom font for better appearance
      const doc = new jsPDF();
      
      // Add a gradient background for 3D effect
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Create gradient background
      const addGradientBackground = () => {
        doc.saveGraphicsState();
        doc.setFillColor(255, 240, 230); // Light orange background
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Add subtle pattern for 3D effect
        doc.setDrawColor(255, 126, 69, 0.1);
        doc.setLineWidth(0.5);
        for (let i = 0; i < pageWidth; i += 10) {
          doc.line(i, 0, i, pageHeight);
        }
        doc.restoreGraphicsState();
      };
      
      addGradientBackground();
      
      // Add decorative header
      doc.setFillColor(255, 126, 69); // food-orange color
      doc.roundedRect(10, 10, pageWidth - 20, 25, 3, 3, 'F');
      
      // Add title with 3D text effect
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(title, 15, 25);
      
      // Add shadow effect
      doc.setFillColor(0, 0, 0, 0.1);
      doc.roundedRect(10, 10, pageWidth - 20, 26, 3, 3, 'F');
      
      // Add user name
      const userName = options?.userName || userProfile.name || 'User';
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(`Report for: ${userName}`, pageWidth - 15, 25, { align: 'right' });
      
      // Add date range if provided
      if (options?.dateRange) {
        const startDate = format(new Date(options.dateRange.startDate), 'PPP');
        const endDate = format(new Date(options.dateRange.endDate), 'PPP');
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text(`Period: ${startDate} - ${endDate}`, 15, 45);
      }
      
      // Add timestamp
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'PPPp')}`, 15, 52);
      
      // Organize expenses by date for daily spending
      const expensesByDate = filteredExpenses.reduce((acc, expense) => {
        const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(expense);
        return acc;
      }, {} as Record<string, Expense[]>);
      
      // Calculate daily totals
      const dailyTotals = Object.entries(expensesByDate).map(([date, dayExpenses]) => {
        const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        return {
          date: format(new Date(date), 'dd MMM yyyy'),
          total,
          count: dayExpenses.length
        };
      });
      
      // Add daily spending summary with 3D effect
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(15, 60, pageWidth - 30, 40, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, 60, pageWidth - 30, 40, 3, 3, 'S');
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(14);
      doc.text("Daily Spending Summary", 20, 70);
      
      // Create daily spending table
      const dailyTableData = dailyTotals.map(day => [
        day.date,
        day.count.toString() + (day.count === 1 ? ' expense' : ' expenses'),
        `₹${day.total.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      ]);
      
      // Only show last 5 days in summary to avoid overcrowding
      const recentDailyData = dailyTableData.slice(Math.max(0, dailyTableData.length - 5));
      
      autoTable(doc, {
        startY: 75,
        head: [['Date', 'Transactions', 'Amount']],
        body: recentDailyData,
        theme: 'striped',
        headStyles: {
          fillColor: [255, 126, 69],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          overflow: 'linebreak',
          fontSize: 10,
          cellPadding: 3
        },
        margin: { left: 20, right: 20 }
      });
      
      // Prepare data for main expense table
      const tableData = filteredExpenses.map(expense => {
        return [
          format(new Date(expense.date), 'yyyy-MM-dd'),
          expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
          expense.description || 'No description',
          `₹${expense.amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        ];
      });
      
      // Add summary data
      const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Group by category
      const categoryTotals: Record<string, number> = {};
      filteredExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
          categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
      });
      
      // Create detailed expense table
      doc.addPage();
      addGradientBackground();
      
      doc.setFillColor(255, 126, 69);
      doc.roundedRect(10, 10, pageWidth - 20, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("Detailed Expenses", 15, 23);
      
      autoTable(doc, {
        head: [['Date', 'Category', 'Description', 'Amount']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 4
        },
        headStyles: {
          fillColor: [255, 126, 69],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [252, 246, 240]
        }
      });
      
      // Add summary
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('Category Summary', 15, finalY);
      
      const summaryData = Object.entries(categoryTotals).map(([category, amount]) => {
        return [
          category.charAt(0).toUpperCase() + category.slice(1),
          `₹${amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        ];
      });
      
      summaryData.push([
        'Total', 
        `₹${totalAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      ]);
      
      autoTable(doc, {
        body: summaryData,
        startY: finalY + 5,
        styles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [252, 246, 240]
        }
      });
      
      // Add decorative footer with 3D effect
      const addFooter = () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          
          // Add gradient footer
          doc.setFillColor(255, 126, 69, 0.8);
          doc.roundedRect(10, pageHeight - 20, pageWidth - 20, 15, 2, 2, 'F');
          
          // Add shadow
          doc.setFillColor(0, 0, 0, 0.05);
          doc.roundedRect(10, pageHeight - 19, pageWidth - 20, 15, 2, 2, 'F');
          
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text(
            'Generated by DineShareTrack',
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 12,
            { align: 'center' }
          );
          
          doc.setFontSize(8);
          doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() - 20,
            doc.internal.pageSize.getHeight() - 12
          );
        }
      };
      
      addFooter();
      
      // Save the PDF
      const fileName = `expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Export successful",
        description: `Report saved as ${fileName}`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while generating the PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return {
    exportToPdf,
    isExporting
  };
};
