
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserProfile } from '@/data/types';

const defaultProfile: UserProfile = {
  name: 'User',
  email: '',
  phone: '',
};

const Navbar: React.FC = () => {
  const [profile] = useLocalStorage<UserProfile>('user-profile', defaultProfile);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-food-orange to-food-yellow flex items-center justify-center">
              <span className="text-white font-bold text-xl">₹</span>
            </div>
            <span className="text-xl font-bold text-gray-800">DineShareTrack</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-food-orange transition-colors">
            Dashboard
          </Link>
          <Link to="/reports" className="text-gray-700 hover:text-food-orange transition-colors">
            Reports
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/profile">
            <Avatar className="h-9 w-9 hover:ring-2 hover:ring-food-orange transition-all">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-food-green text-white">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
