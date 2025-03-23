import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import { useLock } from "../contexts/LockContext";
import ConnectedSites from "../components/settings/ConnectedSites";
import taoxyzLogo from "../../../public/icons/taoxyz.png";

const Settings = () => {
  const navigate = useNavigate();
  const { setIsLocked } = useLock();

  const handleLock = async () => {
    KeyringService.lockAll();
    MessageService.sendWalletsLockedMessage();
    await chrome.storage.local.set({ walletLocked: true });
    setIsLocked(true);
    navigate("/dashboard");
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
            <ConnectedSites />
          </div>

          <div className="mt-4">
            <div className="flex space-x-2 text-xs">
              <button
                onClick={handleLock}
                className="flex-1 rounded-lg bg-mf-ash-500 hover:bg-mf-ash-400 px-4 py-3 text-mf-safety-300"
              >
                <div className="flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                  <span className="ml-2">Lock Wallet</span>
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
