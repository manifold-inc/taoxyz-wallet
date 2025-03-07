import { useState } from "react";
import { KeyringService } from "../services/KeyringService";
import { useNavigate } from "react-router-dom";

const Import = () => {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      setError(null);

      if (!username.trim()) {
        setError("Username is required");
        return;
      } else if (!password.trim()) {
        setError("Password is required");
        return;
      } else if (!mnemonic.trim()) {
        setError("Mnemonic is required");
        return;
      }

      setIsLoading(true);
      const account = await KeyringService.addAccount(
        mnemonic,
        username,
        password
      );

      navigate("/dashboard", { state: { address: account.address } });

      setMnemonic("");
      setUsername("");
      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to import wallet"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-4">
        <h2 className="text-[13px] font-semibold mb-4 text-gray-900">
          Import Account
        </h2>

        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Recovery Phrase
            </label>
            <textarea
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              className="w-full h-24 px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
              placeholder="Enter your 12 or 24-word recovery phrase"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => {
                setMnemonic("");
                setUsername("");
                setPassword("");
                setError(null);
              }}
              className="flex-1 text-[10px] px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleImport}
              disabled={
                isLoading ||
                !mnemonic.trim() ||
                !username.trim() ||
                !password.trim()
              }
              className="flex-1 text-[10px] px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  <span>Importing...</span>
                </div>
              ) : (
                "Import"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Import;
