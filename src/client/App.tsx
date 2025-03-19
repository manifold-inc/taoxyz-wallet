import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Signin from "./pages/Signin";
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

const App = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    init();
    const cleanupListeners = MessageService.setupMessageListeners();
    return cleanupListeners;
  }, []);

  const init = async (): Promise<void> => {
    const lockResult = await chrome.storage.local.get("accountLocked");
    const addressResult = await chrome.storage.local.get("currentAddress");
    console.log("[App] Lock state:", lockResult.accountLocked);
    console.log("[App] Current address:", addressResult.currentAddress);
    setIsLocked(lockResult.accountLocked === true);
    setCurrentAddress(addressResult.currentAddress);
  };

  return (
    <PolkadotApiProvider>
      <HashRouter>
        <div>
          {isLocked && currentAddress ? (
            <LockScreen setIsLocked={setIsLocked} />
          ) : (
            <>
              {!["#/connect", "#/sign"].includes(window.location.hash) && (
                <Navigation />
              )}
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/signin"
                    element={<Signin setIsLocked={setIsLocked} />}
                  />
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
          )}
        </div>
      </HashRouter>
    </PolkadotApiProvider>
  );
};

export default App;
