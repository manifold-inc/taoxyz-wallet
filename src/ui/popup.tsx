import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inconsolata";

import Home from "./pages/Home";

const Popup = () => {
  return (
    <div className="min-w-[360px] min-h-[600px] p-4 bg-gray-50">
      <Home />
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
} 