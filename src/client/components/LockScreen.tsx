import { useState } from "react";
import { useNavigate } from "react-router-dom";

import KeyringService from "../services/KeyringService";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

interface LockScreenProps {
  setIsLocked: (isLocked: boolean) => void;
}

const LockScreen = ({ setIsLocked }: LockScreenProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || password.length < 3) return;
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
        setIsLocked(false);
        navigate("/dashboard");
      } else {
        setError("Invalid password");
      }
    } catch (error) {
      console.error("[LockScreen] Error unlocking wallet:", error);
      setError("Failed to unlock wallet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-mf-silver-300">
              Unlock Your Wallet
            </h1>
          </div>

          <form
            onSubmit={handleUnlock}
            className="flex flex-col h-full justify-between"
          >
            <div className="w-54">
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder={`Enter your password`}
                className="w-full px-4 py-3 rounded-lg bg-mf-ash-500 text-mf-milk-300 placeholder:text-mf-silver-500"
                disabled={isLoading}
                minLength={3}
              />
              <div className="h-5">
                {error && (
                  <p className="mt-2 text-xs text-mf-safety-300">{error}</p>
                )}
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button
                type="submit"
                disabled={password.length < 3 || isLoading}
                className="w-full text-sm rounded-lg bg-mf-safety-300 hover:bg-mf-safety-400 disabled:bg-mf-ash-300 disabled:cursor-not-allowed transition-colors px-4 py-3 text-mf-milk-300"
              >
                {isLoading ? "Unlocking..." : "Unlock"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default LockScreen;
