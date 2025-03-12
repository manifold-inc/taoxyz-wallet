import React from "react";
import { createRoot } from "react-dom/client";
import keyring from "@polkadot/ui-keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import background from "../../public/images/background.png";

import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
const reactRoot = createRoot(root);

const preloadBackground = new Promise((resolve) => {
  const img = new Image();
  img.src = background;
  img.onload = resolve;
});

Promise.all([cryptoWaitReady(), preloadBackground]).then(() => {
  keyring.loadAll({ type: "sr25519" });
  console.log(`[Client] Initial Pairs: ${JSON.stringify(keyring.getPairs())}`);
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
