import GreenDollar from '@public/assets/green-dollar.svg';
import GreenTao from '@public/assets/green-tao.svg';
import SilverDollar from '@public/assets/silver-dollar.svg';
import SilverTao from '@public/assets/silver-tao.svg';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import { NotificationType, type Stake, type Subnet } from '@/types/client';
import { formatNumber, raoToTao } from '@/utils/utils';

interface DashboardOverviewProps {
  stakes: Stake[];
  subnets: Subnet[];
  freeTao: number;
  taoPrice: number | null;
  priceChangePercentage: number | null;
  isLoading: boolean;
}

const DashboardOverview = ({
  stakes,
  subnets,
  freeTao = 0,
  taoPrice,
  priceChangePercentage,
  isLoading = true,
}: DashboardOverviewProps) => {
  const { currentAddress } = useWallet();
  const { showNotification } = useNotification();
  const [totalTao, setTotalTao] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUSD, setShowUSD] = useState(false);

  const calculateTotalTao = (): void => {
    let total = freeTao;
    for (const stake of stakes) {
      const subnet = subnets.find(subnet => subnet.id === stake.netuid) as Subnet;
      if (subnet) {
        total += raoToTao(BigInt(stake.stake)) * subnet.price;
      }
    }

    console.log('Overview Data', { total, freeTao, stakes, subnets });
    setTotalTao(total);
  };

  const handleCopy = async (): Promise<void> => {
    if (!currentAddress) return;
    await navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotification({
      type: NotificationType.Success,
      message: 'Address Copied',
    });
  };

  const handleToggleUnit = (): void => {
    setShowUSD(prev => !prev);
  };

  const totalInUSD = (totalTao ?? 0) * (taoPrice ?? 0);
  const freeInUSD = freeTao * (taoPrice ?? 0);

  useEffect(() => {
    void calculateTotalTao();
  }, [currentAddress, stakes, subnets, freeTao]);

  if (isLoading) {
    console.log('isLoading');
  }

  return (
    <div className="w-full h-full rounded-md bg-mf-sybil-opacity p-3 flex justify-between">
      {/* Total and Free TAO */}
      <motion.div
        className="flex flex-col items-start justify-center gap-2 w-2/3 cursor-pointer"
        onClick={handleToggleUnit}
        role="button"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex flex-col items-start justify-center">
          <div className="flex justify-center items-center gap-0.5">
            {showUSD ? (
              <img src={SilverDollar} alt="Silver Dollar" className="w-4 h-4 -mt-1" />
            ) : (
              <img src={SilverTao} alt="Silver Tao" className="w-4 h-4 -mt-1" />
            )}
            <p className="text-mf-edge-500 font-semibold text-4xl group-hover:opacity-80">
              {showUSD ? `${formatNumber(totalInUSD).toFixed(2)}` : formatNumber(totalTao ?? 0)}
            </p>
          </div>
          <p className="text-mf-edge-500 font-medium text-xs pl-5 -mt-1">Total Balance</p>
        </div>

        <div className="flex flex-col items-start justify-center">
          <div className="flex justify-center items-center gap-0.5">
            {showUSD ? (
              <img src={GreenDollar} alt="Green Dollar" className="w-4 h-4 -mt-1" />
            ) : (
              <img src={GreenTao} alt="Green Tao" className="w-4 h-4 -mt-1" />
            )}
            <p className="text-mf-sybil-500 font-semibold text-3xl">
              {showUSD ? `${formatNumber(freeInUSD).toFixed(2)}` : formatNumber(freeTao)}
            </p>
          </div>
          <p className="text-mf-sybil-500 font-medium text-xs pl-5 -mt-1">Free Balance</p>
        </div>
      </motion.div>

      {/* Address, TAO Price, TAO Percentage Change */}
      <div className="flex flex-col items-end justify-between w-1/3">
        <div className="flex items-center justify-end gap-1">
          <p className="text-mf-sybil-500 text-sm font-light">
            {currentAddress?.slice(0, 4)}...{currentAddress?.slice(-4)}
          </p>
          <motion.button
            onClick={handleCopy}
            className="cursor-pointer bg-mf-ash-500 rounded-full p-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <Copy
              className={`w-3 h-3 cursor-pointer ${
                copied ? 'text-mf-edge-500' : 'text-mf-sybil-500'
              }`}
            />
          </motion.button>
        </div>

        <div className="flex flex-col items-end">
          <p
            className={`text-sm font-light flex items-center ${priceChangePercentage && priceChangePercentage >= 0 ? 'text-mf-sybil-500' : 'text-mf-safety-500'}`}
          >
            {priceChangePercentage && priceChangePercentage >= 0 ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {Math.abs(priceChangePercentage ?? 0).toFixed(2)}
          </p>
          <p className="text-mf-edge-500 text-sm font-light">${taoPrice?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
