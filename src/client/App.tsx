import { HashRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Import from "./pages/Import";
import Dashboard from "./pages/Dashboard";
import Stake from "./pages/Stake";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RpcApiProvider } from "./contexts/RpcApiContext";

const App = () => {
  return (
    <RpcApiProvider>
      <HashRouter>
        <nav className="p-4 bg-gray-100">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
            </li>
            <li>
              <Link to="/signin" className="text-blue-600 hover:text-blue-800">
                Sign In
              </Link>
            </li>
          </ul>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<Signin />} />
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
              path="/stake"
              element={
                <ProtectedRoute>
                  <Stake />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </HashRouter>
    </RpcApiProvider>
  );
};

export default App;
