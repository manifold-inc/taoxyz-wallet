import { useState } from "react";
import type { KeyringPair } from "@polkadot/keyring/types";

import { useNotification } from "../../contexts/NotificationContext";
import KeyringService from "../../services/KeyringService";
import { NotificationType } from "../../../types/client";

interface ImportWalletProps {
  mnemonic: string;
  onSuccess: (wallet: KeyringPair) => Promise<void>;
}

const ImportWallet = ({ mnemonic, onSuccess }: ImportWalletProps) => {
  const { showNotification } = useNotification();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [nameSelected, setNameSelected] = useState(false);
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [nameStatus, setNameStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const validateName = (value: string): boolean => {
    if (value.trim().length < 3) {
      setNameStatus("Minimum 3 Characters Required");
      return false;
    }
    setNameStatus(null);
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setName(value);
    if (value.length > 0) {
      if (validateName(value)) {
        setNameStatus("Valid Wallet Name");
      }
    } else {
      setNameStatus(null);
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
    if (!validateName(name) || !validatePassword(password)) {
      return;
    }

    const wallet = await KeyringService.addWallet(mnemonic, name, password);
    if (wallet instanceof Error) {
      showNotification({
        type: NotificationType.Error,
        message: wallet.message,
      });
      return;
    }
    await onSuccess(wallet);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center mt-8 w-64 [&>*]:w-full"
    >
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        onFocus={() => setNameSelected(true)}
        onBlur={() => setNameSelected(false)}
        className={`p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-2 focus:outline-none ${
          nameStatus === "Valid Wallet Name" && !nameSelected
            ? "border-transparent"
            : nameStatus === "Valid Wallet Name"
            ? "border-mf-sybil-500"
            : nameSelected
            ? "border-mf-safety-500"
            : nameStatus
            ? "border-mf-safety-500"
            : "border-transparent focus:border-mf-safety-500"
        }`}
        placeholder="Wallet Name"
        required
      />
      <div className="h-8">
        {nameStatus && (
          <p
            className={`mt-2 text-xs text-left ${
              nameStatus === "Valid Wallet Name" && !nameSelected
                ? "hidden"
                : nameStatus === "Valid Wallet Name"
                ? "text-mf-sybil-500"
                : "text-mf-safety-500"
            }`}
          >
            {nameStatus}
          </p>
        )}
      </div>

      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        onFocus={() => setPasswordSelected(true)}
        onBlur={() => setPasswordSelected(false)}
        className={`p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-2 focus:outline-none ${
          passwordStatus === "Valid Password" && !passwordSelected
            ? "border-transparent"
            : passwordStatus === "Valid Password"
            ? "border-mf-sybil-500"
            : passwordSelected
            ? "border-mf-safety-500"
            : passwordStatus
            ? "border-mf-safety-500"
            : "border-transparent focus:border-mf-safety-500"
        }`}
        placeholder="Password"
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

      <div className="flex flex-col items-center mt-1">
        <button
          type="submit"
          disabled={
            !name ||
            !password ||
            nameStatus !== "Valid Wallet Name" ||
            passwordStatus !== "Valid Password"
          }
          className="w-44 border-sm text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5 cursor-pointer"
        >
          <span>Import</span>
        </button>
      </div>
    </form>
  );
};

export default ImportWallet;
