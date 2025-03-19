import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import MessageService from "../services/MessageService";
import MnemonicDisplay from "../components/create/Mnemonic";
import CreateForm from "../components/create/CreateForm";
import taoxyz from "../../../public/icons/taoxyz.svg";

interface CreateProps {
  setIsLocked: (isLocked: boolean) => void;
}

export const Create = ({ setIsLocked }: CreateProps) => {
  const navigate = useNavigate();
  const { isLoading } = usePolkadotApi();
  const [account, setAccount] = useState<KeyringPair | null>(null);
  const [mnemonic, setMnemonic] = useState<string>("");

  const handleSuccess = async (
    account: KeyringPair,
    mnemonic: string
  ): Promise<void> => {
    setAccount(account);
    setMnemonic(mnemonic);
  };

  const handleContinue = async (): Promise<void> => {
    if (!account) return;
    await chrome.storage.local.set({
      currentAddress: account.address,
    });
    await chrome.storage.local.set({ accountLocked: false });
    MessageService.sendClearLockTimer();
    setIsLocked(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        {!mnemonic ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-mf-silver-300">
                Create Wallet
              </h1>
            </div>
            <CreateForm onSuccess={handleSuccess} isLoading={isLoading} />
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
