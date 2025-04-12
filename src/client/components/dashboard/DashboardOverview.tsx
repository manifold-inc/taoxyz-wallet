import GreenTao from '@public/assets/green-tao.svg';
import SilverTao from '@public/assets/silver-tao.svg';
import { Copy } from 'lucide-react';

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

  useEffect(() => {
    void calculateTotalTao();
  }, [currentAddress, stakes, subnets, freeTao]);

  if (isLoading) {
    console.log('isLoading');
  }

  return (
    <div className="w-full h-full rounded-sm bg-mf-sybil-opacity p-2 flex justify-between">
      {/* Total and Free TAO */}
      <div className="flex flex-col items-start justify-center gap-2 w-2/3 border border-white">
        <div className="flex flex-col items-start justify-center">
          <div className="flex justify-center items-center gap-0.5">
            <img src={SilverTao} alt="Silver Tao" className="w-5 h-5" />
            <p className="text-mf-edge-500 font-semibold text-4xl">{formatNumber(totalTao ?? 0)}</p>
          </div>
          <p className="text-mf-edge-500 font-medium text-xs pl-6 -mt-1">Total Tao</p>
        </div>

        <div className="flex flex-col items-start justify-center">
          <div className="flex justify-center items-center gap-0.5">
            <img src={GreenTao} alt="Green Tao" className="w-5 h-5" />
            <p className="text-mf-sybil-500 font-semibold text-3xl">{formatNumber(freeTao ?? 0)}</p>
          </div>
          <p className="text-mf-sybil-500 font-medium text-xs pl-6 -mt-1">Free Tao</p>
        </div>
      </div>

      {/* Address, TAO Price, TAO Percentage Change */}
      <div className="flex flex-col items-center justify-center gap-2 w-1/3 border border-white">
        <div className="flex items-center justify-center gap-1">
          <p className="text-mf-sybil-500 text-xs">
            {currentAddress?.slice(0, 4)}...{currentAddress?.slice(-4)}
          </p>
          <button onClick={handleCopy} className="cursor-pointer bg-mf-ash-500 rounded-full p-1.5">
            <Copy
              className={`w-3 h-3 cursor-pointer ${
                copied ? 'text-mf-edge-500' : 'text-mf-sybil-500'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-1">
          <p
            className={`text-xs ${priceChangePercentage && priceChangePercentage >= 0 ? 'text-mf-sybil-500' : 'text-mf-safety-500'}`}
          >
            {priceChangePercentage?.toFixed(2)}%
          </p>
          <p className="text-mf-edge-500 text-xs">${taoPrice?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
