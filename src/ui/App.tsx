import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inconsolata";

import Signin from "./pages/Signin";
import "../../public/globals.css";

const App = () => {
  return <Signin />;
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
