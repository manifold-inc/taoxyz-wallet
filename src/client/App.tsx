import { useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';

import Navigation from '@/client/components/Navigation';
import AppLayout from '@/client/components/layout/AppLayout';
import AppRoutes, { ProtectedRoutes } from '@/client/components/routes/AppRoutes';
import { LockProvider, useLock } from '@/client/contexts/LockContext';
import { NotificationProvider } from '@/client/contexts/NotificationContext';
import { PolkadotApiProvider } from '@/client/contexts/PolkadotApiContext';
import { WalletProvider } from '@/client/contexts/WalletContext';
import { WalletCreationProvider } from '@/client/contexts/WalletCreationContext';
import MessageService from '@/client/services/MessageService';

const Content = () => {
  const { isLocked } = useLock();
  const location = useLocation();

  const isProtectedRoute =
    Object.values(ProtectedRoutes).includes(location.pathname as ProtectedRoutes) ||
    location.pathname === '/';

  return (
    <div className="min-w-screen min-h-screen">
      <AppRoutes />
      {isProtectedRoute && !isLocked && <Navigation />}
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const cleanupListeners = MessageService.setupMessageListeners();
    return () => {
      cleanupListeners();
    };
  }, []);

  return (
    <PolkadotApiProvider>
      <HashRouter>
        <LockProvider>
          <WalletProvider>
            <NotificationProvider>
              <WalletCreationProvider>
                <AppLayout>
                  <Content />
                </AppLayout>
              </WalletCreationProvider>
            </NotificationProvider>
          </WalletProvider>
        </LockProvider>
      </HashRouter>
    </PolkadotApiProvider>
  );
};

export default App;
