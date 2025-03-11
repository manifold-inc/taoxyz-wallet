import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import taoxyzLogo from "../../../public/icons/taoxyz.svg";
import { KeyringService } from "../services/KeyringService";
import MnemonicDisplay from "../components/Mnemonic";

export const Create = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [account, setAccount] = useState<KeyringPair | null>(null);
  const [usernameSelected, setUsernameSelected] = useState(false);
  const [passwordSelected, setPasswordSelected] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (username: string) => {
    if (username.trim().length < 3) {
      setUsernameStatus("Username must be at least 3 characters long");
      return false;
    }
    setUsernameStatus("Username is valid");
    return true;
  };

  const validatePassword = (password: string) => {
    if (password.trim().length < 8) {
      setPasswordStatus("Password must be at least 8 characters long");
      return false;
    }
    setPasswordStatus("Password is valid");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validatePassword(password)) return;
    if (!validateUsername(username)) return;
    try {
      setIsLoading(true);
      const generatedMnemonic = KeyringService.createMnemonic();
      setMnemonic(generatedMnemonic);

      const account = await KeyringService.addAccount(
        generatedMnemonic,
        username,
        password
      );
      setAccount(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
      setPasswordStatus(null);
    } finally {
      setIsLoading(false);
    }
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

  const handleContinue = () => {
    navigate("/dashboard", { state: { address: account?.address } });
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        {!mnemonic ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-[20px] font-semibold text-mf-silver-300">
                Create Wallet
              </h1>
            </div>
            <form
              className="space-y-4 flex flex-col items-center"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="w-54 h-[85px]">
                <label className="block text-[12px] text-mf-silver-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={handleChange}
                  onFocus={() => setUsernameSelected(true)}
                  onBlur={() => setUsernameSelected(false)}
                  className={`w-full px-4 py-3 text-[12px] rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
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
                    (usernameSelected ||
                      usernameStatus !== "Username is valid") && (
                      <p
                        className={`mt-1 text-[10px] ${
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

              <div className="w-54 h-[85px]">
                <label className="block text-[12px] text-mf-silver-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={handleChange}
                  onFocus={() => setPasswordSelected(true)}
                  onBlur={() => setPasswordSelected(false)}
                  className={`w-full px-4 py-3 text-[12px] rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 ${
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
                    (passwordSelected ||
                      passwordStatus !== "Password is valid")) ||
                  error ? (
                    <p
                      className={`mt-1 text-[10px] ${
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
                  className="w-full text-[14px] flex items-center justify-center rounded-lg border border-mf-ash-500 hover:bg-mf-ash-500 transition-colors px-4 py-3 mb-3"
                >
                  <span className="text-mf-milk-300">Back</span>
                </button>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !username ||
                    !password ||
                    usernameStatus !== "Username is valid" ||
                    passwordStatus !== "Password is valid"
                  }
                  className="w-full text-[14px] flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-mf-milk-300">
                    {isLoading ? "Creating..." : "Create Wallet"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-[20px] font-semibold text-mf-silver-300">
                Recovery Phrase
              </h1>
            </div>
            <div className="flex flex-col flex-1 w-full">
              <MnemonicDisplay
                mnemonic={mnemonic}
                onContinue={handleContinue}
              />
            </div>
          </>
        )}
      </div>
      {!mnemonic && <div className="h-20" />}
    </div>
  );
};

export default Create;
