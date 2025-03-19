import { useState } from "react";
import { useNavigate } from "react-router-dom";

import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

interface LogInProps {
  setIsLocked: (isLocked: boolean) => void;
}

const LogIn = ({ setIsLocked }: LogInProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    const isUnlocked = await KeyringService.unlockAccount(username, password);
    if (!isUnlocked) {
      setError("Invalid Credentials");
      return;
    }

    const address = await KeyringService.getAddress(username);
    // TODO: Render error component
    if (address instanceof Error) {
      setError(address.message);
      return;
    }

    await chrome.storage.local.set({
      currentAddress: address,
    });
    await chrome.storage.local.set({ accountLocked: false });
    MessageService.sendClearLockTimer();
    setIsLocked(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />

        <div>
          <div className="text-center text-lg text-mf-milk-500 mt-4">
            <h1>Log In</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center mt-8 w-64 [&>*]:w-full"
          >
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              className="p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-500"
              placeholder="Enter Username"
              required
            />
            <div className="h-8" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="p-3 rounded-sm text-base text-mf-milk-300 bg-mf-ash-300 placeholder:text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-500"
              placeholder="Enter Password"
              required
            />
            <div className="h-8">
              {error && (
                <p className="mt-2 text-xs text-mf-safety-500">{error}</p>
              )}
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
                className="w-44 rounded-xs text-sm text-mf-night-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 transition-colors p-1.5"
              >
                <span>Sign In</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
