import { useState } from "react";

import { useLock } from "../contexts/LockContext";
import { useWallet } from "../contexts/WalletContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

const LockScreen = () => {
  const { setIsLocked } = useLock();
  const { currentAddress } = useWallet();
  const [password, setPassword] = useState("");
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 3) return;

    if (!currentAddress) {
      setError("No wallet selected");
      return;
    }

    setError(null);

    try {
      const isUnlocked = KeyringService.unlockWallet(currentAddress, password);

      if (isUnlocked) {
        await setIsLocked(false);
        await MessageService.sendStartLockTimer();
      } else {
        setError("Failed to unlock wallet");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Unable to decode using the supplied passphrase"
      ) {
        setError("Invalid password");
      } else {
        console.error("[LockScreen] Error unlocking wallet:", error);
        setError("Failed to unlock wallet");
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen overflow-hidden">
      <div className="flex flex-col items-center">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-mf-silver-300">
            Unlock Wallet
          </h1>
        </div>

        <form onSubmit={handleUnlock} className="flex flex-col">
          <div className="w-54 h-20">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordSelected(true)}
              onBlur={() => setPasswordSelected(false)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-mf-ash-500 text-mf-milk-300 placeholder:text-mf-silver-500"
              minLength={3}
            />
            <div className="h-5">
              {error && passwordSelected && (
                <p className="mt-2 text-xs text-mf-safety-300">{error}</p>
              )}
            </div>
          </div>

          <div className="fixed bottom-20 w-54">
            <button
              type="submit"
              disabled={password.length < 3}
              className="w-full text-sm rounded-lg bg-mf-safety-300 hover:bg-mf-safety-400 disabled:bg-mf-ash-300 disabled:cursor-not-allowed transition-colors px-4 py-3 text-mf-milk-300"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockScreen;
