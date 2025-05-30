import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import Navigation from '@/client/components/Navigation';
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
    <main className="h-screen w-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Routes */}
        {children}
      </div>

      {/* Lock Screen for Protected Routes */}
      {isProtectedRoute && (
        <>
          <LockScreen isLocked={isLocked} />
          <div className="h-14">
            <Navigation />
          </div>
        </>
      )}
    </main>
  );
};

export default AppLayout;
