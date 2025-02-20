import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inconsolata";

import Home from "./pages/Home";

const App = () => {
  return <Home />;
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;
