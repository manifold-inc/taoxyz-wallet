import { Navigate } from 'react-router-dom';

import { useWallet } from '@/client/contexts/WalletContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentAddress, isLoading } = useWallet();

  if (isLoading) {
    return null;
  }

  if (!currentAddress) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
