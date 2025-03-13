import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Import from "./pages/Import";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Create from "./pages/Create";
import Connect from "./pages/Connect";
import Sign from "./pages/Sign";
import Stake from "./pages/Stake";
import Transfer from "./pages/Transfer";
import Settings from "./pages/Settings";

import LockScreen from "./components/LockScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";

import MessageService from "./services/MessageService";
import KeyringService from "./services/KeyringService";
import { PolkadotApiProvider } from "./contexts/PolkadotApiContext";

import background from "../../public/images/background.png";

const App = () => {
  const [isLocked, setIsLocked] = useState<boolean>(true);

  useEffect(() => {
    const cleanup = MessageService.setupMessageListeners();

    const checkLockState = async () => {
      const currentAddress = localStorage.getItem("currentAddress");
      if (!currentAddress) {
        setIsLocked(false);
        return;
      }

      try {
        const isLocked = await KeyringService.isLocked(currentAddress);
        setIsLocked(isLocked);
      } catch (error) {
        console.error("[App] Error checking lock state:", error);
        setIsLocked(true);
      }
    };

    checkLockState();
    return cleanup;
  }, []);

  return (
    <PolkadotApiProvider>
      <HashRouter>
        <div
          style={{ backgroundImage: `url(${background})` }}
          className="bg-cover bg-center min-h-screen w-full"
        >
          <div className="bg-transparent">
            {isLocked && localStorage.getItem("currentAddress") ? (
              <LockScreen setIsLocked={setIsLocked} />
            ) : (
              <>
                <Navigation />
                <main className="bg-transparent">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/import" element={<Import />} />
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
                    <Route path="/connect" element={<Connect />} />
                    <Route path="/sign" element={<Sign />} />
                  </Routes>
                </main>
              </>
            )}
          </div>
        </div>
      </HashRouter>
    </PolkadotApiProvider>
  );
};

export default App;
