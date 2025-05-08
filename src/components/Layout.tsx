
import React from 'react';
import Navbar from './Navbar';
import { useToast } from '@/components/ui/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-food-yellow/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-food-green/10 rounded-full blur-3xl"></div>
        
        {/* Main content with animations */}
        <main className="container relative mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
          {children}
        </main>
      </div>
      
      <footer className="bg-white border-t py-6 mt-10">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} DineShareTrack. All rights reserved.</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <a href="#" className="text-gray-400 hover:text-food-orange transition-colors">Privacy Policy</a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-gray-400 hover:text-food-orange transition-colors">Terms of Service</a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-gray-400 hover:text-food-orange transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
