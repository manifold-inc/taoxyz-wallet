import { Home, Settings } from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const links = [
    {
      path: '/dashboard',
      icon: <Home className="w-8 h-8" />,
    },
    {
      path: '/settings',
      icon: <Settings className="w-8 h-8" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-mf-night-500 flex justify-center pb-2">
      <div className="w-82 h-12 border border-mf-ash-300 rounded-md">
        <div className="flex items-center justify-evenly h-full">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center p-2 border-t border-mf-ash-300 ${
                location.pathname === link.path
                  ? 'text-mf-safety-500 border-mf-safety-500'
                  : 'text-mf-milk-300 border-mf-ash-300'
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
