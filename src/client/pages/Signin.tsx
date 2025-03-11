import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { KeyringService } from "../services/KeyringService";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

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
      if (error instanceof Error && error.message === "Account not found") {
        setError("Username is invalid");
      } else if (
        error instanceof Error &&
        error.message === "Unable to decode using the supplied passphrase"
      ) {
        setError("Password is invalid");
      } else {
        setError(error instanceof Error ? error.message : "Failed to sign in");
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16 mb-8" />

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-semibold text-mf-silver-300">
              Sign In
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            <div className="w-54 mb-2">
              <label className="block text-[12px] text-mf-silver-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 text-[12px] rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="w-54 h-[85px]">
              <label className="block text-[12px] text-mf-silver-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-[12px] rounded-lg bg-mf-ash-500 text-mf-milk-300 border-none focus:outline-none focus:ring-2 focus:ring-mf-safety-300"
                placeholder="Enter password"
                required
              />
              <div className="h-5">
                {error && (
                  <p className="mt-2 text-[10px] text-mf-safety-300">{error}</p>
                )}
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
                className="w-full text-[14px] flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3"
              >
                <span className="text-mf-milk-300">Sign In</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default Signin;
