import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '@/client/components/ProtectedRoute';
import Connect from '@/client/components/popups/Connect';
import Sign from '@/client/components/popups/Sign';
import AddWallet from '@/client/pages/AddWallet';
import Dashboard from '@/client/pages/Dashboard';
import Settings from '@/client/pages/Settings';
import Welcome from '@/client/pages/Welcome';

export enum PublicRoutes {
  Welcome = '/welcome',
  AddWallet = '/add-wallet',
  Connect = '/connect',
  Sign = '/sign',
}

export enum ProtectedRoutes {
  Dashboard = '/dashboard',
  Settings = '/settings',
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={PublicRoutes.Welcome} element={<Welcome />} />
      <Route path={PublicRoutes.AddWallet} element={<AddWallet />} />
      <Route path={PublicRoutes.Connect} element={<Connect />} />
      <Route path={PublicRoutes.Sign} element={<Sign />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to={ProtectedRoutes.Dashboard} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path={ProtectedRoutes.Dashboard}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ProtectedRoutes.Settings}
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
