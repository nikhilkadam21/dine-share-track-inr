
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SignInPage from '@/components/auth/SignInPage';
import SignUpPage from '@/components/auth/SignUpPage';

const Auth: React.FC = () => {
  const { action } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="mb-6 flex items-center">
        <div className="w-10 h-10 flex items-center justify-center mr-3">
          <img 
            src="/lovable-uploads/23d2f325-ae3d-408a-b27b-35027f5bcd82.png" 
            alt="MealSync Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
          MealSync
        </span>
      </div>
      
      {action === 'signin' ? (
        <SignInPage />
      ) : action === 'signup' ? (
        <SignUpPage />
      ) : (
        <Navigate to="/auth/signin" replace />
      )}
    </div>
  );
};

export default Auth;
