import { Navigate } from "react-router-dom";

import { useWallet } from "../contexts/WalletContext";
import { useLock } from "../contexts/LockContext";
import LockScreen from "../components/common/LockScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentAddress, isLoading } = useWallet();
  const { isLocked } = useLock();

  if (isLoading) {
    return null;
  }

  if (!currentAddress) {
    return <Navigate to="/welcome" replace />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
