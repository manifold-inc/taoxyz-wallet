import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import MessageService from "../services/MessageService";
import { useNotification } from "../contexts/NotificationContext";
import { useLock } from "../contexts/LockContext";
import MnemonicDisplay from "../components/create/MnemonicDisplay";
import CreateForm from "../components/create/CreateForm";
import { NotificationType } from "../../types/client";
import taoxyz from "../../../public/icons/taoxyz.svg";

export const Create = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { setIsLocked } = useLock();
  const [wallet, setWallet] = useState<KeyringPair | null>(null);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [showOptions, setShowOptions] = useState(true);

  const handleSuccess = async (
    wallet: KeyringPair,
    mnemonic: string
  ): Promise<void> => {
    setWallet(wallet);
    setMnemonic(mnemonic);
  };

  const handleContinue = async (): Promise<void> => {
    if (!wallet) {
      showNotification({
        type: NotificationType.Error,
        message: "Could not find wallet",
      });
      return;
    }
    await chrome.storage.local.set({
      currentAddress: wallet.address,
    });
    await chrome.storage.local.set({ walletLocked: false });
    MessageService.sendClearLockTimer();
    setIsLocked(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center h-screen overflow-hidden">
      <div className="h-20" />
      <div className="flex flex-col items-center w-80">
        <div className="grid grid-cols-3 mb-8 w-full">
          <div className="flex items-center justify-start pl-4" />
          <div className="flex justify-center">
            <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-end pr-4" />
        </div>

        <div className="w-full flex flex-col flex-1">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-mf-silver-300">
              Create Wallet
            </h2>
          </div>

          <div className="flex flex-col space-y-4 flex-1">
            {showOptions ? (
              <CreateForm
                onSuccess={handleSuccess}
                onContinue={handleContinue}
              />
            ) : (
              <MnemonicDisplay
                mnemonic={mnemonic}
                onBack={() => setShowOptions(true)}
                onContinue={handleContinue}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
