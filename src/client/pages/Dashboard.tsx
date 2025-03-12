import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftRight, ListPlus, Redo } from "lucide-react";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import Portfolio from "../components/Portfolio";
import type { StakeTransaction } from "../../types/client";

interface StakeResponse {
  netuid: number;
  hotkey: string;
  stake: number;
}

export const Dashboard = () => {
  const { api } = usePolkadotApi();
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
          const formattedStakes = (stake as unknown as StakeResponse[]).map(
            (stake) => ({
              subnetId: stake.netuid,
              validatorHotkey: stake.hotkey,
              tokens: stake.stake,
            })
          );
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
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <div className="w-72 space-y-6">
          <div>
            <h2 className="text-xs text-mf-silver-300 mb-2">Balance</h2>
            <div className="w-full px-4 py-3 rounded-lg bg-mf-ash-500">
              <div className="flex items-baseline space-x-1">
                <span className="text-sm font-semibold text-mf-milk-300">
                  {Number(balance).toFixed(4)}
                </span>
                <span className="text-[10px] text-mf-silver-300">τ</span>
              </div>
              <p className="text-[10px] text-mf-silver-300 mt-1">{address}</p>
            </div>
          </div>

          <div>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/swap", { state: { address } })}
                className="w-full text-sm flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3"
              >
                <div className="w-2/5 flex justify-end">
                  <ArrowLeftRight className="text-mf-safety-300 w-5 h-5" />
                </div>
                <div className="w-3/5 flex items-center ml-2">
                  <span className="text-mf-milk-300">Swap</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/stake", { state: { address } })}
                className="w-full text-sm flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3"
              >
                <div className="w-2/5 flex justify-end">
                  <ListPlus className="text-mf-safety-300 w-5 h-5" />
                </div>
                <div className="w-3/5 flex items-center ml-2">
                  <span className="text-mf-milk-300">Stake</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/transfer", { state: { address } })}
                className="w-full text-sm flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors px-4 py-3"
              >
                <div className="w-2/5 flex justify-end">
                  <Redo className="text-mf-safety-300 w-5 h-5" />
                </div>
                <div className="w-3/5 flex items-center ml-2">
                  <span className="text-mf-milk-300">Transfer</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xs text-mf-silver-300 mb-2">Portfolio</h2>
            <div className="w-full rounded-lg bg-mf-ash-500 p-4">
              <Portfolio stakes={stakes} address={address} />
              {isLoading && (
                <div className="flex justify-center items-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
                </div>
              )}
              {error && (
                <p className="text-[10px] text-mf-safety-300 text-center">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default Dashboard;
