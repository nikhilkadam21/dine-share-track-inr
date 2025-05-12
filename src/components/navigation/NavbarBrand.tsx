
import { Link } from 'react-router-dom';
import React from 'react';

const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="flex items-center group">
      <div className="w-10 h-10 flex items-center justify-center mr-2">
        <img 
          src="/lovable-uploads/23d2f325-ae3d-408a-b27b-35027f5bcd82.png" 
          alt="MealSync Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <span className="font-bold text-xl bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
        MealSync
      </span>
    </Link>
  );
};

export default NavbarBrand;
