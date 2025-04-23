import GreenDollar from '@public/assets/green-dollar.svg';
import GreenTao from '@public/assets/green-tao.svg';
import SilverDollar from '@public/assets/silver-dollar.svg';
import SilverTao from '@public/assets/silver-tao.svg';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import Skeleton from '@/client/components/common/Skeleton';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import { NotificationType, type Stake, type Subnet } from '@/types/client';
import { formatNumber, raoToTao, taoToRao } from '@/utils/utils';

interface Balances {
  totalTao: number | null;
  totalInUSD: number | null;
  freeInUSD: number | null;
}

interface DashboardOverviewProps {
  stakes: Stake[];
  subnets: Subnet[];
  freeTao: number | null;
  taoPrice: number | null;
  priceChange24h: number | null;
  isLoading: boolean;
}

const DashboardOverviewSkeleton = () => {
  return (
    <div className="w-full h-full rounded-md bg-mf-sybil-opacity p-3 flex justify-between">
      {/* Total and Free TAO Skeleton */}
      <div className="flex flex-col items-start justify-center gap-2 w-2/3">
        <div className="flex flex-col items-start justify-center">
          <div className="flex justify-center items-center gap-0.5">
            <Skeleton className="w-32 h-8 bg-mf-ash-500" />
          </div>
          <div className="text-mf-edge-500 font-medium text-xs pl-5 -mt-1">
            <Skeleton className="w-24 h-4 mt-2 bg-mf-ash-500" />
          </div>
        </div>

        <div className="flex flex-col items-start justify-center">
          <div className="flex justify-center items-center gap-0.5">
            <Skeleton className="w-28 h-7 bg-mf-ash-500" />
          </div>
          <div className="text-mf-sybil-500 font-medium text-xs pl-5 -mt-1">
            <Skeleton className="w-24 h-4 mt-2 bg-mf-ash-500" />
          </div>
        </div>
      </div>

      {/* Address, TAO Price, TAO Percentage Change Skeleton */}
      <div className="flex flex-col items-end justify-between w-1/3">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="w-24 h-4 bg-mf-ash-500" />
        </div>

        <div className="flex flex-col items-end">
          <Skeleton className="w-16 h-4 mb-1 bg-mf-ash-500" />
          <Skeleton className="w-20 h-4 bg-mf-ash-500" />
        </div>
      </div>
    </div>
  );
};

// TODO: Remove nullish coalescing checks
const DashboardOverview = ({
  stakes,
  subnets,
  freeTao,
  taoPrice,
  priceChange24h,
  isLoading = true,
}: DashboardOverviewProps) => {
  const { currentAddress } = useWallet();
  const { showNotification } = useNotification();
  const { setDashboardState, setDashboardTotalBalance, resetDashboardState } = useDashboard();
  const [balances, setBalances] = useState<Balances>({
    totalTao: null,
    totalInUSD: null,
    freeInUSD: null,
  });
  const [copied, setCopied] = useState(false);
  const [showUSD, setShowUSD] = useState(false);

  const calculatedTotalTao = useMemo((): number | null => {
    if (isLoading || freeTao === null) return null;

    let total = freeTao;
    for (const stake of stakes) {
      const subnet = subnets.find(subnet => subnet.id === stake.netuid) as Subnet;
      if (subnet) {
        total += raoToTao(BigInt(stake.stake)) * subnet.price;
      }
    }

    return total;
  }, [stakes, subnets, freeTao, isLoading]);

  const updatedBalances = useMemo(() => {
    if (isLoading || calculatedTotalTao === null || taoPrice === null || freeTao === null)
      return null;

    return {
      totalTao: calculatedTotalTao,
      totalInUSD: calculatedTotalTao * taoPrice,
      freeInUSD: freeTao * taoPrice,
    };
  }, [isLoading, calculatedTotalTao, taoPrice, freeTao]);

  const handleCopy = async (): Promise<void> => {
    if (!currentAddress) return;
    await navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showNotification({
      type: NotificationType.Success,
      message: 'Address Copied',
    });
  };

  const handleToggleUnit = (): void => {
    setShowUSD(prev => !prev);
  };

  useEffect(() => {
    if (updatedBalances) {
      setBalances(updatedBalances);
    }

    if (calculatedTotalTao) {
      setDashboardTotalBalance(taoToRao(calculatedTotalTao));
    }
  }, [updatedBalances, calculatedTotalTao]);

  // TODO: Render 3 different views based on dashboardState
  return (
    <>
      {isLoading ? (
        <DashboardOverviewSkeleton />
      ) : (
        <div className="w-full h-full flex flex-col gap-3">
          {/* Total and Free TAO */}
          <div className="w-full h-full rounded-md bg-mf-sybil-opacity p-3 flex justify-between">
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
                    {showUSD
                      ? `${formatNumber(balances.totalInUSD ?? 0).toFixed(2)}`
                      : formatNumber(balances.totalTao ?? 0)}
                  </p>
                </div>
                <div className="text-mf-edge-500 font-medium text-xs pl-5 -mt-1">Total Balance</div>
              </div>

              <div className="flex flex-col items-start justify-center">
                <div className="flex justify-center items-center gap-0.5">
                  {showUSD ? (
                    <img src={GreenDollar} alt="Green Dollar" className="w-4 h-4 -mt-1" />
                  ) : (
                    <img src={GreenTao} alt="Green Tao" className="w-4 h-4 -mt-1" />
                  )}
                  <p className="text-mf-sybil-500 font-semibold text-3xl">
                    {showUSD
                      ? `${formatNumber(balances.freeInUSD ?? 0).toFixed(2)}`
                      : formatNumber(freeTao ?? 0)}
                  </p>
                </div>
                <div className="text-mf-sybil-500 font-medium text-xs pl-5 -mt-1">Free Balance</div>
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
                  className={`text-sm font-light flex items-center ${priceChange24h && priceChange24h >= 0 ? 'text-mf-sybil-500' : 'text-mf-safety-500'}`}
                >
                  {priceChange24h && priceChange24h >= 0 ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {Math.abs(priceChange24h ?? 0).toFixed(2)}
                </p>
                <p className="text-mf-edge-500 text-sm font-light">${taoPrice?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 w-full">
            <motion.button
              onClick={() => {
                resetDashboardState();
                setDashboardState(DashboardState.CREATE_STAKE);
              }}
              className="w-1/2 py-1.5 bg-mf-sybil-opacity rounded-sm cursor-pointer text-mf-sybil-500 border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm">Stake</span>
            </motion.button>
            <motion.button
              onClick={() => {
                resetDashboardState();
                setDashboardState(DashboardState.TRANSFER);
              }}
              className="w-1/2 py-1.5 bg-mf-safety-opacity rounded-sm cursor-pointer text-mf-safety-500 border border-mf-safety-opacity hover:border-mf-safety-500 transition-colors hover:text-mf-edge-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm">Transfer</span>
            </motion.button>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardOverview;
