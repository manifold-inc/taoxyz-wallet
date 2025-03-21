import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import MessageService from "../services/MessageService";
import MnemonicDisplay from "../components/create/Mnemonic";
import CreateForm from "../components/create/CreateForm";
import Notification from "../components/Notification";
import taoxyz from "../../../public/icons/taoxyz.svg";

interface CreateProps {
  setIsLocked: (isLocked: boolean) => void;
}

export const Create = ({ setIsLocked }: CreateProps) => {
  const navigate = useNavigate();
  const { isLoading } = usePolkadotApi();
  const [wallet, setWallet] = useState<KeyringPair | null>(null);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const handleSuccess = async (
    wallet: KeyringPair,
    mnemonic: string
  ): Promise<void> => {
    setWallet(wallet);
    setMnemonic(mnemonic);
  };

  const handleContinue = async (): Promise<void> => {
    setNotification(null);
    setShowNotification(false);

    if (!wallet) {
      setNotification("Could not find wallet");
      setShowNotification(true);
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
      <Notification
        message={notification as string}
        show={showNotification}
        onDismiss={() => setShowNotification(false)}
      />
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />

        {!mnemonic ? (
          <div>
            <div className="text-center text-lg text-mf-milk-500 mt-4">
              <h1>Create Wallet</h1>
            </div>
            <CreateForm onSuccess={handleSuccess} />
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-mf-silver-300">
                Recovery Phrase
              </h1>
            </div>
            <div className="flex flex-col flex-1 w-full">
              <MnemonicDisplay
                mnemonic={mnemonic}
                onContinue={handleContinue}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
      {!mnemonic && <div className="h-20" />}
    </div>
  );
};

export default Create;
