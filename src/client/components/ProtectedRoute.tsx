import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const address = location.state?.address;

  if (!address) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};
