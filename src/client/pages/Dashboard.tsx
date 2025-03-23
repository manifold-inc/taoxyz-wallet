import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { useNotification } from "../contexts/NotificationContext";
import WalletSelection from "../components/WalletSelection";
import Portfolio from "../components/dashboard/Portfolio";
import type { StakeTransaction } from "../../types/client";
import taoxyz from "../../../public/icons/taoxyz.png";

interface StakeResponse {
  netuid: number;
  hotkey: string;
  stake: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (api) {
      void handleAddressChange();
    }
  }, [api]);

  const fetchData = async (currentAddress: string): Promise<void> => {
    if (!api || !currentAddress) return;
    setIsLoading(true);

    const [balanceResult, stakeResult] = await Promise.all([
      api.getBalance(currentAddress),
      api.getStake(currentAddress),
    ]);

    if (!balanceResult) {
      showNotification({
        type: "error",
        message: "Failed to get balance",
      });
      return;
    }
    setBalance(balanceResult);
    if (!stakeResult) {
      showNotification({
        type: "error",
        message: "Failed to get stake",
      });
      return;
    }
    const formattedStakes = (stakeResult as unknown as StakeResponse[]).map(
      (stake) => ({
        subnetId: stake.netuid,
        validatorHotkey: stake.hotkey,
        tokens: stake.stake,
      })
    );
    setStakes(formattedStakes);

    setIsLoading(false);
  };

  const handleAddressChange = async (): Promise<void> => {
    const result = await chrome.storage.local.get("currentAddress");
    setAddress(result.currentAddress as string);
    await fetchData(result.currentAddress as string);
  };

  const handleCopy = async (): Promise<void> => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotification({
      type: "success",
      message: "Address copied",
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-74 [&>*]:w-full">
        <WalletSelection onSelect={handleAddressChange} />
        <div className="rounded-sm bg-mf-ash-500 p-3 flex justify-between mt-4">
          <div className="flex items-center justify-center space-x-2">
            <img src={taoxyz} alt="Taoxyz Logo" className="w-4 h-4" />
            <span className="text-xl text-mf-milk-300 font-semibold">
              {!api ? "Loading..." : Number(balance).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center text-xs text-mf-milk-300 space-x-1">
            <p>
              {!address ? "" : `${address.slice(0, 6)}...${address.slice(-6)}`}
            </p>
            <button
              onClick={() => void handleCopy()}
              className="transition-colors"
            >
              <Copy
                className={`w-3 h-3 ${
                  copied ? "text-mf-sybil-500" : "text-mf-milk-300"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between rounded-sm text-sm text-mf-night-500 transition-colors space-x-2">
            <button
              onClick={() => navigate("/swap")}
              className="w-1/3 p-1 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 hover:border-mf-safety-500 border-sm transition-colors"
            >
              <span>Swap</span>
            </button>
            <button
              onClick={() => navigate("/stake")}
              className="w-1/3 p-1 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 hover:border-mf-safety-500 border-sm transition-colors"
            >
              <span>Stake</span>
            </button>
            <button
              onClick={() => navigate("/transfer")}
              className="w-1/3 p-1 bg-mf-sybil-500 hover:bg-mf-night-500 hover:text-mf-sybil-500 border-2 border-mf-sybil-500 hover:border-mf-sybil-500 border-sm transition-colors"
            >
              <span>Transfer</span>
            </button>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xs text-mf-sybil-500 font-semibold">Portfolio</h2>
          <Portfolio
            stakes={stakes}
            address={address as string}
            onRefresh={() => fetchData(address as string)}
          />
          {isLoading && (
            <div className="flex justify-center items-center h-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
