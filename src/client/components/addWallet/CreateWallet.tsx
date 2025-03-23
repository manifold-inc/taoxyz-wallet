import { useState } from "react";
import type { KeyringPair } from "@polkadot/keyring/types";

import { useNotification } from "../../contexts/NotificationContext";
import KeyringService from "../../services/KeyringService";
import { NotificationType } from "../../../types/client";

interface CreateWalletProps {
  onSuccess: (wallet: KeyringPair, mnemonic: string) => Promise<void>;
  onBack: () => void;
}

const CreateWallet = ({ onSuccess, onBack }: CreateWalletProps) => {
  const { showNotification } = useNotification();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameSelected, setUsernameSelected] = useState(false);
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const validateUsername = (value: string): boolean => {
    if (value.trim().length < 3) {
      setUsernameStatus("Minimum 3 Characters Required");
      return false;
    }
    setUsernameStatus(null);
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (value.trim().length < 8) {
      setPasswordStatus("Minimum 8 Characters Required");
      return false;
    }
    setPasswordStatus(null);
    return true;
  };

  const handleUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    setUsername(value);
    if (value.length > 0) {
      if (validateUsername(value)) {
        setUsernameStatus("Valid Username");
      }
    } else {
      setUsernameStatus(null);
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    setPassword(value);
    if (value.length > 0) {
      if (validatePassword(value)) {
        setPasswordStatus("Valid Password");
      }
    } else {
      setPasswordStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateUsername(username) || !validatePassword(password)) {
      return;
    }

    const mnemonic = KeyringService.createMnemonic();
    const wallet = await KeyringService.addWallet(mnemonic, username, password);
    if (wallet instanceof Error) {
      showNotification({
        type: NotificationType.Error,
        message: wallet.message,
      });
      return;
    }
    await onSuccess(wallet, mnemonic);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center mt-8 w-64 [&>*]:w-full"
    >
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        onFocus={() => setUsernameSelected(true)}
        onBlur={() => setUsernameSelected(false)}
        className={`p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
          usernameStatus === "Valid Username" && !usernameSelected
            ? ""
            : usernameStatus === "Valid Username"
            ? "ring-2 ring-mf-sybil-500"
            : usernameSelected
            ? "ring-2 ring-mf-safety-500"
            : usernameStatus
            ? "ring-2 ring-mf-safety-500"
            : ""
        }`}
        placeholder="Enter Username"
        required
      />
      <div className="h-8">
        {usernameStatus && (
          <p
            className={`mt-2 text-xs text-left ${
              usernameStatus === "Valid Username" && !usernameSelected
                ? "hidden"
                : usernameStatus === "Valid Username"
                ? "text-mf-sybil-500"
                : "text-mf-safety-500"
            }`}
          >
            {usernameStatus}
          </p>
        )}
      </div>

      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        onFocus={() => setPasswordSelected(true)}
        onBlur={() => setPasswordSelected(false)}
        className={`p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
          passwordStatus === "Valid Password" && !passwordSelected
            ? ""
            : passwordStatus === "Valid Password"
            ? "ring-2 ring-mf-sybil-500"
            : passwordSelected
            ? "ring-2 ring-mf-safety-500"
            : passwordStatus
            ? "ring-2 ring-mf-safety-500"
            : ""
        }`}
        placeholder="Enter Password"
        required
      />
      <div className="h-8">
        {passwordStatus && (
          <p
            className={`mt-2 text-xs text-left ${
              passwordStatus === "Valid Password" && !passwordSelected
                ? "hidden"
                : passwordStatus === "Valid Password"
                ? "text-mf-sybil-500"
                : "text-mf-safety-500"
            }`}
          >
            {passwordStatus}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center space-y-3 mt-1">
        <button
          type="button"
          onClick={onBack}
          className="w-44 rounded-sm text-sm text-mf-safety-500 bg-mf-night-500 hover:bg-mf-safety-500 hover:text-mf-night-500 border-2 border-mf-safety-500 transition-colors p-1.5"
        >
          <span>Back</span>
        </button>
        <button
          type="submit"
          disabled={
            !username ||
            !password ||
            usernameStatus !== "Valid Username" ||
            passwordStatus !== "Valid Password"
          }
          className="w-44 rounded-sm text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
        >
          <span>Create</span>
        </button>
      </div>
    </form>
  );
};

export default CreateWallet;
