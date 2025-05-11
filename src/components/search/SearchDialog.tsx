
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/use-toast';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock suggestion data - in real app this would come from a backend
const suggestionCategories = {
  expenses: ['Food Expenses', 'Rent Expenses', 'Travel Expenses', 'Coffee Expenses', 'Grocery Expenses'],
  groups: ['Family Group', 'Friends Group', 'Roommates Group', 'Office Group', 'Trip Group'],
  categories: ['Food', 'Rent', 'Utilities', 'Entertainment', 'Transport']
};

type SuggestionType = {
  text: string;
  category: string;
};

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'dark' | 'light';
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 200);
  const { toast } = useToast();

  // Handle clicks outside of suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions based on search query
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 1) {
      const results: SuggestionType[] = [];
      
      // Search through all categories
      Object.entries(suggestionCategories).forEach(([category, items]) => {
        const matches = items.filter(item => 
          item.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        
        matches.forEach(match => {
          results.push({ text: match, category });
        });
      });
      
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(results.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to search results
    navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
    
    // Close dialog
    onOpenChange(false);
    setShowSuggestions(false);
    
    // Show toast
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}"`,
    });
  };

  const handleSuggestionClick = (suggestion: SuggestionType) => {
    setSearchQuery(suggestion.text);
    navigate(`/reports?search=${encodeURIComponent(suggestion.text)}&category=${suggestion.category}`);
    setShowSuggestions(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-4 mt-2">
          <div className="relative">
            <Input 
              ref={searchInputRef}
              placeholder="Search expenses, groups, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className={`absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg border z-10 ${
                  mode === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {suggestions.map((suggestion, i) => (
                  <div 
                    key={i}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                      mode === 'dark'
                        ? 'hover:bg-gray-700 text-white' 
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center">
                      <Search className={`h-4 w-4 mr-2 ${
                        mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span>{suggestion.text}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs mr-2 px-2 py-1 rounded-full ${
                        mode === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {suggestion.category}
                      </span>
                      <ArrowRight className={`h-4 w-4 ${
                        mode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Search</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
