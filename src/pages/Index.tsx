import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

const Index = () => {
  const { user } = useAuth();
  
  // If the user is authenticated, redirect to dashboard
  // Otherwise, redirect to signin page
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/signin" replace />;
};

export default Index;
