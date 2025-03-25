import { useState } from "react";
import KeyringService from "../../services/KeyringService";

interface MnemonicImportProps {
  onContinue: (mnemonic: string) => void;
  onBack: () => void;
}

const MnemonicImport = ({ onContinue, onBack }: MnemonicImportProps) => {
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicSelected, setMnemonicSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateMnemonic = () => {
    if (!mnemonic.trim()) {
      setError("Recovery Phrase is Required");
      setIsValid(false);
      return;
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setError("Recovery Phrase Must Be 12 Words");
      setIsValid(false);
      return;
    }

    if (!KeyringService.validateMnemonic(mnemonic.trim())) {
      setError("Recovery Phrase is Invalid");
      setIsValid(false);
      return;
    }

    setIsValid(true);
  };

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);
    validateMnemonic();
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
        className={`p-3 h-28 text-sm rounded-sm bg-mf-ash-300 text-mf-milk-300 placeholder:text-mf-milk-300 focus:outline-none ${
          mnemonicSelected || submitted
            ? `border-2 ${
                isValid ? "border-mf-sybil-500" : "border-mf-safety-500"
              }`
            : "border-none"
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
          className="w-44 rounded-sm text-sm text-mf-safety-500 bg-mf-night-500 border-mf-night-500 hover:border-mf-safety-500 border-2 transition-colors p-1.5"
        >
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="w-44 rounded-sm text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
        >
          <span>Continue</span>
        </button>
      </div>
    </form>
  );
};

export default MnemonicImport;
