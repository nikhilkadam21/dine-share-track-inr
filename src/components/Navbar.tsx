import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  User, 
  BarChart, 
  Users, 
  Home, 
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
  Search,
  X,
  ArrowRight
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserProfile } from '@/data/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from './ui/use-toast';

// Mock suggestion data - in real app this would come from a backend
const mockSuggestions = {
  'food': ['Chinese Food', 'Italian Food', 'Fast Food', 'Food Delivery'],
  'rent': ['Apartment Rent', 'House Rent', 'Office Rent'],
  'grocery': ['Weekly Grocery', 'Monthly Grocery', 'Grocery Budget'],
  'travel': ['Travel Expenses', 'Business Travel', 'Vacation Travel'],
  'dinner': ['Team Dinner', 'Family Dinner', 'Business Dinner'],
  'coffee': ['Morning Coffee', 'Coffee Budget', 'Coffee Shop'],
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [profile] = useLocalStorage<UserProfile | null>('user-profile', null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Search functionality
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Mobile search state
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
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
    if (debouncedQuery && debouncedQuery.length >= 2) {
      // Check mock data first
      const directMatches = mockSuggestions[debouncedQuery.toLowerCase() as keyof typeof mockSuggestions];
      if (directMatches) {
        setSuggestions(directMatches);
        setShowSuggestions(true);
        return;
      }
      
      // Otherwise find partial matches
      const allSuggestions = Object.values(mockSuggestions).flat();
      const filteredSuggestions = allSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      
      setSuggestions(filteredSuggestions.slice(0, 5));
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);
  
  const isActive = (path: string) => location.pathname === path;
  
  const getInitial = (name: string) => {
    return name?.charAt(0) || 'U';
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to search results
    navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
    
    // Close dialogs
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setShowSuggestions(false);
    
    // Show toast
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}"`,
    });
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    navigate(`/reports?search=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };
  
  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (!mobileSearchOpen) {
      setTimeout(() => {
        const mobileInput = document.getElementById('mobile-search-input');
        if (mobileInput) {
          mobileInput.focus();
        }
      }, 100);
    }
  };
  
  return (
    <header 
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {/* Mobile Search Bar (Overlay) */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-[51] p-3 flex flex-col sm:hidden">
          <div className="flex items-center mb-2">
            <Input
              id="mobile-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, groups..."
              className="flex-grow"
              autoFocus
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="ml-2" 
              onClick={toggleMobileSearch}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 w-full"
            >
              {suggestions.map((suggestion, i) => (
                <div 
                  key={i}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span>{suggestion}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center group">
          <div className="w-8 h-8 bg-gradient-to-br from-food-orange to-food-yellow rounded-full flex items-center justify-center mr-2 shadow-md group-hover:shadow-lg transition-all">
            <span className="text-white font-bold">D</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
            DineShareTrack
          </span>
        </Link>
        
        {user ? (
          <>
            <div className="hidden sm:flex sm:items-center sm:space-x-1">
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  className={`text-sm font-medium flex items-center gap-1 transition-all ${
                    isActive('/dashboard') ? 'bg-food-orange/90 text-white' : ''
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              <Link to="/groups">
                <Button 
                  variant={isActive('/groups') ? 'default' : 'ghost'}
                  className={`text-sm font-medium flex items-center gap-1 transition-all ${
                    isActive('/groups') ? 'bg-food-orange/90 text-white' : ''
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Groups</span>
                </Button>
              </Link>
              <Link to="/reports">
                <Button 
                  variant={isActive('/reports') ? 'default' : 'ghost'}
                  className={`text-sm font-medium flex items-center gap-1 transition-all ${
                    isActive('/reports') ? 'bg-food-orange/90 text-white' : ''
                  }`}
                >
                  <BarChart className="h-4 w-4" />
                  <span>Reports</span>
                </Button>
              </Link>
              <Link to="/profile">
                <Button 
                  variant={isActive('/profile') ? 'default' : 'ghost'}
                  className={`text-sm font-medium flex items-center gap-1 transition-all ${
                    isActive('/profile') ? 'bg-food-orange/90 text-white' : ''
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Link to="/settings">
                <Button 
                  variant={isActive('/settings') ? 'default' : 'ghost'}
                  className={`text-sm font-medium flex items-center gap-1 transition-all ${
                    isActive('/settings') ? 'bg-food-orange/90 text-white' : ''
                  }`}
                >
                  <SettingsIcon className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </Link>
              <Button 
                variant="ghost"
                className="text-sm font-medium flex items-center gap-1 transition-all"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mobile search button */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={toggleMobileSearch}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                className="rounded-full"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer transition-all hover:ring-2 hover:ring-food-orange">
                      <AvatarImage src={profile?.avatar} />
                      <AvatarFallback className="bg-food-green text-white">
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="font-medium">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                    <Link to="/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Home</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/groups">
                      <DropdownMenuItem className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Groups</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/reports">
                      <DropdownMenuItem className="cursor-pointer">
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Reports</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => toggleMobileSearch()}>
                      <Search className="mr-2 h-4 w-4" />
                      <span>Search</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Link to="/auth/signin">
              <Button variant="default">Sign In</Button>
            </Link>
            
            <Link to="/auth/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        )}
      </nav>
      
      {/* Desktop Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
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
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                >
                  {suggestions.map((suggestion, i) => (
                    <div 
                      key={i}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center">
                        <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span>{suggestion}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setSearchOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Search</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;
