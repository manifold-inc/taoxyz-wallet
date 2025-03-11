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
    <div className="space-y-4 flex flex-col items-center">
      <div className="w-54">
        <h3 className="text-[12px] font-medium mb-2 text-mf-silver-300">
          Your Recovery Phrase
        </h3>
        <p className="text-[12px] text-mf-milk-300 mb-4">
          Write down these words in the right order and store them safely.
        </p>
        <div className="relative">
          <div className="p-4 bg-mf-ash-500 rounded-lg text-[12px] break-all text-mf-milk-300">
            {mnemonic}
          </div>
          <button
            onClick={handleCopyMnemonic}
            className="absolute top-3 right-3 p-1 text-mf-safety-300 hover:text-mf-safety-500"
          >
            <Copy size={16} />
          </button>
          {copied && (
            <div className="absolute -top-8 right-0 bg-mf-ash-500 text-mf-milk-300 text-[12px] px-3 py-1 rounded-lg">
              Copied!
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-54 text-[14px] flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3 mt-2"
      >
        <span className="text-mf-milk-300">I've Saved My Recovery Phrase</span>
      </button>
    </div>
  );
};

export default Mnemonic;
