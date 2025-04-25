import GreenDollar from '@public/assets/green-dollar.svg';
import GreenTao from '@public/assets/green-tao.svg';
import SilverDollar from '@public/assets/silver-dollar.svg';
import SilverTao from '@public/assets/silver-tao.svg';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import { NotificationType, type Subnet } from '@/types/client';
import { formatNumber, raoToTao, taoToRao } from '@/utils/utils';

interface DashboardOverviewProps {
  taoPrice: number | null;
  priceChange24h: number | null;
}

const DashboardOverview = ({ taoPrice, priceChange24h }: DashboardOverviewProps) => {
  const { currentAddress } = useWallet();
  const { showNotification } = useNotification();
  const {
    dashboardState,
    setDashboardState,
    setDashboardTotalBalance,
    resetDashboardState,
    dashboardStakes: stakes,
    dashboardSubnets: subnets,
    dashboardFreeBalance,
  } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [showUSD, setShowUSD] = useState(false);
  const freeTao = raoToTao(dashboardFreeBalance ?? BigInt(0));

  // resonable memo because this is a potenially costly function
  const calculatedTotalTao = useMemo((): number | null => {
    if (freeTao === null || subnets === null || stakes === null) return null;

    let total = freeTao;
    for (const stake of stakes) {
      const subnet = subnets.find(subnet => subnet.id === stake.netuid) as Subnet;
      if (subnet) {
        total += raoToTao(BigInt(stake.stake)) * subnet.price;
      }
    }

    return total;
  }, [stakes, subnets, freeTao]);

  // not costly
  const balances = {
    totalTao: calculatedTotalTao,
    totalInUSD: (calculatedTotalTao ?? 0) * (taoPrice ?? 0),
    freeInUSD: (freeTao ?? 0) * (taoPrice ?? 0),
  };

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

  // This *should* be done when we get the data back from the fetch call, but
  // oh well
  useEffect(() => {
    if (calculatedTotalTao) {
      setDashboardTotalBalance(taoToRao(calculatedTotalTao));
    }
  }, [calculatedTotalTao]);

  return (
    <>
      <div className="w-full h-full flex flex-col gap-3">
        {/* Total and Free TAO */}
        <div className="w-full h-full rounded-md bg-mf-sybil-opacity p-3 flex justify-between">
          <div
            className="flex flex-col items-start justify-center gap-2 w-2/3 cursor-pointer"
            onClick={handleToggleUnit}
            role="button"
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
                    ? `${formatNumber(balances?.totalInUSD ?? 0).toFixed(2)}`
                    : formatNumber(balances?.totalTao ?? 0)}
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
                    ? `${formatNumber(balances?.freeInUSD ?? 0).toFixed(2)}`
                    : formatNumber(freeTao ?? 0)}
                </p>
              </div>
              <div className="text-mf-sybil-500 font-medium text-xs pl-5 -mt-1">Free Balance</div>
            </div>
          </div>

          {/* Address, TAO Price, TAO Percentage Change */}
          <div className="flex flex-col items-end justify-between w-1/3">
            <div className="flex items-center justify-end gap-1">
              <p className="text-mf-sybil-500 text-sm font-light">
                {currentAddress?.slice(0, 4)}...{currentAddress?.slice(-4)}
              </p>
              <button
                onClick={handleCopy}
                className="cursor-pointer bg-mf-ash-500 rounded-full p-1.5"
              >
                <Copy
                  className={`w-3 h-3 cursor-pointer ${
                    copied ? 'text-mf-edge-500' : 'text-mf-sybil-500'
                  }`}
                />
              </button>
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
          <button
            onClick={() => {
              resetDashboardState();
              setDashboardState(DashboardState.CREATE_STAKE);
            }}
            className={`w-1/2 py-1.5 rounded-sm cursor-pointer hover:opacity-50 ${
              dashboardState === DashboardState.CREATE_STAKE ||
              dashboardState === DashboardState.OVERVIEW
                ? 'bg-mf-sybil-opacity text-mf-sybil-500'
                : 'bg-mf-ash-500 text-mf-edge-500'
            }`}
          >
            <span className="text-sm">Stake</span>
          </button>
          <button
            onClick={() => {
              resetDashboardState();
              setDashboardState(DashboardState.TRANSFER);
            }}
            className={`w-1/2 py-1.5 rounded-sm cursor-pointer hover:opacity-50 ${
              dashboardState === DashboardState.TRANSFER ||
              dashboardState === DashboardState.OVERVIEW
                ? 'bg-mf-safety-opacity text-mf-safety-500'
                : 'bg-mf-ash-500 text-mf-edge-500'
            }`}
          >
            <span className="text-sm">Transfer</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;
