const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/inject.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data.source?.startsWith("react-devtools")) return;
  if (event.data.source === "taoxyz-wallet-dapp") {
    console.log("[Content] Received message from dApp:", event.data);

    if (!event.data.type || !event.data.payload) {
      console.error("[Content] Invalid message format:", event.data);
      return;
    }

    // Forward to background and keep channel open for response
    chrome.runtime
      .sendMessage(event.data)
      .then((response) => {
        // Forward response back to webpage
        window.postMessage(
          {
            source: "taoxyz-wallet-content",
            type: event.data.type,
            payload: response,
          },
          window.location.origin
        );
      })
      .catch((error) => {
        console.error("[Content] Error forwarding message:", error);
        window.postMessage(
          {
            source: "taoxyz-wallet-content",
            type: `${event.data.type}_error`,
            payload: { error: error.message },
          },
          window.location.origin
        );
      });
  }
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Content] Received message from background:", message);

  if (message.type === "ext(signResponse)") {
    window.postMessage(
      {
        source: "taoxyz-wallet-content",
        type: message.type,
        payload: {
          id: message.payload.id,
          signature: message.payload.signature,
        },
      },
      window.location.origin
    );
    sendResponse();
  }

  if (message.type === "ext(connectResponse)") {
    window.postMessage(
      {
        source: "taoxyz-wallet-content",
        type: message.type,
        payload: message.payload,
      },
      window.location.origin
    );
    sendResponse();
  }

  return true;
});

export {};
