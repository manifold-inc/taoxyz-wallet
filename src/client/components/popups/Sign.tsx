import { useState, useEffect } from "react";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";

import KeyringService from "../../services/KeyringService";
import { MESSAGE_TYPES } from "../../../types/messages";
import type {
  StoredSignRequest,
  SignResponsePayload,
} from "../../../types/messages";
import taoxyzLogo from "../../../../public/icons/taoxyz.svg";

const Sign = () => {
  const [request, setRequest] = useState<StoredSignRequest | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void chrome.storage.local.get("signRequest", (result) => {
      if (result.signRequest) {
        setRequest(result.signRequest);
      }
    });
  }, []);

  const handleSign = async () => {
    setLoading(true);
    setError("");
    if (!request) throw new Error("No signing request found");

    try {
      const type = checkPayloadType(request.data);
      if (type === "INVALID") {
        throw new Error("Invalid payload format");
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
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!request) throw new Error("No signing request found");

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

  if (!request) {
    return <div className="p-4">Loading...</div>;
  }

  const renderPayload = () => {
    const type = checkPayloadType(request.data);
    if (type === "JSON") {
      const payload = request.data as SignerPayloadJSON;
      return (
        <div className="grid grid-cols-[100px,1fr] gap-2">
          <div className="text-mf-silver-500 truncate">
            <span className="font-semibold">Method:</span> {payload.method}
          </div>
          <div className="text-mf-silver-500 truncate">
            <span className="font-semibold">Block Hash:</span>{" "}
            {payload.blockHash}
          </div>
          <div className="text-mf-silver-500 truncate">
            <span className="font-semibold">Genesis:</span>{" "}
            {payload.genesisHash}
          </div>
          <div className="text-mf-silver-500 truncate">
            <span className="font-semibold">Era:</span> {payload.era}
          </div>
          <div className="text-mf-silver-500 truncate">
            <span className="font-semibold">Nonce:</span> {payload.nonce}
          </div>
        </div>
      );
    }

    if (type === "RAW") {
      const payload = request.data as SignerPayloadRaw;
      return (
        <div className="grid grid-cols-[100px,1fr] gap-2">
          <div className="text-mf-silver-500 truncate">
            <span className="font-semibold">Data:</span> {payload.data}
          </div>
          <div className="text-mf-silver-500 truncate">
            <span className="font-semibold">Type:</span> Raw Signature
          </div>
        </div>
      );
    }

    return <div>Invalid payload format</div>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with logo */}
      <div className="px-4 pb-4 pt-6 border-b border-mf-ash-500 flex items-center justify-center gap-2">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-6 h-6" />
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
              <span>{request.origin}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold">Address:</span>
              <span>{request.address.slice(0, 16)}...</span>
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

        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSign}
            disabled={loading || !password}
            className={`flex-1 text-sm rounded-lg px-4 py-3 transition-colors ${
              loading || !password
                ? "bg-mf-ash-500 text-mf-silver-500 cursor-not-allowed"
                : "bg-mf-sybil-700 hover:bg-mf-sybil-500 text-mf-ash-500"
            }`}
          >
            {loading ? "Signing..." : "Sign"}
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
