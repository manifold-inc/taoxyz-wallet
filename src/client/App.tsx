import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
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

import { ProtectedRoute } from "./components/ProtectedRoute";
import { RpcApiProvider } from "./contexts/RpcApiContext";
import { KeyringService } from "./services/KeyringService";

const Navigation = () => {
  const location = useLocation();
  const address = location.state?.address;

  if (!address) return null;

  return (
    <nav className="p-4 bg-gray-100">
      <ul className="flex space-x-4">
        <li>
          <Link
            to="/dashboard"
            state={{ address }}
            className="text-blue-600 hover:text-blue-800"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/swap"
            state={{ address }}
            className="text-blue-600 hover:text-blue-800"
          >
            Swap
          </Link>
        </li>
        <li>
          <Link
            to="/stake"
            state={{ address }}
            className="text-blue-600 hover:text-blue-800"
          >
            Stake
          </Link>
        </li>
        <li>
          <Link
            to="/transfer"
            state={{ address }}
            className="text-blue-600 hover:text-blue-800"
          >
            Transfer
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            state={{ address }}
            className="text-blue-600 hover:text-blue-800"
          >
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
};

const App = () => {
  useEffect(() => {
    const handleAuthMessage = async (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      if (message.type === "auth(checkPermission)") {
        try {
          const { address, origin } = message.payload;
          console.log(
            `[App] Checking permission for ${origin} to access ${address}`
          );

          const account = await KeyringService.getAccount(address);
          const permissions =
            (account.meta.websitePermissions as { [key: string]: boolean }) ||
            {};
          const approved = permissions[origin] === true;

          console.log(`[App] Permission check result:`, {
            address,
            origin,
            approved,
            permissions,
          });

          sendResponse({ approved });
        } catch (error) {
          console.error("[App] Error checking permissions:", error);
          sendResponse({ approved: false });
        }
      }
      return true; // Keep channel open for async response
    };

    // Add listener
    chrome.runtime.onMessage.addListener(handleAuthMessage);

    // Cleanup
    return () => {
      chrome.runtime.onMessage.removeListener(handleAuthMessage);
    };
  }, []);

  return (
    <RpcApiProvider>
      <HashRouter>
        <Navigation />
        <main className="p-4">
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
    </RpcApiProvider>
  );
};

export default App;
