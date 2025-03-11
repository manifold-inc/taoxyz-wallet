import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

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

import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";

import { PolkadotApiProvider } from "./contexts/PolkadotApiContext";
import { KeyringService } from "./services/KeyringService";
import { MESSAGE_TYPES } from "../types/messages";

const App = () => {
  // TODO: refactor this
  useEffect(() => {
    const handleAuthMessage = async (
      message: {
        type: typeof MESSAGE_TYPES.AUTHENTICATE;
        payload: { address: string; origin: string };
      },
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: { approved: boolean }) => void
    ) => {
      if (message.type === MESSAGE_TYPES.AUTHENTICATE) {
        try {
          const { address, origin } = message.payload;
          console.log(
            `[App] Checking permission for ${origin} to access ${address}`
          );

          const account = await KeyringService.getAccount(address);
          const permissions =
            (account.meta.websitePermissions as Record<string, boolean>) || {};
          const approved = permissions[origin] === true;

          sendResponse({ approved });
        } catch (error) {
          console.error("[App] Error checking permissions:", error);
          sendResponse({ approved: false });
        }
      }
      return true;
    };

    // Add listener
    chrome.runtime.onMessage.addListener(handleAuthMessage);

    // Cleanup
    return () => {
      chrome.runtime.onMessage.removeListener(handleAuthMessage);
    };
  }, []);

  return (
    <PolkadotApiProvider>
      <HashRouter>
        <Navigation />
        <main>
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
      </HashRouter>
    </PolkadotApiProvider>
  );
};

export default App;
