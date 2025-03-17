import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import MessageService from "../services/MessageService";
import MnemonicDisplay from "../components/Mnemonic";
import CreateForm from "../components/CreateForm";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

interface CreateProps {
  setIsLocked: (isLocked: boolean) => void;
}

export const Create = ({ setIsLocked }: CreateProps) => {
  const { isLoading: isApiLoading } = usePolkadotApi();
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState("");
  const [account, setAccount] = useState<KeyringPair | null>(null);

  const handleSuccess = async (
    newAccount: KeyringPair,
    generatedMnemonic: string
  ) => {
    setAccount(newAccount);
    setMnemonic(generatedMnemonic);
  };

  const handleContinue = async () => {
    await chrome.storage.local.set({
      currentAddress: account?.address as string,
    });
    await chrome.storage.local.set({ accountLocked: false });
    MessageService.sendClearLockTimer();
    setIsLocked(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        {!mnemonic ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-mf-silver-300">
                Create Wallet
              </h1>
            </div>
            <CreateForm onSuccess={handleSuccess} isLoading={isApiLoading} />
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
                isLoading={isApiLoading}
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
