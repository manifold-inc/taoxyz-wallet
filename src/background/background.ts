// Main background script - Extension's core orchestrator
// Initializes and coordinates all services/handlers

/**
 * DUAL-ROLE ARCHITECTURE OVERVIEW
 *
 * 1. PROVIDER ROLE - Serving External Dapps
 * ========================================
 *
 * [External Dapp] <-> [Content Script + Provider] <-> [Background Script] <-> [Storage/Keys]
 *                                                          ^
 *                                                          |
 *                                                     [Popup UI]
 *
 * Flow Example (External Dapp):
 * - Dapp calls provider.sendTransaction()
 * - Provider relays to background
 * - Popup opens for approval
 * - Background handles signing
 * - Result returns to dapp
 *
 * 2. WALLET ROLE - Direct Wallet Operations
 * ========================================
 *
 * [Popup UI (Wallet Dapp)] <-> [Background Script] <-> [Storage/Keys]
 *                                     |
 *                              [Bittensor Service]
 *                                     |
 *                              [Network/Chain]
 *
 * Flow Example (Direct Wallet):
 * - User initiates transfer in popup
 * - Popup UI sends directly to background
 * - Background validates and signs
 * - Bittensor service submits to network
 *
 * Component Responsibilities:
 * =========================
 *
 * 1. Popup UI:
 *    AS WALLET:
 *    - Full wallet interface
 *    - Transfer/stake operations
 *    - Account management
 *    - Network operations
 *    AS PROVIDER UI:
 *    - Transaction approval
 *    - Connection requests
 *    - Signature requests
 *
 * 2. Background Script:
 *    - Core wallet logic
 *    - Key management
 *    - Transaction signing
 *    - State management
 *    - Message routing
 *
 * 3. Content Script & Provider:
 *    - Injected provider interface
 *    - External dapp integration
 *    - Request relay
 *
 * 4. Bittensor Service:
 *    - Network interactions
 *    - Chain-specific operations
 *    - RPC handling
 *
 * Security Boundaries:
 * ==================
 * - Sensitive operations only in background
 * - Popup has direct background access
 * - External dapps isolated via provider
 * - Keys never leave background script
 */

import { cryptoWaitReady } from "@polkadot/util-crypto";
import { BittensorService } from "./services/bittensor";
import { KeyringService } from "./services/keyring";
import { MessageHandler } from "./handlers/messages";

const initializeServices = async () => {
  const keyring = new KeyringService();
  const bittensor = new BittensorService();
  const messageHandler = new MessageHandler();

  messageHandler.registerHandler("pub(import.wallet)", async (payload: any) => {
    keyring.validateMnemonic(payload.mnemonic);
    keyring.addAccount(payload.mnemonic, payload.username, payload.password);
  });
  setupMessageListeners(messageHandler);
};

const setupMessageListeners = (messageHandler: MessageHandler) => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`Message Received: ${JSON.stringify(message)}`);
    messageHandler
      .handleMessage(message)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  });
};

chrome.runtime.onInstalled.addListener(() => {
  cryptoWaitReady().then(() => {
    initializeServices();
  });
});

chrome.runtime.onStartup.addListener(() => {
  cryptoWaitReady().then(() => {
    initializeServices();
  });
});

cryptoWaitReady().then(() => {
  initializeServices();
});
