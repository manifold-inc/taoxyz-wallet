import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import taoxyzLogo from "../../../public/icons/taoxyz.svg";
import CreateForm from "../components/CreateForm";
import { KeyringService } from "../services/KeyringService";

const Import = () => {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState("");
  const [validatedMnemonic, setValidatedMnemonic] = useState<string | null>(
    null
  );
  const [mnemonicSelected, setMnemonicSelected] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMnemonicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setError(null);

    if (!mnemonic.trim()) {
      setError("Recovery phrase is required");
      return;
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setError("Recovery phrase must be 12 or 24 words");
      return;
    }

    if (!KeyringService.validateMnemonic(mnemonic.trim())) {
      setError("Recovery phrase is invalid");
      return;
    }

    setValidatedMnemonic(mnemonic.trim());
  };

  const handleSuccess = (account: KeyringPair) => {
    navigate("/dashboard", { state: { address: account.address } });
  };

  if (validatedMnemonic) {
    return (
      <div className="flex flex-col items-center min-h-screen">
        <div className="h-20" />
        <div className="flex flex-col items-center flex-1">
          <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-[20px] font-semibold text-mf-silver-300">
                Create Account
              </h1>
            </div>
            <CreateForm
              mnemonic={validatedMnemonic}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-semibold text-mf-silver-300">
              Import Wallet
            </h1>
          </div>

          <form
            onSubmit={handleMnemonicSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            <div className="w-54 h-[120px]">
              <textarea
                name="mnemonic"
                value={mnemonic}
                onChange={(e) => {
                  setMnemonic(e.target.value);
                  setError(null);
                  setIsSubmitted(false);
                }}
                onFocus={() => setMnemonicSelected(true)}
                onBlur={() => setMnemonicSelected(false)}
                className={`w-full h-24 px-4 py-3 text-[12px] rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
                  error
                    ? "ring-2 ring-mf-safety-300"
                    : "focus:ring-mf-safety-300"
                }`}
                placeholder="Enter your 12 or 24-word recovery phrase"
                required
              />
              <div className="h-5">
                {error && (isSubmitted || mnemonicSelected) && (
                  <p className="mt-1 text-[10px] text-mf-safety-300">{error}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center w-54">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-[14px] flex items-center justify-center rounded-lg border border-mf-ash-500 hover:bg-mf-ash-500 transition-colors px-4 py-3 mb-3"
              >
                <span className="text-mf-milk-300">Back</span>
              </button>

              <button
                type="submit"
                disabled={!mnemonic.trim()}
                className="w-full text-[14px] flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-mf-milk-300">Continue</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default Import;
