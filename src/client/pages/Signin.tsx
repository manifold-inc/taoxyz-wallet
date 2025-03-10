import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { KeyringService } from "../services/KeyringService";

const Signin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isUnlocked = await KeyringService.unlockAccount(username, password);
      if (isUnlocked) {
        const address = await KeyringService.getAddress(username);
        navigate("/dashboard", { state: { address } });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sign in");
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-4">
        <h2 className="text-[13px] font-semibold mb-4 text-gray-900">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500"
              placeholder="Enter your username"
              required
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
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-[10px] px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
