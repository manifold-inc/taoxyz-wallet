import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from "./pages/Home";
import Sign from "./pages/Sign";
import Signin from "./pages/Signin";

const App = () => {
  return (
    <HashRouter>
      <nav className="p-4 bg-gray-100">
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          </li>
          <li>
            <Link to="/sign" className="text-blue-600 hover:text-blue-800">Sign</Link>
          </li>
          <li>
            <Link to="/signin" className="text-blue-600 hover:text-blue-800">Sign In</Link>
          </li>
        </ul>
      </nav>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </main>
    </HashRouter>
  );
};

export default App;
