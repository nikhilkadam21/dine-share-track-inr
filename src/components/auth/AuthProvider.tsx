
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateAuthUrl, handleAuthCallback, handleLogout, COGNITO } from '@/integrations/cognito/client';

type UserInfo = {
  sub: string;
  email?: string;
  phone_number?: string;
  name?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  signOut: () => void;
  signIn: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for authentication callback
  useEffect(() => {
    const checkAuthCallback = async () => {
      try {
        setIsLoading(true);
        
        // Check if we're returning from auth redirect
        if (window.location.href.includes('code=') && window.location.href.includes('state=')) {
          const result = await handleAuthCallback(window.location.href);
          if (result && result.userInfo) {
            localStorage.setItem('user', JSON.stringify(result.userInfo));
            setUser(result.userInfo);
            
            // Redirect to dashboard after successful login
            window.location.href = '/dashboard';
          }
        }
        
        // Check for existing user in local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthCallback();
  }, []);

  const signIn = () => {
    window.location.href = generateAuthUrl();
  };

  const signOut = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signOut,
        signIn,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
