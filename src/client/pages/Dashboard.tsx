import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { useNotification } from "../contexts/NotificationContext";
import { useWallet } from "../contexts/WalletContext";
import WalletSelection from "../components/WalletSelection";
import Portfolio from "../components/dashboard/Portfolio";
import type { StakeTransaction } from "../../types/client";
import { NotificationType } from "../../types/client";
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
  const { currentAddress } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [copied, setCopied] = useState(false);
  const prevFetchRef = useRef<string | null>(null);

  const fetchData = async (
    address: string,
    forceRefresh = false
  ): Promise<void> => {
    if (!api || !address || (!forceRefresh && address === prevFetchRef.current))
      return;
    prevFetchRef.current = address;

    const [balanceResult, stakeResult] = await Promise.all([
      api.getBalance(address),
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

    setBalance(balanceResult);
    setStakes(formattedStakes);
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
        <div className="rounded-sm bg-mf-ash-500 p-3 flex justify-between mt-4">
          <div className="flex items-center justify-center space-x-2">
            <img src={taoxyz} alt="Taoxyz Logo" className="w-4 h-4" />
            <span className="text-xl text-mf-milk-300 font-semibold">
              {!balance
                ? "Loading"
                : Number(balance) === 0
                ? "0"
                : Number(balance).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center text-xs text-mf-milk-300 space-x-1">
            <p>
              {!currentAddress
                ? ""
                : `${currentAddress.slice(0, 6)}...${currentAddress.slice(-6)}`}
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
            address={currentAddress as string}
            onRefresh={() =>
              currentAddress
                ? fetchData(currentAddress, true)
                : Promise.resolve()
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
