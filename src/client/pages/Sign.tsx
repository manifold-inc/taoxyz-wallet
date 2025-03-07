import { useState, useEffect } from "react";
import { KeyringService } from "../services/KeyringService";
import type { SignRequest } from "../../types/types";

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
    <div className="p-4 max-w-lg w-full">
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="mb-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1.5 text-xs">
            <div className="grid grid-cols-[100px,1fr] gap-2">
              <div className="text-gray-500">Method:</div>
              <div className="text-gray-900 truncate">
                {request.data.method}
              </div>
              <div className="text-gray-500">Nonce:</div>
              <div className="text-gray-900 truncate">{request.data.nonce}</div>
              <div className="text-gray-500">Tip:</div>
              <div className="text-gray-900 truncate">{request.data.tip}</div>
              <div className="text-gray-500">Block Hash:</div>
              <div className="text-gray-900 truncate">
                {request.data.blockHash}
              </div>
              <div className="text-gray-500">Genesis Hash:</div>
              <div className="text-gray-900 truncate">
                {request.data.genesisHash}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to sign"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSign}
            disabled={loading || !password}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >
            {loading ? "Signing..." : "Sign"}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sign;
