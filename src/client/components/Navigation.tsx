import { useLocation, Link } from "react-router-dom";
import { House, ArrowLeftRight, ListPlus, Redo, Settings2 } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const address = localStorage.getItem("currentAddress");
  const currentAddress = location.state?.address || address;
  if (location.state?.address) {
    localStorage.setItem("currentAddress", location.state.address);
  }
  if (!currentAddress) return null;

  const navLinks = [
    { path: "/dashboard", icon: <House size={20} /> },
    { path: "/swap", icon: <ArrowLeftRight size={20} /> },
    { path: "/stake", icon: <ListPlus size={20} /> },
    { path: "/transfer", icon: <Redo size={20} /> },
    { path: "/settings", icon: <Settings2 size={20} /> },
  ];

  return (
    <nav className="bg-mf-ash-500 fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full px-2">
        <div className="flex justify-between h-14">
          {navLinks.map((link, index) => (
            <div key={link.path} className="flex items-center">
              <Link
                to={link.path}
                state={{ address }}
                className="text-mf-safety-300 px-6"
              >
                {link.icon}
              </Link>
              {index < navLinks.length - 1 && (
                <div className="h-4 w-px bg-mf-ash-300/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
