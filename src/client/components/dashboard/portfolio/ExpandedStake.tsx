import { ChevronUp, Copy } from 'lucide-react';

import { useState } from 'react';

import StakeChart from '@/client/components/dashboard/portfolio/StakeChart';
import { useNotification } from '@/client/contexts/NotificationContext';
import { NotificationType } from '@/types/client';
import type { Stake, Subnet } from '@/types/client';
import { formatNumber, raoToTao } from '@/utils/utils';

interface ExpandedStakeProps {
  stake: Stake;
  subnet: Subnet;
  onClose: () => void;
  onAddStake: () => void;
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
  onAddStake,
  onRemoveStake,
  onMoveStake,
}: ExpandedStakeProps) => {
  const { showNotification } = useNotification();
  const [copied, setCopied] = useState(false);
  const [priceData, setPriceData] = useState<PriceResponse[] | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchSubnetPrice = async () => {
    void chrome.storage.local.get([`price_data_cache_sn${stake.netuid}`], r => {
      if (r[`price_data_cache_sn${stake.netuid}`]) {
        setPriceData(r[`price_data_cache_sn${stake.netuid}`]);
      }
    });
    try {
      const response = await fetch('https://tao.xyz/api/subnets/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allSubnets: false,
          netuid: stake.netuid,
        }),
      });

      const data: ApiResponse = await response.json();
      const convertedData = data.data.map(price => {
        const converted = {
          netuid: price.netuid,
          price:
            Number(price.price) < 1
              ? price.price
              : raoToTao(BigInt(Number(price.price))).toString(),
        };
        return converted;
      });
      setPriceData(convertedData);
      void chrome.storage.local.set({ [`price_data_cache_sn${stake.netuid}`]: convertedData });
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Fetch Subnet Price History',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stake.hotkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showNotification({
      type: NotificationType.Success,
      message: 'Validator Hotkey Copied',
    });
  };

  const init = async () => {
    await fetchSubnetPrice();
  };

  if (!isInitialized) {
    void init();
    setIsInitialized(true);
  }

  return (
    <div className="w-full">
      <div className="w-full rounded-md py-2 bg-mf-ash-500 flex flex-col gap-2">
        {/* Subnet Name, Price, Stake */}
        <div className="flex items-center justify-between px-3">
          {/* Subnet Name, ID */}
          <div className="flex gap-1">
            <p className="text-sm font-semibold text-mf-edge-500 truncate max-w-[16ch]">
              {subnet.name}
            </p>
            <span className="text-mf-edge-700 font-semibold text-sm">SN{subnet.id}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-32 border-b border-mf-ash-300">
          <div className="px-3 h-full">
            <StakeChart data={priceData} />
          </div>
        </div>

        {/* Validator */}
        <div className="flex items-center justify-center">
          {/* Pills container */}
          <div className="flex items-center gap-2 text-[10px]">
            {/* Validator */}
            <div className="rounded-full flex space-x-1 items-center bg-mf-sybil-opacity px-2 py-0.5">
              <p className="text-mf-sybil-500">Validator</p>
              <button onClick={handleCopy} className="cursor-pointer">
                <Copy className={`w-3 h-3 hover:text-mf-sybil-500 text-mf-edge-500`} />
              </button>
            </div>

            {/* Stake */}
            <div className="rounded-full flex items-center bg-mf-sybil-opacity px-2 py-0.5">
              <span className="text-mf-sybil-500 mr-1">Stake</span>
              <span className="text-mf-edge-500">
                {formatNumber(raoToTao(stake.stake)).toFixed(2)}α
              </span>
            </div>

            {/* Price */}
            <div className="rounded-full flex items-center bg-mf-sybil-opacity px-2 py-0.5">
              <span className="text-mf-sybil-500 mr-1">Price</span>
              <span className="text-mf-edge-500">
                {subnet.price ? formatNumber(subnet.price) : '-'}τ
              </span>
            </div>
            {/* Collapse button */}
            <button
              onClick={onClose}
              className="flex p-1 items-center justify-center cursor-pointer bg-mf-ash-300 rounded-full"
            >
              <ChevronUp className="w-4 h-4 text-mf-edge-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          className="cursor-pointer w-1/3 py-1.5 bg-mf-sybil-opacity rounded-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:opacity-50"
          onClick={onAddStake}
        >
          Add
        </button>
        <button
          onClick={onRemoveStake}
          className="cursor-pointer w-1/3 py-1.5 bg-mf-red-opacity rounded-sm text-mf-red-500 border border-mf-red-opacity hover:opacity-50"
        >
          Remove
        </button>
        <button
          onClick={onMoveStake}
          className="cursor-pointer w-1/3 py-1.5 bg-mf-safety-opacity rounded-sm text-mf-safety-500 border border-mf-safety-opacity hover:opacity-50"
        >
          Move
        </button>
      </div>
    </div>
  );
};

export default ExpandedStake;
