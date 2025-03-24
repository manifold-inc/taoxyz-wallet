import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import { useNotification } from "../contexts/NotificationContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import CreateForm from "../components/create/CreateForm";
import { NotificationType } from "../../types/client";
import taoxyz from "../../../public/icons/taoxyz.svg";

interface ImportProps {
  setIsLocked: (isLocked: boolean) => void;
}

const Import = ({ setIsLocked }: ImportProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicSelected, setMnemonicSelected] = useState(false);
  const [validMnemonic, setValidMnemonic] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    setError(null);
    setIsSubmitted(true);

    if (!mnemonic.trim()) {
      setError("Recovery Phrase is Required");
      return;
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setError("Recovery Phrase Must Be 12 Words");
      return;
    }

    if (!KeyringService.validateMnemonic(mnemonic.trim())) {
      setError("Recovery Phrase is Invalid");
      return;
    }

    setValidMnemonic(mnemonic.trim());
  };

  const handleSuccess = async (wallet: KeyringPair): Promise<void> => {
    await handleContinue(wallet);
  };

  const handleContinue = async (wallet: KeyringPair): Promise<void> => {
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

  if (validMnemonic) {
    return (
      <div className="flex flex-col items-center min-h-screen">
        <div className="flex flex-col items-center flex-1">
          <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />
          <div>
            <div className="text-center text-lg text-mf-milk-500 mt-4">
              <h1>Import Wallet</h1>
            </div>
            <CreateForm
              mnemonic={validMnemonic}
              onSuccess={handleSuccess}
              isImport={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />

        <div>
          <div className="text-center text-lg text-mf-milk-500 mt-4">
            <h1>Import Wallet</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center mt-8 w-64 [&>*]:w-full"
          >
            <textarea
              name="mnemonic"
              value={mnemonic}
              required
              onChange={(e) => {
                setMnemonic(e.target.value);
                setError(null);
                setIsSubmitted(false);
              }}
              onFocus={() => setMnemonicSelected(true)}
              onBlur={() => setMnemonicSelected(false)}
              className={`p-3 h-28 text-sm rounded-sm bg-mf-ash-300 text-mf-milk-300 placeholder:text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
                error ? "ring-2 ring-mf-safety-500" : "focus:ring-mf-safety-500"
              }`}
              placeholder="Enter 12 Word Recovery Phrase"
            />
            <div className="h-8">
              {error && (isSubmitted || mnemonicSelected) && (
                <p className="mt-2 text-xs text-left text-mf-safety-500">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center space-y-3 mt-1">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-44 rounded-xs text-sm text-mf-safety-500 bg-mf-night-500 border-mf-night-500 hover:border-mf-safety-500 border-2 transition-colors p-1.5"
              >
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="w-44 rounded-xs text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
              >
                <span>Continue</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Import;
