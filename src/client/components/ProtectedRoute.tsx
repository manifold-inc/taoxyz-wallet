import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const address = localStorage.getItem("currentAddress");
  if (!address) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
