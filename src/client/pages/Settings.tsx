import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeyringService } from "../services/KeyringService";
import { useRpcApi } from "../contexts/RpcApiContext";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

interface WebsiteStats {
  [website: string]: {
    accountCount: number;
    accounts: {
      address: string;
      username: string;
      hasAccess: boolean;
    }[];
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { setEndpoint } = useRpcApi();
  const [selectedNetwork, setSelectedNetwork] = useState<"test" | "main">(
    "test"
  );
  const [websiteStats, setWebsiteStats] = useState<WebsiteStats>({});
  const [expandedWebsite, setExpandedWebsite] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<KeyringPair[]>([]);

  useEffect(() => {
    loadWebsiteStats();
  }, []);

  const loadWebsiteStats = async () => {
    try {
      const keyringAccounts = await KeyringService.getAccounts();
      console.log(
        "[Settings] All accounts:",
        keyringAccounts.map((acc) => ({
          address: acc.address,
          username: acc.meta.username,
          websitePermissions: acc.meta.websitePermissions,
          fullMeta: acc.meta, // Log full metadata to see everything
        }))
      );

      setAccounts(keyringAccounts);
      const stats: WebsiteStats = {};

      for (const account of keyringAccounts) {
        const permissions =
          (account.meta.websitePermissions as { [key: string]: boolean }) || {};

        // Include all websites, even those with false permissions
        Object.entries(permissions).forEach(([website, hasAccess]) => {
          if (!stats[website]) {
            stats[website] = {
              accountCount: 0,
              accounts: [],
            };
          }

          if (hasAccess) {
            stats[website].accountCount++;
          }

          stats[website].accounts.push({
            address: account.address,
            username: (account.meta.username as string) || "Unnamed Account",
            hasAccess: hasAccess,
          });
        });
      }

      console.log("[Settings] Final website stats:", stats);
      setWebsiteStats(stats);
    } catch (error) {
      console.error("Failed to load website stats:", error);
    }
  };

  const handleNetworkChange = (network: "test" | "main") => {
    if (
      window.confirm(
        "Changing the network will require a restart and log you out. Do you want to continue?"
      )
    ) {
      setSelectedNetwork(network);

      setEndpoint(network);
      navigate("/");
    }
  };

  const handleWebsiteAccessToggle = async (
    website: string,
    address: string,
    allowed: boolean
  ) => {
    try {
      await KeyringService.updatePermissions(website, address, allowed);
      loadWebsiteStats();
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  };

  const handleRemoveWebsite = async (website: string) => {
    if (!window.confirm(`Remove access for ${website}?`)) return;

    try {
      const accountsWithAccess = accounts.filter(
        (account) =>
          (account.meta.websitePermissions as { [key: string]: boolean })[
            website
          ] === true
      );

      for (const account of accountsWithAccess) {
        await KeyringService.updatePermissions(website, account.address, false);
      }

      // Reload stats
      loadWebsiteStats();
    } catch (error) {
      console.error("Failed to remove website:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Network Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Network</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleNetworkChange("test")}
              className={`px-4 py-2 rounded ${
                selectedNetwork === "test"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => handleNetworkChange("main")}
              className={`px-4 py-2 rounded ${
                selectedNetwork === "main"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Mainnet
            </button>
          </div>
        </div>

        {/* Website Access Management */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Manage Website Access</h2>

          <div className="space-y-4">
            {Object.entries(websiteStats).map(
              ([website, { accountCount, accounts }]) => (
                <div key={website} className="border rounded-lg">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedWebsite(
                        expandedWebsite === website ? null : website
                      )
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">{website}</span>
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {accountCount} accounts
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWebsite(website);
                        }}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                      {expandedWebsite === website ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </div>

                  {expandedWebsite === website && (
                    <div className="border-t px-4 py-2">
                      <div className="space-y-2">
                        {accounts.map((account) => (
                          <div
                            key={account.address}
                            className="flex items-center justify-between py-2"
                          >
                            <span className="text-sm">
                              {account.username} ({account.address.slice(0, 6)}
                              ...
                              {account.address.slice(-6)})
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={account.hasAccess}
                                onChange={(e) =>
                                  handleWebsiteAccessToggle(
                                    website,
                                    account.address,
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                navigate("/");
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
