
import { Link } from 'react-router-dom';
import React from 'react';

const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="flex items-center group">
      <div className="w-8 h-8 bg-gradient-to-br from-food-orange to-food-yellow rounded-full flex items-center justify-center mr-2 shadow-md group-hover:shadow-lg transition-all">
        <span className="text-white font-bold">D</span>
      </div>
      <span className="font-bold text-xl bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
        DineShareTrack
      </span>
    </Link>
  );
};

export default NavbarBrand;
