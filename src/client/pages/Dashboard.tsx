import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Portfolio } from "../components/Portfolio";
import { useRpcApi } from "../contexts/RpcApiContext";
import type { StakeTransaction } from "../../types/types";

export const Dashboard = () => {
  const { api } = useRpcApi();
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address;
  const [balance, setBalance] = useState("");
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!api) return;
      try {
        setIsLoading(true);
        const balance = await api.getBalance(address);
        setBalance(balance ?? "0");
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch balance"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStake = async () => {
      if (!api) return;
      try {
        const stake = await api.getStake(address);
        if (stake) {
          const formattedStakes = (stake as any[]).map((stake) => ({
            subnetId: stake.netuid,
            validatorHotkey: stake.hotkey,
            tokens: stake.stake,
          }));
          setStakes(formattedStakes);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch stake"
        );
      }
    };

    fetchBalance();
    fetchStake();
  }, [address, api]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-[11px] font-medium mb-4">Balance</h2>
        <div className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20">
          <div className="flex flex-col items-start">
            <div className="flex items-baseline space-x-1">
              <span className="text-[13px] font-semibold">
                {Number(balance).toFixed(4)}
              </span>
              <span className="text-[10px] text-gray-400">τ</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{address}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-[11px] font-medium mb-4">Actions</h2>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/swap", { state: { address } })}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg bg-white/5 outline outline-1 outline-black/20 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
          >
            Swap
          </button>
          <button
            onClick={() => navigate("/stake", { state: { address } })}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg bg-white/5 outline outline-1 outline-black/20 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
          >
            Stake
          </button>
          <button
            onClick={() => navigate("/transfer", { state: { address } })}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg bg-white/5 outline outline-1 outline-black/20 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
          >
            Transfer
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-[11px] font-medium mb-4">Portfolio</h2>
        <Portfolio stakes={stakes} address={address} />
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        {error && (
          <div className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20">
            <p className="text-[10px] text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
