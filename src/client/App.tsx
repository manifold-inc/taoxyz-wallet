import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Import from "./pages/Import";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Create from "./pages/Create";
import Stake from "./pages/Stake";
import Transfer from "./pages/Transfer";
import Settings from "./pages/Settings";

import Sign from "./components/popups/Sign";
import Connect from "./components/popups/Connect";
import LockScreen from "./components/LockScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";

import MessageService from "./services/MessageService";
import { PolkadotApiProvider } from "./contexts/PolkadotApiContext";
import { NotificationProvider } from "./contexts/NotificationContext";

const Content = ({
  setIsLocked,
}: {
  setIsLocked: (locked: boolean) => void;
}) => {
  const location = useLocation();

  return (
    <>
      {!["/connect", "/sign", "/create", "/import"].includes(
        location.pathname
      ) && <Navigation />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/create"
            element={<Create setIsLocked={setIsLocked} />}
          />
          <Route
            path="/import"
            element={<Import setIsLocked={setIsLocked} />}
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
                <Settings setIsLocked={setIsLocked} />
              </ProtectedRoute>
            }
          />
          <Route path="/connect" element={<Connect />} />
          <Route path="/sign" element={<Sign />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    init();
    const cleanupListeners = MessageService.setupMessageListeners();
    return cleanupListeners;
  }, []);

  const init = async (): Promise<void> => {
    const lockResult = await chrome.storage.local.get("walletLocked");
    const addressResult = await chrome.storage.local.get("currentAddress");
    setIsLocked(lockResult.walletLocked === true);
    setCurrentAddress(addressResult.currentAddress);
  };

  return (
    <PolkadotApiProvider>
      <NotificationProvider>
        <HashRouter>
          <div>
            {isLocked && currentAddress ? (
              <LockScreen setIsLocked={setIsLocked} />
            ) : (
              <Content setIsLocked={setIsLocked} />
            )}
          </div>
        </HashRouter>
      </NotificationProvider>
    </PolkadotApiProvider>
  );
};

export default App;
