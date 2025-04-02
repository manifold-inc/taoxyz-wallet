import { useState } from "react";

import { useLock } from "../../contexts/LockContext";
import { useWallet } from "../../contexts/WalletContext";
import { useNotification } from "../../contexts/NotificationContext";
import KeyringService from "../../services/KeyringService";
import MessageService from "../../services/MessageService";
import WalletSelection from "../common/WalletSelection";
import { NotificationType } from "../../../types/client";
import taoxyz from "../../../../public/icons/taoxyz.svg";

const LockScreen = () => {
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const { currentAddress } = useWallet();
  const [password, setPassword] = useState("");
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPassword(event.target.value);
    setError(null);
  };

  const handleUnlock = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
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
        showNotification({
          type: NotificationType.Error,
          message: "Failed to Unlock Wallet",
        });
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Unable to decode using the supplied passphrase"
      ) {
        setError("Invalid Password");
      } else {
        showNotification({
          type: NotificationType.Error,
          message: "Failed to Unlock Wallet",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-74 [&>*]:w-full mt-4">
        <WalletSelection />
        <div className="flex flex-col items-center justify-center mt-8">
          <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16" />

          <div className="text-center text-lg text-mf-milk-500 mt-4">
            <h1>Unlock Wallet</h1>
          </div>

          <form
            onSubmit={handleUnlock}
            className="flex flex-col items-center justify-center [&>*]:w-full mt-8"
            autoComplete="off"
          >
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordSelected(true)}
              onBlur={() => setPasswordSelected(false)}
              placeholder="Enter Password"
              className={`p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-2 focus:outline-none ${
                error
                  ? "border-mf-safety-500"
                  : password.length >= 3
                  ? passwordSelected
                    ? "border-mf-sybil-500"
                    : "border-transparent"
                  : "border-transparent focus:border-mf-safety-500"
              }`}
              minLength={3}
            />
            <div className="h-8">
              {error && (
                <p className="mt-2 text-xs text-mf-safety-500">{error}</p>
              )}
            </div>

            <div className="flex flex-col items-center mt-1">
              <button
                type="submit"
                disabled={password.length < 3}
                className="w-44 border-sm text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
              >
                <span>Unlock</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
