import { useEffect, useState } from "react";
import { KeyringService } from "../services/KeyringService";
import type { InjectedAccount } from "@polkadot/extension-inject/types";

interface AuthRequest {
  origin: string;
  requestId: string;
}

interface SelectableAccount extends InjectedAccount {
  selected: boolean;
}

const Connect = () => {
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [accounts, setAccounts] = useState<SelectableAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await chrome.storage.local.get(["pendingRequest"]);
        if (result.pendingRequest) {
          setRequest(result.pendingRequest);
        }

        const keyringAccounts = await KeyringService.getAccounts();
        const formattedAccounts = keyringAccounts.map((account) => ({
          address: account.address,
          genesisHash: null,
          name: (account.meta?.username as string) || "Unnamed Account",
          type: "sr25519" as const,
          meta: {
            source: "taoxyz-wallet",
          },
          selected: false,
        }));

        console.log("Formatted accounts:", formattedAccounts);
        setAccounts(formattedAccounts);
      } catch (error) {
        console.error("Failed to initialize:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const toggleAccount = (address: string) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.address === address
          ? { ...account, selected: !account.selected }
          : account
      )
    );
  };

  const handleResponse = async (approved: boolean) => {
    if (!request) return;
    const selectedAccounts = accounts
      .filter((acc) => acc.selected)
      .map(({ selected, ...acc }) => ({
        address: acc.address,
        genesisHash: acc.genesisHash,
        name: acc.name,
        type: acc.type,
        meta: {
          source: "taoxyz-wallet",
        },
      }));

    console.log("[Client] Sending Accounts:", selectedAccounts);
    await chrome.runtime.sendMessage({
      type: "AUTHORIZATION_RESPONSE",
      payload: {
        approved,
        accounts: selectedAccounts,
        requestId: request.requestId,
        origin: request.origin,
      },
    });
    window.close();
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!request) return <div className="p-4">No pending request</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Connection Request</h2>
      <p className="mb-4">
        {request.origin} is requesting to connect to your wallet
      </p>

      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">
          Select accounts to share:
        </h3>
        <div className="space-y-2">
          {accounts.map((account) => (
            <label
              key={account.address}
              className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={account.selected}
                onChange={() => toggleAccount(account.address)}
                className="mr-3"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm mb-1">{account.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {account.address}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => handleResponse(true)}
          disabled={!accounts.some((acc) => acc.selected)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Approve
        </button>
        <button
          onClick={() => handleResponse(false)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default Connect;
