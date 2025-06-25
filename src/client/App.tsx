import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';

import AppLayout from '@/client/components/layout/AppLayout';
import AppRoutes from '@/client/components/routes/AppRoutes';
import { DashboardProvider } from '@/client/contexts/DashboardContext';
import { LockProvider } from '@/client/contexts/LockContext';
import { NotificationProvider } from '@/client/contexts/NotificationContext';
import { PolkadotApiProvider } from '@/client/contexts/PolkadotApiContext';
import { QueryProvider } from '@/client/contexts/QueryProvider';
import { WalletProvider } from '@/client/contexts/WalletContext';
import { WalletCreationProvider } from '@/client/contexts/WalletCreationContext';
import MessageService from '@/client/services/MessageService';

const App = () => {
  useEffect(() => {
    const cleanupListeners = MessageService.setupMessageListeners();
    return () => {
      cleanupListeners();
    };
  }, []);

  return (
    <PolkadotApiProvider>
      <QueryProvider>
        <HashRouter>
          <LockProvider>
            <WalletProvider>
              <NotificationProvider>
                <WalletCreationProvider>
                  <DashboardProvider>
                    <AppLayout>
                      <AppRoutes />
                    </AppLayout>
                  </DashboardProvider>
                </WalletCreationProvider>
              </NotificationProvider>
            </WalletProvider>
          </LockProvider>
        </HashRouter>
      </QueryProvider>
    </PolkadotApiProvider>
  );
};

export default App;
