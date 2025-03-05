import { useState, useEffect } from "react";
import { KeyringService } from "../services/KeyringService";
import type { SignerPayloadJSON } from "@polkadot/types/types";

interface SignRequest {
  data: SignerPayloadJSON;
  address: string;
  requestId: string;
}

const Sign = () => {
  const [request, setRequest] = useState<SignRequest | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("signRequest", (result) => {
      if (result.signRequest) {
        setRequest(result.signRequest);
      }
    });
  }, []);

  const handleSign = async () => {
    try {
      setLoading(true);
      setError("");

      if (!request) {
        throw new Error("No signing request found");
      }

      const signature = await KeyringService.sign(
        request.address,
        request.data,
        password
      );

      await chrome.runtime.sendMessage({
        type: "ext(signResponse)",
        payload: {
          id: request.requestId,
          signature,
        },
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
    await chrome.runtime.sendMessage({
      type: "ext(signResponse)",
      payload: {
        approved: false,
        id: request?.requestId,
      },
    });
    window.close();
  };

  if (!request) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Sign Transaction</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Transaction Details:</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div>Method: {request.data.method}</div>
          <div>Nonce: {request.data.nonce}</div>
          <div>Tip: {request.data.tip}</div>
          <div>Block Hash: {request.data.blockHash}</div>
          <div>Genesis Hash: {request.data.genesisHash}</div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Enter password to sign:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleSign}
          disabled={loading || !password}
          className={`flex-1 py-2 px-4 rounded ${
            loading || !password
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Signing..." : "Sign"}
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Sign;
