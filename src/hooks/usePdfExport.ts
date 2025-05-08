
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
}

export const usePdfExport = () => {
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
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
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(title, 14, 22);
      
      // Add date range if provided
      if (options?.dateRange) {
        const startDate = format(new Date(options.dateRange.startDate), 'PPP');
        const endDate = format(new Date(options.dateRange.endDate), 'PPP');
        doc.setFontSize(12);
        doc.text(`Period: ${startDate} - ${endDate}`, 14, 32);
      }
      
      // Add timestamp
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'PPPp')}`, 14, 38);
      
      // Prepare data for table
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
      
      // Create table
      autoTable(doc, {
        head: [['Date', 'Category', 'Description', 'Amount']],
        body: tableData,
        startY: 45,
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [255, 126, 69], // Match FF7E45 color
          textColor: [255, 255, 255]
        }
      });
      
      // Add summary
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Summary', 14, finalY);
      
      const summaryData = Object.entries(categoryTotals).map(([category, amount]) => {
        return [
          category.charAt(0).toUpperCase() + category.slice(1),
          `₹${amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        ];
      });
      
      summaryData.push(['Total', `₹${totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`]);
      
      autoTable(doc, {
        body: summaryData,
        startY: finalY + 5,
        styles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        }
      });
      
      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          'Generated by DineShareTrack',
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      }
      
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
