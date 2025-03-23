import { useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { LockProvider } from "./contexts/LockContext";
import { WalletProvider } from "./contexts/WalletContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import MessageService from "./services/MessageService";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Stake from "./pages/Stake";
import Transfer from "./pages/Transfer";
import Settings from "./pages/Settings";
import Welcome from "./pages/Welcome";
import AddWallet from "./pages/AddWallet";
import ProtectedRoute from "./components/ProtectedRoute";
import Connect from "./components/popups/Connect";
import Sign from "./components/popups/Sign";
import Navigation from "./components/Navigation";

const Content = () => {
  const publicRoutes = ["/connect", "/sign", "/add-wallet", "/welcome"];
  const location = useLocation();

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
          path="/swap"
          element={
            <ProtectedRoute>
              <Swap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stake"
          element={
            <ProtectedRoute>
              <Stake />
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
      {!publicRoutes.includes(location.pathname) && <Navigation />}
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
    <HashRouter>
      <LockProvider>
        <WalletProvider>
          <NotificationProvider>
            <Content />
          </NotificationProvider>
        </WalletProvider>
      </LockProvider>
    </HashRouter>
  );
};

export default App;
