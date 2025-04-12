import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import LockScreen from '@/client/components/common/LockScreen';
import { ProtectedRoutes } from '@/client/components/routes/AppRoutes';
import { useLock } from '@/client/contexts/LockContext';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isLocked } = useLock();
  const location = useLocation();

  const isProtectedRoute =
    Object.values(ProtectedRoutes).includes(location.pathname as ProtectedRoutes) ||
    location.pathname === '/';

  return (
    <div className="w-full h-full">
      {/* Main Content */}
      {children}

      {/* Lock Screen Overlay */}
      {isProtectedRoute && <LockScreen isLocked={isLocked} />}
    </div>
  );
};

export default AppLayout;
