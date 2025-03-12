import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KeyringService from "../services/KeyringService";

import taoxyzLogo from "../../../public/icons/taoxyz.svg";

const LockScreen = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUnlock = async () => {
    try {
      const currentAddress = localStorage.getItem("currentAddress");
      if (!currentAddress) {
        navigate("/");
        return;
      }

      const account = await KeyringService.getAccount(currentAddress);
      const unlocked = await KeyringService.unlockAccount(
        account.meta.username as string,
        password
      );

      if (unlocked) {
        navigate("/dashboard", { state: { address: currentAddress } });
      } else {
        setError("Invalid password");
      }
    } catch (error) {
      setError("Failed to unlock wallet");
      console.error("[LockScreen] Error unlocking wallet:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-semibold text-mf-silver-300">
              Unlock Your Wallet
            </h1>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-mf-ash-500 text-mf-milk-300 placeholder:text-mf-silver-500"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleUnlock}
              disabled={!password}
              className="w-full text-[14px] rounded-lg bg-mf-safety-300 hover:bg-mf-safety-400 disabled:bg-mf-ash-300 disabled:cursor-not-allowed transition-colors px-4 py-3 text-mf-milk-300"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default LockScreen;
