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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create New Wallet
          </h2>
        </div>
        {!mnemonic ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {isLoading ? "Creating..." : "Create Wallet"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your Recovery Phrase
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Write down these words in the right order and store them safely.
                You'll need them to recover your wallet.
              </p>
              <div className="relative">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 break-all">
                  {mnemonic}
                </div>
                <button
                  onClick={handleCopyMnemonic}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  <Copy size={12} />
                </button>
                {copied && (
                  <span className="absolute -top-8 right-0 text-sm text-green-600">
                    Copied
                  </span>
                )}
              </div>
            </div>
            <div>
              <button
                onClick={handleContinue}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                I've Saved My Recovery Phrase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
