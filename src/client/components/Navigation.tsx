import { Link } from "react-router-dom";
import { House, ArrowLeftRight, ListPlus, Redo, Settings2 } from "lucide-react";

const Navigation = () => {
  const currentAddress = localStorage.getItem("currentAddress");

  if (!currentAddress) return null;

  const navLinks = [
    { path: "/dashboard", icon: <House className="w-5 h-5" /> },
    { path: "/swap", icon: <ArrowLeftRight className="w-5 h-5" /> },
    { path: "/stake", icon: <ListPlus className="w-5 h-5" /> },
    { path: "/transfer", icon: <Redo className="w-5 h-5" /> },
    { path: "/settings", icon: <Settings2 className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-mf-ash-500/80 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full px-2">
        <div className="flex justify-between h-14">
          {navLinks.map((link, index) => (
            <div key={link.path} className="flex items-center">
              <Link to={link.path} className="text-mf-safety-300 px-6">
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
