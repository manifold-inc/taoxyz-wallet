import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { KeyringService } from "../services/KeyringService";
import type { StakeTransaction } from "../../types/client";

interface PortfolioProps {
  stakes: StakeTransaction[];
  address: string;
}

export const Portfolio = ({ stakes, address }: PortfolioProps) => {
  const { api } = usePolkadotApi();
  const navigate = useNavigate();
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    null
  );

  const handleSwap = async (stake: StakeTransaction) => {
    setSelectedStake(stake);
    setIsSwapping(true);
  };

  const confirmSwap = async () => {
    if (!api || !selectedStake) return;
    try {
      setError(null);
      const account = await KeyringService.getAccount(address);
      const username = account.meta.username as string;
      await KeyringService.unlockAccount(username, password);

      const convertedStake = selectedStake.tokens / 1e9;
      await api.removeStake({
        address,
        validatorHotkey: selectedStake.validatorHotkey,
        subnetId: selectedStake.subnetId,
        amount: convertedStake,
      });

      setPassword("");
      setSelectedStake(null);
      setIsSwapping(false);

      navigate("/dashboard", { state: { address } });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to swap");
    }
  };

  return (
    <div>
      {stakes.length > 0 ? (
        <div className="space-y-2">
          {stakes.map((stake, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold">
                    Subnet {stake.subnetId}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    {stake.validatorHotkey.slice(0, 8)}...
                    {stake.validatorHotkey.slice(-8)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Stake: {(stake.tokens / 1e9).toFixed(4)} α
                  </p>
                </div>
                <button
                  onClick={() => handleSwap(stake)}
                  className="text-[10px] text-red-500 px-4 py-1 rounded outline outline-1 outline-black/20 hover:bg-red-500/10 hover:text-red-500"
                >
                  Unstake
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20">
          <p className="text-[10px] text-gray-400">No stakes found</p>
        </div>
      )}

      {isSwapping && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4">
            <h3 className="text-[13px] font-semibold mb-4 text-gray-900">
              Enter Password to Swap
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 text-[10px] rounded-lg border border-gray-200 hover:border-blue-500 focus:outline-none focus:border-blue-500 mb-4"
            />
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-lg border border-red-100 mb-4">
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsSwapping(false);
                  setPassword("");
                  setError(null);
                }}
                className="flex-1 py-2 px-3 text-[10px] rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwap}
                className="flex-1 py-2 px-3 text-[10px] text-red-500 rounded-lg border border-gray-200 hover:bg-red-500/10 hover:border-red-500 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
