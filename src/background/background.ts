// Basic background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// This is required for service workers
export {};
