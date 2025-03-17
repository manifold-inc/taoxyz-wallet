import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const result = await chrome.storage.local.get("currentAddress");
      setHasAccess(!!result.currentAddress);
      setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) return null;
  if (!hasAccess) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
