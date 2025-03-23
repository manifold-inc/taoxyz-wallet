import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import { LockProvider, useLock } from "./contexts/LockContext";
import { WalletProvider, useWallet } from "./contexts/WalletContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import MessageService from "./services/MessageService";
import LockScreen from "./components/LockScreen";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Stake from "./pages/Stake";
import Transfer from "./pages/Transfer";
import Settings from "./pages/Settings";
import Create from "./pages/Create";
import Import from "./pages/Import";
import Welcome from "./pages/Welcome";
import Connect from "./components/popups/Connect";
import Sign from "./components/popups/Sign";
import Navigation from "./components/Navigation";

const Content = () => {
  const { isLocked } = useLock();
  const { currentAddress } = useWallet();
  const popupRoutes = [
    "#/connect",
    "#/sign",
    "#/create",
    "#/import",
    "#/welcome",
  ];
  const currentPath = window.location.hash;

  return (
    <div className="flex flex-col items-center min-h-screen">
      {!currentAddress ? (
        <Welcome />
      ) : isLocked ? (
        <LockScreen />
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/stake" element={<Stake />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/create" element={<Create />} />
            <Route path="/import" element={<Import />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/sign" element={<Sign />} />
          </Routes>
          {!popupRoutes.includes(currentPath) && <Navigation />}
        </>
      )}
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
