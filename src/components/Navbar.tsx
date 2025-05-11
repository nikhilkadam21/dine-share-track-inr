
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserProfile } from '@/data/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from './ui/use-toast';
import SearchDialog from './search/SearchDialog';
import MobileSearchBar from './search/MobileSearchBar';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [profile] = useLocalStorage<UserProfile | null>('user-profile', null);
  const { user, signOut } = useAuth();
  
  // Search functionality
  const [searchOpen, setSearchOpen] = useState(false);
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

  const isActive = (path: string) => location.pathname === path;
  
  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };
  
  return (
    <header 
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {/* Mobile Search Bar (Overlay) */}
      {mobileSearchOpen && (
        <MobileSearchBar 
          onClose={() => setMobileSearchOpen(false)} 
          mode={darkMode ? 'dark' : 'light'} 
        />
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
      <SearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        mode={darkMode ? 'dark' : 'light'}
      />
    </header>
  );
};

export default Navbar;
