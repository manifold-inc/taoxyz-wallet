import { useState } from "react";
import { Copy } from "lucide-react";

interface MnemonicProps {
  mnemonic: string;
  onContinue: () => void;
}

const Mnemonic = ({ mnemonic, onContinue }: MnemonicProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy mnemonic:", err);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="px-6 max-w-[300px] mt-4">
        <div
          className={`flex items-start justify-between p-4 bg-mf-ash-500 rounded-lg text-[12px] text-mf-milk-300 ring-2 ${
            copied ? "ring-mf-sybil-500" : "ring-mf-safety-300"
          }`}
        >
          <div className="flex-1 mr-2">{mnemonic}</div>
          <button
            onClick={handleCopyMnemonic}
            className={`transition-colors ${
              copied ? "text-mf-sybil-500" : "text-mf-safety-300"
            } hover:opacity-80`}
          >
            <Copy size={16} />
          </button>
        </div>
        <div className="h-5">
          <p
            className={`mt-1 text-[10px] ${
              copied ? "text-mf-sybil-500" : "text-mf-safety-300"
            }`}
          >
            {copied
              ? "Copied recovery phrase"
              : "Save and store in a secure location"}
          </p>
        </div>
      </div>

      <div className="w-54 mt-auto mb-16">
        <button
          onClick={onContinue}
          className="w-full text-[14px] flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3"
        >
          <span className="text-mf-milk-300">Continue</span>
        </button>
      </div>
    </div>
  );
};

export default Mnemonic;
