import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import MessageService from "../services/MessageService";
import { useNotification } from "../contexts/NotificationContext";
import MnemonicDisplay from "../components/create/MnemonicDisplay";
import CreateForm from "../components/create/CreateForm";
import taoxyz from "../../../public/icons/taoxyz.svg";

interface CreateProps {
  setIsLocked: (isLocked: boolean) => void;
}

export const Create = ({ setIsLocked }: CreateProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
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
        type: "error",
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
    <div className="flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />

        {showOptions ? (
          <div className="flex flex-col items-center mt-4 space-y-4">
            <h1 className="text-lg text-mf-milk-500">Add Wallet</h1>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setShowOptions(false)}
                className="w-44 rounded-xs text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
              >
                Create
              </button>
              <button
                onClick={() => navigate("/import")}
                className="w-44 rounded-xs text-sm text-mf-safety-500 bg-mf-night-500 border-mf-night-500 hover:border-mf-safety-500 border-2 transition-colors p-1.5"
              >
                Import
              </button>
            </div>
          </div>
        ) : !mnemonic ? (
          <div>
            <div className="text-center text-lg text-mf-milk-500 mt-4">
              <h1>Create Wallet</h1>
            </div>
            <CreateForm onSuccess={handleSuccess} />
          </div>
        ) : (
          <div>
            <div className="text-center text-lg text-mf-milk-500 mt-4">
              <h1>Recovery Phrase</h1>
            </div>
            <MnemonicDisplay mnemonic={mnemonic} onContinue={handleContinue} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
