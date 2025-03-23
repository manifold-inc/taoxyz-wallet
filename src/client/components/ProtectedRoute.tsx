import { Navigate } from "react-router-dom";

import { useWallet } from "../contexts/WalletContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentAddress } = useWallet();

  if (!currentAddress) {
    return <Navigate to="/create" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
