import { useState } from "react";

const ImportWallet = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    try {
      if (!name.trim() || !password.trim()) {
        throw new Error("Username and password are required");
      }

      setError(null);
      setIsLoading(true);

      const response = await chrome.runtime.sendMessage({
        type: "pub(import.wallet)",
        payload: {
          mnemonic: mnemonic.trim().toLowerCase(),
          name: name.trim(),
          password: password.trim(),
        },
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // TODO: Navigate to accounts page or show success message
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to import wallet"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h1 className="text-2xl font-bold">Import Account</h1>

      <div className="w-full max-w-2xl space-y-4">
        <input
          type="text"
          className="w-full p-3 bg-transparent border border-gray-700 rounded focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter username"
        />

        <input
          type="password"
          className="w-full p-3 bg-transparent border border-gray-700 rounded focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />

        <textarea
          className="w-full h-32 p-3 bg-transparent border border-gray-700 rounded focus:outline-none"
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="Enter your 12 or 24-word recovery phrase"
        />
      </div>

      {error && <div className="text-red-500 text-center">{error}</div>}

      <div className="flex space-x-4 w-full max-w-md">
        <button
          className="w-1/2 py-3 bg-gray-800 text-white rounded"
          onClick={() => {
            setMnemonic("");
            setName("");
            setPassword("");
          }}
        >
          Clear
        </button>
        <button
          className="w-1/2 py-3 bg-white text-black rounded"
          onClick={handleImport}
          disabled={
            isLoading || !mnemonic.trim() || !name.trim() || !password.trim()
          }
        >
          {isLoading ? "Importing..." : "Import"}
        </button>
      </div>
    </div>
  );
};

export default ImportWallet;
