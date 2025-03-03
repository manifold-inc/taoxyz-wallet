// Handles all inter-component communication:
// - Route messages between popup <-> background
// - Handle provider <-> webpage communication
// - Process incoming request types:
//   * Transaction requests
//   * Signing requests
//   * Account requests
//   * Network requests
// - Validate message formats and permissions
// - Manage response routing
// - Handle connection lifecycle
// - Error handling and logging

import type { Message, MessageListeners } from "../../types/messages";

export class MessageHandler {
  private handlers: Map<string, MessageListeners>;

  constructor() {
    this.handlers = new Map();
  }

  registerHandler(messageType: string, handler: MessageListeners) {
    this.handlers.set(messageType, handler);
  }

  public async handleMessage(message: Message) {
    const handler = this.handlers.get(message.type);
    if (!handler) {
      throw new Error(`Unknown Message Type: ${message.type}`);
    }

    try {
      const result = await handler(message.payload);
      const response = { success: true, data: result };
      console.log(`[Background] Message Result: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      const response = { success: false, error: (error as Error).message };
      console.log(`[Background] Message Error: ${JSON.stringify(response)}`);
      return response;
    }
  }
}
