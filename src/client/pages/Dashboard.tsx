import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { useNotification } from "../contexts/NotificationContext";
import { useWallet } from "../contexts/WalletContext";
import WalletSelection from "../components/common/WalletSelection";
import Portfolio from "../components/dashboard/Portfolio";
import { formatNumber, raoToTao } from "../../utils/utils";
import type { StakeTransaction, Subnet } from "../../types/client";
import { NotificationType } from "../../types/client";

import taoxyz from "../../../public/icons/taoxyz.png";
import dollar from "../../../public/assets/dollar.svg";
import clock from "../../../public/assets/clock.svg";

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
  const [balance, setBalance] = useState<number | null>(null);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [usdToTao, setUsdToTao] = useState<number | null>(null);
  const [dayOldUsdToTao, setDayOldUsdToTao] = useState<number | null>(null);
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
      const [subnetsResult, balanceResult, stakeResult] = await Promise.all([
        api.getSubnets(),
        api.getBalance(address),
        api.getStake(address),
      ]);

      if (!subnetsResult) {
        showNotification({
          type: NotificationType.Error,
          message: "Failed to Fetch Subnets",
        });
        return;
      }

      if (balanceResult === null) {
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

      let totalBalance = balanceResult;

      for (const stake of formattedStakes) {
        const subnet = subnetsResult.find(
          (subnet) => subnet.id === stake.subnetId
        ) as Subnet;

        if (subnet) {
          totalBalance += raoToTao(BigInt(stake.tokens)) * subnet.price;
        }
      }

      setTotalBalance(totalBalance);
      setBalance(balanceResult);
      setStakes(formattedStakes);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUSDToTao = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/bittensor/market_chart?vs_currency=usd&days=1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const prices = data.prices;
      const recentPrice = prices[0][1];
      const dayOldPrice = prices[prices.length - 1][1];
      setUsdToTao(recentPrice);
      setDayOldUsdToTao(dayOldPrice);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Fetch USD to TAO Price",
      });
    } finally {
      setIsLoading(false);
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
    void fetchUSDToTao();
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-74 [&>*]:w-full">
        <WalletSelection />

        <div className="mt-2 border-sm border-2 border-mf-ash-500 bg-mf-ash-500 flex p-1 justify-center items-center gap-4">
          {/* Price of TAO */}
          <div className="flex items-center gap-1">
            <img src={dollar} alt="Dollar Logo" className="w-4 h-4" />
            <span className="text-base font-semibold text-mf-silver-500">
              {usdToTao ? `${formatNumber(usdToTao).toFixed(2)}` : "Loading..."}
            </span>
            {usdToTao && (
              <span className="text-[10px] ml-0.5 text-mf-silver-500">/τ</span>
            )}
          </div>

          {/* Price of TAO 24hr ago */}
          <div className="flex items-center gap-1">
            <img src={clock} alt="Clock Logo" className="w-4 h-4" />
            <span className="text-base font-semibold text-mf-silver-500">
              {dayOldUsdToTao
                ? `${formatNumber(dayOldUsdToTao).toFixed(2)}`
                : "Loading..."}
            </span>
            {dayOldUsdToTao && (
              <span className="text-[10px] ml-0.5 text-mf-silver-500">
                24hr
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 border-sm border-2 border-mf-ash-500 bg-mf-ash-500 gap-2">
          {/* Address & Account Value */}
          <div className="border-b border-mf-ash-300">
            <div className="flex items-center justify-between py-1 px-2">
              {/* Address */}
              <div className="flex items-center text-xs text-mf-milk-300 gap-1">
                <p>
                  {!currentAddress
                    ? "Loading..."
                    : `${currentAddress.slice(0, 4)}...${currentAddress.slice(
                        -4
                      )}`}
                </p>
                <button
                  onClick={() => void handleCopy()}
                  className="transition-colors"
                >
                  {currentAddress && (
                    <Copy
                      className={`w-3 h-3 cursor-pointer ${
                        copied ? "text-mf-sybil-500" : "text-mf-milk-300"
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Account Value */}
              <div className="flex items-center text-xs font-semibold text-mf-sybil-500 space-x-1">
                <p>
                  {usdToTao === null || totalBalance === null
                    ? "Loading..."
                    : `$${formatNumber(Number(usdToTao * totalBalance)).toFixed(
                        2
                      )}`}
                </p>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="px-2 py-1">
            {/* Total Balance */}
            <div className="flex items-center gap-2">
              <img src={taoxyz} alt="Taoxyz Logo" className="w-3 h-3" />
              <span className="text-xl text-mf-milk-300 font-semibold">
                {totalBalance === null
                  ? "Loading"
                  : Number(totalBalance) === 0
                  ? "0"
                  : formatNumber(Number(totalBalance))}
              </span>
              <span className="text-xs text-mf-silver-300">Total</span>
            </div>

            {/* Free Balance */}
            <div className="flex items-center gap-2">
              <img src={taoxyz} alt="Taoxyz Logo" className="w-3 h-3" />
              <span className="text-sm text-mf-sybil-500 font-semibold">
                {balance === null
                  ? "Loading"
                  : Number(balance) === 0
                  ? "0"
                  : formatNumber(Number(balance))}
              </span>
              <span className="text-xs text-mf-sybil-500">Free</span>
            </div>
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
