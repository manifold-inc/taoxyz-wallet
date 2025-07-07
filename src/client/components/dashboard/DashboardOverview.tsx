import GreenDollar from '@public/assets/green-dollar.svg';
import GreenTao from '@public/assets/green-tao.svg';
import SilverDollar from '@public/assets/silver-dollar.svg';
import SilverTao from '@public/assets/silver-tao.svg';
import { Copy } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { newApi } from '@/api/api';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import { NotificationType } from '@/types/client';
import { formatNumber, raoToTao, taoToRao } from '@/utils/utils';

interface DashboardOverviewProps {
  taoPrice: number | null;
  selectedStakeKey: string | null;
}

const DashboardOverview = ({ taoPrice, selectedStakeKey }: DashboardOverviewProps) => {
  const { currentAddress } = useWallet();
  const { showNotification } = useNotification();
  const {
    dashboardState,
    setDashboardState,
    setDashboardTotalBalance,
    resetDashboardState,
  } = useDashboard();

  const { data: dashboardFreeBalance } = newApi.balance.getFree(currentAddress || '');
  const { data: subnets, isLoading: isLoadingSubnets } = newApi.subnets.getAll();
  const [showUSD, setShowUSD] = useState(false);
  const freeTao = raoToTao(dashboardFreeBalance ?? BigInt(0));

  // Replace context with queries
  const { data: stakes } = newApi.stakes.getAllStakes(currentAddress || '');

  const dashboardStake = useMemo(() => {
    if (!stakes || !selectedStakeKey) return null;
    return stakes.find(stake => `${stake.hotkey}-${stake.netuid}` === selectedStakeKey) || null;
  }, [stakes, selectedStakeKey]);

  // Function to get the balance to display based on selected stake
  const getAvailableBalance = () => {
    if (dashboardStake && subnets) {
      // When a stake is selected, show that stake's balance
      const selectedSubnet = subnets.find(subnet => subnet.id === dashboardStake.netuid);
      if (selectedSubnet) {
        const stakeInTao = raoToTao(dashboardStake.stake);
        const stakeValueInTao = stakeInTao * selectedSubnet.price;
        return {
          totalTao: stakeValueInTao,
          freeTao: stakeInTao,
          totalInUSD: stakeValueInTao * (taoPrice ?? 0),
          freeInUSD: stakeInTao * (taoPrice ?? 0),
          isStakeView: true,
        };
      }
    }

    // Default: show wallet totals
    return {
      totalTao: calculatedTotalTao,
      freeTao,
      totalInUSD: (calculatedTotalTao ?? 0) * (taoPrice ?? 0),
      freeInUSD: (freeTao ?? 0) * (taoPrice ?? 0),
      isStakeView: false,
    };
  };

  // resonable memo because this is a potenially costly function
  const calculatedTotalTao = useMemo((): number | null => {
    if (freeTao === null || !subnets || !stakes || isLoadingSubnets) return null;

    let total = freeTao;
    for (const stake of stakes) {
      const subnet = subnets.find(subnet => subnet.id === stake.netuid);
      if (subnet) {
        total += raoToTao(BigInt(stake.stake)) * subnet.price;
      }
    }

    return total;
  }, [stakes, subnets, freeTao, isLoadingSubnets]);

  // Get the appropriate balance to display
  const balances = getAvailableBalance();

  const handleCopy = async (): Promise<void> => {
    if (!currentAddress) return;
    await navigator.clipboard.writeText(currentAddress);
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
        <div className="w-full h-full rounded-md [background:linear-gradient(to_bottom,_#375250_0%,_#204b44_100%)] p-3 flex justify-between">
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
              <div className="text-mf-edge-500 font-medium text-xs pl-5 -mt-1">
                {balances.isStakeView ? 'Stake Value' : 'Total Balance'}
              </div>
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
                    : formatNumber(balances?.freeTao ?? 0)}
                </p>
              </div>
              <div className="text-mf-sybil-500 font-medium text-xs pl-5 -mt-1">
                {balances.isStakeView ? 'Stake Amount' : 'Free Balance'}
              </div>
            </div>
          </div>

          {/* Address, TAO Price, TAO Percentage Change */}
          <div className="flex flex-col items-end justify-between w-1/3">
            <div className="flex items-center justify-end gap-1 text-mf-edge-500 hover:text-mf-sybil-500">
              <p className=" text-sm font-light">
                {currentAddress?.slice(0, 4)}...{currentAddress?.slice(-4)}
              </p>
              <button
                onClick={handleCopy}
                className="cursor-pointer bg-mf-ash-500 rounded-full p-1.5"
              >
                <Copy className={`w-3 h-3 cursor-pointer}`} />
              </button>
            </div>

            <button
              className="flex items-center justify-center cursor-pointer bg-mf-ash-500 rounded-full w-6 h-6 p-2 text-mf-edge-500"
              onClick={() => setShowUSD(!showUSD)}
            >
              {showUSD ? <img src={SilverTao} /> : <p>$</p>}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 w-full">
          <button
            onClick={() => {
              if (dashboardState === DashboardState.CREATE_STAKE) {
                resetDashboardState();
              } else {
                resetDashboardState();
                setDashboardState(DashboardState.CREATE_STAKE);
              }
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
              if (dashboardState === DashboardState.TRANSFER) {
                resetDashboardState();
              } else {
                resetDashboardState();
                setDashboardState(DashboardState.TRANSFER);
              }
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
