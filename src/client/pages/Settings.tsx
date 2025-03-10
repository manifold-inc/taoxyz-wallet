import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeyringService } from "../services/KeyringService";
import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { Permissions } from "../../types/client";

type WebsiteStats = Record<
  string,
  {
    accountCount: number;
    accounts: {
      address: string;
      username: string;
      hasAccess: boolean;
    }[];
  }
>;

const Settings = () => {
  const navigate = useNavigate();
  const { setEndpoint } = usePolkadotApi();
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

      setAccounts(keyringAccounts);
      const stats: WebsiteStats = {};

      for (const account of keyringAccounts) {
        const permissions =
          (account.meta.websitePermissions as Record<string, boolean>) || {};

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

      setWebsiteStats(stats);
    } catch (error) {
      console.error("Failed to load website stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentAddress");
    navigate("/");
  };

  const handleNetworkChange = (network: "test" | "main") => {
    if (
      window.confirm(
        "Changing the network will require a restart and log you out. Do you want to continue?"
      )
    ) {
      setSelectedNetwork(network);
      setEndpoint(network);
      localStorage.removeItem("currentAddress");
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
          (account.meta.websitePermissions as Permissions)[website] === true
      );

      for (const account of accountsWithAccess) {
        await KeyringService.updatePermissions(website, account.address, false);
      }

      loadWebsiteStats();
    } catch (error) {
      console.error("Failed to remove website:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-[11px] font-medium mb-4">Settings</h2>

      <div className="mb-6">
        <h3 className="text-[11px] font-medium mb-2">Network</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleNetworkChange("test")}
            className={`px-4 py-1 rounded text-[10px] outline outline-1 outline-black/20 ${
              selectedNetwork === "test"
                ? "bg-blue-500 text-white"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Testnet
          </button>
          <button
            onClick={() => handleNetworkChange("main")}
            className={`px-4 py-1 rounded text-[10px] outline outline-1 outline-black/20 ${
              selectedNetwork === "main"
                ? "bg-blue-500 text-white"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Mainnet
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-[11px] font-medium mb-2">Websites</h3>
        <div className="space-y-2">
          {Object.entries(websiteStats).map(
            ([website, { accountCount, accounts }]) => (
              <div
                key={website}
                className="bg-white/5 rounded-lg outline outline-1 outline-black/20"
              >
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() =>
                    setExpandedWebsite(
                      expandedWebsite === website ? null : website
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px]">{website}</span>
                    <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 rounded outline outline-1 outline-black/20">
                      {accountCount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWebsite(website);
                      }}
                      className="text-red-500 text-[10px] hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  {expandedWebsite === website ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </div>

                {expandedWebsite === website && (
                  <div className="border-t border-black/20 px-3 py-2">
                    <div className="space-y-2">
                      {accounts.map((account) => (
                        <div
                          key={account.address}
                          className="flex items-center justify-between py-1"
                        >
                          <span className="text-[10px] text-gray-400">
                            {account.username}
                            <span className="text-gray-500 ml-1">
                              ({account.address.slice(0, 4)}...
                              {account.address.slice(-4)})
                            </span>
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
                            <div className="w-8 h-4 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 outline outline-1 outline-black/20"></div>
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

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="text-[10px] text-red-500 px-4 py-1 rounded outline outline-1 outline-black/20"
      >
        Log Out
      </button>
    </div>
  );
};

export default Settings;
