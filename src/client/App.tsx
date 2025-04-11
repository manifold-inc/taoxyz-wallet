import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Connect from './components/popups/Connect';
import Sign from './components/popups/Sign';
import { LockProvider, useLock } from './contexts/LockContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PolkadotApiProvider } from './contexts/PolkadotApiContext';
import { WalletProvider } from './contexts/WalletContext';
import { WalletCreationProvider } from './contexts/WalletCreationContext';
import AddStake from './pages/AddStake';
import AddWallet from './pages/AddWallet';
import Dashboard from './pages/Dashboard';
import MoveStake from './pages/MoveStake';
import Settings from './pages/Settings';
import Transfer from './pages/Transfer';
import Welcome from './pages/Welcome';
import MessageService from './services/MessageService';

const Content = () => {
  const { isLocked } = useLock();
  const location = useLocation();
  const publicRoutes = ['/connect', '/sign', '/add-wallet', '/welcome'];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/add-wallet" element={<AddWallet />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/sign" element={<Sign />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-stake"
          element={
            <ProtectedRoute>
              <AddStake />
            </ProtectedRoute>
          }
        />
        <Route
          path="/move-stake"
          element={
            <ProtectedRoute>
              <MoveStake />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!publicRoutes.includes(location.pathname) && !isLocked && <Navigation />}
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
                <Content />
              </WalletCreationProvider>
            </NotificationProvider>
          </WalletProvider>
        </LockProvider>
      </HashRouter>
    </PolkadotApiProvider>
  );
};

export default App;
