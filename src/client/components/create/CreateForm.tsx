import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import KeyringService from "../../services/KeyringService";

interface CreateFormProps {
  mnemonic?: string;
  onSuccess: (account: KeyringPair, mnemonic: string) => void;
}

const CreateForm = ({ mnemonic, onSuccess }: CreateFormProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameSelected, setUsernameSelected] = useState(false);
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = (username: string): boolean => {
    if (username.trim().length < 3) {
      setUsernameStatus("Minimum 3 Characters Required");
      return false;
    }
    setUsernameStatus("Valid Username");
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (password.trim().length < 8) {
      setPasswordStatus("Minimum 8 Characters Required");
      return false;
    }
    setPasswordStatus("Valid Password");
    return true;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    if (name === "username") {
      setUsername(value);
      if (value.length > 0) {
        validateUsername(value);
      } else {
        setUsernameStatus(null);
      }
    } else if (name === "password") {
      setPassword(value);
      if (value.length > 0) {
        validatePassword(value);
      } else {
        setPasswordStatus(null);
      }
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    if (!validatePassword(password)) return;
    if (!validateUsername(username)) return;

    setIsSubmitting(true);
    const inputMnemonic = mnemonic || KeyringService.createMnemonic();
    // TODO: Render error component
    if (!inputMnemonic) {
      setError("Failed to create mnemonic");
      setIsSubmitting(false);
      return;
    }

    // TODO: Render error component
    const account = await KeyringService.addAccount(
      inputMnemonic,
      username,
      password
    );
    if (!account) {
      setError("Failed to create account");
      setIsSubmitting(false);
      return;
    }

    // TODO: Handle account unlock failure
    await KeyringService.unlockAccount(username, password);

    onSuccess(account, inputMnemonic);
    setIsSubmitting(false);
  };

  return (
    <form
      className="flex flex-col items-center justify-center mt-8 w-64 [&>*]:w-full"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <input
        type="text"
        name="username"
        required
        value={username}
        onChange={handleChange}
        onFocus={() => setUsernameSelected(true)}
        onBlur={() => setUsernameSelected(false)}
        className={`p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
          usernameStatus
            ? usernameStatus === "Valid Username"
              ? usernameSelected
                ? "ring-2 ring-mf-sybil-500"
                : ""
              : "ring-2 ring-mf-safety-500"
            : "focus:ring-mf-safety-500"
        }`}
        placeholder="Enter Username"
      />
      <div className="h-8">
        {usernameStatus &&
          (usernameSelected || usernameStatus !== "Valid Username") && (
            <p
              className={`mt-2 text-xs text-left ${
                usernameStatus === "Valid Username"
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
        name="password"
        required
        value={password}
        onChange={handleChange}
        onFocus={() => setPasswordSelected(true)}
        onBlur={() => setPasswordSelected(false)}
        className={`p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
          error
            ? "ring-2 ring-mf-safety-500"
            : passwordStatus
            ? passwordStatus === "Valid Password"
              ? passwordSelected
                ? "ring-2 ring-mf-sybil-500"
                : ""
              : "ring-2 ring-mf-safety-500"
            : "focus:ring-mf-safety-500"
        }`}
        placeholder="Enter Password"
      />
      <div className="h-8">
        {(passwordStatus &&
          (passwordSelected || passwordStatus !== "Valid Password")) ||
        error ? (
          <p
            className={`mt-2 text-xs text-left ${
              error
                ? "text-mf-safety-500"
                : passwordStatus === "Valid Password"
                ? "text-mf-sybil-500"
                : "text-mf-safety-500"
            }`}
          >
            {error || passwordStatus}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-center space-y-3 mt-1">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-44 rounded-xs text-sm text-mf-safety-500 bg-mf-night-500 border-mf-night-500 hover:border-mf-safety-500 border-2 transition-colors p-1.5"
        >
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !username ||
            !password ||
            usernameStatus !== "Valid Username" ||
            passwordStatus !== "Valid Password"
          }
          className="w-44 rounded-xs text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
        >
          <span>{isSubmitting ? "Creating..." : "Create Wallet"}</span>
        </button>
      </div>
    </form>
  );
};

export default CreateForm;
