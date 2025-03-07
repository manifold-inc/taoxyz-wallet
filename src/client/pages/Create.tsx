import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import type { KeyringPair } from "@polkadot/keyring/types";

import { KeyringService } from "../services/KeyringService";

export const Create = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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
      console.log("[Client] Account Created:", account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy mnemonic:", err);
    }
  };

  const handleContinue = () => {
    navigate("/dashboard", { state: { address: account?.address } });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-4">
        <h2 className="text-[13px] font-semibold mb-4 text-gray-900">
          Create New Wallet
        </h2>

        {!mnemonic ? (
          <form className="space-y-2" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={username}
                onChange={handleChange}
                className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={handleChange}
                className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-[10px] px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Wallet"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-[11px] font-medium mb-2 text-gray-900">
                Your Recovery Phrase
              </h3>
              <p className="text-[10px] text-gray-600 mb-2">
                Write down these words in the right order and store them safely.
              </p>
              <div className="relative">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[10px] break-all text-gray-900">
                  {mnemonic}
                </div>
                <button
                  onClick={handleCopyMnemonic}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-500"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full text-[10px] px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors"
            >
              I've Saved My Recovery Phrase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
