import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";
import type { InjectedAccount } from "@polkadot/extension-inject/types";

export interface ConnectRequestPayload extends BasePayload {
  origin: string;
}

export interface SignRequestPayload extends BasePayload {
  id: number;
  address: string;
  data: SignerPayloadJSON | SignerPayloadRaw;
  origin: string;
}

export interface ConnectResponsePayload extends BasePayload {
  approved: boolean;
  wallets: InjectedAccount[];
}

export interface SignResponsePayload extends BasePayload {
  id: number;
  signature?: `0x${string}`;
  approved: boolean;
}

export interface BasePayload {
  type?: string;
}

export interface MessagePayloadMap {
  [MESSAGE_TYPES.CONNECT_REQUEST]: ConnectRequestPayload;
  [MESSAGE_TYPES.CONNECT_RESPONSE]: ConnectResponsePayload;
  [MESSAGE_TYPES.SIGN_REQUEST]: SignRequestPayload;
  [MESSAGE_TYPES.SIGN_RESPONSE]: SignResponsePayload;
  [MESSAGE_TYPES.WALLETS_LOCKED]: BasePayload;
  [MESSAGE_TYPES.START_LOCK_TIMER]: BasePayload;
  [MESSAGE_TYPES.CLEAR_LOCK_TIMER]: BasePayload;
}

interface BaseMessage<T extends keyof MessagePayloadMap> {
  type: T;
  payload: MessagePayloadMap[T];
}

export type DappMessage =
  | BaseMessage<typeof MESSAGE_TYPES.CONNECT_REQUEST>
  | BaseMessage<typeof MESSAGE_TYPES.SIGN_REQUEST>;

export type ExtensionMessage =
  | BaseMessage<typeof MESSAGE_TYPES.CONNECT_RESPONSE>
  | BaseMessage<typeof MESSAGE_TYPES.SIGN_RESPONSE>
  | BaseMessage<typeof MESSAGE_TYPES.WALLETS_LOCKED>
  | BaseMessage<typeof MESSAGE_TYPES.START_LOCK_TIMER>
  | BaseMessage<typeof MESSAGE_TYPES.CLEAR_LOCK_TIMER>;

export interface StoredRequest {
  tabId: number;
  origin: string;
  requestId: string;
}

export interface StoredSignRequest extends StoredRequest {
  address: string;
  data: SignerPayloadJSON | SignerPayloadRaw;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export interface SuccessResponse {
  success: true;
  data?: unknown;
}

export type ResponseMessage = ErrorResponse | SuccessResponse;

export const MESSAGE_TYPES = {
  CONNECT_REQUEST: "dapp(connectRequest)",
  CONNECT_RESPONSE: "ext(connectResponse)",
  SIGN_REQUEST: "dapp(signRequest)",
  SIGN_RESPONSE: "ext(signResponse)",
  WALLETS_LOCKED: "ext(walletsLocked)",
  START_LOCK_TIMER: "ext(startLockTimer)",
  CLEAR_LOCK_TIMER: "ext(clearLockTimer)",
} as const;

export const ERROR_TYPES = {
  NO_TAB: "No tab found",
  NO_ORIGIN: "Origin is required",
  NO_REQUEST: "No pending request",
  PERMISSION_DENIED: "Permission denied",
  INVALID_MESSAGE: "Invalid message format",
  SIGNING_FAILED: "Signing failed",
  CONNECTION_REJECTED: "Connection rejected",
  UNKNOWN_ERROR: "Unknown error",
} as const;
