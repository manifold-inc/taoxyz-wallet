import { QueryClientProvider } from '@tanstack/react-query';

import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';

import AppLayout from '@/client/components/layout/AppLayout';
import AppRoutes from '@/client/components/routes/AppRoutes';
import { DashboardProvider } from '@/client/contexts/DashboardContext';
import { LockProvider } from '@/client/contexts/LockContext';
import { NotificationProvider } from '@/client/contexts/NotificationContext';
import { PolkadotApiProvider } from '@/client/contexts/PolkadotApiContext';
import { WalletProvider } from '@/client/contexts/WalletContext';
import { WalletCreationProvider } from '@/client/contexts/WalletCreationContext';
import MessageService from '@/client/services/MessageService';
import { queryClient } from '@/client/services/queryClient';

const App = () => {
  useEffect(() => {
    const cleanupListeners = MessageService.setupMessageListeners();
    return () => {
      cleanupListeners();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PolkadotApiProvider>
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
      </PolkadotApiProvider>
    </QueryClientProvider>
  );
};

export default App;
