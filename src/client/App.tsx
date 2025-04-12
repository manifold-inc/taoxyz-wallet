import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';

import AppLayout from '@/client/components/layout/AppLayout';
import AppRoutes from '@/client/components/routes/AppRoutes';
import { LockProvider } from '@/client/contexts/LockContext';
import { NotificationProvider } from '@/client/contexts/NotificationContext';
import { PolkadotApiProvider } from '@/client/contexts/PolkadotApiContext';
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
      <HashRouter>
        <LockProvider>
          <WalletProvider>
            <NotificationProvider>
              <WalletCreationProvider>
                <AppLayout>
                  <AppRoutes />
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
