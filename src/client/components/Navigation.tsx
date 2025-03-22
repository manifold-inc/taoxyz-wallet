import { Link, useLocation } from "react-router-dom";
import {
  House,
  ArrowLeftRight,
  Plus,
  CornerUpRight,
  Settings,
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const links = [
    { path: "/dashboard", icon: <House className="w-7 h-7" /> },
    { path: "/swap", icon: <ArrowLeftRight className="w-7 h-7" /> },
    { path: "/stake", icon: <Plus className="w-7 h-7" /> },
    { path: "/transfer", icon: <CornerUpRight className="w-7 h-7" /> },
    { path: "/settings", icon: <Settings className="w-7 h-7" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-74 h-14">
        <div className="flex items-center justify-evenly h-full">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center hover:bg-mf-ash-500 p-4 ${
                location.pathname === link.path
                  ? "text-mf-safety-500"
                  : "text-mf-milk-300"
              }`}
            >
              {link.icon}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
