
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SignInPage from '@/components/auth/SignInPage';
import SignUpPage from '@/components/auth/SignUpPage';

const Auth: React.FC = () => {
  const { action } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="mb-6 flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-food-orange to-food-yellow rounded-full flex items-center justify-center shadow-md mr-3 transform transition-transform hover:rotate-12">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-food-orange to-food-green bg-clip-text text-transparent">
          DineShareTrack
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
