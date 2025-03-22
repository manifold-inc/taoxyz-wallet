import { useState } from "react";
import { Copy } from "lucide-react";

interface MnemonicDisplayProps {
  mnemonic: string;
  onContinue: () => void;
}

const MnemonicDisplay = ({ mnemonic, onContinue }: MnemonicDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMnemonic = async (): Promise<void> => {
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8 w-64 [&>*]:w-full">
      <div className="relative">
        <textarea
          value={mnemonic}
          readOnly
          className="p-3 h-28 text-sm rounded-sm bg-mf-ash-300 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-500 w-full"
        />
        <button
          onClick={handleCopyMnemonic}
          className={`absolute right-2 top-3 transition-colors bg-mf-ash-300 ${
            copied ? "text-mf-sybil-500" : "text-mf-safety-500"
          }`}
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <div>
        <p
          className={`mt-2 text-xs ${
            copied ? "text-mf-sybil-500" : "text-mf-safety-500"
          }`}
        >
          {copied
            ? "Copied Recovery Phrase"
            : "Save and Store in a Secure Location"}
        </p>
      </div>

      <div className="flex flex-col items-center mt-8">
        <button
          onClick={onContinue}
          className="w-44 rounded-xs text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
        >
          <span>Continue</span>
        </button>
      </div>
    </div>
  );
};

export default MnemonicDisplay;
