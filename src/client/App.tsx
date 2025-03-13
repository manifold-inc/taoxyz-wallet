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
import { PolkadotApiProvider } from "./contexts/PolkadotApiContext";

import background from "../../public/images/background.png";

const App = () => {
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem("accountLocked") === "true";
  });

  useEffect(() => {
    const cleanup = MessageService.setupMessageListeners();
    const checkAddress = async () => {
      const currentAddress = localStorage.getItem("currentAddress");
      if (!currentAddress) {
        setIsLocked(false);
        localStorage.setItem("accountLocked", "false");
        return;
      }
    };
    checkAddress();
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
        </div>
      </HashRouter>
    </PolkadotApiProvider>
  );
};

export default App;
