
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  User, 
  BarChart, 
  Users, 
  Home, 
  Settings as SettingsIcon
} from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b shadow-sm bg-white">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl text-food-green">DineShareTrack</span>
        </Link>
        
        <div className="hidden sm:flex sm:items-center sm:space-x-1">
          <Link to="/dashboard">
            <Button 
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              className="text-sm font-medium flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </Link>
          <Link to="/groups">
            <Button 
              variant={isActive('/groups') ? 'default' : 'ghost'}
              className="text-sm font-medium flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              <span>Groups</span>
            </Button>
          </Link>
          <Link to="/reports">
            <Button 
              variant={isActive('/reports') ? 'default' : 'ghost'}
              className="text-sm font-medium flex items-center gap-1"
            >
              <BarChart className="h-4 w-4" />
              <span>Reports</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Button 
              variant={isActive('/profile') ? 'default' : 'ghost'}
              className="text-sm font-medium flex items-center gap-1"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
          </Link>
          <Link to="/settings">
            <Button 
              variant={isActive('/settings') ? 'default' : 'ghost'}
              className="text-sm font-medium flex items-center gap-1"
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
        
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
