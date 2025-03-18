import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyringService } from "../../services/KeyringService";
import type { KeyringPair } from "@polkadot/keyring/types";

interface CreateFormProps {
  mnemonic?: string;
  onSuccess: (account: KeyringPair, mnemonic: string) => void;
  isLoading?: boolean;
}

const CreateForm = ({
  mnemonic,
  onSuccess,
  isLoading = false,
}: CreateFormProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameSelected, setUsernameSelected] = useState(false);
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = (username: string) => {
    if (username.trim().length < 3) {
      setUsernameStatus("Minimum 3 characters required");
      return false;
    }
    setUsernameStatus("Username is valid");
    return true;
  };

  const validatePassword = (password: string) => {
    if (password.trim().length < 8) {
      setPasswordStatus("Minimum 8 characters required");
      return false;
    }
    setPasswordStatus("Password is valid");
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validatePassword(password)) return;
    if (!validateUsername(username)) return;

    try {
      setIsSubmitting(true);
      const userMnemonic = mnemonic || KeyringService.createMnemonic();
      const account = await KeyringService.addAccount(
        userMnemonic,
        username,
        password
      );
      await KeyringService.unlockAccount(username, password);
      onSuccess(account, userMnemonic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
      setPasswordStatus(null);
      setUsernameStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-4 flex flex-col items-center"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div className="w-54 h-20">
        <label className="text-xs text-mf-silver-300 mb-2">Username</label>
        <input
          type="text"
          name="username"
          required
          autoComplete="off"
          value={username}
          onChange={handleChange}
          onFocus={() => setUsernameSelected(true)}
          onBlur={() => setUsernameSelected(false)}
          className={`w-full px-4 py-3 text-xs rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
            usernameStatus
              ? usernameStatus === "Username is valid"
                ? usernameSelected
                  ? "ring-2 ring-mf-sybil-500"
                  : ""
                : "ring-2 ring-mf-safety-300"
              : "focus:ring-mf-safety-300"
          }`}
          placeholder="Enter username"
        />
        <div className="h-5">
          {usernameStatus &&
            (usernameSelected || usernameStatus !== "Username is valid") && (
              <p
                className={`mt-2 text-xs ${
                  usernameStatus === "Username is valid"
                    ? "text-mf-sybil-500"
                    : "text-mf-safety-300"
                }`}
              >
                {usernameStatus}
              </p>
            )}
        </div>
      </div>

      <div className="w-54 h-20">
        <label className="text-xs text-mf-silver-300 mb-2">Password</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={handleChange}
          onFocus={() => setPasswordSelected(true)}
          onBlur={() => setPasswordSelected(false)}
          className={`w-full px-4 py-3 text-xs rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
            error
              ? "ring-2 ring-mf-safety-300"
              : passwordStatus
              ? passwordStatus === "Password is valid"
                ? passwordSelected
                  ? "ring-2 ring-mf-sybil-500"
                  : ""
                : "ring-2 ring-mf-safety-300"
              : "focus:ring-mf-safety-300"
          }`}
          placeholder="Enter password"
        />
        <div className="h-5">
          {(passwordStatus &&
            (passwordSelected || passwordStatus !== "Password is valid")) ||
          error ? (
            <p
              className={`mt-2 text-xs ${
                error
                  ? "text-mf-safety-300"
                  : passwordStatus === "Password is valid"
                  ? "text-mf-sybil-500"
                  : "text-mf-safety-300"
              }`}
            >
              {error || passwordStatus}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-center w-54">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-sm flex items-center justify-center rounded-lg border border-mf-ash-500 hover:bg-mf-ash-500 transition-colors px-4 py-3 mb-3"
        >
          <span className="text-mf-milk-300">Back</span>
        </button>

        <button
          type="submit"
          disabled={
            isLoading ||
            isSubmitting ||
            !username ||
            !password ||
            usernameStatus !== "Username is valid" ||
            passwordStatus !== "Password is valid"
          }
          className="w-full text-sm flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-mf-milk-300">
            {isLoading || isSubmitting ? "Creating..." : "Create Wallet"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default CreateForm;
