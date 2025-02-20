// Secure storage service
// Handles encrypted storage of sensitive data

export class StorageService {
  // Storage operations:
  // - Save/load encrypted keys
  // - Store account metadata
  // - Manage user preferences
  // - Cache frequently used data

  async get(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key]);
      });
    });
  }

  async set(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }
} 