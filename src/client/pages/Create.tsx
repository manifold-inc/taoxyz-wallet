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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<KeyringPair | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleContinue = () => {
    navigate("/dashboard", { state: { address: account?.address } });
  };

  return (
    <div className="bg-mf-night-700 flex flex-col items-center justify-between min-h-screen">
      <div className="flex-1" />
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16" />
        </div>

        <div className="w-full max-w-md bg-mf-night-700">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-semibold text-mf-silver-300">
              Create Wallet
            </h1>
          </div>

          {!mnemonic ? (
            <form
              className="space-y-4 flex flex-col items-center"
              onSubmit={handleSubmit}
            >
              <div className="w-54">
                <label className="block text-[12px] text-mf-silver-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  value={username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[12px] rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
                  placeholder="Enter username"
                />
              </div>

              <div className="w-54">
                <label className="block text-[12px] text-mf-silver-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[12px] rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <div className="w-54 p-3 bg-mf-ash-500 text-mf-safety-300 text-[12px] rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-54 text-[14px] flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3 mt-2"
              >
                <span className="text-mf-milk-300">
                  {isLoading ? "Creating..." : "Create Wallet"}
                </span>
              </button>
            </form>
          ) : (
            <MnemonicDisplay mnemonic={mnemonic} onContinue={handleContinue} />
          )}
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
};

export default Create;
