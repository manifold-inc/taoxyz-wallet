import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import taoxyzLogo from "../../../public/icons/taoxyz.svg";
import CreateForm from "../components/CreateForm";
import MnemonicDisplay from "../components/Mnemonic";

export const Create = () => {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState("");
  const [account, setAccount] = useState<KeyringPair | null>(null);

  const handleSuccess = (
    newAccount: KeyringPair,
    generatedMnemonic: string
  ) => {
    setAccount(newAccount);
    setMnemonic(generatedMnemonic);
  };

  const handleContinue = () => {
    localStorage.setItem("currentAddress", account?.address as string);
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
              <h1 className="text-[20px] font-semibold text-mf-silver-300">
                Create Wallet
              </h1>
            </div>
            <CreateForm onSuccess={handleSuccess} />
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-[20px] font-semibold text-mf-silver-300">
                Recovery Phrase
              </h1>
            </div>
            <div className="flex flex-col flex-1 w-full">
              <MnemonicDisplay
                mnemonic={mnemonic}
                onContinue={handleContinue}
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
