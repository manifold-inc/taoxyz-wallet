import { useState } from "react";
import { ChevronDown, ChevronUp, X, ArrowLeftToLine } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import { useNotification } from "../../contexts/NotificationContext";
import KeyringService from "../../services/KeyringService";
import { NotificationType } from "../../../types/client";
import type { Permissions, PermissionsPerWebsite } from "../../../types/client";
import taoxyz from "../../../../public/icons/taoxyz.svg";

interface ConnectedSitesProps {
  onClose: () => void;
}

const ConnectedSites = ({ onClose }: ConnectedSitesProps) => {
  const { showNotification } = useNotification();
  const [websitePermissions, setWebsitePermissions] =
    useState<PermissionsPerWebsite>({});
  const [expandedWebsite, setExpandedWebsite] = useState<string | null>(null);
  const [wallets, setWallets] = useState<KeyringPair[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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
            username: (wallet.meta.username as string) || "Unnamed Wallet",
            hasAccess: hasAccess as boolean,
          });
        });
      }

      setWebsitePermissions(permissionsPerWebsite);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Permissions",
      });
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
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Update Permissions",
      });
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
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Remove Website",
      });
    }
  };

  const init = async () => {
    if (isInitialized) return;
    setIsInitialized(true);
    await loadPermissions();
  };

  if (!isInitialized) {
    void init();
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="relative flex justify-center items-center w-72 mt-12">
        <ArrowLeftToLine
          className="absolute left-3 w-6 h-6 text-mf-milk-500"
          onClick={onClose}
        />
        <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16" />
      </div>

      <div className="flex flex-col items-center w-72 [&>*]:w-full mt-4 space-y-4">
        <div className="text-center text-lg text-mf-milk-300">
          <h1>Connected Sites</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-mf-ash-500">
          {Object.entries(websitePermissions).map(
            ([website, { walletCount, wallets }]) => (
              <div
                key={website}
                className="border-2 border-mf-safety-500 rounded-sm"
              >
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
                        <X className="w-4 h-4" />
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
    </div>
  );
};

export default ConnectedSites;
