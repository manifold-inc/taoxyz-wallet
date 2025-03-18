import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Lock } from "lucide-react";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import NetworkSelector from "../components/settings/NetworkSelector";
import ConnectedSites from "../components/settings/ConnectedSites";
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

  return (
    <div className="flex flex-col items-center h-screen overflow-hidden">
      <div className="h-20" />
      <div className="flex flex-col items-center w-80">
        <div className="grid grid-cols-3 mb-8 w-full">
          <div className="flex items-center justify-start pl-4" />
          <div className="flex justify-center">
            <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-end pr-4" />
        </div>

        <div className="w-full flex flex-col flex-1">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-mf-silver-300">
              Settings
            </h2>
          </div>

          <div className="flex flex-col space-y-4 flex-1">
            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onNetworkChange={handleNetworkChange}
            />
            <div className="flex-1 min-h-0">
              <ConnectedSites />
            </div>
          </div>

          <div className="mt-4">
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
  );
};

export default Settings;
