chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Message Received:", message);

  switch (message.type) {
    case "dapp(connectRequest)": {
      const requestId = Math.random().toString(36).slice(2);
      console.log("[Background] Authorization Request:", requestId);

      chrome.storage.local.set({
        connectRequest: {
          origin: message.payload.origin,
          requestId,
          tabId: sender.tab?.id,
        },
      });

      chrome.windows.create({
        url: chrome.runtime.getURL("index.html#/connect"),
        type: "popup",
        width: 400,
        height: 600,
      });

      sendResponse({ success: true });
      break;
    }

    case "ext(connectResponse)": {
      chrome.storage.local.get(["connectRequest"], (result) => {
        const { tabId } = result.connectRequest;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, {
            type: "ext(connectResponse)",
            payload: message.payload,
          });
          chrome.storage.local.remove("connectRequest");
        }
        sendResponse({ success: true });
      });
      break;
    }

    case "dapp(signRequest)": {
      chrome.storage.local.set({
        signRequest: {
          id: message.payload.id,
          address: message.payload.address,
          data: message.payload.data,
          tabId: sender.tab?.id,
          origin: sender.origin || sender.url,
        },
      });

      chrome.windows.create({
        url: chrome.runtime.getURL("index.html#/sign"),
        type: "popup",
        width: 400,
        height: 600,
      });

      sendResponse({ success: true });
      break;
    }

    case "ext(signResponse)": {
      chrome.storage.local.get(["signRequest"], (result) => {
        const { tabId } = result.signRequest;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, {
            type: "ext(signResponse)",
            payload: message.payload,
          });
          chrome.storage.local.remove("signRequest");
        }
        sendResponse({ success: true });
      });
      break;
    }

    default:
      console.log("[Background] Unknown message type:", message.type);
      sendResponse({ error: "Unknown message type" });
  }

  return true;
});
