import { motion } from 'framer-motion';
import { ChevronUp, Copy } from 'lucide-react';

import { useState } from 'react';

import { useNotification } from '@/client/contexts/NotificationContext';
import { NotificationType } from '@/types/client';
import type { Stake, Subnet } from '@/types/client';
import { raoToTao } from '@/utils/utils';

import StakeChart from './StakeChart';

interface ExpandedStakeProps {
  stake: Stake;
  subnet: Subnet;
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
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Fetch Subnet Price History',
      });
    } finally {
      setIsLoading(false);
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
    setIsInitialized(true);
  };

  if (!isInitialized) {
    void init();
    setIsInitialized(true);
  }

  return (
    <div className="w-full">
      <div className="rounded-md px-3 py-2 bg-mf-ash-500 flex flex-col gap-2">
        {/* Subnet Name, Price, Stake */}
        <div className="flex items-center justify-between">
          {/* Subnet Name, ID */}
          <div className="flex gap-1">
            <p className="text-sm font-semibold text-mf-edge-500 truncate max-w-[10ch]">
              {subnet.name}
            </p>
            <span className="text-mf-edge-700 font-semibold text-sm">SN{subnet.id}</span>
          </div>

          <div className="flex gap-2">
            {/* Stake */}
            <div className="flex items-center gap-1">
              <div className="rounded-full flex items-center bg-mf-sybil-opacity px-2 py-0.5">
                <span className="text-mf-sybil-500 text-xs">Stake</span>
              </div>
              <span className="text-mf-edge-500 text-xs">{(stake.stake / 1e9).toFixed(4)}α</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-1">
              <div className="rounded-full flex items-center bg-mf-sybil-opacity px-2 py-0.5">
                <span className="text-mf-sybil-500 text-xs">Price</span>
              </div>
              <span className="text-mf-edge-500 text-xs">
                {subnet.price ? subnet.price.toFixed(4) : '-'}τ
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
          </div>
        ) : priceData.length > 0 ? (
          <div className="h-32">
            <StakeChart data={priceData} />
          </div>
        ) : null}

        {/* Validator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full flex items-center bg-mf-sybil-opacity px-2 py-0.5">
              <p className="text-mf-sybil-500 text-xs">Validator</p>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-mf-edge-500 text-xs">
                {stake.hotkey.slice(0, 6)}...{stake.hotkey.slice(-6)}
              </span>
              <motion.button
                onClick={handleCopy}
                className="transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className={`w-3 h-3 ${copied ? 'text-mf-sybil-500' : 'text-mf-edge-500'}`} />
              </motion.button>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="p-1 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronUp className="w-4 h-4 text-mf-edge-500" />
          </motion.button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <motion.button
          className="cursor-pointer w-1/3 py-1.5 bg-mf-sybil-opacity rounded-sm text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Stake
        </motion.button>
        <motion.button
          onClick={onRemoveStake}
          className="cursor-pointer w-1/3 py-1.5 bg-mf-red-opacity rounded-sm text-mf-red-500 border border-mf-red-opacity hover:border-mf-red-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Unstake
        </motion.button>
        <motion.button
          onClick={onMoveStake}
          className="cursor-pointer w-1/3 py-1.5 bg-mf-safety-opacity rounded-sm text-mf-safety-500 border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Move
        </motion.button>
      </div>
    </div>
  );
};

export default ExpandedStake;
