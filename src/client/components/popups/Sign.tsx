import { useState } from "react";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";

import KeyringService from "../../services/KeyringService";
import { useNotification } from "../../contexts/NotificationContext";
import { NotificationType } from "../../../types/client";
import { MESSAGE_TYPES } from "../../../types/messages";
import type {
  StoredSignRequest,
  SignResponsePayload,
} from "../../../types/messages";
import taoxyz from "../../../../public/icons/taoxyz.svg";

const Sign = () => {
  const { showNotification } = useNotification();
  const [request, setRequest] = useState<StoredSignRequest | null>(null);
  const [password, setPassword] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const getRequest = async () => {
    try {
      const result = await chrome.storage.local.get("signRequest");
      if (!result.signRequest) throw new Error();
      setRequest(result.signRequest);
      return result.signRequest;
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Get Request",
      });
      setTimeout(() => {
        window.close();
      }, 3000);
      return null;
    }
  };

  const handleSign = async () => {
    try {
      if (!request) {
        showNotification({
          type: NotificationType.Error,
          message: "No Request Found",
        });
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      const type = checkPayloadType(request.data);
      if (type === "INVALID") {
        showNotification({
          type: NotificationType.Error,
          message: "Invalid Payload Format",
        });
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      const signature: `0x${string}` = await KeyringService.sign(
        request.address,
        request.data as SignerPayloadJSON,
        password
      );

      // TODO: Handle raw payload

      const response: SignResponsePayload = {
        id: parseInt(request.requestId),
        signature,
        approved: true,
      };

      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SIGN_RESPONSE,
        payload: response,
      });

      window.close();
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Sign",
      });
    }
  };

  const handleCancel = async () => {
    if (!request) {
      showNotification({
        type: NotificationType.Error,
        message: "No Request Found",
      });
      setTimeout(() => {
        window.close();
      }, 3000);
      return;
    }

    const response: SignResponsePayload = {
      id: parseInt(request.requestId),
      approved: false,
    };

    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SIGN_RESPONSE,
      payload: response,
    });
    window.close();
  };

  const checkPayloadType = (data: SignerPayloadJSON | SignerPayloadRaw) => {
    if ("method" in data) {
      return "JSON";
    } else if ("data" in data) {
      return "RAW";
    } else {
      return "INVALID";
    }
  };

  const renderPayload = () => {
    if (!request) return null;
    const type = checkPayloadType(request.data);

    if (type === "JSON") {
      const payload = request.data as SignerPayloadJSON;
      return (
        <div className="grid grid-cols-[100px,1fr] gap-2">
          <div className="text-mf-silver-500 truncate">
            <p className="font-semibold">Method:</p>
            <p className="text-mf-silver-500">{payload.method}</p>
          </div>
          <div className="text-mf-silver-500 truncate">
            <p className="font-semibold">Block Hash:</p>
            <p className="text-mf-silver-500">{payload.blockHash}</p>
          </div>
          <div className="text-mf-silver-500 truncate">
            <p className="font-semibold">Genesis:</p>
            <p className="text-mf-silver-500">{payload.genesisHash}</p>
          </div>
          <div className="text-mf-silver-500 truncate">
            <p className="font-semibold">Era:</p>
            <p className="text-mf-silver-500">{payload.era}</p>
          </div>
          <div className="text-mf-silver-500 truncate">
            <p className="font-semibold">Nonce:</p>
            <p className="text-mf-silver-500">{payload.nonce}</p>
          </div>
        </div>
      );
    }

    if (type === "RAW") {
      const payload = request.data as SignerPayloadRaw;
      return (
        <div className="grid grid-cols-[100px,1fr] gap-2">
          <div className="text-mf-silver-500 truncate">
            <p className="font-semibold">Data:</p>
            <p className="text-mf-silver-500">{payload.data}</p>
          </div>
          <div className="text-mf-silver-500 truncate">
            <p className="font-semibold">Type:</p>
            <p className="text-mf-silver-500">Raw Signature</p>
          </div>
        </div>
      );
    }

    return null;
  };

  const init = async () => {
    if (isInitialized) return;
    setIsInitialized(true);
    const request = await getRequest();
    if (!request) return;
  };

  if (!isInitialized) {
    void init();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with logo */}
      <div className="px-4 pb-4 pt-6 border-b border-mf-ash-500 flex items-center justify-center gap-2">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-6 h-6" />
        <p className="text-mf-silver-300 text-lg font-semibold pl-2">
          Confirm Transaction
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Key Information */}
        <div className="bg-mf-ash-500/30 border border-mf-sybil-700 rounded-lg p-4">
          <div className="space-y-2 text-mf-silver-500 text-xs">
            <div className="flex gap-2 items-center">
              <span className="font-semibold">Origin:</span>
              <span>{request?.origin}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold">Address:</span>
              <span>{request?.address.slice(0, 16)}...</span>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-mf-ash-500/20 rounded-lg p-4">
          <div className="text-xs text-mf-safety-500 mb-2 font-semibold">
            Details
          </div>
          <div className="space-y-2">{renderPayload()}</div>
        </div>
      </div>

      {/* Footer with password and buttons */}
      <div className="border-t border-mf-ash-500 p-4 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password to sign"
          className="w-full px-3 py-2 text-sm bg-mf-ash-500/30 border border-mf-ash-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-mf-sybil-500 text-mf-silver-500 placeholder-mf-silver-500"
        />

        <div className="flex space-x-2">
          <button
            onClick={handleSign}
            disabled={!password}
            className={`flex-1 text-sm rounded-lg px-4 py-3 transition-colors ${
              !password
                ? "bg-mf-ash-500 text-mf-silver-500 cursor-not-allowed"
                : "bg-mf-sybil-700 hover:bg-mf-sybil-500 text-mf-ash-500"
            }`}
          >
            Sign
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 text-sm rounded-lg bg-mf-ash-500 hover:bg-mf-ash-400 px-4 py-3 text-mf-safety-300 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sign;
