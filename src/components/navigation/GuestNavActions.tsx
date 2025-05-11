
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

interface GuestNavActionsProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const GuestNavActions: React.FC<GuestNavActionsProps> = ({ darkMode, setDarkMode }) => {
  return (
    <div className="flex items-center space-x-2">
      <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <Link to="/auth/signin">
        <Button variant="default">Sign In</Button>
      </Link>
      
      <Link to="/auth/signup">
        <Button variant="outline">Sign Up</Button>
      </Link>
    </div>
  );
};

export default GuestNavActions;
