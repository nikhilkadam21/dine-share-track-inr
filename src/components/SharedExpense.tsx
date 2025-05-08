
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface SharedExpenseProps {
  expenses: Expense[];
}

const SharedExpense: React.FC<SharedExpenseProps> = ({ expenses }) => {
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>(expenses);
  const { toast } = useToast();
  
  const handleShare = (method: 'whatsapp' | 'email' | 'copy') => {
    if (selectedExpenses.length === 0) {
      toast({
        title: "No expenses selected",
        description: "Please select at least one expense to share",
        variant: "destructive",
      });
      return;
    }
    
    const total = selectedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    let message = `My Expense Summary (₹${total.toLocaleString('en-IN')})\n\n`;
    selectedExpenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString('en-IN');
      message += `${date} - ${expense.category}: ₹${expense.amount} ${expense.description ? `(${expense.description})` : ''}\n`;
    });
    
    switch (method) {
      case 'whatsapp':
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        break;
      case 'email':
        const subject = encodeURIComponent('My Expense Summary');
        const body = encodeURIComponent(message);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(message);
        toast({
          title: "Copied to clipboard",
          description: "You can now paste the expense summary",
        });
        break;
    }
  };
  
  const generatePDF = () => {
    if (selectedExpenses.length === 0) {
      toast({
        title: "No expenses selected",
        description: "Please select at least one expense to download",
        variant: "destructive",
      });
      return;
    }
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Expense Summary', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 32);
    
    // Create table
    const tableColumn = ["Date", "Category", "Amount (₹)", "Description"];
    const tableRows: any[] = [];
    
    selectedExpenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString('en-IN');
      const tableRow = [
        date,
        expense.category,
        expense.amount.toLocaleString('en-IN'),
        expense.description || '-',
      ];
      tableRows.push(tableRow);
    });
    
    const totalAmount = selectedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // @ts-ignore - jsPDF-AutoTable extension
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [255, 126, 69] },
    });
    
    // Add total amount
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(14);
    doc.text(`Total: ₹${totalAmount.toLocaleString('en-IN')}`, 14, finalY + 20);
    
    // Save the PDF
    doc.save('expense-summary.pdf');
    
    toast({
      title: "PDF Generated",
      description: "Your expense report has been downloaded",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Share & Download</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button 
            variant="outline"
            className="flex flex-col items-center p-4 h-auto space-y-2"
            onClick={() => handleShare('whatsapp')}
          >
            <span>WhatsApp</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center p-4 h-auto space-y-2"
            onClick={() => handleShare('email')}
          >
            <span>Email</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center p-4 h-auto space-y-2"
            onClick={() => handleShare('copy')}
          >
            <span>Copy Link</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center p-4 h-auto space-y-2 text-food-blue"
            onClick={generatePDF}
          >
            <span>PDF</span>
          </Button>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2">
              Advanced Options
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                    <Input 
                      id="start-date"
                      type="date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs">End Date</Label>
                    <Input 
                      id="end-date"
                      type="date"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    onClick={generatePDF}
                    className="w-full"
                  >
                    PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // For CSV implementation
                      toast({
                        title: "CSV Export",
                        description: "This feature will be available in future updates",
                      });
                    }}
                    className="w-full"
                  >
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SharedExpense;
