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
    <div className="flex flex-col items-center space-y-6 p-4">
      <h1 className="text-2xl font-bold">Import Account</h1>

      <div className="w-full max-w-2xl space-y-4">
        <input
          type="text"
          className="w-full p-3 bg-transparent border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />

        <input
          type="password"
          className="w-full p-3 bg-transparent border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />

        <textarea
          className="w-full h-32 p-3 bg-transparent border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="Enter your 12 or 24-word recovery phrase"
        />
      </div>

      {error && (
        <div className="text-red-500 text-center bg-red-500/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex space-x-4 w-full max-w-md">
        <button
          className="w-1/2 py-3 px-6 bg-gray-800 text-white rounded-lg hover:bg-gray-700 active:bg-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => {
            setMnemonic("");
            setUsername("");
            setPassword("");
            setError(null);
          }}
        >
          Clear
        </button>
        <button
          className={`w-1/2 py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 
            ${
              isLoading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-100 active:bg-gray-200 focus:ring-white/50"
            }`}
          onClick={handleImport}
          disabled={
            isLoading ||
            !mnemonic.trim() ||
            !username.trim() ||
            !password.trim()
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Importing...
            </span>
          ) : (
            "Import"
          )}
        </button>
      </div>
    </div>
  );
};

export default Import;
