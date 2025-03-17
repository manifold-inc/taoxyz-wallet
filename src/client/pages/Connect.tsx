import { useEffect, useState } from "react";
import { KeyringService } from "../services/KeyringService";
import type { InjectedAccount } from "@polkadot/extension-inject/types";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";
import { MESSAGE_TYPES } from "../../types/messages";

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

    try {
      const selectedAccounts = accounts
        .filter((account) => account.selected)
        .map(({ selected: _, ...account }) => account);

      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CONNECT_RESPONSE,
        payload: {
          approved,
          accounts: selectedAccounts,
          requestId: request.requestId,
          origin: request.origin,
        },
      });

      if (response?.success) {
        window.close();

        try {
          await KeyringService.updatePermissions(
            request.origin,
            selectedAccounts[0].address,
            approved
          );
        } catch (error) {
          console.error("[Connect] Error updating permissions:", error);
        }
      }
    } catch (error) {
      console.error("[Connect] Error sending response:", error);
    }
  };

  if (loading) return <div className="p-4 text-mf-silver-300">Loading...</div>;
  if (!request)
    return <div className="p-4 text-mf-silver-300">No pending request</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-mf-black">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1 w-full px-4">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        <div className="w-full">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-mf-silver-300">
              Connection Request
            </h1>
          </div>

          <div className="bg-mf-ash-500/30 border border-mf-ash-500 rounded-lg p-3 mb-4">
            <p className="text-xs text-mf-silver-300">
              {request.origin} is requesting to connect to your wallet
            </p>
          </div>

          <div className="mb-4">
            <div className="space-y-2">
              {accounts.map((account) => (
                <label
                  key={account.address}
                  className="flex items-center p-2.5 bg-mf-ash-500/30 border border-mf-ash-500 rounded-lg hover:bg-mf-ash-500/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={account.selected}
                    onChange={() => toggleAccount(account.address)}
                    className="mr-2.5 text-mf-safety-300 focus:ring-mf-safety-300 bg-mf-ash-500 border-mf-ash-300"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs text-mf-silver-300">
                      {account.name}
                    </div>
                    <div className="text-[10px] text-mf-silver-500 truncate">
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
              className="flex-1 text-sm rounded-lg bg-mf-safety-300 hover:bg-mf-safety-400 disabled:bg-mf-ash-500 disabled:cursor-not-allowed px-4 py-3 text-mf-milk-300 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleResponse(false)}
              className="flex-1 text-sm rounded-lg bg-mf-ash-500 hover:bg-mf-ash-400 px-4 py-3 text-mf-safety-300 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default Connect;
