import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, LogOut, Lock } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import type { Permissions, PermissionsPerWebsite } from "../../types/client";
import taoxyzLogo from "../../../public/icons/taoxyz.png";

interface SettingsProps {
  setIsLocked: (isLocked: boolean) => void;
}

const Settings = ({ setIsLocked }: SettingsProps) => {
  const navigate = useNavigate();
  const { api, setEndpoint } = usePolkadotApi();
  const [selectedNetwork, setSelectedNetwork] = useState<"test" | "main">(
    () => {
      const network = api?.getNetwork();
      return network === "test" ? "test" : "main";
    }
  );
  const [websiteStats, setWebsiteStats] = useState<PermissionsPerWebsite>({});
  const [expandedWebsite, setExpandedWebsite] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<KeyringPair[]>([]);

  useEffect(() => {
    loadWebsiteStats();
  }, []);

  const loadWebsiteStats = async () => {
    try {
      const keyringAccounts = await KeyringService.getAccounts();
      setAccounts(keyringAccounts);
      const stats: PermissionsPerWebsite = {};

      for (const account of keyringAccounts) {
        const permissions =
          (account.meta.websitePermissions as Permissions) || {};

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
            hasAccess: hasAccess as boolean,
          });
        });
      }

      setWebsiteStats(stats);
    } catch (error) {
      console.error("Failed to load website stats:", error);
    }
  };

  const handleLock = async () => {
    KeyringService.lockAll();
    MessageService.sendAccountsLockedMessage();
    await chrome.storage.local.set({ accountLocked: true });
    setIsLocked(true);
    navigate("/");
  };

  const handleLogout = async () => {
    KeyringService.lockAll();
    MessageService.sendAccountsLockedMessage();
    await chrome.storage.local.remove("currentAddress");
    await chrome.storage.local.set({ accountLocked: true });
    setIsLocked(true);
    navigate("/");
  };

  const handleNetworkChange = async (network: "test" | "main") => {
    if (
      window.confirm(
        "Changing the network will require a restart and log you out. Do you want to continue?"
      )
    ) {
      setSelectedNetwork(network);
      setEndpoint(network);
      await chrome.storage.local.remove("currentAddress");
      await chrome.storage.local.set({ accountLocked: true });
      MessageService.sendAccountsLockedMessage();
      setIsLocked(true);
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
    <div className="flex flex-col items-center min-h-screen overflow-hidden">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <div className="w-80 grid grid-cols-3 mb-8">
          <div className="flex items-center justify-start pl-4" />
          <div className="flex justify-center">
            <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-end pr-4" />
        </div>

        <div className="w-80">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-mf-silver-300">
              Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div className="w-full px-3 py-2 rounded-lg bg-mf-ash-500">
              <h3 className="text-sm font-medium text-mf-silver-300 mb-2">
                Network
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleNetworkChange("main")}
                  className={`flex-1 text-xs rounded-lg px-4 py-2 transition-colors ${
                    selectedNetwork === "main"
                      ? "bg-mf-sybil-500 text-mf-ash-500 hover:bg-mf-sybil-700"
                      : "bg-mf-ash-300 text-mf-silver-300 hover:bg-mf-ash-400 hover:text-mf-milk-300"
                  }`}
                >
                  Mainnet
                </button>
                <button
                  onClick={() => handleNetworkChange("test")}
                  className={`flex-1 text-xs rounded-lg px-4 py-2 transition-colors ${
                    selectedNetwork === "test"
                      ? "bg-mf-sybil-500 text-mf-ash-500 hover:bg-mf-sybil-700"
                      : "bg-mf-ash-300 text-mf-silver-300 hover:bg-mf-ash-400 hover:text-mf-milk-300"
                  }`}
                >
                  Testnet
                </button>
              </div>
            </div>

            <div className="w-full px-3 py-2 rounded-lg bg-mf-ash-500">
              <h3 className="text-sm font-medium text-mf-silver-300 mb-2">
                Connected Sites
              </h3>
              <div className="space-y-2">
                {Object.entries(websiteStats).map(
                  ([website, { accountCount, accounts }]) => (
                    <div key={website} className="bg-mf-ash-300 rounded-lg">
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() =>
                          setExpandedWebsite(
                            expandedWebsite === website ? null : website
                          )
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-mf-milk-300">
                            {website}
                          </span>
                          <span className="bg-mf-safety-300 text-mf-milk-300 text-xs px-2 rounded-lg">
                            {accountCount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveWebsite(website);
                            }}
                            className="text-xs text-mf-safety-300 hover:text-mf-safety-200"
                          >
                            Remove
                          </button>
                          {expandedWebsite === website ? (
                            <ChevronUp className="w-4 h-4 text-mf-silver-300" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-mf-silver-300" />
                          )}
                        </div>
                      </div>

                      {expandedWebsite === website && (
                        <div className="border-t border-mf-ash-500 px-3 py-2">
                          <div className="space-y-2">
                            {accounts.map((account) => (
                              <div
                                key={account.address}
                                className="flex items-center justify-between py-1"
                              >
                                <span className="text-xs text-mf-silver-300">
                                  {account.username}
                                  <span className="text-mf-silver-500 ml-1">
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
                                  <div className="w-8 h-4 bg-mf-ash-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-mf-silver-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-mf-safety-300"></div>
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

            <div className="fixed bottom-20 w-80">
              <div className="flex space-x-2 text-xs">
                <button
                  onClick={handleLock}
                  className="flex-1 rounded-lg bg-mf-ash-500 hover:bg-mf-ash-400 px-4 py-3 text-mf-safety-300"
                >
                  <div className="flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                    <span className="ml-2">Lock Account</span>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-mf-ash-500 hover:bg-mf-ash-400 px-4 py-3 text-mf-safety-300"
                >
                  <div className="flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                    <span className="ml-2">Log Out</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
