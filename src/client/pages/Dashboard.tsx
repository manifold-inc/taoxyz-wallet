import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Portfolio } from "../components/Portfolio";
import { useRpcApi } from "../contexts/RpcApiContext";
import type { Stake } from "../../types/stake";

export const Dashboard = () => {
  const { api } = useRpcApi();
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address;
  const [balance, setBalance] = useState("");
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const result = await chrome.runtime.sendMessage({
          type: "ext(getBalance)",
          payload: { address },
        });
        setBalance(result.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch balance"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStake = async () => {
      try {
        const stake = await api?.getStake(address);
        if (stake) {
          const formattedStakes = (stake as any[]).map((stake) => ({
            netuid: stake.netuid,
            hotkey: stake.hotkey,
            stake: stake.stake,
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => navigate("/stake", { state: { address } })}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Stake
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Account</h2>
          <p className="text-gray-600 break-all">{address}</p>
          <p className="mt-2">Balance: {balance} τ</p>
        </div>

        <Portfolio stakes={stakes} />

        {isLoading && (
          <div className="text-center">
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
