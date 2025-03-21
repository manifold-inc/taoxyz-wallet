import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import KeyringService from "../../services/KeyringService";
import type { Permissions, PermissionsPerWebsite } from "../../../types/client";

const ConnectedSites = () => {
  const [websitePermissions, setWebsitePermissions] =
    useState<PermissionsPerWebsite>({});
  const [expandedWebsite, setExpandedWebsite] = useState<string | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const keyringWallets = await KeyringService.getWallets();
      setWallets(keyringWallets);
      const permissionsPerWebsite: PermissionsPerWebsite = {};

      for (const wallet of keyringWallets) {
        const permissions =
          (wallet.meta.websitePermissions as Permissions) || {};

        Object.entries(permissions).forEach(([website, hasAccess]) => {
          if (!permissionsPerWebsite[website]) {
            permissionsPerWebsite[website] = {
              walletCount: 0,
              wallets: [],
            };
          }

          if (hasAccess) permissionsPerWebsite[website].walletCount++;
          permissionsPerWebsite[website].wallets.push({
            address: wallet.address,
            username: (wallet.meta.username as string) || "Unnamed Account",
            hasAccess: hasAccess as boolean,
          });
        });
      }

      setWebsitePermissions(permissionsPerWebsite);
    } catch (error) {
      console.error("Failed to load website stats:", error);
    }
  };

  const handleWebsiteAccessToggle = async (
    website: string,
    address: string,
    allowed: boolean
  ) => {
    try {
      await KeyringService.updatePermissions(website, address, allowed);
      loadPermissions();
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  };

  const handleRemoveWebsite = async (website: string) => {
    if (!window.confirm(`Remove access for ${website}?`)) return;
    try {
      for (const wallet of wallets) {
        await KeyringService.updatePermissions(
          website,
          wallet.address,
          false,
          true
        );
      }
      loadPermissions();
    } catch (error) {
      console.error("Failed to remove website:", error);
    }
  };

  return (
    <div className="w-full h-40 flex flex-col bg-mf-ash-500 rounded-lg">
      <h3 className="text-sm font-medium text-mf-silver-300 p-3">
        Connected Sites
      </h3>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {Object.entries(websitePermissions).map(
          ([website, { walletCount, wallets }]) => (
            <div key={website} className="bg-mf-ash-400 rounded-lg">
              <div
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() =>
                  setExpandedWebsite(
                    expandedWebsite === website ? null : website
                  )
                }
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-xs text-mf-milk-300 truncate">
                      {website}
                    </span>
                    <span className="bg-mf-safety-300 text-mf-milk-300 text-xs px-2 rounded-lg shrink-0">
                      {walletCount}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 ml-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWebsite(website);
                      }}
                      className="text-mf-safety-500 hover:text-mf-safety-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedWebsite === website ? (
                      <ChevronUp className="w-4 h-4 text-mf-silver-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-mf-silver-300" />
                    )}
                  </div>
                </div>
              </div>

              {expandedWebsite === website && (
                <div className="border-t border-mf-ash-500 px-3 py-2">
                  <div className="space-y-2">
                    {wallets.map((wallet) => (
                      <div
                        key={wallet.address}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-xs text-mf-silver-300 truncate mr-4">
                          {wallet.username}
                          <span className="text-mf-silver-500 ml-1">
                            ({wallet.address.slice(0, 4)}...
                            {wallet.address.slice(-4)})
                          </span>
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={wallet.hasAccess}
                            onChange={(e) =>
                              handleWebsiteAccessToggle(
                                website,
                                wallet.address,
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-mf-ash-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-mf-silver-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-mf-safety-300"></div>
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
  );
};

export default ConnectedSites;
