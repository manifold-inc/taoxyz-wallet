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
    const requestConnect = async () => {
      try {
        const result = await chrome.storage.local.get(["connectRequest"]);
        if (result.connectRequest) {
          setRequest(result.connectRequest);
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
        setAccounts(formattedAccounts);
      } catch (error) {
        console.error("Failed to connect:", error);
      } finally {
        setLoading(false);
      }
    };

    requestConnect();
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
      .map(({ selected, ...acc }) => acc);

    try {
      const response = await chrome.runtime.sendMessage({
        type: "ext(connectResponse)",
        payload: {
          approved,
          accounts: selectedAccounts,
          requestId: request.requestId,
          origin: request.origin,
        },
      });

      if (response?.success) {
        await KeyringService.updatePermissions(
          request.origin,
          selectedAccounts[0].address,
          approved
        );
        window.close();
      }
    } catch (error) {
      console.error("[Client] Error sending response:", error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!request) return <div className="p-4">No pending request</div>;

  return (
    <div className="p-4 max-w-lg w-full">
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-700">
            {request.origin} is requesting to connect to your wallet
          </p>
        </div>

        <div className="mb-4">
          <div className="space-y-2">
            {accounts.map((account) => (
              <label
                key={account.address}
                className="flex items-center p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={account.selected}
                  onChange={() => toggleAccount(account.address)}
                  className="mr-2.5 text-blue-500 focus:ring-blue-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-gray-900">
                    {account.name}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {account.address}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleResponse(true)}
            disabled={!accounts.some((acc) => acc.selected)}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors text-xs font-medium"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default Connect;
