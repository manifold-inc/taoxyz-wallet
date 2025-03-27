import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { useNotification } from "../contexts/NotificationContext";
import { useWallet } from "../contexts/WalletContext";
import WalletSelection from "../components/common/WalletSelection";
import Portfolio from "../components/dashboard/Portfolio";
import { formatNumber } from "../../utils/utils";
import type { StakeTransaction } from "../../types/client";
import { NotificationType } from "../../types/client";
import taoxyz from "../../../public/icons/taoxyz.png";

interface ApiResponse {
  free_balance: string;
  staked_positions: {
    subnet: number;
    stake_amount: string;
  }[];
  timestamp: number;
  total_balance: string;
  total_staked_tao: string;
}

interface StakeResponse {
  netuid: number;
  hotkey: string;
  stake: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { currentAddress } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [balances, setBalances] = useState<{
    free_balance: string;
    total_balance: string;
  } | null>(null);
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [copied, setCopied] = useState(false);
  const prevFetchRef = useRef<string | null>(null);

  const fetchData = async (
    address: string,
    forceRefresh = false
  ): Promise<void> => {
    if (!api || !address || (!forceRefresh && address === prevFetchRef.current))
      return;
    setIsLoading(true);
    prevFetchRef.current = address;

    try {
      const [balanceResult, stakeResult] = await Promise.all([
        fetchBalance(address),
        api.getStake(address),
      ]);

      if (!balanceResult) {
        showNotification({
          type: NotificationType.Error,
          message: "Failed to Fetch Balance",
        });
        return;
      }

      if (!stakeResult) {
        showNotification({
          type: NotificationType.Error,
          message: "Failed to Fetch Stakes",
        });
        return;
      }

      const formattedStakes = await Promise.all(
        (stakeResult as unknown as StakeResponse[]).map(async (stake) => {
          const subnet = await api.getSubnet(stake.netuid);
          return {
            subnetId: stake.netuid,
            subnetName: subnet?.name ?? `Subnet ${stake.netuid}`,
            validatorHotkey: stake.hotkey,
            tokens: stake.stake,
          };
        })
      );

      setBalances(balanceResult);
      setStakes(formattedStakes);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch("https://leo.tao.xyz/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotkey: address,
        }),
      });
      const data: ApiResponse = await response.json();
      const balances = {
        free_balance: data.free_balance.slice(1),
        total_balance: data.total_balance.slice(1),
      };
      return balances;
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Fetch Balance",
      });
      return null;
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!currentAddress) return;
    await navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotification({
      type: NotificationType.Success,
      message: "Address Copied",
    });
  };

  if (api && currentAddress && currentAddress !== prevFetchRef.current) {
    void fetchData(currentAddress);
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-74 [&>*]:w-full">
        <WalletSelection />
        <div className=" mt-2 border-sm border-2 border-mf-ash-500 bg-mf-ash-500 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={taoxyz} alt="Taoxyz Logo" className="w-4 h-4" />
              <span className="text-xl text-mf-milk-300 font-semibold">
                {!balances
                  ? "Loading"
                  : Number(balances.free_balance) === 0
                  ? "0"
                  : formatNumber(Number(balances.total_balance))}
              </span>
              <span className="text-xs text-mf-silver-300">Total</span>
            </div>
            <div className="flex items-center text-xs text-mf-milk-300 space-x-1">
              <p>
                {!currentAddress || !balances
                  ? ""
                  : `${currentAddress.slice(0, 4)}...${currentAddress.slice(
                      -4
                    )}`}
              </p>
              <button
                onClick={() => void handleCopy()}
                className="transition-colors"
              >
                {currentAddress && balances && (
                  <Copy
                    className={`w-3 h-3 ${
                      copied ? "text-mf-sybil-500" : "text-mf-milk-300"
                    }`}
                  />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <img src={taoxyz} alt="Taoxyz Logo" className="w-4 h-4" />
            <span className="text-sm text-mf-sybil-500 font-semibold">
              {!balances
                ? "Loading"
                : Number(balances.free_balance) === 0
                ? "0"
                : formatNumber(Number(balances.free_balance))}
            </span>
            <span className="text-xs text-mf-sybil-500">Free</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between rounded-sm text-sm text-mf-night-500 transition-colors space-x-2">
            <button
              onClick={() => navigate("/add-stake")}
              className="w-1/3 p-1 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 hover:border-mf-safety-500 border-sm transition-colors cursor-pointer"
            >
              <span>Add</span>
            </button>
            <button
              onClick={() => navigate("/move-stake")}
              className="w-1/3 p-1 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 hover:border-mf-safety-500 border-sm transition-colors cursor-pointer"
            >
              <span>Move</span>
            </button>
            <button
              onClick={() => navigate("/transfer")}
              className="w-1/3 p-1 bg-mf-sybil-500 hover:bg-mf-night-500 hover:text-mf-sybil-500 border-2 border-mf-sybil-500 hover:border-mf-sybil-500 border-sm transition-colors cursor-pointer"
            >
              <span>Transfer</span>
            </button>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xs text-mf-sybil-500 font-semibold">Portfolio</h2>
          {isLoading ? (
            <div className="border-sm border-2 border-mf-ash-500 p-2 bg-mf-ash-500 text-sm text-mf-milk-300">
              <p>Loading...</p>
            </div>
          ) : (
            <Portfolio
              stakes={stakes}
              address={currentAddress as string}
              onRefresh={() =>
                currentAddress
                  ? fetchData(currentAddress, true)
                  : Promise.resolve()
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
