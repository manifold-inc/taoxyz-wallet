import { useState } from "react";
import { ChevronUp, Copy } from "lucide-react";

import { useNotification } from "../../contexts/NotificationContext";
import StakeChart from "./StakeChart";
import { NotificationType } from "../../../types/client";
import type { StakeTransaction, Subnet } from "../../../types/client";
import taoxyz from "../../../../public/icons/taoxyz.png";

interface ExpandedStakeProps {
  stake: StakeTransaction;
  subnet: Subnet | null;
  onClose: () => void;
  onRemoveStake: () => void;
  onMoveStake: () => void;
}

interface ApiResponse {
  data: PriceResponse[];
}

interface PriceResponse {
  netuid: number;
  price: string;
}

const ExpandedStake = ({
  stake,
  subnet,
  onClose,
  onRemoveStake,
  onMoveStake,
}: ExpandedStakeProps) => {
  const { showNotification } = useNotification();
  const [copied, setCopied] = useState(false);
  const [priceData, setPriceData] = useState<PriceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchSubnetPrice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://taoxyz.vercel.app/api/subnets/price",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allSubnets: false,
            netuid: stake.subnetId,
          }),
        }
      );

      const data: ApiResponse = await response.json();
      setPriceData(data.data);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Fetch Subnet Price History",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stake.validatorHotkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const init = async () => {
    await fetchSubnetPrice();
    setIsInitialized(true);
  };

  if (!isInitialized) {
    void init();
    setIsInitialized(true);
  }

  return (
    <div className="mt-2">
      <div className="rounded-sm p-3 border border-mf-safety-500 bg-mf-ash-500">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-semibold text-mf-milk-300">
              Subnet {stake.subnetId}
            </h3>
          </div>
          <div className="flex flex-col text-mf-sybil-500 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-mf-milk-300">Stake</span>
              <span>{(stake.tokens / 1e9).toFixed(4)}</span>
              <span className="text-mf-safety-500">α</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-mf-milk-300">Price</span>
              <span className="flex items-center gap-1">
                {subnet?.price ? subnet.price.toFixed(4) : "-"}
                <img src={taoxyz} alt="taoxyz" className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-38 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
          </div>
        ) : priceData.length > 0 ? (
          <div className="h-38">
            <StakeChart data={priceData} subnetId={stake.subnetId} />
          </div>
        ) : null}

        <div className="text-mf-milk-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-mf-milk-300">Validator</span>
            <p>
              {stake.validatorHotkey.slice(0, 6)}...
              {stake.validatorHotkey.slice(-6)}
            </p>
            <button onClick={handleCopy} className="transition-colors">
              <Copy
                className={`w-3 h-3 ${
                  copied ? "text-mf-sybil-500" : "text-mf-milk-300"
                }`}
              />
            </button>
          </div>
          <button onClick={onClose} className="p-1">
            <ChevronUp className="w-5 h-5 text-mf-milk-300" />
          </button>
        </div>
      </div>

      <div className="flex mt-4 space-x-4">
        <button
          onClick={onRemoveStake}
          className="flex-1 p-2 border-sm bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 border-2 border-mf-safety-500 hover:border-mf-safety-500 transition-colors cursor-pointer"
        >
          Remove
        </button>
        <button
          onClick={onMoveStake}
          className="flex-1 p-2 border-sm bg-mf-sybil-500 hover:bg-mf-night-500 hover:text-mf-sybil-500 border-2 border-mf-sybil-500 hover:border-mf-sybil-500 transition-colors cursor-pointer"
        >
          Move
        </button>
      </div>
    </div>
  );
};

export default ExpandedStake;
