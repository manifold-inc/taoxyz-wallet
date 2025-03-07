import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem("currentAddress");

    if (location.state?.address) {
      setAddress(location.state.address);
      localStorage.setItem("currentAddress", location.state.address);
    } else if (savedAddress) {
      setAddress(savedAddress);
    } else {
      setAddress(null);
    }
  }, [location.state?.address]);

  if (!localStorage.getItem("currentAddress")) return null;

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/swap", label: "Swap" },
    { path: "/stake", label: "Stake" },
    { path: "/transfer", label: "Transfer" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-center h-10">
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                state={{ address }}
                className="text-gray-500 hover:text-blue-600 transition-colors text-[11px] uppercase tracking-tight"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
