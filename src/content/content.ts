const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/inject.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", (event) => {
  if (event.data.source?.startsWith("react-devtools")) return;
  if (event.data.source === "taoxyz-wallet-dapp") {
    console.log("[Content] Received message from dApp:", event.data);

    // Forward to background and keep channel open for response
    chrome.runtime.sendMessage(event.data).then((response) => {
      // Forward response back to webpage
      window.postMessage(
        {
          source: "taoxyz-wallet-content",
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
  console.log("[Content] Received message from background:", message);

  if (
    message.type === "ext(connectResponse)" ||
    message.type === "ext(signResponse)"
  ) {
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
