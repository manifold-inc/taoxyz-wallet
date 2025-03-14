import { useState } from "react";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

interface LockScreenProps {
  setIsLocked: (isLocked: boolean) => void;
}

const LockScreen = ({ setIsLocked }: LockScreenProps) => {
  const { api, isLoading: isApiLoading } = usePolkadotApi();
  const [password, setPassword] = useState("");
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || password.length < 3) return;

    if (!api || isApiLoading) {
      setError("Please wait for wallet to initialize...");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const currentAddress = localStorage.getItem("currentAddress") as string;
      const account = await KeyringService.getAccount(currentAddress);
      const isUnlocked = await KeyringService.unlockAccount(
        account.meta.username as string,
        password
      );

      if (isUnlocked) {
        localStorage.setItem("accountLocked", "false");
        await MessageService.sendStartLockTimer();
        setIsLocked(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen overflow-hidden">
      <div className="h-20" />
      <div className="flex flex-col items-center">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-mf-silver-300">
              Unlock Your Wallet
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
                disabled={isLoading || isApiLoading}
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
                disabled={password.length < 3 || isLoading || isApiLoading}
                className="w-full text-sm rounded-lg bg-mf-safety-300 hover:bg-mf-safety-400 disabled:bg-mf-ash-300 disabled:cursor-not-allowed transition-colors px-4 py-3 text-mf-milk-300 relative"
              >
                <span
                  className={
                    isLoading || isApiLoading ? "opacity-0" : "opacity-100"
                  }
                >
                  {isApiLoading ? "Initializing..." : "Unlock"}
                </span>
                {(isLoading || isApiLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-mf-milk-300 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
