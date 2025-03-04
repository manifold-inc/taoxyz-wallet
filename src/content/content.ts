/**
 * Connect wallets
 * Sign transactions
 * Display wallet info - balance, address
 */

// This is the content script that Chrome actually injects
const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/inject.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);

// Handle all messaging through runtime.sendMessage instead of ports
window.addEventListener("message", (event) => {
  if (event.data.source?.startsWith("react-devtools")) return;
  if (event.data.source === "taoxyz-page") {
    console.log("[Content] Received webpage message:", event.data);

    // Forward to background and keep channel open for response
    chrome.runtime.sendMessage(event.data).then((response) => {
      // Forward response back to webpage
      window.postMessage(
        {
          source: "taoxyz-content",
          type: event.data.type,
          payload: response,
        },
        window.location.origin
      );
    });
  }
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Content] Message received from background:", message);

  if (message.type === "AUTHORIZATION_RESPONSE") {
    window.postMessage(
      {
        source: "taoxyz-content",
        type: "AUTHORIZATION_RESPONSE",
        payload: message.payload,
      },
      window.location.origin
    );
    sendResponse();
  }
  return true;
});

export {};
