import { useState } from "react";

import { useNotification } from "../../contexts/NotificationContext";
import KeyringService from "../../services/KeyringService";
import { NotificationType } from "../../../types/client";

interface MnemonicImportProps {
  onContinue: (mnemonic: string) => void;
  onBack: () => void;
}

const MnemonicImport = ({ onContinue, onBack }: MnemonicImportProps) => {
  const { showNotification } = useNotification();
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicSelected, setMnemonicSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateMnemonic = async (): Promise<boolean> => {
    if (!mnemonic.trim()) {
      setError("Recovery Phrase is Required");
      setIsValid(false);
      return false;
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setError("Recovery Phrase Must Be 12 Words");
      setIsValid(false);
      return false;
    }

    if (!KeyringService.validateMnemonic(mnemonic.trim())) {
      setError("Recovery Phrase is Invalid");
      setIsValid(false);
      return false;
    }

    const isDuplicate = await KeyringService.checkDuplicate(mnemonic.trim());
    if (isDuplicate) {
      showNotification({
        type: NotificationType.Error,
        message: "Wallet Already Exists",
      });
      setIsValid(false);
      return false;
    }

    setIsValid(true);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);
    const isValid = await validateMnemonic();
    if (isValid) {
      onContinue(mnemonic.trim());
    }
  };

  return (
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
          setSubmitted(false);
        }}
        onFocus={() => setMnemonicSelected(true)}
        onBlur={() => setMnemonicSelected(false)}
        className={`p-3 h-36 text-base rounded-sm bg-mf-ash-300 text-mf-milk-300 placeholder:text-mf-milk-300 border-2 border-mf-ash-300 focus:outline-none resize-none ${
          mnemonicSelected || submitted
            ? `${isValid ? "border-mf-sybil-500" : "border-mf-safety-500"}`
            : "border-mf-ash-300"
        }`}
        placeholder="Enter 12 Word Recovery Phrase"
      />
      <div className="h-8">
        {error && (mnemonicSelected || submitted) && (
          <p className="mt-2 text-xs text-left text-mf-safety-500">{error}</p>
        )}
      </div>

      <div className="flex flex-col items-center space-y-3 mt-1">
        <button
          type="button"
          onClick={onBack}
          className="w-44 border-sm text-sm text-mf-safety-500 bg-mf-night-500 border-mf-night-500 hover:border-mf-safety-500 border-2 transition-colors p-1.5 cursor-pointer"
        >
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="w-44 border-sm text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5 cursor-pointer"
        >
          <span>Continue</span>
        </button>
      </div>
    </form>
  );
};

export default MnemonicImport;
